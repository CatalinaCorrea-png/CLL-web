// Estado del configurador (zustand): la configuración de la línea y el módulo que se está editando.
// No toca la URL: eso lo hace useUrlConfig.js.
import { create } from 'zustand';
import catalogo from './modelo/catalogo.json';
import { normalizar, agregarBatea, quitarBatea } from './modelo/edicion.js';

/** @typedef {import('./modelo/reglas.js').ConfigParcial} ConfigParcial */

/**
 * @typedef {object} EstadoConfigurador
 * @property {ConfigParcial | null} config  null hasta que useUrlConfig la carga (desde la URL o por defecto)
 * @property {number} seleccionado          índice del módulo que se edita (1 = primera batea)
 * @property {(config: ConfigParcial | null) => void} cargar
 * @property {(indice: number) => void} seleccionar
 * @property {(id: string, valor: unknown) => void} setOpcionLinea
 * @property {(indice: number, id: string, valor: unknown) => void} setOpcionModulo
 * @property {() => void} agregarBatea
 * @property {(indice: number) => void} quitarBatea
 */

/** @type {import('zustand').StateCreator<EstadoConfigurador>} */
const crearEstado = (set) => ({
  config: null,
  seleccionado: 1,

  cargar: (config) => set({ config, seleccionado: 1 }),

  seleccionar: (indice) => set({ seleccionado: indice }),

  setOpcionLinea: (id, valor) =>
    set(({ config }) => (config
      ? { config: normalizar({ ...config, linea: { ...config.linea, [id]: valor } }, catalogo) }
      : {})),

  setOpcionModulo: (indice, id, valor) =>
    set(({ config }) => (config
      ? {
          config: normalizar(
            { ...config, modulos: config.modulos.map((m, i) => (i === indice ? { ...m, [id]: valor } : m)) },
            catalogo
          ),
        }
      : {})),

  // La batea nueva queda seleccionada (es el anteúltimo módulo, antes del remate derecho).
  agregarBatea: () =>
    set(({ config, seleccionado }) => {
      if (!config) return {};
      const nueva = agregarBatea(config, catalogo);
      return { config: nueva, seleccionado: nueva === config ? seleccionado : nueva.modulos.length - 2 };
    }),

  // Después de quitar, se selecciona la primera batea.
  quitarBatea: (indice) =>
    set(({ config, seleccionado }) => {
      if (!config) return {};
      const nueva = quitarBatea(config, indice);
      return { config: nueva, seleccionado: nueva === config ? seleccionado : 1 };
    }),
});

export const useConfigurador = create(crearEstado);
