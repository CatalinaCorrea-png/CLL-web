// Batea generada por código a partir de su configuración: cuerpo, tina, mesada, laterales e interior (6.1)
// y la parte de arriba según el tipo (6.2, en ParteSuperior.jsx); adicionales (6.3, en Adicionales.jsx).
// Materiales (especificación v5): el color va en el faldón, el zócalo o los dos (lo sin color, chapa blanca);
// tina y respaldo trasero son de chapa blanca o de inox (siempre inox con cuerpo de inox); laterales de chapa
// blanca con remate de inox (todo de inox con cuerpo de inox). Los costados de la tina son la cara interior
// de los laterales.
//
// Ejes: ver geometria.js (X largo, Y altura, Z profundidad; el cliente mira desde +Z).
// Los laterales van DENTRO del largo nominal. Nada se escala: cada pieza se dimensiona con el largo.
import { useEffect, useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { MEDIDAS } from './medidas.js';
import { FRENTE, FONDO, PARED_TRASERA, BORDE_LATERAL, hayEquipoIncorporado } from './geometria.js';
import { Caja } from './piezas.jsx';
import ParteSuperior from './ParteSuperior';
import Adicionales from './Adicionales';

const Z_INT_FONDO = PARED_TRASERA + 0.02;          // interior de la tina: de la pared trasera…
const Z_INT_FRENTE = FRENTE - 0.09;                // …a la pared del frente

/**
 * Divide un largo en paneles de ~MEDIDAS.largoPanel (bandejas, rejillas).
 * @param {number} largo  en metros
 * @returns {Array<{ x: number, ancho: number }>}  centro y ancho de cada panel
 */
const paneles = (largo) => {
  const n = Math.max(1, Math.round(largo / MEDIDAS.largoPanel));
  const ancho = largo / n;
  return Array.from({ length: n }, (_, i) => ({ x: -largo / 2 + ancho * (i + 0.5), ancho }));
};

/**
 * Rejilla de alambre en el plano XZ: alambres a lo largo de la profundidad cada `paso`,
 * travesaños adelante, en el medio y atrás, y marcos más gruesos entre paneles.
 * Es un solo InstancedMesh (una llamada de dibujo) por rejilla.
 * @param {object} props
 * @param {number} props.ancho   en X (m)
 * @param {number} props.fondo   en Z (m)
 * @param {THREE.Material} props.material
 * @param {[number, number, number]} [props.position]
 * @param {[number, number, number]} [props.rotation]
 * @param {number} [props.paso]  separación entre alambres (m)
 */
const Rejilla = ({ ancho, fondo, material, position = [0, 0, 0], rotation = [0, 0, 0], paso = 0.025 }) => {
  const piezas = useMemo(() => {
    /** @type {Array<{ p: [number, number, number], s: [number, number, number] }>} */
    const lista = [];
    const n = Math.floor(ancho / paso);
    for (let i = 0; i <= n; i++) {
      lista.push({ p: [-ancho / 2 + i * (ancho / n), 0, 0], s: [0.004, 0.004, fondo] });
    }
    for (const z of [-fondo / 2, 0, fondo / 2]) {
      lista.push({ p: [0, -0.004, z], s: [ancho, 0.006, 0.006] });
    }
    for (const { x, ancho: a } of paneles(ancho)) {
      lista.push({ p: [x - a / 2, 0, 0], s: [0.008, 0.008, fondo] });
    }
    return lista;
  }, [ancho, fondo, paso]);

  return (
    <group position={position} rotation={rotation}>
      <Instances limit={piezas.length} material={material}>
        <boxGeometry />
        {piezas.map((pieza, i) => (
          <Instance key={i} position={pieza.p} scale={pieza.s} />
        ))}
      </Instances>
    </group>
  );
};

const ALTO_REMATE_INOX = 0.015; // PROVISORIO: ancho del remate de inox del borde superior

/** Panel del lateral (siempre recto): frente vertical y borde superior en diagonal. */
const perfilLateral = () => {
  const s = new THREE.Shape();
  s.moveTo(FRENTE + MEDIDAS.salienteRiel, MEDIDAS.altoZocalo);
  for (const [z, y] of BORDE_LATERAL) s.lineTo(z, y);
  s.lineTo(FONDO, MEDIDAS.altoZocalo);
  s.closePath();
  return s;
};

/** Remate de inox: una banda que sigue el borde superior del lateral, un poco por debajo y por encima. */
const perfilRemateInox = () => {
  const s = new THREE.Shape();
  const arriba = BORDE_LATERAL.map(([z, y]) => [z, y + 0.004]);
  const abajo = BORDE_LATERAL.map(([z, y]) => [z, y - ALTO_REMATE_INOX]).reverse();
  s.moveTo(arriba[0][0], arriba[0][1]);
  for (const [z, y] of [...arriba.slice(1), ...abajo]) s.lineTo(z, y);
  s.closePath();
  return s;
};

/**
 * Los laterales de las puntas CERRADAS: siempre rectos, de chapa blanca con la parte de arriba de inox; con cuerpo de inox,
 * todo de acero. No cambian de color ni con el material del interior (su cara de adentro es el costado
 * de la tina). La especificación completa de los laterales llega más adelante.
 * @param {object} props
 * @param {number} props.largo  en metros
 * @param {boolean} props.izq   dibujar el lateral izquierdo
 * @param {boolean} props.der   dibujar el lateral derecho
 * @param {import('./materiales.js').MaterialesBatea} props.materiales
 */
const Laterales = ({ largo, izq, der, materiales }) => {
  const t = MEDIDAS.espesorLateral;
  const sobra = 0.003; // el remate de inox es un poco más ancho que el panel
  const [panel, remate] = useMemo(() => [
    new THREE.ExtrudeGeometry(perfilLateral(), { depth: t, bevelEnabled: false }),
    new THREE.ExtrudeGeometry(perfilRemateInox(), { depth: t + 2 * sobra, bevelEnabled: false }),
  ], [t]);
  useEffect(() => () => { panel.dispose(); remate.dispose(); }, [panel, remate]);

  // Rotando −90° en Y, el perfil (x = z del mundo) queda en el plano ZY y la extrusión va hacia −X.
  const rotacion = /** @type {[number, number, number]} */ ([0, -Math.PI / 2, 0]);
  return (
    <>
      {[izq ? -largo / 2 + t : null, der ? largo / 2 : null].filter((x) => x !== null).map((x) => (
        <group key={x}>
          <mesh geometry={panel} material={materiales.lateral} position={[x, 0, 0]} rotation={rotacion} />
          <mesh geometry={remate} material={materiales.inox} position={[x + sobra, 0, 0]} rotation={rotacion} />
        </group>
      ))}
    </>
  );
};

/**
 * Interior de la tina según el frío: rejillas planas (estático) o bandejas lisas (forzado),
 * con rejilla recta o escalonada encima si se eligió.
 * @param {object} props
 * @param {number} props.anchoInterior  largo libre entre laterales (m)
 * @param {Record<string, unknown>} props.linea
 * @param {import('./materiales.js').MaterialesBatea} props.materiales
 */
const Interior = ({ anchoInterior, linea, materiales }) => {
  const piso = MEDIDAS.pisoExhibicion;
  const fondo = Z_INT_FRENTE - Z_INT_FONDO;
  const zCentro = (Z_INT_FRENTE + Z_INT_FONDO) / 2;
  const ancho = anchoInterior - 0.02;

  if (linea.frio === 'estatico') {
    return <Rejilla ancho={ancho} fondo={fondo - 0.02} material={materiales.rejilla} position={[0, piso + 0.02, zCentro]} />;
  }

  return (
    <>
      {/* Bandejas lisas, una por panel, con una junta fina entre cada una */}
      {paneles(ancho).map(({ x, ancho: a }) => (
        <Caja key={x} x={[x - a / 2 + 0.003, x + a / 2 - 0.003]} y={[piso + 0.005, piso + 0.015]} z={[Z_INT_FONDO + 0.01, Z_INT_FRENTE - 0.01]} material={materiales.bandeja} />
      ))}

      {linea.rejillaSobreBandeja === 'recta' && (
        <Rejilla ancho={ancho} fondo={fondo - 0.04} material={materiales.rejilla} position={[0, piso + 0.05, zCentro]} />
      )}

      {linea.rejillaSobreBandeja === 'escalonada' && (
        // 3 escalones que suben hacia atrás (hacia el vendedor), con sus frentes verticales
        [0, 1, 2].map((k) => {
          const f = (fondo - 0.04) / 3;
          const z = Z_INT_FRENTE - 0.02 - f * (k + 0.5);
          const y = piso + 0.05 + k * 0.06; // PROVISORIO: 6 cm por escalón
          return (
            <group key={k}>
              <Rejilla ancho={ancho} fondo={f} material={materiales.rejilla} position={[0, y, z]} />
              <Rejilla ancho={ancho} fondo={0.06} material={materiales.rejilla} position={[0, y - 0.03, z + f / 2]} rotation={[Math.PI / 2, 0, 0]} />
            </group>
          );
        })
      )}
    </>
  );
};

/**
 * Batea generada por código (cuerpo, tina, mesada, laterales e interior).
 * Cada punta puede estar CERRADA (lleva lateral y vidrio lateral: remate, mostrador o esquina mostrador
 * al lado) o ABIERTA (sigue en una esquina con frío o en otra batea pegada): ahí no hay lateral y el
 * cuerpo, la tina, la mesada y la parte de arriba llegan hasta el borde para unirse con la vecina.
 * @param {object} props
 * @param {Record<string, unknown>} props.batea  módulo de la línea (largo en mm, cúpula, etc.)
 * @param {Record<string, unknown>} props.linea  opciones generales (material, color, tina, frío, …)
 * @param {import('./materiales.js').MaterialesBatea} props.materiales  compartidos por toda la línea
 * @param {boolean} [props.cerradoIzq]
 * @param {boolean} [props.cerradoDer]
 * @param {boolean} [props.vidrioIzq]  vidrio lateral aunque la punta abra (bateas pegadas de distinto tipo)
 * @param {boolean} [props.vidrioDer]
 */
const Batea = ({ batea, linea, materiales, cerradoIzq = true, cerradoDer = true, vidrioIzq = cerradoIzq, vidrioDer = cerradoDer }) => {
  const L = Number(batea.largo) / 1000;
  const t = MEDIDAS.espesorLateral;
  const xi = L / 2 - t; // cara interior de los laterales
  const xa = cerradoIzq ? -xi : -L / 2; // extremos de lo que va entre laterales (o hasta el borde si abre)
  const xb = cerradoDer ? xi : L / 2;
  const m = MEDIDAS;

  // Patas: en las puntas del zócalo y una cada ~1 m
  const xPatas = useMemo(() => {
    const extremo = L / 2 - m.retiroZocaloCostado - 0.08;
    const n = Math.max(1, Math.ceil((2 * extremo) / 1.0));
    return Array.from({ length: n + 1 }, (_, i) => -extremo + (2 * extremo * i) / n);
  }, [L, m.retiroZocaloCostado]);

  return (
    <group>
      {/* 1. Patas */}
      {xPatas.flatMap((x) => [FONDO + 0.15, FRENTE - m.retiroZocaloFrente - 0.08].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, m.altoPatas / 2, z]} material={materiales.oscuro}>
          <cylinderGeometry args={[0.03, 0.03, m.altoPatas, 16]} />
        </mesh>
      )))}

      {/* 2. Zócalo, retirado hacia adentro. Lleva el color del zócalo (o chapa blanca si va sin color).
          Con equipo incorporado se acorta: su costado derecho es el lugar del equipo (Adicionales). */}
      <Caja
        x={[
          cerradoIzq ? -L / 2 + m.retiroZocaloCostado : -L / 2,
          (cerradoDer ? L / 2 - m.retiroZocaloCostado : L / 2) - (hayEquipoIncorporado(linea) ? m.anchoEquipo : 0),
        ]}
        y={[m.altoPatas, m.altoZocalo]}
        z={[FONDO + 0.03, FRENTE - m.retiroZocaloFrente]}
        material={materiales.zocalo}
      />

      {/* 3. Bloque bajo la tina y respaldo trasero (lado del vendedor, bajo la mesada): material de la tina.
          Faldón (franja del frente): lleva el color del faldón (o chapa blanca si va sin color). */}
      <Caja x={[xa, xb]} y={[m.altoZocalo, m.pisoExhibicion - 0.02]} z={[PARED_TRASERA, FRENTE - 0.04]} material={materiales.tina} />
      <Caja x={[xa, xb]} y={[m.altoZocalo, m.altoMesada - m.espesorMesada]} z={[FONDO, PARED_TRASERA]} material={materiales.tina} />
      <Caja x={[xa, xb]} y={[m.altoZocalo, m.altoFranja]} z={[FRENTE - 0.04, FRENTE]} material={materiales.faldon} />

      {/* 4. Riel frontal (galvanizado) con dos juntas oscuras */}
      <Caja x={[xa, xb]} y={[m.altoFranja, m.altoRiel]} z={[FRENTE - 0.08, FRENTE + m.salienteRiel]} material={materiales.galvanizado} />
      {[0.035, 0.075].map((dy) => (
        <Caja
          key={dy}
          x={[xa, xb]}
          y={[m.altoFranja + dy - 0.004, m.altoFranja + dy + 0.004]}
          z={[FRENTE + m.salienteRiel - 0.002, FRENTE + m.salienteRiel + 0.003]}
          material={materiales.oscuro}
        />
      ))}

      {/* 5. Tina: bacha (piso), pared del frente por dentro y respaldo hasta la mesada */}
      <Caja x={[xa, xb]} y={[m.pisoExhibicion - 0.02, m.pisoExhibicion]} z={[PARED_TRASERA, FRENTE - 0.08]} material={materiales.tina} />
      <Caja x={[xa, xb]} y={[m.pisoExhibicion, m.altoRiel - 0.005]} z={[FRENTE - 0.09, FRENTE - 0.08]} material={materiales.tina} />
      <Caja x={[xa, xb]} y={[m.pisoExhibicion, m.altoMesada - m.espesorMesada]} z={[PARED_TRASERA, PARED_TRASERA + 0.02]} material={materiales.tina} />

      {/* 6. Mesada de inox del lado del vendedor, a todo el largo */}
      <Caja
        x={[xa, xb]}
        y={[m.altoMesada - m.espesorMesada, m.altoMesada]}
        z={[FONDO - 0.02, PARED_TRASERA + 0.02]}
        material={materiales.inox}
      />

      {/* 7. Laterales */}
      <Laterales largo={L} izq={cerradoIzq} der={cerradoDer} materiales={materiales} />

      {/* 8. Interior según el frío */}
      <group position={[(xa + xb) / 2, 0, 0]}>
        <Interior anchoInterior={xb - xa} linea={linea} materiales={materiales} />
      </group>

      {/* 9. Parte de arriba según el tipo (cúpula curva / recta, sin cúpula con iluminación, sin cúpula) */}
      <ParteSuperior batea={batea} x0={xa} x1={xb} cerradoIzq={vidrioIzq} cerradoDer={vidrioDer} materiales={materiales} />

      {/* 10. Adicionales: depósito, puertas traseras de acrílico y equipo incorporado (6.3) */}
      <Adicionales batea={batea} linea={linea} largo={L} xi={xi} materiales={materiales} />
    </group>
  );
};

export default Batea;
