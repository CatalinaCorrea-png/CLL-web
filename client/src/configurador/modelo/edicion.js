// Operaciones de edición de una línea: mantener la configuración coherente, agregar y quitar bateas.
// JS puro (sin React ni three). Solo lo usa el client (store.js); no se copia al server.
import { opcionesDeshabilitadas, paletaDeColor, coloresDe } from './reglas.js';
import { moduloPorDefecto } from './esquema.js';

/** @typedef {import('./reglas.js').Catalogo} Catalogo */
/** @typedef {import('./reglas.js').ConfigParcial} ConfigParcial */

/**
 * Opción del catálogo vista de forma genérica.
 * @typedef {object} Opcion
 * @property {string} id
 * @property {string} tipo
 * @property {string | number | boolean} [default]
 * @property {boolean} [copiarDelAnterior]
 */

/**
 * Deja la configuración coherente después de un cambio:
 * - borra los valores de las opciones que quedaron deshabilitadas;
 * - completa las que se acaban de habilitar con su valor por defecto
 *   (o con el del módulo anterior, si la opción tiene `copiarDelAnterior`);
 * - corrige los colores (faldón y zócalo): si no son de la paleta del material ni "sin color" usa el de
 *   por defecto, y con inox los borra.
 * Repite hasta que no cambie nada, porque una opción puede habilitar otra (versión → cúpula → puertas).
 * No modifica la configuración recibida: devuelve una nueva.
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 * @returns {ConfigParcial}
 */
export const normalizar = (config, catalogo) => {
  /** @type {ConfigParcial} */
  const actual = structuredClone(config);
  /** @type {Record<string, Opcion[]>} */
  const opcionesPorModulo = catalogo.modulos;

  for (let pasada = 0; pasada < 5; pasada++) {
    const antes = JSON.stringify(actual);
    const deshabilitadas = opcionesDeshabilitadas(actual, catalogo);
    const deshabilitadaEnLinea = (/** @type {string} */ id) =>
      deshabilitadas.some((d) => d.ambito === 'linea' && d.opcion === id);
    const deshabilitadaEnModulo = (/** @type {string} */ id, /** @type {number} */ indice) =>
      deshabilitadas.some((d) => d.ambito === 'modulo' && d.indice === indice && d.opcion === id);

    // Opciones generales (el color se resuelve aparte)
    for (const o of /** @type {Opcion[]} */ (catalogo.opcionesLinea)) {
      if (o.tipo === 'color') continue;
      if (deshabilitadaEnLinea(o.id)) delete actual.linea[o.id];
      else if (actual.linea[o.id] === undefined) actual.linea[o.id] = o.default;
    }
    // Colores (faldón y zócalo): con inox no van; si el valor no es de la paleta ni "sin color", el default
    const paleta = paletaDeColor(catalogo, actual.linea.material);
    const colores = coloresDe(catalogo, actual.linea.material);
    for (const o of /** @type {Opcion[]} */ (catalogo.opcionesLinea)) {
      if (o.tipo !== 'color') continue;
      if (!paleta) delete actual.linea[o.id];
      else if (!colores.includes(String(actual.linea[o.id]))) actual.linea[o.id] = paleta.default;
    }

    // Opciones de cada módulo
    actual.modulos.forEach((modulo, indice) => {
      for (const o of opcionesPorModulo[String(modulo.tipo)] ?? []) {
        if (deshabilitadaEnModulo(o.id, indice)) {
          delete modulo[o.id];
        } else if (modulo[o.id] === undefined) {
          const delAnterior = o.copiarDelAnterior ? actual.modulos[indice - 1]?.[o.id] : undefined;
          modulo[o.id] = delAnterior ?? o.default;
        }
      }
    });

    if (JSON.stringify(actual) === antes) break;
  }
  return actual;
};

/**
 * Cantidad de bateas de la línea.
 * @param {ConfigParcial} config
 */
export const contarBateas = (config) => config.modulos.filter((m) => m.tipo === 'batea').length;

/**
 * ¿Se puede agregar otra batea? Devuelve el motivo si no (para el tooltip del botón).
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 * @returns {{ ok: boolean, motivo?: string }}
 */
export const puedeAgregarBatea = (config, catalogo) =>
  contarBateas(config) < catalogo.linea.maxBateas
    ? { ok: true }
    : { ok: false, motivo: `La línea puede tener hasta ${catalogo.linea.maxBateas} bateas.` };

/**
 * ¿Se puede quitar la batea en esa posición? Devuelve el motivo si no.
 * @param {ConfigParcial} config
 * @param {number} indice  posición del módulo en config.modulos
 * @returns {{ ok: boolean, motivo?: string }}
 */
export const puedeQuitarBatea = (config, indice) => {
  if (config.modulos[indice]?.tipo !== 'batea') return { ok: false, motivo: 'Elegí una batea para quitarla.' };
  if (contarBateas(config) <= 1) return { ok: false, motivo: 'La línea necesita al menos una batea.' };
  return { ok: true };
};

/**
 * Agrega una batea al final de la línea (antes del remate derecho), unida con una esquina.
 * La esquina nueva copia el tipo de exhibición de la batea anterior.
 * Si ya se llegó al máximo de bateas, devuelve la misma configuración.
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 * @returns {ConfigParcial}
 */
export const agregarBatea = (config, catalogo) => {
  if (!puedeAgregarBatea(config, catalogo).ok) return config;
  const modulos = [...config.modulos];
  const remateDerecho = /** @type {Record<string, unknown>} */ (modulos.pop());
  const bateaAnterior = modulos[modulos.length - 1];
  modulos.push(
    moduloPorDefecto(catalogo, 'esquina', bateaAnterior),
    moduloPorDefecto(catalogo, 'batea'),
    remateDerecho
  );
  return normalizar({ ...config, modulos }, catalogo);
};

/**
 * Cambia el tipo de una unión entre bateas (esquina, mostrador intermedio o directa).
 * El módulo nuevo arranca con sus valores por defecto; una esquina copia la cúpula y la estructura
 * de la batea anterior. Si la posición no es una unión o el tipo no existe, devuelve la misma configuración.
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 * @param {number} indice  posición de la unión en config.modulos
 * @param {string} tipo    uno de catalogo.uniones.valores
 * @returns {ConfigParcial}
 */
export const cambiarUnion = (config, catalogo, indice, tipo) => {
  /** @type {string[]} */
  const uniones = catalogo.uniones.valores;
  const actual = config.modulos[indice];
  if (!actual || !uniones.includes(String(actual.tipo)) || !uniones.includes(tipo) || actual.tipo === tipo) return config;
  const nuevo = moduloPorDefecto(catalogo, /** @type {import('./esquema.js').TipoModulo} */ (tipo), config.modulos[indice - 1]);
  return normalizar({ ...config, modulos: config.modulos.map((m, i) => (i === indice ? nuevo : m)) }, catalogo);
};

/**
 * Quita la batea en esa posición junto con la unión (esquina, mostrador o directa) que la une:
 * la de su izquierda, o la de su derecha si es la primera batea.
 * Si no se puede (no es una batea o es la única), devuelve la misma configuración.
 * @param {ConfigParcial} config
 * @param {number} indice  posición de la batea en config.modulos
 * @returns {ConfigParcial}
 */
export const quitarBatea = (config, indice) => {
  if (!puedeQuitarBatea(config, indice).ok) return config;
  const modulos = [...config.modulos];
  const desde = indice === 1 ? 1 : indice - 1; // [batea, esquina] o [esquina, batea]
  modulos.splice(desde, 2);
  return { ...config, modulos };
};
