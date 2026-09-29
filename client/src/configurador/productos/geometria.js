// Geometría común de la batea: ejes, borde del lateral y el perfil curvo que comparten
// la cúpula curva y los arcos de la estructura curva (así se ven de la misma familia).
//
// Ejes (1 unidad = 1 metro):
//   X = largo, centrado en 0.   Y = altura, piso en 0.
//   Z = profundidad: el CLIENTE mira desde +Z (frente); el VENDEDOR está en −Z (mesada).
// Los perfiles se dibujan en el plano (z, y) y se extruyen a lo largo de X.
import * as THREE from 'three';
import { MEDIDAS } from './medidas.js';

export const FRENTE = MEDIDAS.profundidad / 2;                // cara del frente (lado del cliente)
export const FONDO = -MEDIDAS.profundidad / 2;                // cara de atrás (lado del vendedor)
export const PARED_TRASERA = FONDO + MEDIDAS.anchoMesada;     // donde termina la mesada y empieza la tina
export const Z_VIDRIO_FRENTE = FRENTE + MEDIDAS.retiroVidrioFrente; // plano del vidrio del frente, sobre el riel

// Borde superior del lateral, de adelante hacia atrás: frente, tramo horizontal a la altura
// del riel, diagonal y tope. Lo usan el panel, el remate de inox y los vidrios laterales.
export const ALTO_LATERAL = MEDIDAS.altoMesada + 0.05; // el lateral pasa un poco la mesada
export const BORDE_LATERAL = /** @type {Array<[number, number]>} */ ([
  [FRENTE + MEDIDAS.salienteRiel, MEDIDAS.altoRiel + 0.05],
  [0.22, MEDIDAS.altoRiel + 0.05], // PROVISORIO: dónde arranca la diagonal
  [-0.15, ALTO_LATERAL],
  [FONDO, ALTO_LATERAL],
]);

// ------------------------------------------------------------------ perfil curvo
// Cuarto de elipse: arranca VERTICAL sobre el riel, en el plano del vidrio del frente, y termina
// HORIZONTAL arriba, a la altura total; la panza queda hacia el cliente (como en las fotos).
const CENTRO_Z = MEDIDAS.zTopeCurva;
const CENTRO_Y = MEDIDAS.altoRiel;
const RADIO_Z = Z_VIDRIO_FRENTE - CENTRO_Z;
const RADIO_Y = MEDIDAS.altoTotal - MEDIDAS.altoRiel;

/**
 * Punto del perfil curvo. θ = 0 abajo (sobre el riel), θ = π/2 arriba (tope).
 * @param {number} θ
 * @returns {[number, number]}  (z, y)
 */
export const puntoCurva = (θ) => [CENTRO_Z + RADIO_Z * Math.cos(θ), CENTRO_Y + RADIO_Y * Math.sin(θ)];

/**
 * Ángulo del perfil curvo en el que se alcanza una altura.
 * @param {number} y  en metros, entre el riel y el alto total
 */
export const anguloDeAltura = (y) => Math.asin(Math.min(1, Math.max(0, (y - CENTRO_Y) / RADIO_Y)));

/**
 * Puntos del perfil curvo entre dos ángulos.
 * @param {number} θ0
 * @param {number} θ1
 * @param {number} [n]  cantidad de tramos
 * @returns {Array<[number, number]>}
 */
export const curvaCupula = (θ0, θ1, n = 32) =>
  Array.from({ length: n + 1 }, (_, i) => puntoCurva(θ0 + ((θ1 - θ0) * i) / n));

/**
 * Banda de espesor `grosor` que sigue el perfil curvo (centrada en la curva).
 * Extruida con el ancho de un paño es un vidrio curvo; con 3 cm, un arco.
 * @param {number} θ0
 * @param {number} θ1
 * @param {number} grosor  en metros
 */
export const bandaSobreCurva = (θ0, θ1, grosor) => {
  const n = 32;
  /** @type {Array<[number, number]>} */ const afuera = [];
  /** @type {Array<[number, number]>} */ const adentro = [];
  for (let i = 0; i <= n; i++) {
    const θ = θ0 + ((θ1 - θ0) * i) / n;
    const [z, y] = puntoCurva(θ);
    // Normal de la elipse en ese punto
    const nz = Math.cos(θ) / RADIO_Z, ny = Math.sin(θ) / RADIO_Y;
    const largo = Math.hypot(nz, ny);
    afuera.push([z + (nz / largo) * grosor / 2, y + (ny / largo) * grosor / 2]);
    adentro.push([z - (nz / largo) * grosor / 2, y - (ny / largo) * grosor / 2]);
  }
  return formaDesdePuntos([...afuera, ...adentro.reverse()]);
};

// ------------------------------------------------------------------ contornos
/**
 * Shape cerrado a partir de puntos (z, y).
 * @param {Array<[number, number]>} puntos
 */
export const formaDesdePuntos = (puntos) => {
  const s = new THREE.Shape();
  s.moveTo(puntos[0][0], puntos[0][1]);
  for (const [z, y] of puntos.slice(1)) s.lineTo(z, y);
  s.closePath();
  return s;
};

/**
 * Vidrio que cierra cada punta de la parte de arriba: va del contorno del frente/techo
 * (de abajo hacia arriba y hacia atrás) bajando en diagonal hasta la pared trasera, y vuelve
 * hacia adelante por el borde superior del lateral.
 * @param {Array<[number, number]>} contorno  de abajo-adelante hasta arriba-atrás
 */
export const perfilVidrioLateral = (contorno) => {
  const bordeLateral = BORDE_LATERAL.filter(([z]) => z > PARED_TRASERA).reverse(); // de atrás hacia adelante
  return formaDesdePuntos([...contorno, [PARED_TRASERA, ALTO_LATERAL], ...bordeLateral]);
};

/**
 * Reparte un largo en tramos de ~`paso` (paños de vidrio, espacio entre arcos).
 * @param {number} largo  en metros (centrado en 0)
 * @param {number} paso   en metros
 * @returns {{ cortes: number[], tramos: Array<[number, number]> }}  cortes = posiciones X de los bordes
 */
export const tramos = (largo, paso) => {
  const n = Math.max(1, Math.round(largo / paso));
  const cortes = Array.from({ length: n + 1 }, (_, i) => -largo / 2 + (largo * i) / n);
  return { cortes, tramos: cortes.slice(0, -1).map((x, i) => /** @type {[number, number]} */ ([x, cortes[i + 1]])) };
};
