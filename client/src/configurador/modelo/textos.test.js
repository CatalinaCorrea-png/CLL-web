// Tests de los textos del configurador. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { configuracionPorDefecto } from './esquema.js';
import { agregarBatea } from './edicion.js';
import { formatearMetros, textoValor, nombreModulo } from './textos.js';

test('metros con coma decimal', () => {
  assert.equal(formatearMetros(2000), '2,00 m');
  assert.equal(formatearMetros(1500), '1,50 m');
});

test('texto de un valor: etiqueta del catálogo o medida en metros', () => {
  const cupula = catalogo.modulos.batea.find((o) => o.id === 'cupula');
  const largo = catalogo.modulos.batea.find((o) => o.id === 'largo');
  assert.equal(textoValor(cupula ?? {}, 'cupula_curva'), 'Cúpula curva');
  assert.equal(textoValor(largo ?? {}, 2400), '2,40 m');
});

test('nombres de los módulos según su posición', () => {
  const c = agregarBatea(configuracionPorDefecto(catalogo), catalogo);
  assert.deepEqual(
    c.modulos.map((_, i) => nombreModulo(c, i, catalogo)),
    ['Remate izquierdo', 'Batea 1', 'Esquina 1', 'Batea 2', 'Remate derecho']
  );
});
