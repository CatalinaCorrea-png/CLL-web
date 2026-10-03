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
 * Opción del catálogo con lo que usan los textos. `frase` es una plantilla con {valor} para leer la
 * opción dentro de una oración ("tina de {valor}"); `frases` da el texto de cada valor (null = no se
 * menciona). Sin ninguna de las dos, va la etiqueta en minúscula.
 * @typedef {OpcionConTextos & { id: string, nombre: string, tipo: string, frase?: string,
 *   frases?: Record<string, string | null> }} OpcionResumen
 */

/**
 * Opción de la configuración que aplica, con su valor.
 * @typedef {{ opcion: OpcionResumen, valor: unknown }} ItemConfig
 */

/**
 * Recorre la configuración: opciones generales y módulos, dejando afuera lo que no aplica
 * (opciones deshabilitadas, remates sin mostrador). Base del resumen, las frases y el resumen corto.
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 */
const recorrer = (config, catalogo) => {
  const deshabilitadas = opcionesDeshabilitadas(config, catalogo);
  /** @param {string} id @param {number} [indice] */
  const noAplica = (id, indice) =>
    deshabilitadas.some((d) => d.opcion === id && (indice === undefined ? d.ambito === 'linea' : d.ambito === 'modulo' && d.indice === indice));

  /** @type {ItemConfig[]} */
  const linea = /** @type {OpcionResumen[]} */ (/** @type {unknown} */ (catalogo.opcionesLinea))
    .filter((o) => !noAplica(o.id) && config.linea[o.id] !== undefined)
    .map((opcion) => ({ opcion, valor: config.linea[opcion.id] }));

  /** @type {Record<string, OpcionResumen[]>} */
  const opcionesPorModulo = /** @type {any} */ (catalogo.modulos);
  const modulos = config.modulos.flatMap((m, indice) => {
    const tipo = String(m.tipo);
    if (tipo === 'remate' && m.valor !== 'mostrador') return [];
    /** @type {ItemConfig[]} */
    const items = tipo === 'remate' ? [] : (opcionesPorModulo[tipo] ?? [])
      .filter((o) => !noAplica(o.id, indice) && m[o.id] !== undefined)
      .map((opcion) => ({ opcion, valor: m[opcion.id] }));
    return [{ nombre: nombreModulo(config, indice, catalogo), tipo, items }];
  });

  return { linea, modulos };
};

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
  const { linea, modulos } = recorrer(config, catalogo);
  /** @type {Record<string, string>} */
  const etiquetasUnion = catalogo.uniones.etiquetas;
  /** @param {ItemConfig} item */
  const fila = ({ opcion, valor }) => ({ nombre: opcion.nombre, valor: textoResumen(opcion, valor, catalogo, config.linea) });
  return {
    linea: linea.map(fila),
    modulos: modulos.map(({ nombre, tipo, items }) => ({
      nombre,
      filas: tipo === 'union' ? [{ nombre: catalogo.uniones.nombre, valor: etiquetasUnion.union }]
        : tipo === 'remate' ? [{ nombre: 'Tipo', valor: 'Mostrador de remate' }]
          : items.map(fila),
    })),
  };
};

/** Primera letra en minúscula ("Cúpula curva" → "cúpula curva"; "2,40 m" queda igual). */
const minuscula = (/** @type {string} */ t) => t.charAt(0).toLocaleLowerCase('es') + t.slice(1);

/**
 * Cómo se lee una opción dentro de una frase, o null si no se menciona (p. ej. un "No" o "Ninguna").
 * @param {OpcionResumen} opcion
 * @param {unknown} valor
 * @param {Catalogo} catalogo
 * @param {Record<string, unknown>} linea
 * @returns {string | null}
 */
const fraseDe = (opcion, valor, catalogo, linea) => {
  if (opcion.tipo === 'bool') return valor ? (opcion.frase ?? minuscula(opcion.nombre)) : null;
  if (opcion.frases && String(valor) in opcion.frases) return opcion.frases[String(valor)];
  const texto = minuscula(textoResumen(opcion, valor, catalogo, linea));
  return opcion.frase ? opcion.frase.replace('{valor}', texto) : texto;
};

/**
 * La configuración en frases, para el resumen antes de pedir presupuesto. Ej.:
 *   linea: "chapa galvanizada pintada, color rojo, color en faldón y zócalo, tina de chapa blanca, …"
 *   modulos: [{ nombre: "Batea 1", texto: "2,40 m, sin cúpula con iluminación, estructura curva (arcos), con depósito" },
 *             { nombre: "Esquina 1", texto: "esquinero, tipo mostrador" }, …]
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 * @returns {{ linea: string, modulos: Array<{ nombre: string, texto: string }> }}
 */
export const frasesConfiguracion = (config, catalogo) => {
  const { linea, modulos } = recorrer(config, catalogo);
  /** @param {ItemConfig[]} items */
  const frase = (items) => items
    .map(({ opcion, valor }) => fraseDe(opcion, valor, catalogo, config.linea))
    .filter((t) => t)
    .join(', ');
  return {
    linea: frase(linea),
    modulos: modulos.map(({ nombre, tipo, items }) => ({
      nombre,
      texto: tipo === 'union' ? 'directa (las bateas quedan pegadas)'
        : tipo === 'remate' ? 'mostrador de remate'
          : frase(items),
    })),
  };
};
