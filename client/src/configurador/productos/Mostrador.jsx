// Mostrador sin frío ni vidrio (prompt 6b): el intermedio (entre dos bateas en línea recta, del largo
// elegido) y el de remate (en una punta, 1100 × 1100 mm). Materiales (especificación, foto batea-3.webp):
//   faldón y zócalo → siguen la zona de color de la línea, como en la batea;
//   riel frontal → galvanizado, alineado con el de las bateas;
//   frente de arriba y caja → chapa blanca (inox con cuerpo de inox);
//   tapa → inox, a la altura de la mesada, así la mesada del vendedor sigue de largo.
import { MEDIDAS } from './medidas.js';
import { FRENTE, FONDO } from './geometria.js';
import { Caja } from './piezas.jsx';

/** @typedef {import('./materiales.js').MaterialesBatea} MaterialesBatea */

const m = MEDIDAS;

/**
 * Mostrador centrado en x = 0, con el frente (cliente) hacia +Z.
 * @param {object} props
 * @param {number} props.largo  en metros
 * @param {MaterialesBatea} props.materiales
 */
const Mostrador = ({ largo, materiales }) => {
  const x = /** @type {[number, number]} */ ([-largo / 2, largo / 2]);
  const yTapa = m.altoMesada - m.espesorMesada;
  return (
    <group>
      {/* Zócalo retirado y caja del cuerpo */}
      <Caja x={[x[0] + 0.01, x[1] - 0.01]} y={[0, m.altoZocalo]} z={[FONDO + 0.03, FRENTE - m.retiroZocaloFrente]} material={materiales.zocalo} />
      <Caja x={x} y={[m.altoZocalo, yTapa]} z={[FONDO, FRENTE - 0.04]} material={materiales.lateral} />
      {/* Faldón, riel con sus juntas y frente de arriba */}
      <Caja x={x} y={[m.altoZocalo, m.altoFranja]} z={[FRENTE - 0.04, FRENTE]} material={materiales.faldon} />
      <Caja x={x} y={[m.altoFranja, m.altoRiel]} z={[FRENTE - 0.08, FRENTE + m.salienteRiel]} material={materiales.galvanizado} />
      {[0.035, 0.075].map((dy) => (
        <Caja
          key={dy}
          x={x}
          y={[m.altoFranja + dy - 0.004, m.altoFranja + dy + 0.004]}
          z={[FRENTE + m.salienteRiel - 0.002, FRENTE + m.salienteRiel + 0.003]}
          material={materiales.oscuro}
        />
      ))}
      <Caja x={x} y={[m.altoRiel, yTapa]} z={[FRENTE - 0.04, FRENTE - 0.01]} material={materiales.lateral} />
      {/* Tapa de inox, apenas más grande que la caja */}
      <Caja x={[x[0] - 0.01, x[1] + 0.01]} y={[yTapa, m.altoMesada]} z={[FONDO - 0.02, FRENTE + 0.01]} material={materiales.inox} />
    </group>
  );
};

export default Mostrador;
