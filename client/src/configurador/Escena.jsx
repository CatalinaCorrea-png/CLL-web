import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bounds, Environment, Grid, Lightformer, OrbitControls, PerformanceMonitor, useBounds } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import Linea from './productos/Linea';
import { MEDIDAS } from './productos/medidas.js';
import Cotas from './Cotas';
import { canvasAJpeg, esperarCuadros } from './captura.js';
import Persona from './Persona';

// Distancia entre el arranque de la línea y la silueta humana (m).
const SEPARACION_PERSONA = 0.5;

// Colores de theme.css (three no lee variables CSS): --ice, --accent, --indigo-dye.
const COLOR_CIELO = '#e9f4ff';
const COLOR_PISO = '#96c5f7';
const COLOR_GRILLA = '#96c5f7';
const COLOR_GRILLA_METRO = '#5387c0';

// Calidad adaptativa: se mide el rendimiento al abrir, con render continuo durante este tiempo (ms).
// Con frameloop="demand" el PerformanceMonitor no sirve: entre un frame y otro pasan segundos y
// leería siempre "equipo lento".
const TIEMPO_MEDICION = 4000;
// Los primeros cuadros compilan shaders y arman el entorno (lentos en cualquier equipo): no se cuentan.
const TIEMPO_ARRANQUE = 1000;
// En un equipo muy lento el PerformanceMonitor no llega a juntar sus muestras en ese tiempo: si al
// terminar el promedio de cuadros por segundo quedó por debajo de esto, también se baja la calidad.
const FPS_MINIMO = 24;

/**
 * Reencuadra la cámara cuando cambia el tamaño de lo que se muestra. Bounds ya llama invalidate()
 * mientras anima, así que funciona con frameloop="demand".
 * @param {object} props
 * @param {string} props.clave  cambia cuando hay que reencuadrar (módulos de la línea)
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
  frente: [0, 1.2, 5],             // de frente, del lado del cliente
  vendedor: [0, 1.2, -5],          // desde atrás: mesada, depósito y puertas traseras
  costado: [5, 1.2, 0.3],          // desde la punta derecha: la silueta queda al fondo y no tapa la batea
  perspectiva: [-2.2, 3.4, 4.5],   // tres cuartos y de arriba (~33°), del lado de la silueta: la vista inicial y
                                   // la de la captura del presupuesto (se ve la tina y cómo dobla la línea)
  arriba: [0, 8, 0.01],            // planta (el 0.01 evita la cámara exactamente vertical)
});

/**
 * Lleva la cámara a la vista pedida y reencuadra. `n` cambia en cada clic, así se puede volver a una
 * vista aunque después se haya girado la cámara con el mouse.
 * @param {object} props
 * @param {{ lado: string, n: number }} props.vista
 */
const CambiarVista = ({ vista }) => {
  const bounds = useBounds();
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    if (vista.n === 0) return; // al abrir, la cámara ya arranca en la vista inicial
    camera.position.set(...(DIRECCION_VISTA[vista.lado] ?? DIRECCION_VISTA.perspectiva));
    bounds.refresh().clip().fit();
  }, [bounds, camera, vista.n, vista.lado]);
  return null;
};

/**
 * Función que lleva la cámara a la perspectiva, reencuadra toda la línea y devuelve la captura (JPEG).
 * @typedef {() => Promise<Blob | null>} Capturar
 */

// Lo que tarda Bounds en terminar de mover la cámara (su animación dura hasta 1 s)
const TIEMPO_REENCUADRE = 1100;
// Para la captura, la cámara se aleja un poco más que el encuadre de Bounds: en un visor angosto,
// una línea con esquinas quedaba con las puntas cortadas en el borde.
const ALEJAR_CAPTURA = 1.15;

/**
 * Registra en `api` la función para sacar la captura del pedido de presupuesto.
 * @param {object} props
 * @param {import('react').RefObject<Capturar | null>} props.api
 */
const Capturador = ({ api }) => {
  const bounds = useBounds();
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const controles = /** @type {any} */ (useThree((s) => s.controls)); // OrbitControls (makeDefault)
  useEffect(() => {
    api.current = async () => {
      camera.position.set(...DIRECCION_VISTA.perspectiva);
      bounds.refresh().clip().fit();
      await new Promise((r) => setTimeout(r, TIEMPO_REENCUADRE));
      if (controles?.target) {
        camera.position.sub(controles.target).multiplyScalar(ALEJAR_CAPTURA).add(controles.target);
        controles.update();
      }
      invalidate();
      await esperarCuadros(2);
      return canvasAJpeg(gl.domElement);
    };
    return () => {
      api.current = null;
    };
  }, [api, bounds, camera, gl, invalidate, controles]);
  return null;
};

/**
 * Cuenta los cuadros dibujados (mientras se mide la calidad).
 * @param {object} props
 * @param {import('react').RefObject<number>} props.cuadros
 */
const ContarCuadros = ({ cuadros }) => {
  useFrame(() => {
    cuadros.current++;
  });
  return null;
};

// Desplazamiento (pan): hasta dónde puede ir el centro de la vista. No baja del piso ni sube más que la
// batea, y no se aleja de la línea más que esto (m), así no se "pierde" el equipo.
const ALTO_MAXIMO_CENTRO = 1.6;
const LIMITE_HORIZONTAL = 14;

/**
 * Configura los controles de la cámara para desplazar la vista: flechas del teclado cuando el foco está
 * en el 3D (se puede enfocar con un clic o con Tab) y límites para el centro de la vista.
 */
const ControlesDeDesplazamiento = () => {
  const controles = /** @type {any} */ (useThree((s) => s.controls)); // OrbitControls (makeDefault)
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (!controles) return;
    const lienzo = gl.domElement;
    lienzo.tabIndex = 0; // así las flechas solo mueven la vista cuando el foco está en el 3D, no en el panel
    controles.listenToKeyEvents?.(lienzo);
    const limitar = () => {
      const t = controles.target;
      const y = Math.min(Math.max(t.y, 0), ALTO_MAXIMO_CENTRO);
      const x = Math.min(Math.max(t.x, -LIMITE_HORIZONTAL), LIMITE_HORIZONTAL);
      const z = Math.min(Math.max(t.z, -LIMITE_HORIZONTAL), LIMITE_HORIZONTAL);
      if (x !== t.x || y !== t.y || z !== t.z) {
        // Se corren juntos el centro y la cámara, para no cambiar el ángulo de la vista
        const dx = x - t.x, dy = y - t.y, dz = z - t.z;
        t.set(x, y, z);
        controles.object.position.x += dx;
        controles.object.position.y += dy;
        controles.object.position.z += dz;
      }
    };
    controles.addEventListener('change', limitar);
    return () => {
      controles.removeEventListener('change', limitar);
      controles.stopListenToKeyEvents?.();
    };
  }, [controles, gl]);
  return null;
};

/** Solo en desarrollo: deja el renderer a mano para medir fugas (gl.info) desde la consola o un script. */
const ExponerRenderer = () => {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    /** @type {any} */ (window).__cllGL = gl;
  }, [gl]);
  return null;
};

/**
 * @param {object} props
 * @param {{ lado: string, n: number }} props.vista  vista elegida con los botones del visor
 * @param {import('./modelo/reglas.js').ConfigParcial} props.config  la línea completa (opciones y módulos)
 * @param {boolean} props.cotas  mostrar las cotas en mm
 * @param {import('react').RefObject<Capturar | null>} props.capturador  acá queda la función de captura
 */
const Escena = ({ vista, config, cotas, capturador }) => {
  // La silueta va antes del arranque de la línea (y del mostrador de remate izquierdo, si hay)
  const remateIzq = config.modulos[0]?.valor === 'mostrador' ? MEDIDAS.profundidad : 0;
  const xPersona = -remateIzq - SEPARACION_PERSONA;

  // Calidad: 'alta' por defecto; baja si el equipo no llega a los FPS mientras se mide al abrir
  const [calidad, setCalidad] = useState(/** @type {'alta' | 'baja'} */ ('alta'));
  const [midiendo, setMidiendo] = useState(true);
  const cuadros = useRef(0);
  useEffect(() => {
    const arranque = setTimeout(() => { cuadros.current = 0; }, TIEMPO_ARRANQUE);
    const fin = setTimeout(() => {
      const fps = (cuadros.current * 1000) / (TIEMPO_MEDICION - TIEMPO_ARRANQUE);
      if (import.meta.env.DEV) /** @type {any} */ (window).__cllFps = fps;
      if (fps < FPS_MINIMO) setCalidad('baja');
      setMidiendo(false);
    }, TIEMPO_MEDICION);
    return () => {
      clearTimeout(arranque);
      clearTimeout(fin);
    };
  }, []);
  const bajarCalidad = () => setCalidad('baja');
  // Ayuda táctil: se ve hasta el primer toque en el 3D (en desktop la ayuda queda fija y no la afecta)
  const [tocado, setTocado] = useState(false);
  const alta = calidad === 'alta';

  return (
    <>
      <Canvas
        role="img"
        aria-label="Vista 3D de la línea configurada. Se puede girar arrastrando; las opciones están en el panel."
        frameloop={midiendo ? 'always' : 'demand'}
        onPointerDown={() => setTocado(true)}
        dpr={alta ? [1, 1.75] : 1}
        gl={{ preserveDrawingBuffer: true }} // necesario para sacar la captura del canvas más adelante
        camera={{ position: DIRECCION_VISTA.perspectiva, fov: 40 }} // del lado de la silueta, para que no quede tapada
      >
        {midiendo && (
          <>
            <PerformanceMonitor iterations={6} ms={200} flipflops={3} onDecline={bajarCalidad} onFallback={bajarCalidad} />
            <ContarCuadros cuadros={cuadros} />
          </>
        )}
        {import.meta.env.DEV && <ExponerRenderer />}

        {/* Luces: hemisférica + direccional, y un entorno armado con paneles de luz (sin HDR externo)
            para que el inox y el galvanizado tengan reflejos en vez de verse negros. */}
        <hemisphereLight args={[COLOR_CIELO, COLOR_PISO, 0.8]} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <Environment resolution={alta ? 128 : 64} frames={1}>
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

        <Bounds fit clip observe margin={1.3}>
          <Reencuadre clave={JSON.stringify(config.modulos)} />
          <CambiarVista vista={vista} />
          <Capturador api={capturador} />
          <Linea linea={config.linea} modulos={config.modulos} />
          <Persona x={xPersona} />
        </Bounds>
        {/* Fuera de Bounds: las cotas no cambian el encuadre */}
        {cotas && <Cotas modulos={config.modulos} />}

        {/* Bloom selectivo: solo brilla lo que supera el umbral (el LED, emisivo × 4 y sin tone mapping).
            El EffectComposer apaga el tone mapping del renderer, así que se aplica acá al final.
            En calidad baja no hay composer: el renderer vuelve a su tone mapping ACES. */}
        {alta && (
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur luminanceThreshold={1.2} luminanceSmoothing={0.2} intensity={0.7} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}

        {/* Ángulo polar limitado: la cámara no puede bajar del piso */}
        {/* Girar (arrastrar), zoom (rueda o pellizco) y desplazar la vista: clic derecho o Ctrl/Shift +
            arrastrar en la compu, dos dedos en el celular, flechas con el foco en el 3D.
            Ángulo polar limitado: la cámara no puede bajar del piso. */}
        <OrbitControls
          makeDefault
          enablePan
          screenSpacePanning
          keyPanSpeed={20}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={1.5}
          maxDistance={25} // una línea larga vista desde arriba necesita alejarse
        />
        <ControlesDeDesplazamiento />
      </Canvas>
      {!alta && <p className="cfg-calidad">Calidad reducida para este equipo</p>}
      <p className="cfg-ayuda-controles">Arrastrá para girar · clic derecho para mover · rueda para zoom</p>
      {!tocado && <p className="cfg-ayuda-tactil">1 dedo: girar · 2 dedos: mover y zoom</p>}
    </>
  );
};

export default Escena;
