// Tests de los textos del configurador. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { configuracionPorDefecto } from './esquema.js';
import { agregarBatea, cambiarUnion } from './edicion.js';
import { formatearMetros, textoValor, nombreModulo, resumenConfiguracion, frasesConfiguracion } from './textos.js';

/**
 * Cambia opciones de un módulo.
 * @param {import('./reglas.js').ConfigParcial} c
 * @param {number} indice
 * @param {Record<string, unknown>} cambios
 */
const conModulo = (c, indice, cambios) => ({ ...c, modulos: c.modulos.map((m, i) => (i === indice ? { ...m, ...cambios } : m)) });

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

test('nombres de mostradores y uniones directas', () => {
  let c = agregarBatea(agregarBatea(configuracionPorDefecto(catalogo), catalogo), catalogo);
  c = cambiarUnion(cambiarUnion(c, catalogo, 2, 'mostrador'), catalogo, 4, 'union');
  assert.deepEqual(
    c.modulos.map((_, i) => nombreModulo(c, i, catalogo)),
    ['Remate izquierdo', 'Batea 1', 'Mostrador 1', 'Batea 2', 'Unión 1', 'Batea 3', 'Remate derecho']
  );
});

test('resumen de la configuración: opciones generales y cada módulo, en lenguaje claro', () => {
  let c = agregarBatea(configuracionPorDefecto(catalogo), catalogo);
  c = cambiarUnion(c, catalogo, 2, 'mostrador');
  const r = resumenConfiguracion(c, catalogo);
  const material = r.linea.find((f) => f.nombre === 'Material del cuerpo');
  assert.equal(material?.valor, 'Chapa galvanizada pintada');
  assert.equal(r.linea.find((f) => f.nombre === 'Color')?.valor, 'Blanco'); // nombre de la paleta, no el id
  // Los remates "ninguno" no aparecen; el mostrador intermedio sí
  assert.deepEqual(r.modulos.map((m) => m.nombre), ['Batea 1', 'Mostrador 1', 'Batea 2']);
  const batea = r.modulos[0].filas;
  assert.equal(batea.find((f) => f.nombre === 'Largo')?.valor, '2,00 m');
  assert.equal(batea.find((f) => f.nombre === 'Depósito inferior')?.valor, 'No');
  // Nunca ids internos
  assert.ok(!JSON.stringify(r).includes('galvanizada_pintada'));
});

test('resumen: deja afuera lo que no aplica', () => {
  const base = configuracionPorDefecto(catalogo);
  const inox = { ...base, linea: { ...base.linea, material: 'inox' } };
  const r = resumenConfiguracion(inox, catalogo);
  assert.equal(r.linea.find((f) => f.nombre === 'Color'), undefined); // el inox no se pinta
  assert.equal(r.linea.find((f) => f.nombre === 'Dónde va el color'), undefined);
  // La estructura solo aparece en sin cúpula con iluminación
  const filas = r.modulos[0].filas.map((f) => f.nombre);
  assert.ok(!filas.includes('Estructura'));
});

test('resumen: unión directa y remate con mostrador', () => {
  let c = agregarBatea(configuracionPorDefecto(catalogo), catalogo);
  c = cambiarUnion(c, catalogo, 2, 'union');
  c = { ...c, modulos: c.modulos.map((m, i) => (i === 0 ? { ...m, valor: 'mostrador' } : m)) };
  const r = resumenConfiguracion(c, catalogo);
  assert.deepEqual(r.modulos.map((m) => m.nombre), ['Remate izquierdo', 'Batea 1', 'Unión 1', 'Batea 2']);
  assert.equal(r.modulos[2].filas[0].valor, 'Directa');
});

test('frases: cada módulo en una oración, como en el ejemplo del pedido', () => {
  let c = agregarBatea(configuracionPorDefecto(catalogo), catalogo); // remate, batea, esquina, batea, remate
  c = conModulo(c, 1, { largo: 2400, cupula: 'sin_cupula_iluminacion', estructura: 'curva', deposito: true });
  c = conModulo(c, 2, { forma: 'esquinero', version: 'mostrador' });
  const f = frasesConfiguracion(c, catalogo);
  assert.deepEqual(f.modulos.map((m) => m.nombre), ['Batea 1', 'Esquina 1', 'Batea 2']);
  assert.equal(f.modulos[0].texto, '2,40 m, sin cúpula con iluminación, estructura curva (arcos), con depósito');
  assert.equal(f.modulos[1].texto, 'esquinero, tipo mostrador'); // la cúpula no aplica en la esquina mostrador
  assert.match(f.linea, /^chapa galvanizada pintada, color blanco, color en faldón y zócalo, tina de chapa blanca, para fiambres \/ lácteos, frío por aire forzado, bandejas de chapa prepintada/);
  assert.ok(!f.linea.includes('rejilla')); // "ninguna" no se menciona
  assert.ok(!JSON.stringify(f).includes('_')); // nunca ids internos (sin_cupula, galvanizada_pintada…)
});

test('frases: inox sin color ni tina, sin depósito no se menciona, unión directa', () => {
  const base = configuracionPorDefecto(catalogo);
  let c = agregarBatea({ ...base, linea: { ...base.linea, material: 'inox', tina: 'inox' } }, catalogo);
  c = cambiarUnion(c, catalogo, 2, 'union');
  const f = frasesConfiguracion(c, catalogo);
  // Con cuerpo de acero la tina es de acero sí o sí: la opción no aplica y no se repite
  assert.ok(f.linea.startsWith('acero inoxidable, para fiambres'));
  assert.ok(!f.linea.includes('color'));
  assert.equal(f.modulos[0].texto, '2,00 m, cúpula curva');
  assert.equal(f.modulos[1].texto, 'directa (las bateas quedan pegadas)');
});
