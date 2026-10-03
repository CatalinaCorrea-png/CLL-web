// Textos para mostrar valores y módulos en lenguaje claro ("Cúpula curva", "2,00 m", "Batea 2").
// JS puro (sin React ni three). Lo usan el panel, el resumen del pedido y los mails del server
// (se comparte con el server: npm run sync-modelo).
import { opcionesDeshabilitadas, paletaDeColor } from './reglas.js';

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

/**
 * Fila del resumen: nombre de la opción y su valor en lenguaje claro.
 * @typedef {{ nombre: string, valor: string }} FilaResumen
 */

/**
 * Resumen de la configuración para mostrar o mandar por mail.
 * @typedef {object} ResumenConfiguracion
 * @property {FilaResumen[]} linea                                   opciones generales
 * @property {Array<{ nombre: string, filas: FilaResumen[] }>} modulos  cada batea, unión, esquina y remate
 */

/**
 * @typedef {OpcionConTextos & { id: string, nombre: string, tipo: string }} OpcionResumen
 */

/**
 * Texto de un valor para el resumen: sí/no en las opciones booleanas y el nombre del color de la paleta.
 * @param {OpcionResumen} opcion
 * @param {unknown} valor
 * @param {Catalogo} catalogo
 * @param {Record<string, unknown>} linea
 */
const textoResumen = (opcion, valor, catalogo, linea) => {
  if (opcion.tipo === 'bool') return valor ? 'Sí' : 'No';
  if (opcion.tipo === 'color') {
    const color = paletaDeColor(catalogo, linea.material)?.colores.find((c) => c.id === valor);
    return color?.nombre ?? String(valor);
  }
  return textoValor(opcion, valor);
};

/**
 * Resumen en lenguaje claro de toda la línea: las opciones generales y, por separado, cada módulo.
 * Deja afuera las opciones que no aplican (las deshabilitadas) y los remates sin mostrador.
 * Nunca muestra los ids internos.
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 * @returns {ResumenConfiguracion}
 */
export const resumenConfiguracion = (config, catalogo) => {
  const deshabilitadas = opcionesDeshabilitadas(config, catalogo);
  /** @param {string} id @param {number} [indice] */
  const noAplica = (id, indice) =>
    deshabilitadas.some((d) => d.opcion === id && (indice === undefined ? d.ambito === 'linea' : d.ambito === 'modulo' && d.indice === indice));

  const linea = /** @type {OpcionResumen[]} */ (/** @type {unknown} */ (catalogo.opcionesLinea))
    .filter((o) => !noAplica(o.id) && config.linea[o.id] !== undefined)
    .map((o) => ({ nombre: o.nombre, valor: textoResumen(o, config.linea[o.id], catalogo, config.linea) }));

  /** @type {Record<string, OpcionResumen[]>} */
  const opcionesPorModulo = /** @type {any} */ (catalogo.modulos);
  /** @type {Record<string, string>} */
  const etiquetasUnion = catalogo.uniones.etiquetas;
  const modulos = config.modulos.flatMap((m, indice) => {
    const tipo = String(m.tipo);
    if (tipo === 'remate' && m.valor !== 'mostrador') return [];
    const nombre = nombreModulo(config, indice, catalogo);
    if (tipo === 'union') return [{ nombre, filas: [{ nombre: catalogo.uniones.nombre, valor: etiquetasUnion.union }] }];
    if (tipo === 'remate') return [{ nombre, filas: [{ nombre: 'Tipo', valor: 'Mostrador de remate' }] }];
    const filas = (opcionesPorModulo[tipo] ?? [])
      .filter((o) => !noAplica(o.id, indice) && m[o.id] !== undefined)
      .map((o) => ({ nombre: o.nombre, valor: textoResumen(o, m[o.id], catalogo, config.linea) }));
    return [{ nombre, filas }];
  });

  return { linea, modulos };
};
