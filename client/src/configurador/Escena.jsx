import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Grid, OrbitControls, useBounds } from '@react-three/drei';
import Mueble from './Mueble';
import Persona from './Persona';

// Distancia entre el costado del mueble y la silueta humana (m).
const SEPARACION_PERSONA = 0.5;

// Colores de theme.css (three no lee variables CSS): --ice, --accent, --indigo-dye.
const COLOR_CIELO = '#e9f4ff';
const COLOR_PISO = '#96c5f7';
const COLOR_GRILLA = '#96c5f7';
const COLOR_GRILLA_METRO = '#5387c0';

// Reencuadra la cámara cuando cambia el largo. Bounds ya llama invalidate() mientras anima,
// así que funciona con frameloop="demand".
const Reencuadre = ({ largo }) => {
  const bounds = useBounds();
  useEffect(() => {
    bounds.refresh().clip().fit();
  }, [bounds, largo]);
  return null;
};

// largo en mm
const Escena = ({ largo }) => {
  const xPersona = -(largo / 2000) - SEPARACION_PERSONA;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      gl={{ preserveDrawingBuffer: true }} // necesario para sacar la captura del canvas más adelante
      camera={{ position: [-1.8, 1.7, 4.5], fov: 40 }} // de frente y del lado de la silueta, para que no quede tapada
    >
      {/* Luz de entorno sencilla, sin HDR externo */}
      <hemisphereLight args={[COLOR_CIELO, COLOR_PISO, 1.2]} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />

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
        <Reencuadre largo={largo} />
        <Mueble largo={largo} />
        <Persona x={xPersona} />
      </Bounds>

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
