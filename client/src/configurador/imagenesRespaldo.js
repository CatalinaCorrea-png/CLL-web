// Imágenes de referencia para el modo sin WebGL (prompt 7): una por tipo de módulo, sacadas del propio
// configurador con `npm run capturas-respaldo` (scripts/capturas-respaldo.mjs) y guardadas en
// public/bateas/configurador/. Los textos salen de las etiquetas del catálogo.
import catalogo from './modelo/catalogo.json';
import { textoValor } from './modelo/textos.js';

/** @typedef {import('./modelo/reglas.js').ConfigParcial} ConfigParcial */
/** @typedef {{ clave: string, src: string, texto: string }} ImagenRespaldo */

export const CARPETA_RESPALDO = '/bateas/configurador';

/**
 * Opción de un módulo del catálogo, por id.
 * @param {'batea' | 'esquina' | 'remate'} tipo
 * @param {string} id
 * @returns {import('./modelo/textos.js').OpcionConTextos}
 */
const opcion = (tipo, id) =>
  /** @type {import('./modelo/textos.js').OpcionConTextos} */ (
    /** @type {Array<{ id: string }>} */ (catalogo.modulos[tipo]).find((o) => o.id === id) ?? {}
  );

/**
 * Clave e imagen de un módulo, o null si no se muestra (uniones directas, remates "ninguno").
 * @param {Record<string, unknown>} m
 * @returns {Omit<ImagenRespaldo, 'src'> | null}
 */
const imagenDe = (m) => {
  if (m.tipo === 'batea') {
    const cupula = String(m.cupula);
    const texto = textoValor(opcion('batea', 'cupula'), cupula);
    if (cupula !== 'sin_cupula_iluminacion') return { clave: cupula, texto };
    const estructura = m.estructura === 'recta' ? 'recta' : 'curva';
    return { clave: `iluminacion_${estructura}`, texto: `${texto}, estructura ${textoValor(opcion('batea', 'estructura'), estructura).toLowerCase()}` };
  }
  if (m.tipo === 'esquina') {
    const forma = m.forma === 'rinconero' ? 'rinconero' : 'esquinero';
    const version = m.version === 'mostrador' ? 'mostrador' : 'frio';
    return {
      clave: `${forma}_${version}`,
      texto: `${textoValor(opcion('esquina', 'forma'), forma)} ${version === 'frio' ? 'con frío' : 'tipo mostrador'}`,
    };
  }
  if (m.tipo === 'mostrador') return { clave: 'mostrador', texto: 'Mostrador intermedio' };
  if (m.tipo === 'remate' && m.valor === 'mostrador') return { clave: 'remate', texto: 'Mostrador de remate' };
  return null;
};

/**
 * Una imagen por cada tipo distinto de módulo de la línea, en el orden en que aparecen.
 * @param {ConfigParcial} config
 * @returns {ImagenRespaldo[]}
 */
export const imagenesDeLinea = (config) => {
  /** @type {Map<string, ImagenRespaldo>} */
  const imagenes = new Map();
  for (const m of config.modulos) {
    const im = imagenDe(m);
    if (im && !imagenes.has(im.clave)) imagenes.set(im.clave, { ...im, src: `${CARPETA_RESPALDO}/${im.clave}.webp` });
  }
  return [...imagenes.values()];
};

