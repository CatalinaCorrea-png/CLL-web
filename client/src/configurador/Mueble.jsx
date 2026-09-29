// Mueble de prototipo: una caja de largo variable apoyada en el piso.
// Unidades de la escena: 1 unidad = 1 metro.

// PROVISORIO: medidas de la batea según la especificación (alto total y profundidad).
export const ALTO = 1.25;
export const PROFUNDIDAD = 1.1;

// largo en mm. Se cambia la geometría (args), no la escala, para no deformar detalles futuros.
const Mueble = ({ largo }) => {
  return (
    <mesh position={[0, ALTO / 2, 0]}>
      <boxGeometry args={[largo / 1000, ALTO, PROFUNDIDAD]} />
      <meshStandardMaterial color="#c9d6e3" metalness={0.2} roughness={0.55} />
    </mesh>
  );
};

export default Mueble;
