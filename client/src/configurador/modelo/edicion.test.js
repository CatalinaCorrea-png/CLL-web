// Tests de las operaciones de edición de la línea. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { configuracionPorDefecto, crearEsquema } from './esquema.js';
import { normalizar, agregarBatea, quitarBatea, puedeAgregarBatea, puedeQuitarBatea, contarBateas } from './edicion.js';

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

test('normalizar: material y color', () => {
  const inox = conLinea({ material: 'inox' });
  assert.ok(!('color' in inox.linea));
  assert.ok(esValida(inox));

  // Volver a pintada pone el color por defecto (blanco)
  const pintada = normalizar({ ...inox, linea: { ...inox.linea, material: 'galvanizada_pintada' } }, catalogo);
  assert.equal(pintada.linea.color, 'blanco');

  // Un color de la epoxi que no existe en la prepintada se corrige al default de la prepintada
  const prepintada = conLinea({ color: 'plata', material: 'galvanizada_prepintada' });
  assert.equal(prepintada.linea.color, 'blanco');
  // Uno que existe en las dos paletas se mantiene
  assert.equal(conLinea({ color: 'azul', material: 'galvanizada_prepintada' }).linea.color, 'azul');
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
