// Silueta humana simple como referencia de escala (1 unidad = 1 metro).
export const ALTURA_PERSONA = 1.75;

const RADIO_CABEZA = 0.11;
const RADIO_CUERPO = 0.2;
// Cuerpo: cápsula que va del piso hasta el cuello (el alto de una cápsula es largo + 2 radios).
const ALTO_CUERPO = ALTURA_PERSONA - RADIO_CABEZA * 2;
const LARGO_CAPSULA = ALTO_CUERPO - RADIO_CUERPO * 2;

/**
 * @param {object} props
 * @param {number} props.x  posición en metros sobre el eje del largo
 */
const Persona = ({ x }) => {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, ALTO_CUERPO / 2, 0]}>
        <capsuleGeometry args={[RADIO_CUERPO, LARGO_CAPSULA, 8, 16]} />
        <meshStandardMaterial color="#5387c0" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, ALTO_CUERPO + RADIO_CABEZA, 0]}>
        <sphereGeometry args={[RADIO_CABEZA, 24, 16]} />
        <meshStandardMaterial color="#5387c0" transparent opacity={0.55} />
      </mesh>
    </group>
  );
};

export default Persona;
