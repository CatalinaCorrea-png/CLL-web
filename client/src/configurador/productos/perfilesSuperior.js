// Perfiles de la parte de arriba de la batea, en el plano (z, y) de una batea recta.
// Los usa la batea (extruidos a lo largo) y la esquina con frío (barridos por el quiebre), así las
// dos piezas quedan idénticas y se unen sin saltos.
//   banda   → piezas que corren a lo largo (vidrios, perfiles, marcos, LED)
//   corte   → pieza que se repite en cada corte (arco de aluminio o parante de inox)
//   paso    → distancia entre cortes (paños o arcos); Infinity = solo en las puntas
import { MEDIDAS } from './medidas.js';
import {
  Z_VIDRIO_FRENTE, bandaSobreCurva, curvaCupula, anguloDeAltura, formaDesdePuntos, perfilVidrioLateral, rectZY,
} from './geometria.js';

const T = MEDIDAS.altoTotal;    // tope de la parte de arriba
const R = MEDIDAS.altoRiel;     // donde apoya el vidrio del frente
const ZF = Z_VIDRIO_FRENTE;     // plano del vidrio del frente
const ZT = MEDIDAS.zTopeCurva;  // tope de la curva (cúpula curva y arcos)
const ZA = MEDIDAS.fondoTecho;  // borde de atrás del techo recto
const ESP = MEDIDAS.espesorVidrio;

/**
 * Pieza de un perfil: su forma en (z, y) y el nombre del material (clave de MaterialesBatea).
 * @typedef {{ forma: import('three').Shape, material: string }} PiezaPerfil
 */

/**
 * @typedef {object} PerfilesSuperior
 * @property {PiezaPerfil[]} banda
 * @property {(PiezaPerfil & { ancho: number }) | null} corte
 * @property {number} paso
 * @property {import('three').Shape | null} vidrioLateral  vidrio que cierra cada punta de la batea
 */

// ------------------------------------------------------------------ formas
const VIDRIO_CURVO = bandaSobreCurva(0, Math.PI / 2, ESP);
const ARCO = bandaSobreCurva(0, Math.PI / 2, MEDIDAS.anchoArco);
const VIDRIO_BAJO_CURVO = bandaSobreCurva(0, anguloDeAltura(R + (T - R) / 4), ESP); // primer cuarto de la curva
const LATERAL_CURVO = perfilVidrioLateral([...curvaCupula(0, Math.PI / 2), [ZT - 0.08, T]]);
const LATERAL_RECTO = perfilVidrioLateral([[ZF, R], [ZF, T], [ZA, T]]);
const DEFLECTOR = (() => {
  const a = (MEDIDAS.inclinacionDeflector * Math.PI) / 180;
  const dz = -Math.sin(a) * MEDIDAS.altoDeflector, dy = Math.cos(a) * MEDIDAS.altoDeflector;
  return formaDesdePuntos([[ZF, R], [ZF + dz, R + dy], [ZF + dz - ESP, R + dy], [ZF - ESP, R]]);
})();

// Techo recto (cúpula recta y sin cúpula con iluminación de estructura recta): vidrio superior,
// travesaños de inox adelante y atrás, y LED bajo el travesaño de adelante.
const TECHO_RECTO = /** @type {PiezaPerfil[]} */ ([
  { forma: rectZY(ZA, ZF, T - 0.01, T), material: 'vidrio' },
  { forma: rectZY(ZF - 0.03, ZF + 0.005, T - 0.035, T + 0.005), material: 'inox' },
  { forma: rectZY(ZA - 0.005, ZA + 0.025, T - 0.035, T + 0.005), material: 'inox' },
  { forma: rectZY(ZF - 0.028, ZF - 0.008, T - 0.043, T - 0.035), material: 'led' },
]);
const PARANTE = { forma: rectZY(ZF - 0.025, ZF + 0.004, R, T - 0.035), material: 'inox', ancho: 0.024 };
const ARCO_ALUMINIO = { forma: ARCO, material: 'aluminio', ancho: MEDIDAS.anchoArco };

/** @type {Record<string, PerfilesSuperior>} */
const PERFILES = {
  cupula_curva: {
    banda: [
      { forma: VIDRIO_CURVO, material: 'vidrio' },
      { forma: rectZY(ZT - 0.08, ZT + 0.02, T - 0.035, T + 0.01), material: 'aluminio' }, // perfil superior
      { forma: rectZY(ZT - 0.06, ZT, T - 0.043, T - 0.035), material: 'led' },
    ],
    corte: ARCO_ALUMINIO, paso: MEDIDAS.largoPano, vidrioLateral: LATERAL_CURVO,
  },
  cupula_recta: {
    banda: [
      // DVH: dos hojas de vidrio con cámara de aire
      { forma: rectZY(ZF - ESP / 2, ZF, R, T - 0.035), material: 'vidrio' },
      { forma: rectZY(ZF - 0.018, ZF - 0.018 + ESP / 2, R, T - 0.035), material: 'vidrio' },
      ...TECHO_RECTO,
    ],
    corte: PARANTE, paso: MEDIDAS.largoPano, vidrioLateral: LATERAL_RECTO,
  },
  iluminacion_recta: {
    banda: [{ forma: rectZY(ZF - ESP, ZF, R, R + MEDIDAS.altoVidrioBajo), material: 'vidrio' }, ...TECHO_RECTO],
    corte: PARANTE, paso: Infinity, vidrioLateral: LATERAL_RECTO, // parantes solo en las puntas
  },
  iluminacion_curva: {
    banda: [
      { forma: rectZY(ZT - 0.08, ZT + 0.02, T - 0.05, T), material: 'aluminio' }, // viga superior
      { forma: rectZY(ZT - 0.06, ZT, T - 0.058, T - 0.05), material: 'led' },     // LED hacia abajo
      { forma: VIDRIO_BAJO_CURVO, material: 'vidrio' },
    ],
    corte: ARCO_ALUMINIO, paso: MEDIDAS.pasoArcos, vidrioLateral: LATERAL_CURVO,
  },
  sin_cupula: { banda: [{ forma: DEFLECTOR, material: 'vidrio' }], corte: null, paso: Infinity, vidrioLateral: null },
};

/**
 * Perfiles de la parte de arriba según el tipo de exhibición (y la estructura, si es sin cúpula con iluminación).
 * @param {unknown} cupula
 * @param {unknown} [estructura]
 * @returns {PerfilesSuperior}
 */
export const perfilesSuperior = (cupula, estructura) => {
  if (cupula === 'sin_cupula_iluminacion') return estructura === 'recta' ? PERFILES.iluminacion_recta : PERFILES.iluminacion_curva;
  return PERFILES[String(cupula)] ?? PERFILES.sin_cupula;
};
