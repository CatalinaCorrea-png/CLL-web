// Materiales de la batea, con nombre. Se crean una sola vez y se recolorean en vivo
// (no se recrean al cambiar opciones), así no se pierde memoria de GPU.
import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import catalogo from '../modelo/catalogo.json';
import { paletaDeColor } from '../modelo/reglas.js';

// Colores fijos (los que no elige el cliente). Aproximados de las fotos.
const COLOR_GALVANIZADO = '#b9c0c6';
const COLOR_INOX = '#d8dde1';
const COLOR_CHAPA_BLANCA = '#ffffff'; // chapa blanca: tina, respaldo y laterales
const COLOR_REJILLA = '#f5f7f8';    // alambre blanco
const COLOR_BANDEJA_PREPINTADA = '#f1f3f2';
const COLOR_OSCURO = '#3d4349';     // patas, ruedas y juntas del riel
const COLOR_ALUMINIO = '#cfd4d8';   // arcos y perfiles de la parte de arriba

/**
 * @typedef {object} MaterialesBatea
 * @property {THREE.MeshStandardMaterial} pintura
 * @property {THREE.MeshStandardMaterial} inox
 * @property {THREE.MeshStandardMaterial} galvanizado
 * @property {THREE.MeshStandardMaterial} chapaBlanca  tina de chapa y caras de los laterales
 * @property {THREE.MeshStandardMaterial} rejilla
 * @property {THREE.MeshStandardMaterial} bandeja
 * @property {THREE.MeshStandardMaterial} oscuro
 * @property {THREE.MeshStandardMaterial} aluminio  arcos, perfil superior y tirantes de la parte de arriba
 * @property {THREE.MeshPhysicalMaterial} vidrio   transparente simple (sin transmission, liviano para mobile)
 * @property {THREE.MeshStandardMaterial} led      emisivo por encima de 1 y sin tone mapping: es lo único que toma el Bloom
 * @property {THREE.MeshStandardMaterial} acrilico puertas traseras: translúcido esmerilado
 * @property {THREE.MeshStandardMaterial} rejillaVentilacion  chapa perforada en la pared del costado del equipo (textura generada por código)
 * @property {THREE.MeshStandardMaterial} faldon  franja del frente: pintura si lleva color, chapa blanca si no; inox con cuerpo de inox
 * @property {THREE.MeshStandardMaterial} zocalo  base: pintura si lleva color, chapa blanca si no; inox con cuerpo de inox
 * @property {THREE.MeshStandardMaterial} tina    bacha, respaldo y respaldo trasero: chapa blanca o inox
 * @property {THREE.MeshStandardMaterial} lateral laterales de cierre (y costados de la tina): chapa blanca, o inox con cuerpo de inox
 */

/**
 * @param {string} name
 * @param {THREE.MeshStandardMaterialParameters} params
 */
const estandar = (name, params) => Object.assign(new THREE.MeshStandardMaterial(params), { name });

/**
 * Textura de chapa perforada (agujeros redondos oscuros sobre gris), generada en un canvas:
 * no hace falta ningún archivo de imagen. Cada repetición es un agujero de ~12 mm.
 * @param {number} repX  repeticiones a lo ancho de la cara
 * @param {number} repY  repeticiones a lo alto
 * @returns {THREE.CanvasTexture}
 */
const texturaPerforada = (repX, repY) => {
  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = 32;
  const g = /** @type {CanvasRenderingContext2D} */ (lienzo.getContext('2d'));
  g.fillStyle = '#b9c0c6';
  g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#2f353b';
  g.beginPath();
  g.arc(16, 16, 9, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(lienzo);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repX, repY);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/**
 * Materiales de la batea según las opciones de la línea (material, color, tina, bandeja).
 * @param {Record<string, unknown>} linea  opciones generales de la línea
 * @returns {MaterialesBatea}
 */
export const useMateriales = (linea) => {
  const invalidate = useThree((s) => s.invalidate);

  const base = useMemo(() => ({
    pintura: estandar('pintura', { color: '#ffffff', metalness: 0.1, roughness: 0.5 }),
    // Metales con metalness moderado: el entorno es simple y con valores altos se ven oscuros
    inox: estandar('inox', { color: COLOR_INOX, metalness: 0.6, roughness: 0.3 }),
    galvanizado: estandar('galvanizado', { color: COLOR_GALVANIZADO, metalness: 0.35, roughness: 0.45 }),
    chapaBlanca: estandar('chapaBlanca', { color: COLOR_CHAPA_BLANCA, metalness: 0.05, roughness: 0.45 }),
    rejilla: estandar('rejilla', { color: COLOR_REJILLA, metalness: 0.1, roughness: 0.5 }),
    bandeja: estandar('bandeja', { color: COLOR_BANDEJA_PREPINTADA, metalness: 0.1, roughness: 0.45 }),
    oscuro: estandar('oscuro', { color: COLOR_OSCURO, metalness: 0.2, roughness: 0.7 }),
    aluminio: estandar('aluminio', { color: COLOR_ALUMINIO, metalness: 0.5, roughness: 0.35 }),
    vidrio: Object.assign(
      new THREE.MeshPhysicalMaterial({
        color: '#cfeef0', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.32,
        depthWrite: false, side: THREE.DoubleSide,
      }),
      { name: 'vidrio' }
    ),
    led: estandar('led', { color: '#ffffff', emissive: '#f2f7ff', emissiveIntensity: 4, toneMapped: false }),
    acrilico: estandar('acrilico', {
      color: '#eef6f8', metalness: 0, roughness: 0.4, transparent: true, opacity: 0.45,
      depthWrite: false, side: THREE.DoubleSide,
    }),
    // PROVISORIO: repeticiones pensadas para la pared del costado del equipo (~0,92 m de fondo × 0,23 m de alto)
    rejillaVentilacion: estandar('rejillaVentilacion', { map: texturaPerforada(77, 20), metalness: 0.4, roughness: 0.5 }),
  }), []);

  // Liberar la memoria de GPU al desmontar
  useEffect(() => () => {
    base.rejillaVentilacion.map?.dispose();
    Object.values(base).forEach((m) => m.dispose());
  }, [base]);

  // Recolorear en vivo: color de la pintura y material de las bandejas
  const hexPintura = paletaDeColor(catalogo, linea.material)?.colores.find((c) => c.id === linea.color)?.hex;
  const bandejaInox = linea.bandeja === 'inox';
  useEffect(() => {
    if (hexPintura) base.pintura.color.set(hexPintura);
    base.bandeja.color.set(bandejaInox ? COLOR_INOX : COLOR_BANDEJA_PREPINTADA);
    base.bandeja.metalness = bandejaInox ? 0.6 : 0.1;
    base.bandeja.roughness = bandejaInox ? 0.28 : 0.45;
    invalidate();
  }, [base, hexPintura, bandejaInox, invalidate]);

  const esInox = linea.material === 'inox';
  // El color va en el faldón, en el zócalo o en los dos (zonaColor); la parte sin color queda de chapa blanca
  const conColor = (/** @type {'faldon' | 'zocalo'} */ parte) =>
    linea.zonaColor === 'faldon_y_zocalo' || linea.zonaColor === parte ? base.pintura : base.chapaBlanca;
  return {
    ...base,
    faldon: esInox ? base.inox : conColor('faldon'),
    zocalo: esInox ? base.inox : conColor('zocalo'),
    // Con cuerpo de inox la tina es siempre de acero; con chapa, lo que se eligió
    tina: esInox || linea.tina === 'inox' ? base.inox : base.chapaBlanca,
    // Laterales de cierre: chapa blanca, o todo de acero con cuerpo de inox (no dependen de la tina)
    lateral: esInox ? base.inox : base.chapaBlanca,
  };
};
