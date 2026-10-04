// Tests de la serialización de la configuración en la URL. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { configuracionPorDefecto, crearEsquema } from './esquema.js';
import { agregarBatea, normalizar, cambiarUnion } from './edicion.js';
import { serializar, deserializar, configDesdeLink } from './url.js';

const esquema = crearEsquema(catalogo);

/** @param {import('./reglas.js').ConfigParcial} c */
const idaYVuelta = (c) => deserializar(serializar(c, catalogo), catalogo);

test('la configuración por defecto va y vuelve igual', () => {
  const c = configuracionPorDefecto(catalogo);
  const params = serializar(c, catalogo);
  assert.equal(params.v, '7');
  assert.equal(params.l, '0110010010'); // material 0 · faldón 1 (blanco) · zócalo 1 (blanco) · …
  assert.equal(params.m, 'r0.b22-00.r0'); // el "-" es la estructura, que no aplica con cúpula curva
  assert.deepEqual(idaYVuelta(c), c);
});

test('una U de 3 bateas con opciones variadas va y vuelve igual, y el link es corto', () => {
  let c = agregarBatea(agregarBatea(configuracionPorDefecto(catalogo), catalogo), catalogo);
  c = normalizar({
    linea: { ...c.linea, material: 'galvanizada_prepintada', colorFaldon: 'negro', colorZocalo: 'sin_color', frio: 'estatico', equipamiento: 'semi' },
    modulos: c.modulos.map((m, i) => {
      if (i === 0) return { ...m, valor: 'mostrador' };
      if (i === 2) return { ...m, forma: 'rinconero', version: 'mostrador' };
      if (i === 3) return { ...m, largo: 3600, cupula: 'cupula_recta', deposito: true, puertasTraseras: true };
      return m;
    }),
  }, catalogo);
  assert.ok(esquema.safeParse(c).success);
  assert.deepEqual(idaYVuelta(c), c);

  const { l, m } = serializar(c, catalogo);
  assert.ok((l + m).length < 60, `demasiado largo: ${l} ${m}`);
});

test('inox (sin color) va y vuelve igual', () => {
  const base = configuracionPorDefecto(catalogo);
  const inox = normalizar({ ...base, linea: { ...base.linea, material: 'inox' } }, catalogo);
  assert.equal(serializar(inox, catalogo).l.slice(1, 3), '--');
  assert.deepEqual(idaYVuelta(inox), inox);
});

test('parámetros rotos o de una versión que no existe devuelven null', () => {
  const { l, m } = serializar(configuracionPorDefecto(catalogo), catalogo);
  assert.equal(deserializar({ v: '8', l, m }, catalogo), null);          // versión futura
  assert.equal(deserializar({ v: '0', l, m }, catalogo), null);          // versión inexistente
  assert.equal(deserializar({ v: 'x', l, m }, catalogo), null);
  assert.equal(deserializar({ v: '7', l: null, m }, catalogo), null);    // falta la línea
  assert.equal(deserializar({ v: '7', l: l + '0', m }, catalogo), null); // largo incorrecto
  assert.equal(deserializar({ v: '7', l, m: 'basura' }, catalogo), null);
  assert.equal(deserializar({ v: '7', l, m: 'r0.bz-200.r0' }, catalogo), null); // índice fuera de rango
  assert.equal(deserializar({ v: '7', l, m: 'r0.b22-x0.r0' }, catalogo), null); // bool inválido
  assert.equal(deserializar({ v: '7', l, m: 'x0.b22-00.r0' }, catalogo), null); // tipo de módulo inexistente
  assert.equal(deserializar({ v: '7', l, m: 'r0.b2200.r0' }, catalogo), null);  // módulo con formato v1 declarado como actual
});

test('una URL bien formada pero que rompe las reglas la rechaza el esquema', () => {
  // Estructura inválida: dos bateas seguidas, sin esquina
  const { l } = serializar(configuracionPorDefecto(catalogo), catalogo);
  const c = deserializar({ v: '7', l, m: 'r0.b22-00.b22-00.r0' }, catalogo);
  assert.ok(c);
  assert.equal(esquema.safeParse(c).success, false);
});

// ---------------------------------------------------------------- estructura y links de la versión 1
test('estructura recta va y vuelve igual', () => {
  const base = configuracionPorDefecto(catalogo);
  const c = normalizar({ ...base, modulos: base.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'sin_cupula_iluminacion', estructura: 'recta' } : m)) }, catalogo);
  // largo 2 · cúpula 1 (sin cúpula con iluminación) · estructura 1 (recta) · depósito 0 · puertas "-" (no aplican)
  assert.equal(serializar(c, catalogo).m, 'r0.b2110-.r0');
  assert.deepEqual(idaYVuelta(c), c);
});

test('un link compartido con la versión 1 sigue abriendo (v1 → … → v7), con la estructura en su default', () => {
  // Link v1 real: batea con cúpula curva, esquina con frío y una batea sin cúpula con iluminación
  // (en v1 no existía la estructura).
  const linkV1 = { v: '1', l: '000010100', m: 'r0.b2200.e0120.b210-.r0' };
  const { config, desdeLink } = configDesdeLink(linkV1, catalogo);
  assert.equal(desdeLink, true);
  assert.ok(esquema.safeParse(config).success);
  assert.deepEqual(config.modulos.map((m) => [m.tipo, m.cupula, m.estructura]), [
    ['remate', undefined, undefined],
    ['batea', 'cupula_curva', undefined],
    ['esquina', 'cupula_curva', undefined],
    ['batea', 'sin_cupula_iluminacion', 'curva'], // la estructura toma su default
    ['remate', undefined, undefined],
  ]);
  // Al volver a serializarlo, queda como link de la versión actual
  const nuevo = serializar(config, catalogo);
  assert.equal(nuevo.v, '7');
  assert.equal(nuevo.m, 'r0.b22-00.e012-.b2100-.r0');
});

test('un link de la versión 6 con puertas traseras en la esquina abre sin ellas (la batea conserva las suyas)', () => {
  // v6: esquina = forma · versión · cúpula · estructura · puertas (1 = sí); batea con puertas (último 1)
  const linkV6 = { v: '6', l: '0110010010', m: 'r0.b22-01.e012-1.b22-01.r0' };
  const { config, desdeLink } = configDesdeLink(linkV6, catalogo);
  assert.equal(desdeLink, true);
  assert.ok(esquema.safeParse(config).success);
  assert.ok(!('puertasTraseras' in config.modulos[2]));
  assert.equal(config.modulos[1].puertasTraseras, true);
  assert.equal(config.modulos[3].puertasTraseras, true);
  assert.equal(serializar(config, catalogo).m, 'r0.b22-01.e012-.b22-01.r0');
});

test('configDesdeLink: link inválido → configuración por defecto', () => {
  const { config, desdeLink } = configDesdeLink({ v: '7', l: '0110010010', m: 'basura' }, catalogo);
  assert.equal(desdeLink, false);
  assert.deepEqual(config, configuracionPorDefecto(catalogo));
});

test('un link de la versión 2 con lateral curvo abre sin lateral y con la tina en chapa blanca', () => {
  // v2: posición 2 de la línea = lateral (1 = curvo)
  const { config, desdeLink } = configDesdeLink({ v: '2', l: '001010100', m: 'r0.b22-00.r0' }, catalogo);
  assert.equal(desdeLink, true);
  assert.ok(!('lateral' in config.linea));
  assert.equal(config.linea.tina, 'chapa_blanca');
  assert.ok(esquema.safeParse(config).success);
  assert.equal(serializar(config, catalogo).l, '0110010010');
});

test('un link de la versión 2 con inox abre sin tina (la tina es de acero)', () => {
  const { config, desdeLink } = configDesdeLink({ v: '2', l: '2-0010100', m: 'r0.b22-00.r0' }, catalogo);
  assert.equal(desdeLink, true);
  assert.equal(config.linea.material, 'inox');
  assert.ok(!('tina' in config.linea));
});

test('tina de acero con cuerpo de chapa va y vuelve igual', () => {
  const base = configuracionPorDefecto(catalogo);
  const c = normalizar({ ...base, linea: { ...base.linea, tina: 'inox', colorFaldon: 'rojo' } }, catalogo);
  assert.equal(serializar(c, catalogo).l[3], '1'); // posición 3 = tina
  assert.deepEqual(idaYVuelta(c), c);
});

// ---------------------------------------------------------------- dónde va el color (v4)
test('un link de la versión 3 abre con el color en faldón y zócalo, y se reescribe como la versión actual', () => {
  // v3: material, color, tina, producto, … (sin zonaColor)
  const { config, desdeLink } = configDesdeLink({ v: '3', l: '070010100', m: 'r0.b22-00.r0' }, catalogo);
  assert.equal(desdeLink, true);
  assert.equal(config.linea.colorFaldon, 'rojo');
  assert.equal(config.linea.colorZocalo, 'rojo');
  assert.equal(config.linea.tina, 'chapa_blanca');
  assert.ok(esquema.safeParse(config).success);
  // rojo es el 7 de la epoxi: en v6 es el 8, porque el 0 es "sin color"
  assert.deepEqual(serializar(config, catalogo), { v: '7', l: '0880010010', m: 'r0.b22-00.r0' });
});

test('faldón y zócalo de colores distintos, o sin color, van y vuelven igual', () => {
  const base = configuracionPorDefecto(catalogo);
  for (const [colorFaldon, colorZocalo] of [['rojo', 'azul'], ['sin_color', 'verde_ral'], ['sin_color', 'sin_color']]) {
    const c = normalizar({ ...base, linea: { ...base.linea, colorFaldon, colorZocalo } }, catalogo);
    assert.equal(c.linea.colorFaldon, colorFaldon);
    assert.deepEqual(idaYVuelta(c), c);
  }
});

// ---------------------------------------------------------------- dos colores (v6)
test('links de la versión 5: cada "dónde va el color" abre con los mismos colores en faldón y zócalo', () => {
  // v5: material, color, zonaColor, tina, producto, frío, bandeja, rejilla, equipamiento, ubicación.
  // Color 7 = rojo (epoxi). zonaColor: 0 faldón y zócalo · 1 solo faldón · 2 solo zócalo.
  const casos = [
    ['0', 'rojo', 'rojo'],
    ['1', 'rojo', 'sin_color'],
    ['2', 'sin_color', 'rojo'],
  ];
  for (const [zona, faldon, zocalo] of casos) {
    const { config, desdeLink } = configDesdeLink({ v: '5', l: '07' + zona + '0010010', m: 'r0.b22-00.r0' }, catalogo);
    assert.equal(desdeLink, true, zona);
    assert.equal(config.linea.colorFaldon, faldon, `zona ${zona}: faldón`);
    assert.equal(config.linea.colorZocalo, zocalo, `zona ${zona}: zócalo`);
    assert.ok(!('color' in config.linea) && !('zonaColor' in config.linea));
    assert.ok(esquema.safeParse(config).success, zona);
  }
  // Inox (sin color ni zona) sigue abriendo
  const inox = configDesdeLink({ v: '5', l: '2--1010010', m: 'r0.b22-00.r0' }, catalogo);
  assert.equal(inox.desdeLink, true);
  assert.equal(inox.config.linea.material, 'inox');
  assert.ok(!('colorFaldon' in inox.config.linea) && !('colorZocalo' in inox.config.linea));
});

// ---------------------------------------------------------------- orden nuevo de las opciones (v5)
test('un link de la versión 4 (frío estático, semi-equipada) abre igual con el orden nuevo', () => {
  // v4: material, color, zona, tina, producto, equipamiento, ubicación, frío, bandeja, rejilla
  //      0         3      1     1     1         0 (semi)      - (no aplica) 0 (estático) -  -
  const { config, desdeLink } = configDesdeLink({ v: '4', l: '03111' + '0-0--', m: 'r0.b22-00.r0' }, catalogo);
  assert.equal(desdeLink, true);
  assert.equal(config.linea.colorFaldon, 'amarillo'); // v4 tenía el color solo en el faldón
  assert.equal(config.linea.colorZocalo, 'sin_color');
  assert.equal(config.linea.tina, 'inox');
  assert.equal(config.linea.producto, 'carnes');
  assert.equal(config.linea.equipamiento, 'semi');
  assert.equal(config.linea.frio, 'estatico');
  assert.ok(!('ubicacionEquipo' in config.linea) && !('bandeja' in config.linea));
  assert.ok(esquema.safeParse(config).success);
  // v6: material, faldón (amarillo = 4), zócalo (sin color = 0), tina, producto, frío, bandeja, rejilla, equipamiento, ubicación
  assert.deepEqual(serializar(config, catalogo), { v: '7', l: '040110--0-', m: 'r0.b22-00.r0' });
});

// ---------------------------------------------------------------- uniones en la URL
test('mostrador intermedio (o) y unión directa (u) van y vuelven igual', () => {
  let c = agregarBatea(agregarBatea(configuracionPorDefecto(catalogo), catalogo), catalogo);
  c = cambiarUnion(c, catalogo, 2, 'mostrador');
  c = cambiarUnion(c, catalogo, 4, 'union');
  c = normalizar({ ...c, modulos: c.modulos.map((m, i) => (i === 2 ? { ...m, largo: 1200 } : m)) }, catalogo);
  const { m } = serializar(c, catalogo);
  assert.equal(m, 'r0.b22-00.o2.b22-00.u.b22-00.r0');
  assert.deepEqual(idaYVuelta(c), c);
  assert.ok(esquema.safeParse(c).success);
});
