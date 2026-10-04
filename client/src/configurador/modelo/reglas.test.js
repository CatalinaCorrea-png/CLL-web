// Tests de las reglas del configurador. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { opcionesDeshabilitadas, paletaDeColor, coloresDe, SIN_COLOR } from './reglas.js';
import { configuracionPorDefecto } from './esquema.js';

/**
 * Configuración por defecto con cambios en la línea.
 * @param {Record<string, unknown>} [linea]
 */
const configCon = (linea = {}) => {
  const base = configuracionPorDefecto(catalogo);
  return { linea: { ...base.linea, ...linea }, modulos: base.modulos };
};

/**
 * Ids de las opciones generales deshabilitadas.
 * @param {ReturnType<typeof configCon>} config
 */
const deshabilitadasDeLinea = (config) =>
  opcionesDeshabilitadas(config, catalogo).filter((d) => d.ambito === 'linea').map((d) => d.opcion);

test('con la configuración por defecto solo queda deshabilitada la estructura (la batea es cúpula curva)', () => {
  assert.deepEqual(opcionesDeshabilitadas(configuracionPorDefecto(catalogo), catalogo), [{
    ambito: 'modulo',
    indice: 1,
    opcion: 'estructura',
    motivo: 'La estructura solo se elige en el tipo sin cúpula con iluminación.',
  }]);
});

test('semi-equipada deshabilita la ubicación del equipo, con su motivo', () => {
  const d = opcionesDeshabilitadas(configCon({ equipamiento: 'semi' }), catalogo).filter((x) => x.ambito === 'linea');
  assert.deepEqual(d, [{
    ambito: 'linea',
    opcion: 'ubicacionEquipo',
    motivo: 'La ubicación del equipo solo se elige si la batea es equipada.',
  }]);
});

test('frío estático deshabilita bandejas y rejilla sobre bandeja', () => {
  assert.deepEqual(deshabilitadasDeLinea(configCon({ frio: 'estatico' })), ['bandeja', 'rejillaSobreBandeja']);
});

test('frío forzado habilita bandejas y rejilla', () => {
  assert.deepEqual(deshabilitadasDeLinea(configCon({ frio: 'forzado' })), []);
});

test('colores de faldón y zócalo y tina solo se eligen con chapa: inox los deshabilita', () => {
  const d = opcionesDeshabilitadas(configCon({ material: 'inox' }), catalogo).filter((x) => x.ambito === 'linea');
  assert.deepEqual(d, [
    { ambito: 'linea', opcion: 'colorFaldon', motivo: 'El acero inoxidable no se pinta.' },
    { ambito: 'linea', opcion: 'colorZocalo', motivo: 'El acero inoxidable no se pinta.' },
    { ambito: 'linea', opcion: 'tina', motivo: 'Con cuerpo de acero inoxidable, la tina también es de acero.' },
  ]);
  assert.deepEqual(deshabilitadasDeLinea(configCon({ material: 'galvanizada_prepintada' })), []);
});

test('paleta de color según el material', () => {
  assert.equal(paletaDeColor(catalogo, 'galvanizada_pintada')?.colores.length, 15);
  assert.deepEqual(
    paletaDeColor(catalogo, 'galvanizada_prepintada')?.colores.map((c) => c.id),
    ['blanco', 'negro', 'gris', 'rojo', 'azul']
  );
  assert.equal(paletaDeColor(catalogo, 'inox'), null);
});

test('colores posibles: "sin color" primero y después la paleta; ninguno con inox', () => {
  assert.deepEqual(coloresDe(catalogo, 'galvanizada_prepintada'), [SIN_COLOR, 'blanco', 'negro', 'gris', 'rojo', 'azul']);
  assert.equal(coloresDe(catalogo, 'galvanizada_pintada').length, 16);
  assert.deepEqual(coloresDe(catalogo, 'inox'), []);
});

test('puertas traseras: deshabilitadas solo en las bateas sin cúpula, por índice', () => {
  const config = {
    linea: configuracionPorDefecto(catalogo).linea,
    modulos: [
      { tipo: 'remate', valor: 'ninguno' },
      { tipo: 'batea', largo: 2000, cupula: 'sin_cupula', deposito: false },               // 1
      { tipo: 'esquina', forma: 'esquinero', version: 'frio', cupula: 'cupula_curva' },
      { tipo: 'batea', largo: 2000, cupula: 'cupula_curva', deposito: false },             // 3
      { tipo: 'esquina', forma: 'rinconero', version: 'frio', cupula: 'cupula_recta' },
      { tipo: 'batea', largo: 1500, cupula: 'sin_cupula_iluminacion', deposito: true },    // 5
      { tipo: 'remate', valor: 'mostrador' },
    ],
  };
  const d = opcionesDeshabilitadas(config, catalogo).filter((x) => x.opcion === 'puertasTraseras');
  assert.deepEqual(d.map((x) => [x.indice, x.opcion]), [[1, 'puertasTraseras'], [5, 'puertasTraseras']]);
  assert.match(d[0].motivo, /solo van en bateas con cúpula/);
});

test('esquinas: la mostrador no lleva cúpula ni puertas; la con frío, puertas solo con cúpula', () => {
  const linea = configuracionPorDefecto(catalogo).linea;
  const batea = { tipo: 'batea', largo: 2000, cupula: 'cupula_curva', deposito: false };
  /** @param {Record<string, unknown>} esquina */
  const deshabilitadasEsquina = (esquina) =>
    opcionesDeshabilitadas({ linea, modulos: [{ tipo: 'remate', valor: 'ninguno' }, batea, esquina, batea, { tipo: 'remate', valor: 'ninguno' }] }, catalogo)
      .filter((d) => d.indice === 2)
      .map((d) => d.opcion);

  assert.deepEqual(deshabilitadasEsquina({ tipo: 'esquina', forma: 'esquinero', version: 'mostrador' }), ['cupula', 'estructura', 'puertasTraseras']);
  assert.deepEqual(deshabilitadasEsquina({ tipo: 'esquina', forma: 'esquinero', version: 'frio', cupula: 'sin_cupula' }), ['estructura', 'puertasTraseras']);
  assert.deepEqual(deshabilitadasEsquina({ tipo: 'esquina', forma: 'rinconero', version: 'frio', cupula: 'cupula_recta' }), ['estructura']);
  // Sin cúpula con iluminación: se habilita la estructura y se deshabilitan las puertas
  assert.deepEqual(deshabilitadasEsquina({ tipo: 'esquina', forma: 'rinconero', version: 'frio', cupula: 'sin_cupula_iluminacion' }), ['puertasTraseras']);
});

test('depósito con equipo incorporado y carnes con cualquier frío o cúpula: nada deshabilitado', () => {
  for (const frio of ['estatico', 'forzado']) {
    for (const cupula of ['sin_cupula', 'sin_cupula_iluminacion', 'cupula_curva', 'cupula_recta']) {
      const config = configCon({ producto: 'carnes', ubicacionEquipo: 'incorporado', frio });
      config.modulos = [
        { tipo: 'remate', valor: 'ninguno' },
        { tipo: 'batea', largo: 2400, cupula, deposito: true },
        { tipo: 'remate', valor: 'ninguno' },
      ];
      const d = opcionesDeshabilitadas(config, catalogo).map((x) => x.opcion);
      // Lo único que puede aparecer es lo que depende del frío o de la cúpula, nunca por el producto o el depósito
      assert.ok(d.every((o) => ['bandeja', 'rejillaSobreBandeja', 'estructura', 'puertasTraseras'].includes(o)), `${frio}/${cupula}: ${d}`);
    }
  }
});

test('estructura de la batea: solo se habilita con sin cúpula con iluminación', () => {
  const linea = configuracionPorDefecto(catalogo).linea;
  for (const cupula of ['sin_cupula', 'sin_cupula_iluminacion', 'cupula_curva', 'cupula_recta']) {
    const modulos = [{ tipo: 'remate', valor: 'ninguno' }, { tipo: 'batea', largo: 2000, cupula, deposito: false }, { tipo: 'remate', valor: 'ninguno' }];
    const deshabilitada = opcionesDeshabilitadas({ linea, modulos }, catalogo).some((d) => d.opcion === 'estructura');
    assert.equal(deshabilitada, cupula !== 'sin_cupula_iluminacion', cupula);
  }
});
