// Textos para mostrar valores y módulos en lenguaje claro ("Cúpula curva", "2,00 m", "Batea 2").
// JS puro (sin React ni three). Hoy lo usa el panel; sirve también para el resumen y los mails.

/** @typedef {import('./reglas.js').Catalogo} Catalogo */
/** @typedef {import('./reglas.js').ConfigParcial} ConfigParcial */

/**
 * @typedef {object} OpcionConTextos
 * @property {string} [unidad]                    'mm' en las medidas
 * @property {Record<string, string>} [etiquetas] texto de cada valor
 */

/**
 * Milímetros → metros con coma decimal. Ej: 2000 → "2,00 m".
 * @param {number} mm
 */
export const formatearMetros = (mm) => `${(mm / 1000).toFixed(2).replace('.', ',')} m`;

/**
 * Texto de un valor de una opción. Ej: 'cupula_curva' → "Cúpula curva"; 2400 (mm) → "2,40 m".
 * @param {OpcionConTextos} opcion
 * @param {unknown} valor
 */
export const textoValor = (opcion, valor) => {
  if (typeof valor === 'number' && opcion.unidad === 'mm') return formatearMetros(valor);
  return opcion.etiquetas?.[String(valor)] ?? String(valor);
};

/**
 * Nombre de un módulo según su posición. Ej: "Batea 2", "Esquina 1", "Remate izquierdo".
 * @param {ConfigParcial} config
 * @param {number} indice  posición en config.modulos
 * @param {Catalogo} catalogo
 */
export const nombreModulo = (config, indice, catalogo) => {
  const tipo = String(config.modulos[indice]?.tipo);
  /** @type {Record<string, string>} */
  const nombres = catalogo.nombresModulo;
  if (tipo === 'remate') return `${nombres.remate} ${indice === 0 ? 'izquierdo' : 'derecho'}`;
  const numero = config.modulos.slice(0, indice + 1).filter((m) => m.tipo === tipo).length;
  return `${nombres[tipo] ?? tipo} ${numero}`;
};
