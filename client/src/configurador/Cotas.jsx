// Cotas en mm (prompt 7): largo de cada batea, mostrador y remate; largo de cada ala (sin esquinas, el
// total de la línea); profundidad y alto. Líneas de drei (Line) con la medida en un sprite encima.
// Se recalculan con los módulos: salen del mismo recorrido que ubica las piezas (productos/recorrido.js).
// La medida va en un sprite (textura dibujada en un canvas) y no en un Html de drei: el Html crea una
// raíz de React por etiqueta que con React 19 falla al desmontarse mientras se renderiza, y además no
// saldría en la captura del canvas para el presupuesto.
import { useEffect, useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { MEDIDAS } from './productos/medidas.js';
import { recorrerLinea } from './productos/recorrido.js';

/** @typedef {[number, number, number]} Punto3 */

const COLOR_COTA = '#5387c0'; // --accent de theme.css (three no lee variables CSS)
const COLOR_TEXTO = '#224870'; // --brand
const ALTO_ETIQUETA = 0.024;   // tamaño fijo en pantalla (sprite sin atenuación): ~2,4 % de la altura
const PX = 64;                 // alto de la textura de cada etiqueta, en px
const Y_PISO = 0.005;          // apenas sobre el piso, para que no titile con la grilla
const H = MEDIDAS.profundidad / 2;
const TOPE = 0.06;             // largo de las marquitas en las puntas
const SEPARACION = 0.12;       // de la cota de profundidad y alto a la punta de la línea
const Z_MODULO = H + 0.25;     // cota de cada módulo, por delante del frente
const Z_ALA = H + 0.55;        // cota de cada ala (total), más afuera

/**
 * Etiqueta con la medida: un sprite que siempre mira a la cámara, del mismo tamaño en pantalla a
 * cualquier distancia, y por encima de todo (sin depthTest). Textura y material se liberan al desmontar.
 * @param {object} props
 * @param {Punto3} props.position
 * @param {string} props.texto
 */
const Etiqueta = ({ position, texto }) => {
  const { material, aspecto } = useMemo(() => {
    const lienzo = document.createElement('canvas');
    const ctx = /** @type {CanvasRenderingContext2D} */ (lienzo.getContext('2d'));
    const fuente = `700 ${PX * 0.55}px system-ui, sans-serif`;
    ctx.font = fuente;
    const ancho = Math.ceil(ctx.measureText(texto).width + PX * 0.6);
    lienzo.width = ancho;
    lienzo.height = PX;
    ctx.font = fuente; // se pierde al cambiar el tamaño del canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.strokeStyle = 'rgba(83, 135, 192, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(1.5, 1.5, ancho - 3, PX - 3, PX * 0.22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLOR_TEXTO;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, ancho / 2, PX / 2 + 1);
    const textura = new THREE.CanvasTexture(lienzo);
    textura.colorSpace = THREE.SRGBColorSpace;
    return {
      material: new THREE.SpriteMaterial({ map: textura, depthTest: false, sizeAttenuation: false, toneMapped: false }),
      aspecto: ancho / PX,
    };
  }, [texto]);
  useEffect(() => () => {
    material.map?.dispose();
    material.dispose();
  }, [material]);
  return <sprite position={position} material={material} scale={[ALTO_ETIQUETA * aspecto, ALTO_ETIQUETA, 1]} renderOrder={11} />;
};

/**
 * Una cota: línea de a a b con topes perpendiculares (en la dirección `tope`) y la medida en mm.
 * @param {object} props
 * @param {Punto3} props.a
 * @param {Punto3} props.b
 * @param {Punto3} props.tope  dirección de las marquitas (unitaria)
 */
const Cota = ({ a, b, tope }) => {
  const mm = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) * 1000);
  const t = /** @type {Punto3} */ (tope.map((v) => v * TOPE));
  /** @param {Punto3} p @param {number} k @returns {Punto3} */
  const mas = (p, k) => [p[0] + t[0] * k, p[1] + t[1] * k, p[2] + t[2] * k];
  const medio = /** @type {Punto3} */ ([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
  return (
    <group>
      <Line
        points={[a, b, mas(a, -1), mas(a, 1), mas(b, -1), mas(b, 1)]}
        segments
        color={COLOR_COTA}
        lineWidth={1.5}
        depthTest={false}
        renderOrder={10}
      />
      <Etiqueta position={medio} texto={String(mm)} />
    </group>
  );
};

/**
 * Cotas de toda la línea.
 * @param {object} props
 * @param {Array<Record<string, unknown>>} props.modulos  config.modulos
 */
const Cotas = ({ modulos }) => {
  const { piezas, alas, alto } = useMemo(() => recorrerLinea(modulos), [modulos]);
  const primera = alas[0];

  return (
    <group>
      {/* Largo de cada batea, mostrador intermedio y remate (las esquinas miden siempre la profundidad) */}
      {piezas.filter((p) => p.pieza !== 'esquina').map(({ indice, posicion, giro, largo = 0 }) => (
        <group key={indice} position={posicion} rotation={[0, giro, 0]}>
          <Cota a={[-largo / 2, Y_PISO, Z_MODULO]} b={[largo / 2, Y_PISO, Z_MODULO]} tope={[0, 0, 1]} />
        </group>
      ))}

      {/* Largo de cada ala sobre el frente del cliente; sin esquinas, el total de la línea.
          Si el ala es un solo módulo y ninguna esquina le suma, repetiría su cota: no se dibuja. */}
      {alas.filter((ala) => ala.modulos > 1 || ala.esquina).map((ala, i) => (
        <group key={i} position={ala.origen} rotation={[0, ala.giro, 0]}>
          <Cota a={[ala.desde, Y_PISO, Z_ALA]} b={[ala.hasta, Y_PISO, Z_ALA]} tope={[0, 0, 1]} />
        </group>
      ))}

      {/* Profundidad (en el piso) y alto, en la punta izquierda de la línea */}
      <group position={primera.origen} rotation={[0, primera.giro, 0]}>
        <Cota a={[primera.desde - SEPARACION, Y_PISO, -H]} b={[primera.desde - SEPARACION, Y_PISO, H]} tope={[1, 0, 0]} />
        <Cota a={[primera.desde - SEPARACION, 0, H]} b={[primera.desde - SEPARACION, alto, H]} tope={[1, 0, 0]} />
      </group>
    </group>
  );
};

export default Cotas;
