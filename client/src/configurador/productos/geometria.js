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
 * El vidrio APOYA sobre el lateral: el contorno arranca a la altura del borde (no del riel) y el borde
 * solo se recorre por detrás de ese arranque. Si el borde pasara por delante del plano del vidrio, el
 * contorno se cruzaría a sí mismo y la triangulación dejaría una franja con vidrio doble (una banda diagonal).
 * @param {Array<[number, number]>} contorno  de abajo-adelante hasta arriba-atrás
 */
export const perfilVidrioLateral = (contorno) => {
  const yApoyo = BORDE_LATERAL[0][1];
  // Recortar el contorno desde abajo hasta la altura de apoyo
  const i = contorno.findIndex(([, y]) => y >= yApoyo);
  /** @type {Array<[number, number]>} */
  let arriba = contorno.slice(i);
  if (i > 0 && contorno[i][1] > yApoyo) {
    const [z0, y0] = contorno[i - 1], [z1, y1] = contorno[i];
    const t = (yApoyo - y0) / (y1 - y0);
    arriba = [[z0 + (z1 - z0) * t, yApoyo], ...arriba];
  }
  const zArranque = arriba[0][0];
  const bordeLateral = BORDE_LATERAL
    .filter(([z]) => z > PARED_TRASERA && z < zArranque - 1e-6)
    .reverse(); // de atrás hacia adelante, sin pasar el plano del vidrio
  return formaDesdePuntos([...arriba, [PARED_TRASERA, ALTO_LATERAL], ...bordeLateral]);
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

/**
 * ¿La línea lleva el equipo dentro de la batea? Solo si es equipada y con el equipo incorporado
 * (remoto va afuera; semi-equipada no trae equipo, lo pone el cliente).
 * @param {Record<string, unknown>} linea
 */
export const hayEquipoIncorporado = (linea) => linea.equipamiento === 'equipada' && linea.ubicacionEquipo === 'incorporado';

// ------------------------------------------------------------------ esquinas: perfiles barridos
// En una esquina, las piezas que corren a lo largo de la batea (faldón, riel, vidrios, perfiles) siguen
// un recorrido que dobla. Se describen con su perfil en (u, y), donde u es la distancia hacia ADENTRO
// desde el frente (u = FRENTE − z en una batea recta), y se "barren" por secciones: en cada sección,
// el punto del perfil es  p + m·u,  donde m es la dirección hacia adentro (la normal en los extremos,
// y la bisectriz "a inglete" en los quiebres, así los perfiles se unen sin cortes).

/**
 * Sección del barrido: punto del recorrido en planta (x, z) y dirección hacia adentro.
 * @typedef {{ p: [number, number], m: [number, number] }} Seccion
 */

/**
 * Dirección a inglete entre dos normales unitarias (se estira para que el perfil mantenga su ancho).
 * @param {[number, number]} a
 * @param {[number, number]} b
 * @returns {[number, number]}
 */
export const inglete = (a, b) => {
  const k = 1 + a[0] * b[0] + a[1] * b[1];
  return [(a[0] + b[0]) / k, (a[1] + b[1]) / k];
};

/**
 * Rectángulo en el plano (z, y) como Shape (perfil de una pieza recta de la batea).
 * @param {number} z0 @param {number} z1 @param {number} y0 @param {number} y1
 */
export const rectZY = (z0, z1, y0, y1) => formaDesdePuntos([[z0, y0], [z1, y0], [z1, y1], [z0, y1]]);

/**
 * Barre un perfil (Shape en el plano (z, y) de una batea recta) por un recorrido de secciones.
 * Devuelve la geometría lateral (sin tapas: los extremos quedan pegados a las piezas vecinas).
 * Caras planas (vértices separados por cara), con el sentido corregido para que se vean de afuera.
 * @param {Seccion[]} secciones
 * @param {THREE.Shape} forma  perfil en (z, y), con z medido como en una batea recta
 * @param {'frente' | 'fondo'} [desde]  u se mide hacia adentro desde el frente (cliente) o desde el fondo (vendedor)
 * @returns {THREE.BufferGeometry}
 */
export const barrido = (secciones, forma, desde = 'frente') => {
  const perfil = forma.getPoints().map((v) => /** @type {[number, number]} */ ([desde === 'fondo' ? v.x - FONDO : FRENTE - v.x, v.y])); // (u, y)
  if (perfil.length > 2) {
    const [a, b] = [perfil[0], perfil[perfil.length - 1]];
    if (Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9) perfil.pop(); // sin punto repetido
  }
  /** @param {Seccion} s @param {[number, number]} q */
  const punto = (s, [u, y]) => new THREE.Vector3(s.p[0] + s.m[0] * u, y, s.p[1] + s.m[1] * u);

  // Sentido de las caras: depende de la orientación del perfil en (u, y) y de hacia dónde avanza el
  // recorrido respecto de "adentro". Se mide con puntos un poco adentro (sirve aunque todas las secciones
  // estén en el mismo punto, como en el rincón del rinconero).
  let area = 0;
  perfil.forEach(([u0, y0], i) => { const [u1, y1] = perfil[(i + 1) % perfil.length]; area += u0 * y1 - u1 * y0; });
  const s0 = secciones[0], s1 = secciones[secciones.length - 1];
  const t = [s1.p[0] + s1.m[0] * 0.1 - s0.p[0] - s0.m[0] * 0.1, s1.p[1] + s1.m[1] * 0.1 - s0.p[1] - s0.m[1] * 0.1];
  const giro = t[0] * s0.m[1] - t[1] * s0.m[0];
  const invertir = (area > 0) === (giro > 0);

  /** @type {number[]} */
  const pos = [];
  for (let s = 0; s < secciones.length - 1; s++) {
    for (let k = 0; k < perfil.length; k++) {
      const q0 = perfil[k], q1 = perfil[(k + 1) % perfil.length];
      const a = punto(secciones[s], q0), b = punto(secciones[s], q1);
      const c = punto(secciones[s + 1], q1), d = punto(secciones[s + 1], q0);
      const tri = invertir ? [a, c, b, a, d, c] : [a, b, c, a, c, d];
      for (const v of tri) pos.push(v.x, v.y, v.z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
};

/**
 * Planta (polígono en x, z) extruida en vertical entre y0 e y1 (tapas, pisos, bloques de las esquinas).
 * @param {Array<[number, number]>} poligono  puntos (x, z)
 * @param {number} y0
 * @param {number} y1
 * @returns {THREE.BufferGeometry}  ya ubicada (no hace falta rotarla)
 */
export const losa = (poligono, y0, y1) => {
  // Shape en (x, −z): rotada −90° en X, la extrusión queda vertical y vuelve a z
  const g = new THREE.ExtrudeGeometry(formaDesdePuntos(poligono.map(([x, z]) => [x, -z])), { depth: y1 - y0, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g;
};

/**
 * ¿El punto está dentro del polígono? (planta, regla par-impar)
 * @param {[number, number]} q
 * @param {Array<[number, number]>} poligono
 */
export const dentroDe = (q, poligono) => {
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [xi, zi] = poligono[i], [xj, zj] = poligono[j];
    if ((zi > q[1]) !== (zj > q[1]) && q[0] < ((xj - xi) * (q[1] - zi)) / (zj - zi) + xi) dentro = !dentro;
  }
  return dentro;
};

/**
 * Partes del segmento a–b (en planta) que quedan dentro de TODOS los polígonos.
 * Sirve para recortar alambres y travesaños de rejilla a la forma de la esquina.
 * @param {[number, number]} a
 * @param {[number, number]} b
 * @param {Array<Array<[number, number]>>} poligonos
 * @returns {Array<[[number, number], [number, number]]>}
 */
export const tramosDentro = (a, b, poligonos) => {
  const d = [b[0] - a[0], b[1] - a[1]];
  const ts = [0, 1];
  for (const pol of poligonos) {
    for (let i = 0; i < pol.length; i++) {
      const p = pol[i], q = pol[(i + 1) % pol.length];
      const e = [q[0] - p[0], q[1] - p[1]];
      const den = d[0] * e[1] - d[1] * e[0];
      if (Math.abs(den) < 1e-12) continue;
      const w = [p[0] - a[0], p[1] - a[1]];
      const t = (w[0] * e[1] - w[1] * e[0]) / den;
      const u = (w[0] * d[1] - w[1] * d[0]) / den;
      if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
    }
  }
  ts.sort((x, y) => x - y);
  /** @type {Array<[number, number]>} */
  const partes = [];
  for (let i = 0; i < ts.length - 1; i++) {
    const t0 = ts[i], t1 = ts[i + 1];
    if (t1 - t0 < 1e-9) continue;
    const tm = (t0 + t1) / 2;
    if (!poligonos.every((pol) => dentroDe([a[0] + d[0] * tm, a[1] + d[1] * tm], pol))) continue;
    const ultima = partes[partes.length - 1];
    if (ultima && Math.abs(ultima[1] - t0) < 1e-9) ultima[1] = t1;
    else partes.push([t0, t1]);
  }
  /** @param {number} t @returns {[number, number]} */
  const en = (t) => [a[0] + d[0] * t, a[1] + d[1] * t];
  return partes.map(([t0, t1]) => /** @type {[[number, number], [number, number]]} */ ([en(t0), en(t1)]));
};
