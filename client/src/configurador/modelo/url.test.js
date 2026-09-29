// Tests de la serialización de la configuración en la URL. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { configuracionPorDefecto, crearEsquema } from './esquema.js';
import { agregarBatea, normalizar } from './edicion.js';
import { serializar, deserializar, configDesdeLink } from './url.js';

const esquema = crearEsquema(catalogo);

/** @param {import('./reglas.js').ConfigParcial} c */
const idaYVuelta = (c) => deserializar(serializar(c, catalogo), catalogo);

test('la configuración por defecto va y vuelve igual', () => {
  const c = configuracionPorDefecto(catalogo);
  const params = serializar(c, catalogo);
  assert.equal(params.v, '2');
  assert.equal(params.m, 'r0.b22-00.r0'); // el "-" es la estructura, que no aplica con cúpula curva
  assert.deepEqual(idaYVuelta(c), c);
});

test('una U de 3 bateas con opciones variadas va y vuelve igual, y el link es corto', () => {
  let c = agregarBatea(agregarBatea(configuracionPorDefecto(catalogo), catalogo), catalogo);
  c = normalizar({
    linea: { ...c.linea, material: 'galvanizada_prepintada', color: 'negro', frio: 'estatico', equipamiento: 'semi' },
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
  assert.equal(serializar(inox, catalogo).l[1], '-');
  assert.deepEqual(idaYVuelta(inox), inox);
});

test('parámetros rotos o de una versión que no existe devuelven null', () => {
  const { l, m } = serializar(configuracionPorDefecto(catalogo), catalogo);
  assert.equal(deserializar({ v: '3', l, m }, catalogo), null);          // versión futura
  assert.equal(deserializar({ v: '0', l, m }, catalogo), null);          // versión inexistente
  assert.equal(deserializar({ v: 'x', l, m }, catalogo), null);
  assert.equal(deserializar({ v: '2', l: null, m }, catalogo), null);    // falta la línea
  assert.equal(deserializar({ v: '2', l: l + '0', m }, catalogo), null); // largo incorrecto
  assert.equal(deserializar({ v: '2', l, m: 'basura' }, catalogo), null);
  assert.equal(deserializar({ v: '2', l, m: 'r0.bz-200.r0' }, catalogo), null); // índice fuera de rango
  assert.equal(deserializar({ v: '2', l, m: 'r0.b22-x0.r0' }, catalogo), null); // bool inválido
  assert.equal(deserializar({ v: '2', l, m: 'x0.b22-00.r0' }, catalogo), null); // tipo de módulo inexistente
  assert.equal(deserializar({ v: '2', l, m: 'r0.b2200.r0' }, catalogo), null);  // módulo con formato v1 declarado como v2
});

test('una URL bien formada pero que rompe las reglas la rechaza el esquema', () => {
  // Estructura inválida: dos bateas seguidas, sin esquina
  const { l } = serializar(configuracionPorDefecto(catalogo), catalogo);
  const c = deserializar({ v: '2', l, m: 'r0.b22-00.b22-00.r0' }, catalogo);
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

test('un link compartido con la versión 1 sigue abriendo, con la estructura en su default', () => {
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
  // Al volver a serializarlo, queda como link v2
  const nuevo = serializar(config, catalogo);
  assert.equal(nuevo.v, '2');
  assert.equal(nuevo.m, 'r0.b22-00.e012-0.b2100-.r0');
});

test('configDesdeLink: link inválido → configuración por defecto', () => {
  const { config, desdeLink } = configDesdeLink({ v: '2', l: '000010100', m: 'basura' }, catalogo);
  assert.equal(desdeLink, false);
  assert.deepEqual(config, configuracionPorDefecto(catalogo));
});
