// Adicionales de la batea (prompt 6.3): depósito, puertas traseras de acrílico y equipo incorporado.
// No hay fotos de estas partes (salvo la rejilla de ventilación de batea-8): todo es PROVISORIO.
//   - Depósito: puertas batientes en el respaldo trasero (lado del vendedor), bajo la mesada, sin ocupar
//     el costado reservado para el equipo.
//   - Puertas traseras: hojas de acrílico corredizas que cierran la cúpula del lado del vendedor, en el
//     plano inclinado entre la mesada y el borde de atrás del techo.
//   - Equipo incorporado: volumen en la zona del zócalo, costado derecho (+X), con rejilla perforada en el costado.
import { MEDIDAS } from './medidas.js';
import { FRENTE, FONDO, PARED_TRASERA, formaDesdePuntos, tramos, hayEquipoIncorporado } from './geometria.js';
import { Caja, Extruido, Barra } from './piezas.jsx';

/** @typedef {import('./materiales.js').MaterialesBatea} MaterialesBatea */

const m = MEDIDAS;

// ------------------------------------------------------------------ puertas traseras (formas constantes)
// Plano inclinado: de la mesada (junto a la pared trasera) al borde de atrás del techo.
const Y0 = m.altoMesada + 0.005;
const Z0 = PARED_TRASERA + 0.03;
const Y1 = m.altoTotal - 0.035;
const Z1_SEGUN_CUPULA = /** @type {Record<string, number>} */ ({ cupula_curva: m.zTopeCurva - 0.08, cupula_recta: m.fondoTecho });
const SEPARACION_HOJAS = 0.012; // las hojas corren por dos rieles, una delante de la otra

/**
 * Geometría del plano de las puertas para un tipo de cúpula: extremos y normal hacia el vendedor.
 * @param {number} z1
 */
const planoPuertas = (z1) => {
  const dz = z1 - Z0, dy = Y1 - Y0, largo = Math.hypot(dz, dy);
  return { dz, dy, nz: -dy / largo, ny: dz / largo }; // normal (nz < 0: hacia el vendedor)
};

/**
 * Hoja de acrílico como cuadrilátero en el plano (z, y), corrida `desplazo` hacia el vendedor.
 * @param {number} z1
 * @param {number} desplazo
 */
const formaHoja = (z1, desplazo) => {
  const { nz, ny } = planoPuertas(z1);
  const a = desplazo, b = desplazo + m.espesorAcrilico;
  return formaDesdePuntos([
    [Z0 + nz * a, Y0 + ny * a], [z1 + nz * a, Y1 + ny * a],
    [z1 + nz * b, Y1 + ny * b], [Z0 + nz * b, Y0 + ny * b],
  ]);
};

const FORMAS_HOJA = Object.fromEntries(
  Object.entries(Z1_SEGUN_CUPULA).map(([cupula, z1]) => [cupula, [formaHoja(z1, 0), formaHoja(z1, SEPARACION_HOJAS)]])
);

// ------------------------------------------------------------------ piezas

/**
 * Depósito: puertas batientes en el respaldo trasero, con juntas oscuras y manijas de inox.
 * @param {{ xi: number, mat: MaterialesBatea }} props
 */
const Deposito = ({ xi, mat }) => {
  const x0 = -xi + m.margenDeposito;
  const x1 = xi - m.anchoEquipo - m.margenDeposito;
  if (x1 - x0 < 0.25) return null; // no entra ni una puerta
  const centro = (x0 + x1) / 2;
  const { tramos: puertas } = tramos(x1 - x0, m.anchoPuertaDeposito);
  const y = /** @type {[number, number]} */ ([m.altoZocalo + m.bajoDeposito, m.altoMesada - m.topeDeposito]);
  const yMedio = (y[0] + y[1]) / 2;
  const zFondo = FONDO - 0.002;               // fondo oscuro que se ve por las juntas
  const zPuerta = zFondo - m.espesorPuerta;  // cara exterior de las puertas

  return (
    <>
      <Caja x={[x0, x1]} y={y} z={[zFondo, FONDO]} material={mat.oscuro} />
      {puertas.map(([a, b], i) => {
        const xa = centro + a + 0.003, xb = centro + b - 0.003;
        // Manijas alternadas: las de a pares quedan enfrentadas en el medio
        const xManija = i % 2 === 0 ? xb - 0.05 : xa + 0.05;
        return (
          <group key={i}>
            <Caja x={[xa, xb]} y={y} z={[zPuerta, zFondo]} material={mat.tina} />
            <Caja x={[xManija - 0.008, xManija + 0.008]} y={[yMedio - 0.06, yMedio + 0.06]} z={[zPuerta - 0.022, zPuerta]} material={mat.inox} />
          </group>
        );
      })}
    </>
  );
};

/**
 * Puertas traseras de acrílico corredizas: dos hojas por paño en dos rieles, riel inferior sobre la mesada,
 * riel superior bajo el techo y una manija por hoja.
 * @param {{ xi: number, cupula: string, mat: MaterialesBatea }} props
 */
const PuertasTraseras = ({ xi, cupula, mat }) => {
  const z1 = Z1_SEGUN_CUPULA[cupula];
  const formas = FORMAS_HOJA[cupula];
  if (z1 === undefined || !formas) return null;
  const { dz, dy, nz, ny } = planoPuertas(z1);
  const { tramos: hojas } = tramos(2 * xi, m.largoPano / 2);

  return (
    <>
      {hojas.map(([a, b], i) => {
        const capa = i % 2;
        const desplazo = capa * SEPARACION_HOJAS + m.espesorAcrilico + 0.01;
        const xa = Math.max(-xi, a - 0.02), xb = Math.min(xi, b + 0.02); // se superponen un poco
        const xManija = capa ? xa + 0.05 : xb - 0.05;
        /** @param {number} t @returns {[number, number, number]} */
        const punto = (t) => [xManija, Y0 + dy * t + ny * desplazo, Z0 + dz * t + nz * desplazo];
        return (
          <group key={i}>
            <Extruido forma={formas[capa]} x0={xa} x1={xb} material={mat.acrilico} />
            <Barra desde={punto(0.18)} hasta={punto(0.34)} grosor={0.014} material={mat.inox} />
          </group>
        );
      })}
      {/* Rieles de inox: abajo sobre la mesada, arriba bajo el techo */}
      <Caja x={[-xi, xi]} y={[m.altoMesada, m.altoMesada + 0.02]} z={[Z0 - 0.035, Z0 + 0.01]} material={mat.inox} />
      <Caja x={[-xi, xi]} y={[Y1 - 0.015, Y1 + 0.005]} z={[z1 - 0.035, z1 + 0.01]} material={mat.inox} />
    </>
  );
};

/**
 * Equipo incorporado: volumen en la zona del zócalo, en el costado derecho (+X), con chapa perforada
 * de ventilación solo en la pared del costado (como en batea-8).
 * @param {{ largo: number, mat: MaterialesBatea }} props
 */
const Equipo = ({ largo, mat }) => {
  const x1 = largo / 2 - m.retiroZocaloCostado;
  const x0 = x1 - m.anchoEquipo;
  const y0 = m.altoPatas, y1 = m.altoZocalo;
  const z0 = FONDO + 0.03, z1 = FRENTE - m.retiroZocaloFrente;
  // Caras de la caja en el orden de three: +X, −X, +Y, −Y, +Z, −Z.
  // La chapa perforada va SOLO en la pared del costado (+X); el frente sigue como el resto del zócalo.
  const caras = [mat.rejillaVentilacion, mat.zocalo, mat.zocalo, mat.zocalo, mat.zocalo, mat.zocalo];
  return (
    <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]} material={caras}>
      <boxGeometry args={[x1 - x0, y1 - y0, z1 - z0]} />
    </mesh>
  );
};

/**
 * Adicionales de una batea: depósito, puertas traseras de acrílico y equipo incorporado.
 * @param {object} props
 * @param {Record<string, unknown>} props.batea  módulo (deposito, puertasTraseras, cupula)
 * @param {Record<string, unknown>} props.linea  opciones generales (equipamiento, ubicacionEquipo)
 * @param {number} props.largo                  largo total de la batea (m)
 * @param {number} props.xi                     cara interior de los laterales (m)
 * @param {MaterialesBatea} props.materiales
 */
const Adicionales = ({ batea, linea, largo, xi, materiales }) => (
  <>
    {batea.deposito === true && <Deposito xi={xi} mat={materiales} />}
    {batea.puertasTraseras === true && <PuertasTraseras xi={xi} cupula={String(batea.cupula)} mat={materiales} />}
    {hayEquipoIncorporado(linea) && <Equipo largo={largo} mat={materiales} />}
  </>
);

export default Adicionales;
