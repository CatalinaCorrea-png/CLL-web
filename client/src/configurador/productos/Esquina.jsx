// Pieza de esquina (prompt 6b): vista desde arriba ocupa un cuadrado de profundidad × profundidad
// (1100 × 1100 mm) con un ochavado de 45° hacia afuera. Dobla la línea 90°:
//   - esquinero: dobla hacia el vendedor; el cliente queda por FUERA de la L y el frente tiene tres caras
//     (las dos alas y la diagonal del ochavado). Ver client/public/bateas/ch/batea-8-1.webp.
//   - rinconero: dobla hacia el cliente; el cliente queda por DENTRO de la L (el frente es el rincón) y el
//     ochavado queda del lado del vendedor, por donde la mesada sigue la esquina.
// Versión con frío: sigue el cuerpo, la tina y la parte de arriba (con el tipo de exhibición de la esquina).
// Versión mostrador: tapa de inox ochavada a la altura de la mesada, sin vidrio ni frío.
//
// Marco local: el ala anterior llega por la cara x = 0 (z de −D/2 a D/2, frente del cliente en +z);
// la línea sigue por la cara z = −D/2 (esquinero) o z = +D/2 (rinconero). Las piezas que corren a lo
// largo (faldón, riel, vidrios, perfiles) se barren por el quiebre con los mismos perfiles que la batea.
import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { MEDIDAS } from './medidas.js';
import { FRENTE, FONDO, PARED_TRASERA, inglete, rectZY, tramosDentro } from './geometria.js';
import { perfilesSuperior } from './perfilesSuperior.js';
import { Barrido, Losa } from './piezas.jsx';

/** @typedef {import('./materiales.js').MaterialesBatea} MaterialesBatea */
/** @typedef {import('./geometria.js').Seccion} Seccion */
/** @typedef {[number, number]} Punto */

const m = MEDIDAS;
const D = m.profundidad;
const H = D / 2;
const C = m.ochavado;
const PT = PARED_TRASERA;            // pared trasera de la tina (−0.25)
const ANCHO_MESADA = PT - FONDO;     // 0.30
const DIAG = Math.SQRT1_2;
const Y_TAPA = m.altoMesada - m.espesorMesada;

/**
 * Puntos de un recorrido corridos `u` hacia adentro.
 * @param {Seccion[]} secciones
 * @param {number} u
 * @returns {Punto[]}
 */
const corrido = (secciones, u) => secciones.map(({ p, m: d }) => [p[0] + d[0] * u, p[1] + d[1] * u]);

// ------------------------------------------------------------------ esquinero
// Frente (cliente) por fuera: ala anterior → diagonal del ochavado → ala siguiente.
const ESQUINERO_FRENTE = /** @type {Seccion[]} */ ([
  { p: [0, H], m: [0, -1] },
  { p: [D - C, H], m: inglete([0, -1], [-DIAG, -DIAG]) },
  { p: [D, H - C], m: inglete([-DIAG, -DIAG], [-1, 0]) },
  { p: [D, -H], m: [-1, 0] },
]);
// La tina rodea el rincón del vendedor (donde las dos mesadas se encuentran)
const TINA_ESQUINERO = /** @type {Punto[]} */ ([[0, PT], ...corrido(ESQUINERO_FRENTE, 0.09), [ANCHO_MESADA, -H], [ANCHO_MESADA, PT]]);
const ESQUINERO = {
  planta: /** @type {Punto[]} */ ([[0, -H], [0, H], [D - C, H], [D, H - C], [D, -H]]),
  // El cuerpo termina 4 cm antes del frente, como en la batea: ahí van el faldón y el riel
  cuerpo: /** @type {Punto[]} */ ([[0, -H], ...corrido(ESQUINERO_FRENTE, 0.04), [D - 0.04, -H]]),
  zocalo: /** @type {Punto[]} */ ([[0, -H + 0.03], ...corrido(ESQUINERO_FRENTE, m.retiroZocaloFrente), [0.03, -H], [0.03, -H + 0.03]]),
  tina: TINA_ESQUINERO,
  interior: TINA_ESQUINERO, // donde pueden ir las rejillas
  frente: ESQUINERO_FRENTE,
};

// ------------------------------------------------------------------ rinconero
// Frente (cliente) en el rincón: todas las secciones en el mismo punto, girando de un ala a la otra.
const RINCON = /** @type {Punto} */ ([0, H]);
const RINCONERO_FRENTE = /** @type {Seccion[]} */ ([
  { p: RINCON, m: [0, -1] },
  { p: RINCON, m: inglete([0, -1], [1, 0]) },
  { p: RINCON, m: [1, 0] },
]);
// Fondo (vendedor) por fuera, con el ochavado: la mesada y el respaldo siguen la esquina.
const RINCONERO_FONDO = /** @type {Seccion[]} */ ([
  { p: [0, -H], m: [0, 1] },
  { p: [D - C, -H], m: inglete([0, 1], [-DIAG, DIAG]) },
  { p: [D, -H + C], m: inglete([-DIAG, DIAG], [-1, 0]) },
  { p: [D, H], m: [-1, 0] },
]);
const PLANTA_RINCONERO = /** @type {Punto[]} */ ([[0, -H], [0, H], [D, H], [D, -H + C], [D - C, -H]]);
const RINCONERO = {
  planta: PLANTA_RINCONERO,
  cuerpo: PLANTA_RINCONERO, // el frente es solo el rincón: el cuerpo no tapa el faldón
  zocalo: /** @type {Punto[]} */ ([...corrido(RINCONERO_FONDO, 0.03), [m.retiroZocaloFrente, H], [m.retiroZocaloFrente, H - m.retiroZocaloFrente], [0, H - m.retiroZocaloFrente]]),
  tina: /** @type {Punto[]} */ ([...corrido(RINCONERO_FONDO, ANCHO_MESADA), [0.09, H], [0.09, H - 0.09], [0, H - 0.09]]),
  // Las rejillas no pasan la pared trasera de la tina (a 0,30–0,32 m del fondo)
  interior: /** @type {Punto[]} */ ([...corrido(RINCONERO_FONDO, ANCHO_MESADA + 0.03), [0.09, H], [0.09, H - 0.09], [0, H - 0.09]]),
  frente: RINCONERO_FRENTE,
};

// ------------------------------------------------------------------ perfiles (constantes)
const FALDON = rectZY(FRENTE - 0.04, FRENTE, m.altoZocalo, m.altoFranja);
const RIEL = rectZY(FRENTE - 0.08, FRENTE + m.salienteRiel, m.altoFranja, m.altoRiel);
const JUNTAS = [0.035, 0.075].map((dy) =>
  rectZY(FRENTE + m.salienteRiel - 0.002, FRENTE + m.salienteRiel + 0.003, m.altoFranja + dy - 0.004, m.altoFranja + dy + 0.004));
const PARED_FRENTE_TINA = rectZY(FRENTE - 0.09, FRENTE - 0.08, m.pisoExhibicion, m.altoRiel - 0.005);
const FRENTE_MOSTRADOR = rectZY(FRENTE - 0.04, FRENTE - 0.01, m.altoRiel, Y_TAPA);
// Lado del vendedor del rinconero (perfiles medidos desde el fondo)
const MESADA = rectZY(FONDO - 0.02, PT + 0.02, Y_TAPA, m.altoMesada);
const RESPALDO_TRASERO = rectZY(FONDO, PT, m.altoZocalo, Y_TAPA);
const PARED_TRASERA_TINA = rectZY(PT, PT + 0.02, m.pisoExhibicion, Y_TAPA);

/**
 * Pieza que se repite en un quiebre (arco o parante), barrida en un tramo cortito alrededor de la sección.
 * @param {Seccion} s
 * @param {number} ancho
 * @returns {Seccion[]}
 */
const tramoEnQuiebre = (s, ancho) => {
  const largo = Math.hypot(s.m[0], s.m[1]);
  const t = [-s.m[1] / largo, s.m[0] / largo]; // perpendicular a la dirección hacia adentro
  return [
    { p: [s.p[0] - (t[0] * ancho) / 2, s.p[1] - (t[1] * ancho) / 2], m: s.m },
    { p: [s.p[0] + (t[0] * ancho) / 2, s.p[1] + (t[1] * ancho) / 2], m: s.m },
  ];
};

// Los tramos de los quiebres se crean una vez por forma de esquina y tipo de pieza (secciones estables).
/** @type {Map<string, Seccion[][]>} */
const QUIEBRES = new Map();
/**
 * @param {'esquinero' | 'rinconero'} forma
 * @param {Seccion[]} frente
 * @param {number} ancho
 */
const quiebres = (forma, frente, ancho) => {
  const clave = `${forma}-${ancho}`;
  if (!QUIEBRES.has(clave)) QUIEBRES.set(clave, frente.slice(1, -1).map((s) => tramoEnQuiebre(s, ancho)));
  return /** @type {Seccion[][]} */ (QUIEBRES.get(clave));
};

/**
 * Esquina de la línea.
 * @param {object} props
 * @param {Record<string, unknown>} props.esquina  módulo (forma, version, cupula, estructura)
 * @param {Record<string, unknown>} props.linea    opciones generales (frío, …)
 * @param {MaterialesBatea} props.materiales
 */
const Esquina = ({ esquina, linea, materiales: mat }) => {
  const forma = esquina.forma === 'rinconero' ? 'rinconero' : 'esquinero';
  const geo = forma === 'rinconero' ? RINCONERO : ESQUINERO;
  const conFrio = esquina.version === 'frio';
  const sup = conFrio ? perfilesSuperior(esquina.cupula, esquina.estructura) : null;
  const matPorNombre = /** @type {Record<string, import('three').Material>} */ (/** @type {unknown} */ (mat));

  return (
    <group>
      {/* Base común: zócalo, faldón y riel siguiendo el frente */}
      <Losa poligono={geo.zocalo} y0={m.altoPatas} y1={m.altoZocalo} material={mat.zocalo} />
      <Barrido secciones={geo.frente} forma={FALDON} material={mat.faldon} />
      <Barrido secciones={geo.frente} forma={RIEL} material={mat.galvanizado} />
      {JUNTAS.map((j, i) => <Barrido key={i} secciones={geo.frente} forma={j} material={mat.oscuro} />)}

      {!conFrio && (
        // Mostrador: caja, frente de arriba de chapa blanca (inox con cuerpo inox) y tapa de inox ochavada
        <>
          <Losa poligono={geo.cuerpo} y0={m.altoZocalo} y1={Y_TAPA} material={mat.lateral} />
          <Barrido secciones={geo.frente} forma={FRENTE_MOSTRADOR} material={mat.lateral} />
          <Losa poligono={geo.planta} y0={Y_TAPA} y1={m.altoMesada} material={mat.inox} />
        </>
      )}

      {conFrio && sup && (
        <>
          {/* Cuerpo bajo la tina, bacha y pared del frente por dentro */}
          <Losa poligono={geo.cuerpo} y0={m.altoZocalo} y1={m.pisoExhibicion - 0.02} material={mat.tina} />
          <Losa poligono={geo.tina} y0={m.pisoExhibicion - 0.02} y1={m.pisoExhibicion} material={mat.tina} />
          <Barrido secciones={geo.frente} forma={PARED_FRENTE_TINA} material={mat.tina} />
          {/* Interior: rejilla (estático) o bandeja lisa (forzado) con rejilla recta o escalonada encima */}
          {linea.frio !== 'estatico' && (
            <Losa poligono={geo.tina} y0={m.pisoExhibicion + 0.005} y1={m.pisoExhibicion + 0.015} material={mat.bandeja} />
          )}
          <RejillasEsquina forma={forma} frio={String(linea.frio)} sobreBandeja={String(linea.rejillaSobreBandeja)} material={mat.rejilla} />

          {/* Lado del vendedor: la mesada y el respaldo siguen la esquina sin cortarse */}
          {forma === 'esquinero' ? (
            <>
              <Losa poligono={RINCON_VENDEDOR} y0={m.altoZocalo} y1={Y_TAPA} material={mat.tina} />
              <Losa poligono={RINCON_VENDEDOR_MESADA} y0={Y_TAPA} y1={m.altoMesada} material={mat.inox} />
              <Losa poligono={RESPALDO_ESQUINERO} y0={m.pisoExhibicion} y1={Y_TAPA} material={mat.tina} />
            </>
          ) : (
            <>
              <Barrido secciones={RINCONERO_FONDO} forma={RESPALDO_TRASERO} material={mat.tina} desde="fondo" />
              <Barrido secciones={RINCONERO_FONDO} forma={MESADA} material={mat.inox} desde="fondo" />
              <Barrido secciones={RINCONERO_FONDO} forma={PARED_TRASERA_TINA} material={mat.tina} desde="fondo" />
            </>
          )}

          {/* Parte de arriba: los mismos perfiles que la batea, barridos por el quiebre */}
          {sup.banda.map(({ forma: f, material }, i) => (
            <Barrido key={i} secciones={geo.frente} forma={f} material={matPorNombre[material]} />
          ))}
          {sup.corte && quiebres(forma, geo.frente, sup.corte.ancho).map((tramo, i) => (
            <Barrido key={`c${i}`} secciones={tramo} forma={sup.corte?.forma ?? FALDON} material={matPorNombre[sup.corte?.material ?? 'inox']} />
          ))}
        </>
      )}
    </group>
  );
};

// Esquinero: el rincón del vendedor (por dentro de la L), donde se juntan las dos mesadas
const RINCON_VENDEDOR = /** @type {Punto[]} */ ([[0, -H], [0, PT], [ANCHO_MESADA, PT], [ANCHO_MESADA, -H]]);
const RINCON_VENDEDOR_MESADA = /** @type {Punto[]} */ ([[0, -H], [0, PT + 0.02], [ANCHO_MESADA + 0.02, PT + 0.02], [ANCHO_MESADA + 0.02, -H]]);
// Respaldo de la tina en L alrededor de ese rincón
const RESPALDO_ESQUINERO = /** @type {Punto[]} */ ([[0, PT], [0, PT + 0.02], [ANCHO_MESADA + 0.02, PT + 0.02], [ANCHO_MESADA + 0.02, -H], [ANCHO_MESADA, -H], [ANCHO_MESADA, PT]]);

// ------------------------------------------------------------------ rejillas
// Como en la batea: alambres de 4 mm cada 25 mm, perpendiculares al frente, y travesaños adelante, en el
// medio y atrás. En la esquina el frente dobla, así que se arma por tramos (cada ala y el ochavado; en el
// rinconero, cada mitad del rincón) y todo se recorta a la tina.
const ALAMBRE = 0.004;
const PASO_ALAMBRE = 0.025;
const PISO = m.pisoExhibicion;
const FONDO_TINA = FRENTE - (PT + 0.02); // del frente a la pared trasera de la tina, como en la batea

/**
 * Pieza de rejilla: posición, escala de la caja unitaria y giro en Y.
 * @typedef {{ p: [number, number, number], s: [number, number, number], r: number }} PiezaRejilla
 */

/**
 * Barra horizontal en planta de a a b, a la altura y.
 * @param {Punto} a
 * @param {Punto} b
 * @param {number} y
 * @param {number} grosor
 * @returns {PiezaRejilla}
 */
const barraEnPlanta = (a, b, y, grosor) => {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  return { p: [(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2], s: [grosor, grosor, Math.hypot(dx, dz)], r: Math.atan2(dx, dz) };
};

/**
 * Tramos del frente: la zona que barre cada segmento hacia adentro y la dirección de sus alambres.
 * @param {Seccion[]} frente
 * @returns {Array<{ zona: Punto[], v: Punto }>}
 */
const zonasDelFrente = (frente) => {
  const K = 1.5; // más que la profundidad: la zona se recorta después
  return frente.slice(0, -1).map((s0, i) => {
    const s1 = frente[i + 1];
    const seg = [s1.p[0] - s0.p[0], s1.p[1] - s0.p[1]];
    const l = Math.hypot(seg[0], seg[1]);
    /** @type {Punto} */
    let v;
    if (l > 1e-6) {
      v = [-seg[1] / l, seg[0] / l];
      if (v[0] * s0.m[0] + v[1] * s0.m[1] < 0) v = [-v[0], -v[1]];
    } else {
      // Rincón (el frente es un punto): cada mitad sigue la dirección de su ala (la sección sin inglete)
      const a = Math.hypot(s0.m[0], s0.m[1]), b = Math.hypot(s1.m[0], s1.m[1]);
      const d = a <= b ? s0.m : s1.m, n = Math.min(a, b);
      v = [d[0] / n, d[1] / n];
    }
    /** @type {Punto[]} */
    const zona = [s0.p, s1.p, [s1.p[0] + s1.m[0] * K, s1.p[1] + s1.m[1] * K], [s0.p[0] + s0.m[0] * K, s0.p[1] + s0.m[1] * K]];
    return { zona, v };
  });
};

/**
 * Rejilla plana en la franja entre d0 y d1 metros del frente, a la altura y.
 * @param {typeof ESQUINERO} geo
 * @param {number} d0
 * @param {number} d1
 * @param {number} y
 * @returns {PiezaRejilla[]}
 */
const rejillaPlana = (geo, d0, d1, y) => {
  /** @type {PiezaRejilla[]} */
  const piezas = [];
  const banda = [...corrido(geo.frente, d0), ...corrido(geo.frente, d1).reverse()];
  for (const { zona, v } of zonasDelFrente(geo.frente)) {
    const w = [-v[1], v[0]];
    const ss = zona.map((q) => q[0] * w[0] + q[1] * w[1]);
    const ts = zona.map((q) => q[0] * v[0] + q[1] * v[1]);
    const tmin = Math.min(...ts) - 0.1, tmax = Math.max(...ts) + 0.1;
    for (let sv = Math.ceil(Math.min(...ss) / PASO_ALAMBRE) * PASO_ALAMBRE; sv <= Math.max(...ss); sv += PASO_ALAMBRE) {
      /** @type {Punto} */
      const a = [w[0] * sv + v[0] * tmin, w[1] * sv + v[1] * tmin];
      /** @type {Punto} */
      const b = [w[0] * sv + v[0] * tmax, w[1] * sv + v[1] * tmax];
      for (const [p, q] of tramosDentro(a, b, [zona, banda, geo.interior])) piezas.push(barraEnPlanta(p, q, y, ALAMBRE));
    }
  }
  // Travesaños adelante, en el medio y atrás, siguiendo el frente
  for (const d of [d0, (d0 + d1) / 2, d1]) {
    const linea = corrido(geo.frente, d);
    for (let i = 0; i < linea.length - 1; i++) {
      for (const [p, q] of tramosDentro(linea[i], linea[i + 1], [geo.interior])) piezas.push(barraEnPlanta(p, q, y - 0.004, 0.006));
    }
  }
  return piezas;
};

/**
 * Frente vertical de un escalón: alambres verticales a lo largo del frente corrido d, de y − alto a y.
 * @param {typeof ESQUINERO} geo
 * @param {number} d
 * @param {number} y
 * @param {number} alto
 * @returns {PiezaRejilla[]}
 */
const frenteEscalon = (geo, d, y, alto) => {
  /** @type {PiezaRejilla[]} */
  const piezas = [];
  const linea = corrido(geo.frente, d);
  for (let i = 0; i < linea.length - 1; i++) {
    for (const [p, q] of tramosDentro(linea[i], linea[i + 1], [geo.interior])) {
      const n = Math.floor(Math.hypot(q[0] - p[0], q[1] - p[1]) / PASO_ALAMBRE);
      for (let k = 0; k <= n; k++) {
        const t = n ? k / n : 0;
        piezas.push({ p: [p[0] + (q[0] - p[0]) * t, y - alto / 2, p[1] + (q[1] - p[1]) * t], s: [ALAMBRE, alto, ALAMBRE], r: 0 });
      }
      for (const yy of [y - alto, y - alto / 2, y]) piezas.push(barraEnPlanta(p, q, yy, 0.006));
    }
  }
  return piezas;
};

/**
 * Rejillas de la esquina con frío, con las mismas reglas que el interior de la batea:
 * estático → rejilla plana en el fondo; forzado → rejilla recta o escalonada sobre la bandeja, si se eligió.
 * @param {object} props
 * @param {'esquinero' | 'rinconero'} props.forma
 * @param {string} props.frio
 * @param {string} props.sobreBandeja  ninguna | recta | escalonada
 * @param {import('three').Material} props.material
 */
const RejillasEsquina = ({ forma, frio, sobreBandeja, material }) => {
  const piezas = useMemo(() => {
    const geo = forma === 'rinconero' ? RINCONERO : ESQUINERO;
    const d0 = 0.09; // pared del frente de la tina
    if (frio === 'estatico') return rejillaPlana(geo, d0 + 0.01, FONDO_TINA - 0.01, PISO + 0.02);
    if (sobreBandeja === 'recta') return rejillaPlana(geo, d0 + 0.02, FONDO_TINA - 0.02, PISO + 0.05);
    if (sobreBandeja === 'escalonada') {
      // 3 escalones que suben hacia atrás, de 6 cm cada uno (PROVISORIO, igual que en la batea)
      const f = (FONDO_TINA - d0 - 0.04) / 3;
      return [0, 1, 2].flatMap((k) => {
        const y = PISO + 0.05 + k * 0.06;
        const desde = d0 + 0.02 + f * k;
        return [...rejillaPlana(geo, desde, desde + f, y), ...frenteEscalon(geo, desde, y, 0.06)];
      });
    }
    return [];
  }, [forma, frio, sobreBandeja]);

  if (!piezas.length) return null;
  return (
    <Instances key={piezas.length} limit={piezas.length} material={material}>
      <boxGeometry />
      {piezas.map((pieza, i) => (
        <Instance key={i} position={pieza.p} scale={pieza.s} rotation={[0, pieza.r, 0]} />
      ))}
    </Instances>
  );
};

export default Esquina;
