// Tests del esquema de configuración de línea. Correr con: npm test (desde client/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalogo from './catalogo.json' with { type: 'json' };
import { crearEsquema, configuracionPorDefecto, moduloPorDefecto } from './esquema.js';

const esquema = crearEsquema(catalogo);

const REMATE = { tipo: 'remate', valor: 'ninguno' };
const MOSTRADOR = { tipo: 'remate', valor: 'mostrador' };
const BATEA = { tipo: 'batea', largo: 2000, cupula: 'cupula_curva', deposito: false, puertasTraseras: false };
const ESQUINERO = { tipo: 'esquina', forma: 'esquinero', version: 'frio', cupula: 'cupula_curva' };
const RINCONERO = { tipo: 'esquina', forma: 'rinconero', version: 'frio', cupula: 'cupula_recta', puertasTraseras: true };

/**
 * Línea por defecto con cambios en las opciones generales y/o en los módulos.
 * @param {{ linea?: Record<string, unknown>, modulos?: Array<Record<string, unknown>> }} [cambios]
 */
const config = ({ linea = {}, modulos } = {}) => {
  const base = configuracionPorDefecto(catalogo);
  return { linea: { ...base.linea, ...linea }, modulos: modulos ?? base.modulos };
};

/**
 * Mensajes de error del esquema (vacío si es válida).
 * @param {unknown} c
 */
const errores = (c) => {
  const r = esquema.safeParse(c);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

// ---------------------------------------------------------------- catálogo
test('catálogo: 15 colores epoxi (con blanco por defecto) y los 6 largos de la especificación', () => {
  assert.equal(catalogo.paletas.epoxi.colores.length, 15);
  assert.equal(catalogo.paletas.epoxi.default, 'blanco');
  assert.equal(catalogo.linea.mostradorRemate.alto, 900);
  assert.equal(catalogo.version, 5);
  // Orden del panel: frío, bandejas y rejilla antes de equipamiento
  const orden = catalogo.opcionesLinea.map((o) => o.id);
  assert.ok(orden.indexOf('rejillaSobreBandeja') < orden.indexOf('equipamiento'));
  assert.equal(catalogo.paletas.epoxi.colores.find((c) => c.id === 'blanco')?.hex, '#FFFFFF');
  assert.equal(catalogo.paletas.prepintada.colores.find((c) => c.id === 'blanco')?.hex, '#FFFFFF');
  const ids = catalogo.opcionesLinea.map((o) => o.id);
  assert.ok(!ids.includes('lateral'), 'el estilo de lateral ya no se ofrece');
  assert.equal(ids[2], 'zonaColor');
  assert.equal(ids[3], 'tina');
  const largo = catalogo.modulos.batea.find((o) => o.id === 'largo');
  assert.deepEqual(largo?.valores, [1200, 1500, 2000, 2400, 3000, 3600]);
});

test('catálogo: cada opción tiene nombre y cada valor de texto tiene etiqueta (para el panel)', () => {
  /** @type {Array<{ id: string, nombre?: string, tipo: string, valores?: Array<string | number>, etiquetas?: Record<string, string> }>} */
  const opciones = [...catalogo.opcionesLinea, ...Object.values(catalogo.modulos).flat()];
  for (const o of opciones) {
    assert.ok(o.nombre, `"${o.id}" no tiene nombre`);
    for (const v of o.valores ?? []) {
      if (typeof v === 'string') assert.ok(o.etiquetas?.[v], `"${o.id}": el valor "${v}" no tiene etiqueta`);
    }
  }
  assert.deepEqual(Object.keys(catalogo.nombresModulo), ['batea', 'esquina', 'mostrador', 'union', 'remate']);
  // Cada tipo de unión tiene su etiqueta, y existe en los módulos
  for (const u of catalogo.uniones.valores) {
    assert.ok(/** @type {Record<string, string>} */ (catalogo.uniones.etiquetas)[u], u);
    assert.ok(u in catalogo.modulos, u);
  }
});

// ---------------------------------------------------------------- válidas
test('la configuración por defecto es válida (una batea de 2000 mm, sin remates)', () => {
  const c = configuracionPorDefecto(catalogo);
  assert.deepEqual(errores(c), []);
  assert.equal(c.modulos[1].largo, 2000);
});

test('el ejemplo de la especificación es válido', () => {
  const c = {
    linea: { ...config().linea, material: 'galvanizada_pintada', color: 'blanco', frio: 'forzado' },
    modulos: [
      MOSTRADOR,
      { tipo: 'batea', largo: 2400, cupula: 'sin_cupula_iluminacion', estructura: 'curva', deposito: false },
      { tipo: 'esquina', forma: 'esquinero', version: 'mostrador' },
      { tipo: 'batea', largo: 2000, cupula: 'cupula_recta', deposito: true },
      REMATE,
    ],
  };
  assert.deepEqual(errores(c), []);
});

test('líneas en L, en U y en zigzag son válidas', () => {
  const L = [REMATE, BATEA, ESQUINERO, BATEA, REMATE];
  const U = [MOSTRADOR, BATEA, ESQUINERO, BATEA, ESQUINERO, BATEA, MOSTRADOR];
  const zigzag = [REMATE, BATEA, RINCONERO, BATEA, ESQUINERO, BATEA, REMATE];
  for (const modulos of [L, U, zigzag]) assert.deepEqual(errores(config({ modulos })), []);
});

test('inox sin color y prepintada con su paleta son válidas', () => {
  const inox = config({ linea: { material: 'inox' } });
  delete inox.linea.color;
  delete inox.linea.tina; // con inox la tina es de acero, no se elige
  delete inox.linea.zonaColor;
  assert.deepEqual(errores(inox), []);
  assert.deepEqual(errores(config({ linea: { material: 'galvanizada_prepintada', color: 'negro' } })), []);
});

test('moduloPorDefecto no incluye opciones deshabilitadas', () => {
  assert.deepEqual(moduloPorDefecto(catalogo, 'esquina'), {
    tipo: 'esquina', forma: 'esquinero', version: 'frio', cupula: 'cupula_curva', puertasTraseras: false,
  });
  assert.ok('puertasTraseras' in moduloPorDefecto(catalogo, 'batea')); // default es cúpula curva
});

test('una esquina nueva copia la cúpula de la batea anterior', () => {
  const bateaRecta = { ...BATEA, cupula: 'cupula_recta' };
  assert.equal(moduloPorDefecto(catalogo, 'esquina', bateaRecta).cupula, 'cupula_recta');

  // Si la batea anterior no tiene cúpula, la esquina tampoco lleva puertas traseras
  const esquina = moduloPorDefecto(catalogo, 'esquina', { ...BATEA, cupula: 'sin_cupula' });
  assert.equal(esquina.cupula, 'sin_cupula');
  assert.ok(!('puertasTraseras' in esquina));
  assert.deepEqual(errores(config({ modulos: [REMATE, BATEA, esquina, BATEA, REMATE] })), []);
});

test('esquina mostrador: sin cúpula ni puertas traseras', () => {
  const mostrador = { tipo: 'esquina', forma: 'esquinero', version: 'mostrador' };
  assert.deepEqual(errores(config({ modulos: [REMATE, BATEA, mostrador, BATEA, REMATE] })), []);
  const conCupula = { ...mostrador, cupula: 'cupula_curva' };
  assert.match(errores(config({ modulos: [REMATE, BATEA, conCupula, BATEA, REMATE] }))[0], /tapa de inox/);
});

test('una opción condicional habilitada que falta es inválida (si es select)', () => {
  const equipadaSinUbicacion = config();
  delete equipadaSinUbicacion.linea.ubicacionEquipo;
  assert.deepEqual(errores(equipadaSinUbicacion), ['Falta elegir "ubicacionEquipo".']);

  const esquinaFrioSinCupula = { tipo: 'esquina', forma: 'rinconero', version: 'frio' };
  assert.deepEqual(errores(config({ modulos: [REMATE, BATEA, esquinaFrioSinCupula, BATEA, REMATE] })), ['Falta elegir "cupula".']);

  // Un bool que falta cuenta como false: la batea con cúpula sin "puertasTraseras" es válida
  const { puertasTraseras, ...bateaSinPuertas } = BATEA;
  assert.equal(puertasTraseras, false);
  assert.deepEqual(errores(config({ modulos: [REMATE, bateaSinPuertas, REMATE] })), []);
});

// ---------------------------------------------------------------- inválidas
test('una opción deshabilitada que trae valor es inválida', () => {
  const semi = config({ linea: { equipamiento: 'semi', ubicacionEquipo: 'remoto' } });
  assert.deepEqual(errores(semi), ['La ubicación del equipo solo se elige si la batea es equipada.']);

  const estatico = config({ linea: { frio: 'estatico' } }); // bandeja y rejilla vienen del default
  assert.equal(errores(estatico).length, 2);

  const sinCupulaConPuertas = config({
    modulos: [REMATE, { ...BATEA, cupula: 'sin_cupula', puertasTraseras: true }, REMATE],
  });
  assert.match(errores(sinCupulaConPuertas)[0], /solo van en bateas con cúpula/);
});

test('color: "negro" no existe en la epoxi, y con inox no se admite color', () => {
  assert.match(errores(config({ linea: { material: 'galvanizada_pintada', color: 'negro' } }))[0], /paleta/);
  const inoxConColor = config({ linea: { material: 'inox', color: 'plata' } });
  delete inoxConColor.linea.tina;
  delete inoxConColor.linea.zonaColor;
  assert.deepEqual(errores(inoxConColor), ['El acero inoxidable no se pinta.']);
  const sinColor = config();
  delete sinColor.linea.color;
  assert.match(errores(sinColor)[0], /paleta/);
});

test('estructura inválida: sin remates, bateas seguidas, 4 bateas', () => {
  assert.ok(errores(config({ modulos: [BATEA] })).length > 0);
  assert.ok(errores(config({ modulos: [REMATE, BATEA, BATEA, REMATE] })).length > 0);
  assert.ok(errores(config({ modulos: [REMATE, ESQUINERO, BATEA, REMATE] })).length > 0);
  const cuatro = [REMATE, BATEA, ESQUINERO, BATEA, ESQUINERO, BATEA, RINCONERO, BATEA, REMATE];
  assert.deepEqual(errores(config({ modulos: cuatro })), ['La línea puede tener hasta 3 bateas.']);
});

test('valores fuera del catálogo: largo de 900 mm, material inventado, campo extra', () => {
  assert.match(errores(config({ modulos: [REMATE, { ...BATEA, largo: 900 }, REMATE] }))[0], /largo/);
  assert.match(errores(config({ linea: { material: 'madera' } }))[0], /material/);
  assert.ok(errores(config({ linea: { precio: 1000 } })).length > 0); // no se aceptan campos desconocidos
});

// ---------------------------------------------------------------- estructura (v3)
test('estructura: obligatoria con sin cúpula con iluminación, ignorada con los otros tipos', () => {
  const conIluminacion = { ...BATEA, cupula: 'sin_cupula_iluminacion', puertasTraseras: undefined };
  delete conIluminacion.puertasTraseras;

  assert.deepEqual(errores(config({ modulos: [REMATE, { ...conIluminacion, estructura: 'recta' }, REMATE] })), []);
  assert.deepEqual(errores(config({ modulos: [REMATE, conIluminacion, REMATE] })), ['Falta elegir "estructura".']);
  assert.match(errores(config({ modulos: [REMATE, { ...conIluminacion, estructura: 'ovalada' }, REMATE] }))[0], /estructura/);

  // Con cúpula curva no aplica: si viene un valor, se ignora (no da error, a diferencia de las puertas traseras)
  assert.deepEqual(errores(config({ modulos: [REMATE, { ...BATEA, estructura: 'recta' }, REMATE] })), []);
});

test('estructura en la esquina: solo con frío y sin cúpula con iluminación; si no, se ignora', () => {
  const bateaIlum = { tipo: 'batea', largo: 2000, cupula: 'sin_cupula_iluminacion', estructura: 'recta', deposito: false };
  const esquinaIlum = { tipo: 'esquina', forma: 'esquinero', version: 'frio', cupula: 'sin_cupula_iluminacion', estructura: 'recta' };
  assert.deepEqual(errores(config({ modulos: [REMATE, bateaIlum, esquinaIlum, bateaIlum, REMATE] })), []);

  const { estructura, ...esquinaSinEstructura } = esquinaIlum;
  assert.equal(estructura, 'recta');
  assert.deepEqual(errores(config({ modulos: [REMATE, bateaIlum, esquinaSinEstructura, bateaIlum, REMATE] })), ['Falta elegir "estructura".']);

  const mostradorConEstructura = { tipo: 'esquina', forma: 'esquinero', version: 'mostrador', estructura: 'curva' };
  assert.deepEqual(errores(config({ modulos: [REMATE, BATEA, mostradorConEstructura, BATEA, REMATE] })), []);
});

test('una esquina nueva copia la estructura de la batea anterior', () => {
  const bateaIlum = { tipo: 'batea', largo: 2000, cupula: 'sin_cupula_iluminacion', estructura: 'recta', deposito: false };
  const esquina = moduloPorDefecto(catalogo, 'esquina', bateaIlum);
  assert.equal(esquina.cupula, 'sin_cupula_iluminacion');
  assert.equal(esquina.estructura, 'recta');
});

// ---------------------------------------------------------------- tina (v4 de la especificación)
test('tina: chapa blanca o acero con cuerpo de chapa; con inox no se elige', () => {
  assert.deepEqual(errores(config({ linea: { tina: 'inox' } })), []);
  assert.deepEqual(errores(config({ linea: { material: 'galvanizada_prepintada', color: 'negro', tina: 'chapa_blanca' } })), []);
  const inox = config({ linea: { material: 'inox' } });
  delete inox.linea.color;
  delete inox.linea.tina;
  delete inox.linea.zonaColor;
  assert.deepEqual(errores(inox), []);
  assert.deepEqual(errores({ ...inox, linea: { ...inox.linea, tina: 'chapa_blanca' } }), ['Con cuerpo de acero inoxidable, la tina también es de acero.']);
  const sinTina = config();
  delete sinTina.linea.tina;
  assert.deepEqual(errores(sinTina), ['Falta elegir "tina".']);
});

// ---------------------------------------------------------------- dónde va el color (v4)
test('zonaColor: faldón, zócalo o los dos con chapa; con inox no se elige', () => {
  for (const zona of ['faldon_y_zocalo', 'faldon', 'zocalo']) {
    assert.deepEqual(errores(config({ linea: { zonaColor: zona } })), [], zona);
  }
  assert.match(errores(config({ linea: { zonaColor: 'laterales' } }))[0], /zonaColor/);
  const sinZona = config();
  delete sinZona.linea.zonaColor;
  assert.deepEqual(errores(sinZona), ['Falta elegir "zonaColor".']);

  const inox = config({ linea: { material: 'inox' } });
  delete inox.linea.color;
  delete inox.linea.tina;
  assert.deepEqual(errores(inox), ['El acero inoxidable no se pinta.']); // queda zonaColor con inox
});

// ---------------------------------------------------------------- uniones: mostrador intermedio y directa
const MOSTRADOR_INTERMEDIO = { tipo: 'mostrador', largo: 900 };
const DIRECTA = { tipo: 'union' };

test('uniones: mostrador intermedio, directa y esquinas mezcladas son válidas', () => {
  assert.deepEqual(errores(config({ modulos: [REMATE, BATEA, MOSTRADOR_INTERMEDIO, BATEA, REMATE] })), []);
  assert.deepEqual(errores(config({ modulos: [REMATE, BATEA, DIRECTA, BATEA, REMATE] })), []);
  assert.deepEqual(errores(config({ modulos: [MOSTRADOR, BATEA, ESQUINERO, BATEA, { tipo: 'mostrador', largo: 1500 }, BATEA, REMATE] })), []);
});

test('uniones inválidas: en la punta, largo fuera de catálogo, directa con opciones', () => {
  assert.ok(errores(config({ modulos: [REMATE, MOSTRADOR_INTERMEDIO, BATEA, REMATE] })).length > 0);
  assert.ok(errores(config({ modulos: [REMATE, BATEA, DIRECTA, REMATE] })).length > 0);
  assert.match(errores(config({ modulos: [REMATE, BATEA, { tipo: 'mostrador', largo: 2000 }, BATEA, REMATE] }))[0], /largo/);
  assert.ok(errores(config({ modulos: [REMATE, BATEA, { tipo: 'union', largo: 900 }, BATEA, REMATE] })).length > 0);
});

test('el máximo sigue siendo 3 bateas aunque las uniones sean mostradores o directas', () => {
  const cuatro = [REMATE, BATEA, MOSTRADOR_INTERMEDIO, BATEA, DIRECTA, BATEA, MOSTRADOR_INTERMEDIO, BATEA, REMATE];
  assert.deepEqual(errores(config({ modulos: cuatro })), ['La línea puede tener hasta 3 bateas.']);
});

