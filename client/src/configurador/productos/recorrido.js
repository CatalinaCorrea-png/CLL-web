// Recorrido de la línea (prompt 6b; cotas del prompt 7): dónde va cada pieza, los tramos rectos (alas)
// entre esquinas y el alto. JS puro: lo usan Linea.jsx (para ubicar las piezas) y Cotas.jsx.
//
// El recorrido arranca en el origen hacia +X, con el cliente en +Z. Cada módulo se dibuja en su marco
// local (largo en X, cliente en +Z) con su posición y su giro en Y. Cada esquina gira el recorrido 90°:
// el esquinero hacia el vendedor y el rinconero hacia el cliente.
import { MEDIDAS } from './medidas.js';
import { ALTO_LATERAL } from './geometria.js';

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
 * Tramo recto de la línea entre esquinas. En su marco local (origen y giro), el frente del cliente
 * va de x = desde a x = hasta (en metros), sobre z = +profundidad/2.
 * @typedef {object} Ala
 * @property {[number, number, number]} origen
 * @property {number} giro
 * @property {number} desde
 * @property {number} hasta
 * @property {number} modulos  cuántas piezas con largo tiene (bateas, mostradores y remates)
 * @property {boolean} esquina si un esquinero le suma su cuadrado (en alguna de sus puntas)
 */

/**
 * @typedef {object} Recorrido
 * @property {Ubicacion[]} piezas
 * @property {Ala[]} alas
 * @property {number} alto  alto máximo de la línea (m)
 */

/**
 * Alto de un módulo: con cúpula o iluminación llega al tope; sin cúpula, al borde del lateral;
 * los mostradores, a la mesada.
 * @param {Record<string, unknown>} modulo
 */
const altoDe = (modulo) => {
  const conFrio = modulo.tipo === 'batea' || (modulo.tipo === 'esquina' && modulo.version === 'frio');
  if (!conFrio) return MEDIDAS.altoMesada;
  return modulo.cupula === 'sin_cupula' ? ALTO_LATERAL : MEDIDAS.altoTotal;
};

/**
 * Calcula dónde va cada pieza de la línea, sus alas y su alto.
 * @param {Array<Record<string, unknown>>} modulos
 * @returns {Recorrido}
 */
export const recorrerLinea = (modulos) => {
  /** @type {Ubicacion[]} */
  const piezas = [];
  /** @type {Ala[]} */
  const alas = [];
  let x = 0, z = 0, giro = 0;
  // Ala en curso: arranca en el cursor; s = cuánto avanzó el cursor sobre ella
  /** @type {Ala} */
  let ala = { origen: [0, 0, 0], giro: 0, desde: 0, hasta: 0, modulos: 0, esquina: false };
  let s = 0;
  let alto = 0;
  // Punto del marco actual (local lx a lo largo, lz hacia el cliente) en el mundo
  const enMundo = (/** @type {number} */ lx, /** @type {number} */ lz) =>
    /** @type {[number, number]} */ ([x + lx * Math.cos(giro) + lz * Math.sin(giro), z - lx * Math.sin(giro) + lz * Math.cos(giro)]);

  modulos.forEach((modulo, indice) => {
    if (modulo.tipo !== 'union' && modulo.tipo !== 'remate') alto = Math.max(alto, altoDe(modulo));
    if (modulo.tipo === 'remate') {
      if (modulo.valor !== 'mostrador') return;
      alto = Math.max(alto, MEDIDAS.altoMesada);
      // El remate izquierdo va antes del arranque; el derecho, a continuación
      const izquierdo = indice === 0;
      const [px, pz] = enMundo(izquierdo ? -D / 2 : D / 2, 0);
      piezas.push({ indice, modulo, posicion: [px, 0, pz], giro, pieza: 'mostrador', largo: D });
      if (izquierdo) ala.desde = -D;
      else ala.hasta = s + D;
      ala.modulos++;
    } else if (modulo.tipo === 'batea' || modulo.tipo === 'mostrador') {
      const largo = Number(modulo.largo) / 1000;
      const [px, pz] = enMundo(largo / 2, 0);
      piezas.push({ indice, modulo, posicion: [px, 0, pz], giro, pieza: modulo.tipo, largo });
      [x, z] = enMundo(largo, 0);
      s += largo;
      ala.hasta = s;
      ala.modulos++;
    } else if (modulo.tipo === 'esquina') {
      piezas.push({ indice, modulo, posicion: [x, 0, z], giro, pieza: 'esquina' });
      const rinconero = modulo.forma === 'rinconero';
      // El esquinero tiene el frente por fuera: el cuadrado de la esquina suma a las dos alas que toca.
      // El rinconero tiene el frente en el rincón: no suma a ninguna.
      if (!rinconero) {
        ala.hasta = s + D;
        ala.esquina = true;
      }
      alas.push(ala);
      // Sale por el costado del cuadrado: esquinero hacia el vendedor (−Z local), rinconero hacia el cliente
      [x, z] = enMundo(D / 2, rinconero ? D / 2 : -D / 2);
      giro += rinconero ? -Math.PI / 2 : Math.PI / 2;
      ala = { origen: [x, 0, z], giro, desde: rinconero ? 0 : -D, hasta: 0, modulos: 0, esquina: !rinconero };
      s = 0;
    }
    // union: las bateas quedan pegadas, no hay pieza ni avance
  });
  alas.push(ala);
  return { piezas, alas, alto };
};
