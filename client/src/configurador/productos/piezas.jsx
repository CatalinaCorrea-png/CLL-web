// Piezas básicas reutilizables para armar la batea (cuerpo, parte de arriba, esquinas).
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Caja definida por sus límites en cada eje (más claro que centro + tamaño).
 * @param {object} props
 * @param {[number, number]} props.x
 * @param {[number, number]} props.y
 * @param {[number, number]} props.z
 * @param {THREE.Material} props.material
 */
export const Caja = ({ x, y, z, material }) => (
  <mesh position={[(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2]} material={material}>
    <boxGeometry args={[x[1] - x[0], y[1] - y[0], z[1] - z[0]]} />
  </mesh>
);

/**
 * Perfil en el plano (z, y) extruido a lo largo de X, entre x0 y x1.
 * La forma tiene que ser estable (constante del módulo o useMemo) para no recrear la geometría.
 * @param {object} props
 * @param {THREE.Shape} props.forma
 * @param {number} props.x0
 * @param {number} props.x1
 * @param {THREE.Material} props.material
 */
export const Extruido = ({ forma, x0, x1, material }) => {
  const ancho = x1 - x0;
  const geometria = useMemo(() => new THREE.ExtrudeGeometry(forma, { depth: ancho, bevelEnabled: false }), [forma, ancho]);
  useEffect(() => () => geometria.dispose(), [geometria]);
  // Rotando −90° en Y, el perfil (x = z del mundo) queda en el plano ZY y la extrusión va hacia −X.
  return <mesh geometry={geometria} material={material} position={[x1, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />;
};

const EJE_Y = new THREE.Vector3(0, 1, 0);

/**
 * Barra recta de sección cuadrada entre dos puntos (tirantes, parantes inclinados).
 * @param {object} props
 * @param {[number, number, number]} props.desde
 * @param {[number, number, number]} props.hasta
 * @param {number} props.grosor  lado de la sección (m)
 * @param {THREE.Material} props.material
 */
export const Barra = ({ desde, hasta, grosor, material }) => {
  const { centro, largo, giro } = useMemo(() => {
    const a = new THREE.Vector3(...desde), b = new THREE.Vector3(...hasta);
    const dir = b.clone().sub(a);
    return {
      centro: a.clone().add(b).multiplyScalar(0.5),
      largo: dir.length(),
      giro: new THREE.Quaternion().setFromUnitVectors(EJE_Y, dir.normalize()),
    };
  }, [desde, hasta]);
  return (
    <mesh position={centro} quaternion={giro} material={material}>
      <boxGeometry args={[grosor, largo, grosor]} />
    </mesh>
  );
};
