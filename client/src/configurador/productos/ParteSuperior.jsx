// Parte de arriba de la batea según su tipo (prompt 6.2; tabla "Cómo se ve cada tipo" de la especificación):
//   cúpula curva · cúpula recta (DVH) · sin cúpula con iluminación (estructura recta o curva) · sin cúpula.
// Los perfiles salen de perfilesSuperior.js (los mismos que barre la esquina con frío). Acá se extruyen
// a lo largo, se ponen los arcos o parantes en cada corte, los tirantes y, en las puntas CERRADAS
// (las que no siguen en una esquina con frío ni en una unión directa), los vidrios laterales.
import { MEDIDAS } from './medidas.js';
import { PARED_TRASERA, tramos } from './geometria.js';
import { perfilesSuperior } from './perfilesSuperior.js';
import { Extruido, Barra, Caja } from './piezas.jsx';

/** @typedef {import('./materiales.js').MaterialesBatea} MaterialesBatea */

const T = MEDIDAS.altoTotal;
const ZT = MEDIDAS.zTopeCurva;
const ZA = MEDIDAS.fondoTecho;
const ESP = MEDIDAS.espesorVidrio;
const Y_TIRANTE = MEDIDAS.altoMesada + 0.02; // los tirantes bajan hasta el respaldo, a la altura de la mesada
const Z_TIRANTE = PARED_TRASERA + 0.02;

// Tirante de cada corte hacia el fondo: dónde arranca arriba, su grosor y material, según el tipo.
const TIRANTES = /** @type {Record<string, { y: number, z: number, grosor: number, material: 'aluminio' | 'inox' }>} */ ({
  cupula_curva: { y: T - 0.03, z: ZT - 0.06, grosor: 0.018, material: 'aluminio' },
  cupula_recta: { y: T - 0.03, z: ZA, grosor: 0.018, material: 'inox' },
  iluminacion_curva: { y: T - 0.04, z: ZT - 0.07, grosor: 0.025, material: 'aluminio' },
});

/**
 * Clave del tipo de parte de arriba.
 * @param {Record<string, unknown>} modulo
 */
const claveTipo = (modulo) =>
  modulo.cupula === 'sin_cupula_iluminacion'
    ? (modulo.estructura === 'recta' ? 'iluminacion_recta' : 'iluminacion_curva')
    : String(modulo.cupula);

/**
 * Cierre del marco recto en una punta: travesaño lateral de inox y borde que baja por la diagonal de
 * atrás del vidrio lateral hasta el respaldo.
 * @param {{ x: number, hacia: 1 | -1, m: MaterialesBatea }} props  x = cara de la punta; hacia = hacia adentro
 */
const CierreMarco = ({ x, hacia, m }) => {
  const xb = x + hacia * 0.012;
  return (
    <>
      <Caja x={hacia > 0 ? [x, x + 0.025] : [x - 0.025, x]} y={[T - 0.035, T + 0.005]} z={[ZA - 0.005, MEDIDAS.profundidad / 2 - 0.025]} material={m.inox} />
      <Barra desde={[xb, T - 0.02, ZA]} hasta={[xb, Y_TIRANTE, PARED_TRASERA]} grosor={0.02} material={m.inox} />
    </>
  );
};

/**
 * Parte de arriba de una batea según su tipo.
 * @param {object} props
 * @param {Record<string, unknown>} props.batea   módulo (cupula, estructura, …)
 * @param {number} props.x0                       extremo izquierdo de la parte de arriba (m)
 * @param {number} props.x1                       extremo derecho (m)
 * @param {boolean} props.cerradoIzq              la punta izquierda cierra (lleva vidrio lateral)
 * @param {boolean} props.cerradoDer
 * @param {MaterialesBatea} props.materiales
 */
const ParteSuperior = ({ batea, x0, x1, cerradoIzq, cerradoDer, materiales }) => {
  const tipo = claveTipo(batea);
  const { banda, corte, paso, vidrioLateral } = perfilesSuperior(batea.cupula, batea.estructura);
  const centro = (x0 + x1) / 2;
  const cortes = tramos(x1 - x0, paso).cortes.map((x) => x + centro);
  const tirante = TIRANTES[tipo];
  const mat = /** @type {Record<string, import('three').Material>} */ (/** @type {unknown} */ (materiales));
  const techoRecto = tipo === 'cupula_recta' || tipo === 'iluminacion_recta';

  return (
    <>
      {banda.map(({ forma, material }, i) => (
        <Extruido key={i} forma={forma} x0={x0} x1={x1} material={mat[material]} />
      ))}

      {corte && cortes.map((x) => {
        const a = Math.max(x0, x - corte.ancho / 2), b = Math.min(x1, x + corte.ancho / 2);
        const xc = (a + b) / 2;
        return (
          <group key={x}>
            <Extruido forma={corte.forma} x0={a} x1={b} material={mat[corte.material]} />
            {tirante && (
              <Barra desde={[xc, tirante.y, tirante.z]} hasta={[xc, Y_TIRANTE, Z_TIRANTE]} grosor={tirante.grosor} material={mat[tirante.material]} />
            )}
          </group>
        );
      })}

      {/* Puntas cerradas: vidrio lateral y, en el techo recto, el cierre del marco */}
      {vidrioLateral && cerradoIzq && <Extruido forma={vidrioLateral} x0={x0} x1={x0 + ESP} material={materiales.vidrio} />}
      {vidrioLateral && cerradoDer && <Extruido forma={vidrioLateral} x0={x1 - ESP} x1={x1} material={materiales.vidrio} />}
      {techoRecto && cerradoIzq && <CierreMarco x={x0} hacia={1} m={materiales} />}
      {techoRecto && cerradoDer && <CierreMarco x={x1} hacia={-1} m={materiales} />}
    </>
  );
};

export default ParteSuperior;
