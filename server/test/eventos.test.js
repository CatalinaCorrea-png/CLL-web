// Tests de la analítica (sin base de datos): qué eventos acepta POST /eventos.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validarEvento } = require('../src/presupuestos/eventos');

const sesion = '3f2c9a1e-8b7d-4c6a-9e5f-1a2b3c4d5e6f';

test('eventos válidos, como texto (sendBeacon) o como objeto', () => {
  assert.equal(validarEvento(JSON.stringify({ evento: 'configurador_iniciado', sesion })).ok, true);
  assert.equal(validarEvento({ evento: 'whatsapp_click', sesion, ref: 'CLL-2026-0001' }).ok, true);
});

test('se rechazan eventos inventados, el que registra el server, sesiones y refs mal formadas y campos extra', () => {
  assert.equal(validarEvento({ evento: 'otro', sesion }).ok, false);
  assert.equal(validarEvento({ evento: 'presupuesto_enviado', sesion }).ok, false); // solo lo registra el server
  assert.equal(validarEvento({ evento: 'configurador_iniciado', sesion: 'abc' }).ok, false);
  assert.equal(validarEvento({ evento: 'whatsapp_click', sesion, ref: '<script>' }).ok, false);
  assert.equal(validarEvento({ evento: 'configurador_iniciado', sesion, email: 'x@y.z' }).ok, false);
  assert.equal(validarEvento('{no es json').ok, false);
});
