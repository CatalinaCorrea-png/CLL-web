// Parte de arriba de la batea según su tipo (prompt 6.2; tabla "Cómo se ve cada tipo" de la especificación):
//   cúpula curva · cúpula recta (DVH) · sin cúpula con iluminación (estructura recta o curva) · sin cúpula.
// La cúpula curva y los arcos de la estructura curva usan el MISMO perfil (geometria.js), así se ven
// de la misma familia. Las formas no dependen del largo: se crean una vez, acá arriba.
import { MEDIDAS } from './medidas.js';
import {
  PARED_TRASERA, Z_VIDRIO_FRENTE, bandaSobreCurva, curvaCupula, anguloDeAltura,
  formaDesdePuntos, perfilVidrioLateral, tramos,
} from './geometria.js';
import { Caja, Extruido, Barra } from './piezas.jsx';

/** @typedef {import('./materiales.js').MaterialesBatea} MaterialesBatea */

const T = MEDIDAS.altoTotal;          // tope de la parte de arriba
const R = MEDIDAS.altoRiel;           // donde apoya el vidrio del frente
const ZF = Z_VIDRIO_FRENTE;           // plano del vidrio del frente
const ZT = MEDIDAS.zTopeCurva;        // tope de la curva (cúpula curva y arcos)
const ESP = MEDIDAS.espesorVidrio;
const ARCO = MEDIDAS.anchoArco;
const Y_TIRANTE = MEDIDAS.altoMesada + 0.02; // los tirantes bajan hasta el respaldo, a la altura de la mesada
const Z_TIRANTE = PARED_TRASERA + 0.02;

// ------------------------------------------------------------------ formas (constantes)
const FORMA_VIDRIO_CURVO = bandaSobreCurva(0, Math.PI / 2, ESP);
const FORMA_ARCO = bandaSobreCurva(0, Math.PI / 2, ARCO);
// Vidrio bajo curvo: el primer cuarto de la altura de la curva
const FORMA_VIDRIO_BAJO_CURVO = bandaSobreCurva(0, anguloDeAltura(R + (T - R) / 4), ESP);
const FORMA_LATERAL_CURVO = perfilVidrioLateral([...curvaCupula(0, Math.PI / 2), [ZT - 0.08, T]]);
const FORMA_LATERAL_RECTO = perfilVidrioLateral([[ZF, R], [ZF, T], [MEDIDAS.fondoTecho, T]]);
const FORMA_DEFLECTOR = (() => {
  const a = (MEDIDAS.inclinacionDeflector * Math.PI) / 180;
  const dz = -Math.sin(a) * MEDIDAS.altoDeflector, dy = Math.cos(a) * MEDIDAS.altoDeflector;
  return formaDesdePuntos([[ZF, R], [ZF + dz, R + dy], [ZF + dz - ESP, R + dy], [ZF - ESP, R]]);
})();

/**
 * Limita un intervalo en X al interior entre laterales.
 * @param {number} x  centro
 * @param {number} ancho
 * @param {number} xi  cara interior de los laterales
 * @returns {[number, number]}
 */
const dentro = (x, ancho, xi) => [Math.max(-xi, x - ancho / 2), Math.min(xi, x + ancho / 2)];

/**
 * Vidrios que cierran las dos puntas, pegados a la cara interior de los laterales.
 * @param {{ xi: number, forma: import('three').Shape, material: import('three').Material }} props
 */
const VidriosLaterales = ({ xi, forma, material }) => (
  <>
    <Extruido forma={forma} x0={-xi} x1={-xi + ESP} material={material} />
    <Extruido forma={forma} x0={xi - ESP} x1={xi} material={material} />
  </>
);

/**
 * Techo recto: vidrio superior con marco rectangular de inox (travesaños adelante y atrás y los dos
 * laterales que los unen) y LED bajo el travesaño de adelante. Lo comparten la cúpula recta y la sin
 * cúpula con iluminación de estructura recta.
 * @param {{ xi: number, m: MaterialesBatea }} props
 */
const TechoRecto = ({ xi, m }) => {
  const zAtras = MEDIDAS.fondoTecho;
  const y = /** @type {[number, number]} */ ([T - 0.035, T + 0.005]);
  return (
    <>
      <Caja x={[-xi, xi]} y={[T - 0.01, T]} z={[zAtras, ZF]} material={m.vidrio} />
      <Caja x={[-xi, xi]} y={y} z={[ZF - 0.03, ZF + 0.005]} material={m.inox} />
      <Caja x={[-xi, xi]} y={y} z={[zAtras - 0.005, zAtras + 0.025]} material={m.inox} />
      <Caja x={[-xi, -xi + 0.025]} y={y} z={[zAtras - 0.005, ZF + 0.005]} material={m.inox} />
      <Caja x={[xi - 0.025, xi]} y={y} z={[zAtras - 0.005, ZF + 0.005]} material={m.inox} />
      {/* Borde de inox que baja por la diagonal de atrás del vidrio lateral, hasta el respaldo */}
      <Barra desde={[-xi + 0.012, T - 0.02, zAtras]} hasta={[-xi + 0.012, Y_TIRANTE, PARED_TRASERA]} grosor={0.02} material={m.inox} />
      <Barra desde={[xi - 0.012, T - 0.02, zAtras]} hasta={[xi - 0.012, Y_TIRANTE, PARED_TRASERA]} grosor={0.02} material={m.inox} />
      <Caja x={[-xi + 0.03, xi - 0.03]} y={[T - 0.043, T - 0.035]} z={[ZF - 0.028, ZF - 0.008]} material={m.led} />
    </>
  );
};

/**
 * Parante vertical de inox en el plano del frente, del riel al techo.
 * @param {{ x: number, xi: number, m: MaterialesBatea }} props
 */
const Parante = ({ x, xi, m }) => (
  <Caja x={dentro(x, 0.024, xi)} y={[R, T - 0.035]} z={[ZF - 0.025, ZF + 0.004]} material={m.inox} />
);

// ------------------------------------------------------------------ los 4 tipos

/**
 * Cúpula curva: paños de vidrio curvo con arcos de aluminio entre paños, perfil superior con LED
 * y tirantes de cada arco hacia el fondo.
 * @param {{ xi: number, m: MaterialesBatea }} props
 */
const CupulaCurva = ({ xi, m }) => {
  const { cortes, tramos: panos } = tramos(2 * xi, MEDIDAS.largoPano);
  return (
    <>
      {panos.map(([x0, x1]) => (
        <Extruido key={x0} forma={FORMA_VIDRIO_CURVO} x0={x0 + ARCO / 2} x1={x1 - ARCO / 2} material={m.vidrio} />
      ))}
      {cortes.map((x) => {
        const [x0, x1] = dentro(x, ARCO, xi);
        const xc = (x0 + x1) / 2;
        return (
          <group key={x}>
            <Extruido forma={FORMA_ARCO} x0={x0} x1={x1} material={m.aluminio} />
            <Barra desde={[xc, T - 0.03, ZT - 0.06]} hasta={[xc, Y_TIRANTE, Z_TIRANTE]} grosor={0.018} material={m.aluminio} />
          </group>
        );
      })}
      {/* Perfil superior a lo largo del tope de la curva, con la tira LED debajo */}
      <Caja x={[-xi, xi]} y={[T - 0.035, T + 0.01]} z={[ZT - 0.08, ZT + 0.02]} material={m.aluminio} />
      <Caja x={[-xi + 0.03, xi - 0.03]} y={[T - 0.043, T - 0.035]} z={[ZT - 0.06, ZT]} material={m.led} />
      <VidriosLaterales xi={xi} forma={FORMA_LATERAL_CURVO} material={m.vidrio} />
    </>
  );
};

/**
 * Cúpula recta: vidrio frontal DVH (dos hojas), techo de vidrio, parantes de inox en las puntas y entre
 * paños, tirantes hacia el fondo y LED arriba.
 * @param {{ xi: number, m: MaterialesBatea }} props
 */
const CupulaRecta = ({ xi, m }) => {
  const { cortes } = tramos(2 * xi, MEDIDAS.largoPano);
  return (
    <>
      {/* DVH: dos hojas de vidrio con cámara de aire */}
      <Caja x={[-xi, xi]} y={[R, T - 0.035]} z={[ZF - ESP / 2, ZF]} material={m.vidrio} />
      <Caja x={[-xi, xi]} y={[R, T - 0.035]} z={[ZF - 0.018, ZF - 0.018 + ESP / 2]} material={m.vidrio} />
      <TechoRecto xi={xi} m={m} />
      {cortes.map((x) => {
        const [x0, x1] = dentro(x, 0.024, xi);
        const xc = (x0 + x1) / 2;
        return (
          <group key={x}>
            <Parante x={x} xi={xi} m={m} />
            <Barra desde={[xc, T - 0.03, MEDIDAS.fondoTecho]} hasta={[xc, Y_TIRANTE, Z_TIRANTE]} grosor={0.018} material={m.inox} />
          </group>
        );
      })}
      <VidriosLaterales xi={xi} forma={FORMA_LATERAL_RECTO} material={m.vidrio} />
    </>
  );
};

/**
 * Sin cúpula con iluminación, estructura recta: marco recto de inox con vidrio superior y LED,
 * frente ABIERTO con vidrio bajo recto, parantes solo en las puntas y vidrios laterales trapezoidales.
 * @param {{ xi: number, m: MaterialesBatea }} props
 */
const IluminacionRecta = ({ xi, m }) => (
  <>
    <Caja x={[-xi, xi]} y={[R, R + MEDIDAS.altoVidrioBajo]} z={[ZF - ESP, ZF]} material={m.vidrio} />
    <TechoRecto xi={xi} m={m} />
    <Parante x={-xi} xi={xi} m={m} />
    <Parante x={xi} xi={xi} m={m} />
    <VidriosLaterales xi={xi} forma={FORMA_LATERAL_RECTO} material={m.vidrio} />
  </>
);

/**
 * Sin cúpula con iluminación, estructura curva: arcos (uno por punta y uno cada ~1 m) con el mismo perfil
 * que la cúpula curva, viga superior con LED hacia abajo, un tirante por arco hacia el fondo (la V de
 * costado), frente ABIERTO y vidrio bajo curvo que sigue la base de los arcos.
 * @param {{ xi: number, m: MaterialesBatea }} props
 */
const IluminacionCurva = ({ xi, m }) => {
  const { cortes } = tramos(2 * xi, MEDIDAS.pasoArcos);
  return (
    <>
      {cortes.map((x) => {
        const [x0, x1] = dentro(x, ARCO, xi);
        const xc = (x0 + x1) / 2;
        return (
          <group key={x}>
            <Extruido forma={FORMA_ARCO} x0={x0} x1={x1} material={m.aluminio} />
            <Barra desde={[xc, T - 0.04, ZT - 0.07]} hasta={[xc, Y_TIRANTE, Z_TIRANTE]} grosor={0.025} material={m.aluminio} />
          </group>
        );
      })}
      {/* Viga superior a lo largo, con los LED apuntando hacia abajo */}
      <Caja x={[-xi, xi]} y={[T - 0.05, T]} z={[ZT - 0.08, ZT + 0.02]} material={m.aluminio} />
      <Caja x={[-xi + 0.03, xi - 0.03]} y={[T - 0.058, T - 0.05]} z={[ZT - 0.06, ZT]} material={m.led} />
      <Extruido forma={FORMA_VIDRIO_BAJO_CURVO} x0={-xi} x1={xi} material={m.vidrio} />
      <VidriosLaterales xi={xi} forma={FORMA_LATERAL_CURVO} material={m.vidrio} />
    </>
  );
};

/**
 * Sin cúpula: solo un vidrio deflector bajo al frente, inclinado hacia adentro.
 * @param {{ xi: number, m: MaterialesBatea }} props
 */
const SinCupula = ({ xi, m }) => <Extruido forma={FORMA_DEFLECTOR} x0={-xi} x1={xi} material={m.vidrio} />;

/**
 * Parte de arriba de una batea según su tipo.
 * @param {object} props
 * @param {Record<string, unknown>} props.batea       módulo (cupula, estructura, …)
 * @param {number} props.anchoInterior               largo libre entre laterales (m)
 * @param {MaterialesBatea} props.materiales
 */
const ParteSuperior = ({ batea, anchoInterior, materiales }) => {
  const xi = anchoInterior / 2;
  switch (batea.cupula) {
    case 'cupula_curva': return <CupulaCurva xi={xi} m={materiales} />;
    case 'cupula_recta': return <CupulaRecta xi={xi} m={materiales} />;
    case 'sin_cupula_iluminacion':
      return batea.estructura === 'recta' ? <IluminacionRecta xi={xi} m={materiales} /> : <IluminacionCurva xi={xi} m={materiales} />;
    default: return <SinCupula xi={xi} m={materiales} />;
  }
};

export default ParteSuperior;
