// Tests de la serialización de la configuración en la URL. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { configuracionPorDefecto, crearEsquema } from './esquema.js';
import { agregarBatea, normalizar } from './edicion.js';
import { serializar, deserializar } from './url.js';

const esquema = crearEsquema(catalogo);

/** @param {import('./reglas.js').ConfigParcial} c */
const idaYVuelta = (c) => deserializar(serializar(c, catalogo), catalogo);

test('la configuración por defecto va y vuelve igual', () => {
  const c = configuracionPorDefecto(catalogo);
  const params = serializar(c, catalogo);
  assert.equal(params.v, '1');
  assert.equal(params.m, 'r0.b2200.r0');
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

test('parámetros rotos o de otra versión devuelven null', () => {
  const { l, m } = serializar(configuracionPorDefecto(catalogo), catalogo);
  assert.equal(deserializar({ v: '2', l, m }, catalogo), null);          // otra versión del catálogo
  assert.equal(deserializar({ v: '1', l: null, m }, catalogo), null);    // falta la línea
  assert.equal(deserializar({ v: '1', l: l + '0', m }, catalogo), null); // largo incorrecto
  assert.equal(deserializar({ v: '1', l, m: 'basura' }, catalogo), null);
  assert.equal(deserializar({ v: '1', l, m: 'r0.bz200.r0' }, catalogo), null); // índice fuera de rango
  assert.equal(deserializar({ v: '1', l, m: 'r0.b22x0.r0' }, catalogo), null); // bool inválido
  assert.equal(deserializar({ v: '1', l, m: 'x0.b2200.r0' }, catalogo), null); // tipo de módulo inexistente
});

test('una URL bien formada pero que rompe las reglas la rechaza el esquema', () => {
  // Estructura inválida: dos bateas seguidas, sin esquina
  const { l } = serializar(configuracionPorDefecto(catalogo), catalogo);
  const c = deserializar({ v: '1', l, m: 'r0.b2200.b2200.r0' }, catalogo);
  assert.ok(c);
  assert.equal(esquema.safeParse(c).success, false);
});
