// Línea completa (prompt 6b): recorre los módulos y los ubica uno después del otro.
//   remate – batea – [unión – batea]… – remate, donde la unión es una esquina, un mostrador intermedio
//   o una unión directa (las bateas quedan pegadas).
// Dónde va cada pieza lo calcula recorrido.js; acá cada módulo se dibuja en su marco local dentro de
// un <group> con su posición y su giro en Y.
import { useMemo } from 'react';
import { useMateriales } from './materiales.js';
import { recorrerLinea } from './recorrido.js';
import Batea from './Batea';
import Esquina from './Esquina';
import Mostrador from './Mostrador';

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
 * Línea completa de bateas, uniones y remates.
 * @param {object} props
 * @param {Record<string, unknown>} props.linea                 opciones generales
 * @param {Array<Record<string, unknown>>} props.modulos       config.modulos
 */
const Linea = ({ linea, modulos }) => {
  const materiales = useMateriales(linea); // una sola vez para toda la línea
  const piezas = useMemo(() => recorrerLinea(modulos).piezas, [modulos]);

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
