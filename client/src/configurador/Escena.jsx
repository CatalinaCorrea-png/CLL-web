import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Bounds, Environment, Grid, Lightformer, OrbitControls, useBounds } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import Batea from './productos/Batea';
import Persona from './Persona';

// Distancia entre el costado de la batea y la silueta humana (m).
const SEPARACION_PERSONA = 0.5;

// Colores de theme.css (three no lee variables CSS): --ice, --accent, --indigo-dye.
const COLOR_CIELO = '#e9f4ff';
const COLOR_PISO = '#96c5f7';
const COLOR_GRILLA = '#96c5f7';
const COLOR_GRILLA_METRO = '#5387c0';

/**
 * Reencuadra la cámara cuando cambia el tamaño de lo que se muestra. Bounds ya llama invalidate()
 * mientras anima, así que funciona con frameloop="demand".
 * @param {object} props
 * @param {string} props.clave  cambia cuando hay que reencuadrar (hoy, el largo)
 */
const Reencuadre = ({ clave }) => {
  const bounds = useBounds();
  useEffect(() => {
    bounds.refresh().clip().fit();
  }, [bounds, clave]);
  return null;
};

/** Dirección de la cámara para cada vista (se reencuadra con Bounds, así la distancia la pone el fit). */
const DIRECCION_VISTA = /** @type {Record<string, [number, number, number]>} */ ({
  cliente: [-1.8, 1.7, 4.5],   // de frente y del lado de la silueta
  vendedor: [1.8, 1.7, -4.5],  // desde atrás: mesada, depósito y puertas traseras
});

/**
 * Lleva la cámara al lado pedido y reencuadra. `n` cambia en cada clic, así se puede volver a una
 * vista aunque después se haya girado la cámara con el mouse.
 * @param {object} props
 * @param {{ lado: string, n: number }} props.vista
 */
const CambiarVista = ({ vista }) => {
  const bounds = useBounds();
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    if (vista.n === 0) return; // al abrir, la cámara ya arranca del lado del cliente
    camera.position.set(...(DIRECCION_VISTA[vista.lado] ?? DIRECCION_VISTA.cliente));
    bounds.refresh().clip().fit();
  }, [bounds, camera, vista.n, vista.lado]);
  return null;
};

/**
 * @param {object} props
 * @param {{ lado: string, n: number }} props.vista  lado desde el que se mira (botones Cliente / Vendedor)
 * @param {Record<string, unknown>} props.linea  opciones generales de la línea
 * @param {Record<string, unknown>} props.batea  la batea a mostrar (por ahora, la primera de la línea)
 */
const Escena = ({ vista, linea, batea }) => {
  const largo = Number(batea.largo);
  const xPersona = -(largo / 2000) - SEPARACION_PERSONA;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      gl={{ preserveDrawingBuffer: true }} // necesario para sacar la captura del canvas más adelante
      camera={{ position: [-1.8, 1.7, 4.5], fov: 40 }} // de frente y del lado de la silueta, para que no quede tapada
    >
      {/* Luces: hemisférica + direccional, y un entorno armado con paneles de luz (sin HDR externo)
          para que el inox y el galvanizado tengan reflejos en vez de verse negros. */}
      <hemisphereLight args={[COLOR_CIELO, COLOR_PISO, 0.8]} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.5} position={[0, 5, 3]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer intensity={1.5} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer intensity={1.5} position={[5, 2, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer intensity={1.5} position={[0, 2, 6]} scale={[10, 3, 1]} />
        <Lightformer intensity={1.5} position={[0, 2, -5]} scale={[10, 3, 1]} />
      </Environment>

      <Grid
        infiniteGrid
        cellSize={0.1}
        sectionSize={1}
        cellColor={COLOR_GRILLA}
        sectionColor={COLOR_GRILLA_METRO}
        fadeDistance={25}
        fadeStrength={1.5}
      />

      <Bounds fit clip observe margin={1.2}>
        <Reencuadre clave={`${largo}-${batea.cupula}-${batea.estructura ?? ''}`} />
        <CambiarVista vista={vista} />
        <Batea batea={batea} linea={linea} />
        <Persona x={xPersona} />
      </Bounds>

      {/* Bloom selectivo: solo brilla lo que supera el umbral (el LED, emisivo × 4 y sin tone mapping).
          El EffectComposer apaga el tone mapping del renderer, así que se aplica acá al final. */}
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={1.2} luminanceSmoothing={0.2} intensity={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>

      {/* Ángulo polar limitado: la cámara no puede bajar del piso */}
      <OrbitControls
        makeDefault
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={1.5}
        maxDistance={15}
      />
    </Canvas>
  );
};

export default Escena;
