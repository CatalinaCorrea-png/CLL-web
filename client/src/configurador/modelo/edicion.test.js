// Tests de las operaciones de edición de la línea. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { configuracionPorDefecto, crearEsquema } from './esquema.js';
import { normalizar, agregarBatea, quitarBatea, puedeAgregarBatea, puedeQuitarBatea, contarBateas, cambiarUnion } from './edicion.js';
import { serializar, configDesdeLink } from './url.js';

const esquema = crearEsquema(catalogo);
const base = () => configuracionPorDefecto(catalogo);
/** @param {unknown} c */
const esValida = (c) => esquema.safeParse(c).success;

/**
 * Configuración por defecto con cambios en la línea, ya normalizada.
 * @param {Record<string, unknown>} cambios
 */
const conLinea = (cambios) => {
  const c = base();
  return normalizar({ ...c, linea: { ...c.linea, ...cambios } }, catalogo);
};

// ---------------------------------------------------------------- normalizar
test('normalizar: frío estático saca bandeja y rejilla; volver a forzado las repone con su default', () => {
  const estatico = conLinea({ frio: 'estatico' });
  assert.ok(!('bandeja' in estatico.linea) && !('rejillaSobreBandeja' in estatico.linea));
  assert.ok(esValida(estatico));

  const forzado = normalizar({ ...estatico, linea: { ...estatico.linea, frio: 'forzado' } }, catalogo);
  assert.equal(forzado.linea.bandeja, 'prepintada');
  assert.equal(forzado.linea.rejillaSobreBandeja, 'ninguna');
  assert.ok(esValida(forzado));
});

test('normalizar: material y colores de faldón y zócalo', () => {
  const inox = conLinea({ material: 'inox' });
  assert.ok(!('colorFaldon' in inox.linea) && !('colorZocalo' in inox.linea));
  assert.ok(esValida(inox));
  assert.ok(!('tina' in inox.linea)); // con inox la tina es de acero, no se elige

  // Volver a pintada pone los dos colores por defecto (blanco) y la tina en chapa blanca
  const pintada = normalizar({ ...inox, linea: { ...inox.linea, material: 'galvanizada_pintada' } }, catalogo);
  assert.equal(pintada.linea.colorFaldon, 'blanco');
  assert.equal(pintada.linea.colorZocalo, 'blanco');
  assert.equal(pintada.linea.tina, 'chapa_blanca');

  // Un color de la epoxi que no existe en la prepintada se corrige al default de la prepintada
  const prepintada = conLinea({ colorFaldon: 'plata', colorZocalo: 'azul', material: 'galvanizada_prepintada' });
  assert.equal(prepintada.linea.colorFaldon, 'blanco');
  // Uno que existe en las dos paletas se mantiene, y "sin color" vale con cualquier paleta
  assert.equal(prepintada.linea.colorZocalo, 'azul');
  assert.equal(conLinea({ colorZocalo: 'sin_color', material: 'galvanizada_prepintada' }).linea.colorZocalo, 'sin_color');
});

test('normalizar: semi-equipada saca la ubicación del equipo', () => {
  const semi = conLinea({ equipamiento: 'semi' });
  assert.ok(!('ubicacionEquipo' in semi.linea));
  assert.ok(esValida(semi));
});

test('normalizar: esquina mostrador ↔ con frío (la cúpula vuelve copiando la batea anterior)', () => {
  let c = agregarBatea(base(), catalogo);
  c = normalizar({ ...c, modulos: c.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'cupula_recta' } : m)) }, catalogo);

  const mostrador = normalizar({ ...c, modulos: c.modulos.map((m, i) => (i === 2 ? { ...m, version: 'mostrador' } : m)) }, catalogo);
  assert.deepEqual(mostrador.modulos[2], { tipo: 'esquina', forma: 'esquinero', version: 'mostrador' });

  const frio = normalizar({ ...mostrador, modulos: mostrador.modulos.map((m, i) => (i === 2 ? { ...m, version: 'frio' } : m)) }, catalogo);
  assert.equal(frio.modulos[2].cupula, 'cupula_recta');
  assert.equal(frio.modulos[2].puertasTraseras, false);
  assert.ok(esValida(frio));
});

test('normalizar: batea sin cúpula pierde las puertas traseras y las recupera con cúpula', () => {
  const c = base();
  const sin = normalizar({ ...c, modulos: c.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'sin_cupula', puertasTraseras: true } : m)) }, catalogo);
  assert.ok(!('puertasTraseras' in sin.modulos[1]));
  const con = normalizar({ ...sin, modulos: sin.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'cupula_curva' } : m)) }, catalogo);
  assert.equal(con.modulos[1].puertasTraseras, false);
});

test('normalizar: pasar a sin cúpula con iluminación agrega la estructura; cambiar de tipo la saca', () => {
  const c = base();
  const conIluminacion = normalizar({ ...c, modulos: c.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'sin_cupula_iluminacion' } : m)) }, catalogo);
  assert.equal(conIluminacion.modulos[1].estructura, 'curva');
  assert.ok(!('puertasTraseras' in conIluminacion.modulos[1]));
  assert.ok(esValida(conIluminacion));

  const recta = normalizar({ ...conIluminacion, modulos: conIluminacion.modulos.map((m, i) => (i === 1 ? { ...m, estructura: 'recta' } : m)) }, catalogo);
  const curva = normalizar({ ...recta, modulos: recta.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'cupula_curva' } : m)) }, catalogo);
  assert.ok(!('estructura' in curva.modulos[1]));
  assert.equal(curva.modulos[1].puertasTraseras, false);
  assert.ok(esValida(curva));
});

test('agregar batea después de una sin cúpula con iluminación: la esquina copia tipo y estructura', () => {
  const c = base();
  const recta = normalizar({ ...c, modulos: c.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'sin_cupula_iluminacion', estructura: 'recta' } : m)) }, catalogo);
  const dos = agregarBatea(recta, catalogo);
  assert.equal(dos.modulos[2].cupula, 'sin_cupula_iluminacion');
  assert.equal(dos.modulos[2].estructura, 'recta');
  assert.ok(esValida(dos));
});

test('normalizar no modifica la configuración original', () => {
  const c = base();
  const copia = structuredClone(c);
  normalizar({ ...c, linea: { ...c.linea, material: 'inox' } }, catalogo);
  assert.deepEqual(c, copia);
});

// ---------------------------------------------------------------- agregar / quitar
test('agregar bateas hasta 3; la esquina copia el tipo de la batea anterior', () => {
  let c = base();
  c = { ...c, modulos: c.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'sin_cupula_iluminacion', puertasTraseras: undefined } : m)) };
  c = normalizar(c, catalogo);

  c = agregarBatea(c, catalogo);
  assert.deepEqual(c.modulos.map((m) => m.tipo), ['remate', 'batea', 'esquina', 'batea', 'remate']);
  assert.equal(c.modulos[2].cupula, 'sin_cupula_iluminacion');

  c = agregarBatea(c, catalogo);
  assert.equal(contarBateas(c), 3);
  assert.ok(esValida(c));

  const otra = agregarBatea(c, catalogo);
  assert.equal(otra, c); // no hace nada
  assert.deepEqual(puedeAgregarBatea(c, catalogo), { ok: false, motivo: 'La línea puede tener hasta 3 bateas.' });
});

test('quitar la primera, la del medio y la última batea (con su esquina)', () => {
  let tres = agregarBatea(agregarBatea(base(), catalogo), catalogo);
  // Marco cada batea con un largo distinto para reconocerlas
  tres = { ...tres, modulos: tres.modulos.map((m, i) => (m.tipo === 'batea' ? { ...m, largo: [0, 1200, 0, 1500, 0, 3000][i] } : m)) };

  const sinPrimera = quitarBatea(tres, 1);
  assert.deepEqual(sinPrimera.modulos.filter((m) => m.tipo === 'batea').map((m) => m.largo), [1500, 3000]);
  const sinMedio = quitarBatea(tres, 3);
  assert.deepEqual(sinMedio.modulos.filter((m) => m.tipo === 'batea').map((m) => m.largo), [1200, 3000]);
  const sinUltima = quitarBatea(tres, 5);
  assert.deepEqual(sinUltima.modulos.filter((m) => m.tipo === 'batea').map((m) => m.largo), [1200, 1500]);

  for (const c of [sinPrimera, sinMedio, sinUltima]) {
    assert.deepEqual(c.modulos.map((m) => m.tipo), ['remate', 'batea', 'esquina', 'batea', 'remate']);
    assert.ok(esValida(c));
  }
});

test('no se puede quitar la única batea ni algo que no es batea', () => {
  const c = base();
  assert.equal(quitarBatea(c, 1), c);
  assert.deepEqual(puedeQuitarBatea(c, 1), { ok: false, motivo: 'La línea necesita al menos una batea.' });
  assert.equal(puedeQuitarBatea(agregarBatea(c, catalogo), 2).ok, false); // es una esquina
});

// ---------------------------------------------------------------- uniones
test('cambiarUnion: esquina → mostrador → directa → esquina (copia la cúpula de la batea anterior)', () => {
  let c = agregarBatea(base(), catalogo);
  c = normalizar({ ...c, modulos: c.modulos.map((m, i) => (i === 1 ? { ...m, cupula: 'cupula_recta' } : m)) }, catalogo);

  const mostrador = cambiarUnion(c, catalogo, 2, 'mostrador');
  assert.deepEqual(mostrador.modulos[2], { tipo: 'mostrador', largo: 900 });
  assert.ok(esValida(mostrador));

  const directa = cambiarUnion(mostrador, catalogo, 2, 'union');
  assert.deepEqual(directa.modulos[2], { tipo: 'union' });
  assert.ok(esValida(directa));

  const esquina = cambiarUnion(directa, catalogo, 2, 'esquina');
  assert.equal(esquina.modulos[2].tipo, 'esquina');
  assert.equal(esquina.modulos[2].cupula, 'cupula_recta');
  assert.ok(esValida(esquina));
});

test('cambiarUnion no toca bateas ni remates, ni tipos inexistentes', () => {
  const c = agregarBatea(base(), catalogo);
  assert.equal(cambiarUnion(c, catalogo, 1, 'mostrador'), c); // es una batea
  assert.equal(cambiarUnion(c, catalogo, 0, 'mostrador'), c); // es un remate
  assert.equal(cambiarUnion(c, catalogo, 2, 'puente'), c);
});

test('quitar una batea unida por un mostrador saca también el mostrador', () => {
  const c = cambiarUnion(agregarBatea(base(), catalogo), catalogo, 2, 'mostrador');
  const sin = quitarBatea(c, 3);
  assert.deepEqual(sin.modulos.map((m) => m.tipo), ['remate', 'batea', 'remate']);
});

// ---------------------------------------------------------------- casos borde (revisión del prompt 11)
/**
 * Cambia opciones de un módulo y normaliza.
 * @param {import('./reglas.js').ConfigParcial} c
 * @param {number} indice
 * @param {Record<string, unknown>} cambios
 */
const cambiarModulo = (c, indice, cambios) =>
  normalizar({ ...c, modulos: c.modulos.map((m, i) => (i === indice ? { ...m, ...cambios } : m)) }, catalogo);

test('borde: batea con puertas traseras que pasa a sin cúpula o sin cúpula con iluminación pierde las puertas y queda válida', () => {
  const conPuertas = cambiarModulo(base(), 1, { cupula: 'cupula_recta', puertasTraseras: true });
  assert.equal(conPuertas.modulos[1].puertasTraseras, true);
  for (const cupula of ['sin_cupula', 'sin_cupula_iluminacion']) {
    const c = cambiarModulo(conPuertas, 1, { cupula });
    assert.ok(!('puertasTraseras' in c.modulos[1]), cupula);
    assert.ok(esValida(c), cupula);
  }
});

test('borde: esquina con frío y puertas traseras que pasa a mostrador pierde cúpula, estructura y puertas', () => {
  let c = agregarBatea(base(), catalogo);
  c = cambiarModulo(c, 2, { puertasTraseras: true });
  c = cambiarModulo(c, 2, { version: 'mostrador' });
  assert.deepEqual(Object.keys(c.modulos[2]).sort(), ['forma', 'tipo', 'version']);
  assert.ok(esValida(c));
});

test('borde: quitar la batea del medio de una línea con dos esquinas deja una línea válida y el link la reabre igual', () => {
  let c = agregarBatea(agregarBatea(base(), catalogo), catalogo); // r b e b e b r
  c = cambiarModulo(c, 2, { forma: 'esquinero' });
  c = cambiarModulo(c, 4, { forma: 'rinconero', version: 'mostrador' });
  c = cambiarModulo(c, 3, { largo: 3600, deposito: true });
  const sinMedio = quitarBatea(c, 3);
  assert.deepEqual(sinMedio.modulos.map((m) => m.tipo), ['remate', 'batea', 'esquina', 'batea', 'remate']);
  assert.equal(sinMedio.modulos[2].forma, 'rinconero'); // se va la esquina de la izquierda de la batea quitada
  assert.ok(esValida(sinMedio));
  const reabierta = configDesdeLink(serializar(sinMedio, catalogo), catalogo);
  assert.equal(reabierta.desdeLink, true);
  assert.deepEqual(reabierta.config, normalizar(sinMedio, catalogo));
});

test('borde: quitar bateas en cualquier orden siempre deja una línea válida', () => {
  const tres = agregarBatea(agregarBatea(base(), catalogo), catalogo);
  for (const orden of [[1, 1], [3, 1], [5, 3], [5, 1], [1, 3]]) {
    let c = tres;
    for (const i of orden) {
      c = quitarBatea(c, i);
      assert.ok(esValida(c), `orden ${orden}`);
    }
    assert.equal(contarBateas(c), 1);
  }
});
