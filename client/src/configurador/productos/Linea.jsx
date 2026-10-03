// Línea completa (prompt 6b): recorre los módulos y los ubica uno después del otro.
//   remate – batea – [unión – batea]… – remate, donde la unión es una esquina, un mostrador intermedio
//   o una unión directa (las bateas quedan pegadas).
// Cada esquina gira el recorrido 90°: el esquinero hacia el vendedor y el rinconero hacia el cliente.
//
// El recorrido arranca en el origen hacia +X, con el cliente en +Z. Cada módulo se dibuja en su marco
// local (largo en X, cliente en +Z) dentro de un <group> con su posición y su giro en Y.
import { useMemo } from 'react';
import { MEDIDAS } from './medidas.js';
import { useMateriales } from './materiales.js';
import Batea from './Batea';
import Esquina from './Esquina';
import Mostrador from './Mostrador';

const D = MEDIDAS.profundidad;

/**
 * Pieza ubicada en el mundo.
 * @typedef {object} Ubicacion
 * @property {number} indice                 posición del módulo en config.modulos
 * @property {Record<string, unknown>} modulo
 * @property {[number, number, number]} posicion
 * @property {number} giro                   rotación en Y (radianes)
 * @property {'batea' | 'esquina' | 'mostrador'} pieza
 * @property {number} [largo]                en metros (bateas y mostradores)
 */

/**
 * ¿La batea queda cerrada de ese lado? Abre si sigue en una esquina con frío o en otra batea pegada.
 * @param {Record<string, unknown> | undefined} vecino
 */
const cierraContra = (vecino) =>
  !(vecino && (vecino.tipo === 'union' || (vecino.tipo === 'esquina' && vecino.version === 'frio')));

/**
 * En una unión directa, ¿hace falta vidrio lateral en la junta? Solo si las dos bateas pegadas tienen
 * distinta parte de arriba (si son iguales, la cúpula, los arcos o el marco siguen de corrido).
 * @param {Record<string, unknown> | undefined} vecino  el módulo de al lado (la unión)
 * @param {Record<string, unknown>} batea
 * @param {Record<string, unknown> | undefined} otra    la batea del otro lado de la unión
 */
const vidrioContra = (vecino, batea, otra) => {
  if (cierraContra(vecino)) return true;
  if (vecino?.tipo !== 'union' || !otra) return false;
  return otra.cupula !== batea.cupula || (batea.cupula === 'sin_cupula_iluminacion' && otra.estructura !== batea.estructura);
};

/**
 * Calcula dónde va cada pieza de la línea.
 * @param {Array<Record<string, unknown>>} modulos
 * @returns {Ubicacion[]}
 */
const ubicarLinea = (modulos) => {
  /** @type {Ubicacion[]} */
  const piezas = [];
  let x = 0, z = 0, giro = 0;
  // Punto del marco actual (local lx a lo largo, lz hacia el cliente) en el mundo
  const enMundo = (/** @type {number} */ lx, /** @type {number} */ lz) =>
    /** @type {[number, number]} */ ([x + lx * Math.cos(giro) + lz * Math.sin(giro), z - lx * Math.sin(giro) + lz * Math.cos(giro)]);

  modulos.forEach((modulo, indice) => {
    if (modulo.tipo === 'remate') {
      if (modulo.valor !== 'mostrador') return;
      // El remate izquierdo va antes del arranque; el derecho, a continuación
      const [px, pz] = enMundo(indice === 0 ? -D / 2 : D / 2, 0);
      piezas.push({ indice, modulo, posicion: [px, 0, pz], giro, pieza: 'mostrador', largo: D });
    } else if (modulo.tipo === 'batea' || modulo.tipo === 'mostrador') {
      const largo = Number(modulo.largo) / 1000;
      const [px, pz] = enMundo(largo / 2, 0);
      piezas.push({ indice, modulo, posicion: [px, 0, pz], giro, pieza: modulo.tipo, largo });
      [x, z] = enMundo(largo, 0);
    } else if (modulo.tipo === 'esquina') {
      piezas.push({ indice, modulo, posicion: [x, 0, z], giro, pieza: 'esquina' });
      // Sale por el costado del cuadrado: esquinero hacia el vendedor (−Z local), rinconero hacia el cliente
      const rinconero = modulo.forma === 'rinconero';
      [x, z] = enMundo(D / 2, rinconero ? D / 2 : -D / 2);
      giro += rinconero ? -Math.PI / 2 : Math.PI / 2;
    }
    // union: las bateas quedan pegadas, no hay pieza ni avance
  });
  return piezas;
};

/**
 * Línea completa de bateas, uniones y remates.
 * @param {object} props
 * @param {Record<string, unknown>} props.linea                 opciones generales
 * @param {Array<Record<string, unknown>>} props.modulos       config.modulos
 */
const Linea = ({ linea, modulos }) => {
  const materiales = useMateriales(linea); // una sola vez para toda la línea
  const piezas = useMemo(() => ubicarLinea(modulos), [modulos]);

  return (
    <group>
      {piezas.map(({ indice, modulo, posicion, giro, pieza, largo = 0 }) => (
        <group key={indice} position={posicion} rotation={[0, giro, 0]}>
          {pieza === 'batea' && (
            <Batea
              batea={modulo}
              linea={linea}
              materiales={materiales}
              cerradoIzq={cierraContra(modulos[indice - 1])}
              cerradoDer={cierraContra(modulos[indice + 1])}
              vidrioIzq={vidrioContra(modulos[indice - 1], modulo, modulos[indice - 2])}
              vidrioDer={vidrioContra(modulos[indice + 1], modulo, modulos[indice + 2])}
            />
          )}
          {pieza === 'mostrador' && <Mostrador largo={largo} materiales={materiales} />}
          {pieza === 'esquina' && <Esquina esquina={modulo} linea={linea} materiales={materiales} />}
        </group>
      ))}
    </group>
  );
};

export default Linea;
