// Reglas del configurador: qué opciones quedan deshabilitadas según la configuración actual.
// JS puro (sin React ni three): lo usa el panel en el navegador y el server para revalidar.
// Se edita SOLO en client/src/configurador/modelo/; el server tiene una copia (npm run sync-modelo).

/** @typedef {typeof import('./catalogo.json')} Catalogo */

/**
 * Configuración de línea tal como llega (puede estar incompleta o ser inválida).
 * @typedef {object} ConfigParcial
 * @property {Record<string, unknown>} linea
 * @property {Array<Record<string, unknown>>} modulos
 */

/**
 * Opción deshabilitada, con el motivo para mostrar en el tooltip.
 * @typedef {object} OpcionDeshabilitada
 * @property {'linea' | 'modulo'} ambito  si es una opción general o de un módulo
 * @property {number} [indice]            posición del módulo en config.modulos (solo ámbito 'modulo')
 * @property {string} opcion              id de la opción en el catálogo
 * @property {string} motivo
 */

/**
 * Opción del catálogo vista de forma genérica (el JSON tiene formas distintas por opción).
 * @typedef {object} OpcionCatalogo
 * @property {string} id
 * @property {Record<string, unknown>} [soloSi]  { campo: valor } o { campo: [valores] }
 * @property {string} [motivo]
 */

/**
 * ¿El objeto cumple la condición `soloSi`? Cada campo tiene que valer lo indicado
 * (o alguno de los valores, si es una lista).
 * @param {Record<string, unknown>} soloSi
 * @param {Record<string, unknown>} objeto
 */
const cumple = (soloSi, objeto) =>
  Object.entries(soloSi).every(([campo, esperado]) =>
    Array.isArray(esperado) ? esperado.includes(objeto[campo]) : objeto[campo] === esperado
  );

/**
 * Paleta de colores que corresponde a un material, o null si ese material no lleva color (inox).
 * @param {Catalogo} catalogo
 * @param {unknown} material  id del material (p. ej. 'galvanizada_pintada')
 * @returns {{ default: string, colores: Array<{ id: string, nombre: string, hex: string }> } | null}
 */
export const paletaDeColor = (catalogo, material) => {
  const opcionColor = /** @type {{ paletaSegun?: Record<string, string | null> } | undefined} */ (
    catalogo.opcionesLinea.find((o) => o.id === 'color')
  );
  const nombre = opcionColor?.paletaSegun?.[String(material)];
  if (!nombre) return null;
  /** @type {Record<string, { default: string, colores: Array<{ id: string, nombre: string, hex: string }> }>} */
  const paletas = catalogo.paletas;
  return paletas[nombre] ?? null;
};

/**
 * Devuelve las opciones que están deshabilitadas con la configuración actual y por qué.
 * No las oculta: el panel las muestra deshabilitadas con el motivo en un tooltip.
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 * @returns {OpcionDeshabilitada[]}
 */
export const opcionesDeshabilitadas = (config, catalogo) => {
  /** @type {OpcionDeshabilitada[]} */
  const deshabilitadas = [];

  // Opciones generales (valen para toda la línea)
  for (const o of /** @type {Array<OpcionCatalogo & { motivoSinPaleta?: string }>} */ (catalogo.opcionesLinea)) {
    if (o.soloSi && !cumple(o.soloSi, config.linea)) {
      deshabilitadas.push({ ambito: 'linea', opcion: o.id, motivo: o.motivo ?? '' });
    }
    if (o.id === 'color' && !paletaDeColor(catalogo, config.linea.material)) {
      deshabilitadas.push({ ambito: 'linea', opcion: o.id, motivo: o.motivoSinPaleta ?? '' });
    }
  }

  // Opciones de cada módulo (batea, esquina, remate)
  /** @type {Record<string, OpcionCatalogo[]>} */
  const opcionesPorModulo = catalogo.modulos;
  config.modulos.forEach((modulo, indice) => {
    const opciones = opcionesPorModulo[String(modulo.tipo)] ?? [];
    for (const o of opciones) {
      if (o.soloSi && !cumple(o.soloSi, modulo)) {
        deshabilitadas.push({ ambito: 'modulo', indice, opcion: o.id, motivo: o.motivo ?? '' });
      }
    }
  });

  return deshabilitadas;
};
