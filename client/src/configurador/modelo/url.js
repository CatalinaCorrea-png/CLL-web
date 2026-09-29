// Serialización compacta de una configuración de línea para la URL (links compartibles).
// JS puro (sin React ni three). Solo lo usa el client; no se copia al server.
//
// Formato:  ?producto=bateas&v=5&l=0000010010&m=r0.b22-00.r0
//   v  versión del catálogo.
//   l  un carácter por opción general, en el orden del catálogo: índice del valor en `valores`
//      en base 36 (para `color`, índice en la paleta del material), o "-" si no aplica.
//   m  módulos separados por ".": letra del tipo (r remate, b batea, e esquina, o mostrador intermedio,
//      u unión directa, que no lleva opciones) + un carácter
//      por opción del módulo, igual que en `l`. Los bool son 0/1.
//
// ⚠️ Los links dependen del ORDEN de las opciones y de sus valores en el catálogo. Si se agregan
// opciones en el medio, se reordenan o se sacan valores, hay que subir `version` en catalogo.json
// y sumar abajo, en MIGRACIONES, cómo pasar un link de la versión anterior a la nueva (con su test),
// para que los links que ya se compartieron sigan abriendo.
import { paletaDeColor } from './reglas.js';
import { crearEsquema, configuracionPorDefecto } from './esquema.js';
import { normalizar } from './edicion.js';

/**
 * Inserta "-" (sin valor) en una posición de los módulos de cierto tipo.
 * @param {string} m        parámetro `m` del link
 * @param {string} letra    tipo de módulo ('b' batea, 'e' esquina, 'r' remate)
 * @param {number} posicion índice del carácter nuevo dentro del módulo (la letra es la posición 0)
 */
const insertarSinValor = (m, letra, posicion) =>
  m.split('.').map((t) => (t[0] === letra ? t.slice(0, posicion) + '-' + t.slice(posicion) : t)).join('.');

/**
 * Migraciones de links: MIGRACIONES[n] convierte los parámetros de la versión n a la n + 1.
 * @type {Record<number, (p: { l: string, m: string }) => { l: string, m: string }>}
 */
const MIGRACIONES = {
  // v1 → v2: se agregó `estructura` después de `cupula` en la batea (posición 3) y en la esquina (posición 4).
  // Queda sin valor; normalizar() le pone el default si aplica.
  1: ({ l, m }) => ({ l, m: insertarSinValor(insertarSinValor(m, 'b', 3), 'e', 4) }),
  // v2 → v3: se sacó `lateral` (posición 2 de la línea) y en su lugar entró `tina`.
  // Queda sin valor; normalizar() le pone el default (chapa blanca) si el material es chapa.
  2: ({ l, m }) => ({ l: l.slice(0, 2) + '-' + l.slice(3), m }),
  // v3 → v4: se agregó `zonaColor` (dónde va el color) después de `color` (posición 2 de la línea).
  // Queda sin valor; normalizar() le pone el default (faldón y zócalo) si el material es chapa.
  3: ({ l, m }) => ({ l: l.slice(0, 2) + '-' + l.slice(2), m }),
  // v4 → v5: se reordenaron las opciones de la línea: frío, bandeja y rejilla pasaron antes de
  // equipamiento y ubicación del equipo. v4: material, color, zona, tina, producto, equipamiento (5),
  // ubicación (6), frío (7), bandeja (8), rejilla (9).
  4: ({ l, m }) => ({ l: l.slice(0, 5) + l[7] + l[8] + l[9] + l[5] + l[6], m }),
};

/** @typedef {import('./reglas.js').Catalogo} Catalogo */
/** @typedef {import('./reglas.js').ConfigParcial} ConfigParcial */

/**
 * @typedef {object} Opcion
 * @property {string} id
 * @property {string} tipo  'select' | 'bool' | 'color'
 * @property {Array<string | number>} [valores]
 */

/** @type {Record<string, string>} */
const LETRA_DE_TIPO = { remate: 'r', batea: 'b', esquina: 'e', mostrador: 'o', union: 'u' };
/** @type {Record<string, string>} */
const TIPO_DE_LETRA = { r: 'remate', b: 'batea', e: 'esquina', o: 'mostrador', u: 'union' };
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
 * Parámetros de URL → configuración, o null si el formato está roto o la versión no se puede leer.
 * Los links de versiones anteriores se migran con MIGRACIONES antes de decodificar.
 * No completa ni valida: quien la usa tiene que pasar el resultado por normalizar() y crearEsquema().
 * @param {{ v?: string | null, l?: string | null, m?: string | null }} params
 * @param {Catalogo} catalogo
 * @returns {ConfigParcial | null}
 */
export const deserializar = (params, catalogo) => {
  try {
    const version = Number(params.v);
    if (!Number.isInteger(version) || version < 1 || version > catalogo.version || !params.l || !params.m) return null;

    // Llevar el link desde su versión hasta la actual
    let { l, m } = { l: params.l, m: params.m };
    for (let n = version; n < catalogo.version; n++) {
      const migrar = MIGRACIONES[n];
      if (!migrar) return null;
      ({ l, m } = migrar({ l, m }));
    }

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

/**
 * Configuración que indica un link: lo lee (migrándolo si es de una versión anterior), lo normaliza
 * (completa opciones que faltan, como la estructura de un link v1, y descarta las que no aplican)
 * y lo valida. Si algo falla, devuelve la configuración por defecto.
 * @param {{ v?: string | null, l?: string | null, m?: string | null }} params
 * @param {Catalogo} catalogo
 * @returns {{ config: ConfigParcial, desdeLink: boolean }}  desdeLink = false si se usó la de por defecto
 */
export const configDesdeLink = (params, catalogo) => {
  const leida = deserializar(params, catalogo);
  if (leida) {
    const normalizada = normalizar(leida, catalogo);
    if (crearEsquema(catalogo).safeParse(normalizada).success) return { config: normalizada, desdeLink: true };
  }
  return { config: configuracionPorDefecto(catalogo), desdeLink: false };
};
