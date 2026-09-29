// Serialización compacta de una configuración de línea para la URL (links compartibles).
// JS puro (sin React ni three). Solo lo usa el client; no se copia al server.
//
// Formato:  ?producto=bateas&v=1&l=000001000&m=r0.b2200.r0
//   v  versión del catálogo.
//   l  un carácter por opción general, en el orden del catálogo: índice del valor en `valores`
//      en base 36 (para `color`, índice en la paleta del material), o "-" si no aplica.
//   m  módulos separados por ".": letra del tipo (r remate, b batea, e esquina) + un carácter
//      por opción del módulo, igual que en `l`. Los bool son 0/1.
//
// ⚠️ Los links dependen del ORDEN de los valores en el catálogo: si se reordenan o se sacan
// valores, hay que subir `version` en catalogo.json (los links viejos quedan inválidos y el
// configurador abre con la configuración por defecto, en vez de leerlos mal).
import { paletaDeColor } from './reglas.js';

/** @typedef {import('./reglas.js').Catalogo} Catalogo */
/** @typedef {import('./reglas.js').ConfigParcial} ConfigParcial */

/**
 * @typedef {object} Opcion
 * @property {string} id
 * @property {string} tipo  'select' | 'bool' | 'color'
 * @property {Array<string | number>} [valores]
 */

/** @type {Record<string, string>} */
const LETRA_DE_TIPO = { remate: 'r', batea: 'b', esquina: 'e' };
/** @type {Record<string, string>} */
const TIPO_DE_LETRA = { r: 'remate', b: 'batea', e: 'esquina' };
const SIN_VALOR = '-';

/**
 * Valores posibles de una opción (para `color`, los ids de la paleta del material).
 * @param {Opcion} opcion
 * @param {Catalogo} catalogo
 * @param {Record<string, unknown>} linea
 * @returns {Array<string | number>}
 */
const valoresDe = (opcion, catalogo, linea) =>
  opcion.tipo === 'color'
    ? (paletaDeColor(catalogo, linea.material)?.colores.map((c) => c.id) ?? [])
    : (opcion.valores ?? []);

/**
 * @param {Opcion} opcion
 * @param {unknown} valor
 * @param {Catalogo} catalogo
 * @param {Record<string, unknown>} linea
 */
const codificar = (opcion, valor, catalogo, linea) => {
  if (valor === undefined) return SIN_VALOR;
  if (opcion.tipo === 'bool') return valor ? '1' : '0';
  const indice = valoresDe(opcion, catalogo, linea).indexOf(/** @type {string | number} */ (valor));
  return indice >= 0 && indice < 36 ? indice.toString(36) : SIN_VALOR;
};

/**
 * @param {Opcion} opcion
 * @param {string} caracter
 * @param {Catalogo} catalogo
 * @param {Record<string, unknown>} linea
 */
const decodificar = (opcion, caracter, catalogo, linea) => {
  if (caracter === SIN_VALOR) return undefined;
  if (opcion.tipo === 'bool') {
    if (caracter !== '0' && caracter !== '1') throw new Error(`bool inválido en "${opcion.id}"`);
    return caracter === '1';
  }
  const valor = valoresDe(opcion, catalogo, linea)[parseInt(caracter, 36)];
  if (valor === undefined) throw new Error(`índice inválido en "${opcion.id}"`);
  return valor;
};

/**
 * Configuración → parámetros de URL.
 * @param {ConfigParcial} config
 * @param {Catalogo} catalogo
 * @returns {{ v: string, l: string, m: string }}
 */
export const serializar = (config, catalogo) => {
  /** @type {Record<string, Opcion[]>} */
  const opcionesPorModulo = catalogo.modulos;
  const l = /** @type {Opcion[]} */ (catalogo.opcionesLinea)
    .map((o) => codificar(o, config.linea[o.id], catalogo, config.linea))
    .join('');
  const m = config.modulos
    .map((modulo) => {
      const tipo = String(modulo.tipo);
      const opciones = opcionesPorModulo[tipo] ?? [];
      return LETRA_DE_TIPO[tipo] + opciones.map((o) => codificar(o, modulo[o.id], catalogo, config.linea)).join('');
    })
    .join('.');
  return { v: String(catalogo.version), l, m };
};

/**
 * Parámetros de URL → configuración, o null si el formato está roto o es de otra versión del catálogo.
 * No valida las reglas: quien la usa tiene que pasar el resultado por crearEsquema(catalogo).
 * @param {{ v?: string | null, l?: string | null, m?: string | null }} params
 * @param {Catalogo} catalogo
 * @returns {ConfigParcial | null}
 */
export const deserializar = ({ v, l, m }, catalogo) => {
  try {
    if (v !== String(catalogo.version) || !l || !m) return null;
    const opcionesLinea = /** @type {Opcion[]} */ (catalogo.opcionesLinea);
    if (l.length !== opcionesLinea.length) return null;

    // La línea se decodifica en orden: el material viene antes que el color, que depende de él.
    /** @type {Record<string, unknown>} */
    const linea = {};
    opcionesLinea.forEach((o, i) => {
      const valor = decodificar(o, l[i], catalogo, linea);
      if (valor !== undefined) linea[o.id] = valor;
    });

    /** @type {Record<string, Opcion[]>} */
    const opcionesPorModulo = catalogo.modulos;
    const modulos = m.split('.').map((texto) => {
      const tipo = TIPO_DE_LETRA[texto[0]];
      const opciones = opcionesPorModulo[tipo];
      if (!opciones || texto.length !== opciones.length + 1) throw new Error(`módulo inválido: "${texto}"`);
      /** @type {Record<string, unknown>} */
      const modulo = { tipo };
      opciones.forEach((o, i) => {
        const valor = decodificar(o, texto[i + 1], catalogo, linea);
        if (valor !== undefined) modulo[o.id] = valor;
      });
      return modulo;
    });

    return { linea, modulos };
  } catch {
    return null;
  }
};
