// Esquema zod de una configuración de línea y valores por defecto.
// JS puro (sin React ni three): lo usa el client (URL, store) y el server (revalidar el pedido).
// Se edita SOLO en client/src/configurador/modelo/; el server tiene una copia (npm run sync-modelo).
//
// Una línea es: remate – batea – [esquina – batea] × 0..2 – remate.
// Formato:
//   { linea: { material, color, frio, ... },
//     modulos: [ { tipo: 'remate', valor }, { tipo: 'batea', largo, cupula, ... }, { tipo: 'esquina', forma, version }, ... ] }
import { z } from 'zod';
import { opcionesDeshabilitadas, paletaDeColor } from './reglas.js';

/** @typedef {import('./reglas.js').Catalogo} Catalogo */

/**
 * Opción del catálogo vista de forma genérica.
 * @typedef {object} Opcion
 * @property {string} id
 * @property {string} tipo  'select' | 'bool' | 'color'
 * @property {Array<string | number>} [valores]
 * @property {string | number | boolean} [default]
 * @property {Record<string, unknown>} [soloSi]
 * @property {boolean} [copiarDelAnterior]  al crear el módulo, toma el valor del módulo anterior
 * @property {boolean} [ocultarSiNoAplica]  cuando está deshabilitada no se muestra y su valor se ignora al validar
 */

const TIPOS_MODULO = /** @type {const} */ (['remate', 'batea', 'esquina']);

/**
 * Campo zod para una opción 'select' o 'bool'. Las que dependen de otra (soloSi) son opcionales:
 * si la condición no se cumple, no deben venir (lo controla el superRefine).
 * @param {Opcion} opcion
 */
const campoDeOpcion = (opcion) => {
  let campo;
  if (opcion.tipo === 'bool') {
    campo = z.boolean();
  } else {
    const valores = opcion.valores ?? [];
    campo = z.union([z.string(), z.number()]).refine((v) => valores.includes(v), {
      message: `Valor inválido para "${opcion.id}". Opciones: ${valores.join(', ')}`,
    });
  }
  return opcion.soloSi ? campo.optional() : campo;
};

/**
 * Esquema zod de una configuración de línea, armado a partir de los valores del catálogo.
 * @param {Catalogo} catalogo
 */
export const crearEsquema = (catalogo) => {
  // --- Opciones generales ---
  /** @type {Record<string, z.ZodType>} */
  const camposLinea = {};
  for (const opcion of /** @type {Opcion[]} */ (catalogo.opcionesLinea)) {
    // El color depende del material: se valida contra la paleta en el superRefine.
    camposLinea[opcion.id] = opcion.tipo === 'color' ? z.string().optional() : campoDeOpcion(opcion);
  }

  // --- Módulos: uno por tipo, discriminados por "tipo" ---
  /** @type {Record<string, Opcion[]>} */
  const opcionesPorModulo = catalogo.modulos;
  const esquemasModulo = TIPOS_MODULO.map((tipo) => {
    /** @type {Record<string, z.ZodType>} */
    const campos = { tipo: z.literal(tipo) };
    for (const opcion of opcionesPorModulo[tipo]) campos[opcion.id] = campoDeOpcion(opcion);
    return z.strictObject(campos);
  });

  return z
    .strictObject({
      linea: z.strictObject(camposLinea),
      modulos: z.array(z.discriminatedUnion('tipo', /** @type {any} */ (esquemasModulo))),
    })
    .superRefine((config, ctx) => {
      const { linea } = config;
      const modulos = /** @type {Array<Record<string, unknown>>} */ (config.modulos);

      // 1) Estructura: remate – batea – [esquina – batea]… – remate, con 1..maxBateas bateas
      const tipos = modulos.map((m) => m.tipo);
      const interior = tipos.slice(1, -1);
      const alternaBien = interior.length % 2 === 1 &&
        interior.every((t, i) => t === (i % 2 === 0 ? 'batea' : 'esquina'));
      if (tipos.length < 3 || tipos[0] !== 'remate' || tipos[tipos.length - 1] !== 'remate' || !alternaBien) {
        ctx.addIssue({
          code: 'custom',
          path: ['modulos'],
          message: 'La línea tiene que ser: remate – batea – (esquina – batea)… – remate.',
        });
        return; // sin estructura válida, el resto de los chequeos no tiene sentido
      }
      const bateas = interior.filter((t) => t === 'batea').length;
      if (bateas > catalogo.linea.maxBateas) {
        ctx.addIssue({
          code: 'custom',
          path: ['modulos'],
          message: `La línea puede tener hasta ${catalogo.linea.maxBateas} bateas.`,
        });
      }

      // 2) Opciones deshabilitadas que igual traen valor. Las marcadas con `ocultarSiNoAplica`
      //    (p. ej. la estructura) no dan error: su valor simplemente se ignora.
      const deshabilitadas = opcionesDeshabilitadas({ linea, modulos }, catalogo);
      /** @param {import('./reglas.js').OpcionDeshabilitada} d */
      const seIgnora = (d) => {
        const opciones = d.ambito === 'linea'
          ? /** @type {Opcion[]} */ (catalogo.opcionesLinea)
          : opcionesPorModulo[String(modulos[d.indice ?? -1]?.tipo)] ?? [];
        return opciones.find((o) => o.id === d.opcion)?.ocultarSiNoAplica === true;
      };
      for (const d of deshabilitadas) {
        const origen = d.ambito === 'linea' ? linea : modulos[d.indice ?? -1];
        if (origen?.[d.opcion] !== undefined && !seIgnora(d)) {
          ctx.addIssue({
            code: 'custom',
            path: d.ambito === 'linea' ? ['linea', d.opcion] : ['modulos', d.indice ?? -1, d.opcion],
            message: d.motivo,
          });
        }
      }

      // 2b) Opciones condicionales habilitadas que faltan. Solo las 'select':
      //     un 'bool' que falta cuenta como false.
      const estaDeshabilitada = (/** @type {string} */ opcion, /** @type {number | undefined} */ indice) =>
        deshabilitadas.some((d) => d.opcion === opcion && d.indice === indice);
      /** @param {Opcion} o @param {Record<string, unknown>} origen @param {Array<string | number>} ruta @param {number} [indice] */
      const exigir = (o, origen, ruta, indice) => {
        if (o.soloSi && o.tipo === 'select' && origen[o.id] === undefined && !estaDeshabilitada(o.id, indice)) {
          ctx.addIssue({ code: 'custom', path: [...ruta, o.id], message: `Falta elegir "${o.id}".` });
        }
      };
      for (const o of /** @type {Opcion[]} */ (catalogo.opcionesLinea)) exigir(o, linea, ['linea']);
      modulos.forEach((m, i) => {
        for (const o of opcionesPorModulo[String(m.tipo)] ?? []) exigir(o, m, ['modulos', i], i);
      });

      // 3) Color: obligatorio y de la paleta del material (el inox ya quedó cubierto en el paso 2)
      const paleta = paletaDeColor(catalogo, linea.material);
      if (paleta && !paleta.colores.some((c) => c.id === linea.color)) {
        ctx.addIssue({
          code: 'custom',
          path: ['linea', 'color'],
          message: `Elegí un color de la paleta: ${paleta.colores.map((c) => c.id).join(', ')}.`,
        });
      }
    });
};

/** @typedef {import('zod').infer<ReturnType<typeof crearEsquema>>} ConfigLinea */

/**
 * Valores por defecto de un tipo de módulo, sin las opciones que quedan deshabilitadas.
 * Las opciones con `copiarDelAnterior` toman el valor del módulo anterior si lo tiene
 * (p. ej. una esquina nueva copia la cúpula de la batea de su izquierda).
 * @param {Catalogo} catalogo
 * @param {'remate' | 'batea' | 'esquina'} tipo
 * @param {Record<string, unknown>} [anterior]  módulo que queda a la izquierda del nuevo
 * @returns {Record<string, unknown>}
 */
export const moduloPorDefecto = (catalogo, tipo, anterior) => {
  /** @type {Record<string, Opcion[]>} */
  const opcionesPorModulo = catalogo.modulos;
  /** @type {Record<string, unknown>} */
  const modulo = { tipo };
  for (const o of opcionesPorModulo[tipo]) {
    const copiado = o.copiarDelAnterior ? anterior?.[o.id] : undefined;
    modulo[o.id] = copiado ?? o.default;
  }
  for (const d of opcionesDeshabilitadas({ linea: {}, modulos: [modulo] }, catalogo)) {
    if (d.ambito === 'modulo') delete modulo[d.opcion];
  }
  return modulo;
};

/**
 * Configuración inicial: una sola batea con los valores por defecto y sin remates.
 * @param {Catalogo} catalogo
 */
export const configuracionPorDefecto = (catalogo) => {
  /** @type {Record<string, unknown>} */
  const linea = {};
  for (const o of /** @type {Opcion[]} */ (catalogo.opcionesLinea)) {
    if (o.tipo !== 'color') linea[o.id] = o.default;
  }
  linea.color = paletaDeColor(catalogo, linea.material)?.default;

  const modulos = [
    moduloPorDefecto(catalogo, 'remate'),
    moduloPorDefecto(catalogo, 'batea'),
    moduloPorDefecto(catalogo, 'remate'),
  ];

  // Sacar lo que quede deshabilitado con los valores por defecto
  for (const d of opcionesDeshabilitadas({ linea, modulos }, catalogo)) {
    if (d.ambito === 'linea') delete linea[d.opcion];
  }
  return { linea, modulos };
};
