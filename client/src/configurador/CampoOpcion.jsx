import Form from 'react-bootstrap/Form';
import ConMotivo from './ConMotivo';
import { textoValor } from './modelo/textos.js';

// Hasta este largo de etiqueta, los valores se muestran como botones; si alguna es más larga, como radios.
const LARGO_MAX_BOTON = 10;

/**
 * Opción del catálogo con lo que necesita la interfaz.
 * @typedef {object} OpcionUI
 * @property {string} id
 * @property {string} nombre
 * @property {string} tipo                        'select' | 'bool' | 'color'
 * @property {Array<string | number>} [valores]
 * @property {string} [unidad]
 * @property {Record<string, string>} [etiquetas]
 * @property {Record<string, string>} [ayudas]    ayuda de cada valor
 * @property {string} [ayuda]                     ayuda general de la opción
 * @property {boolean} [ocultarSiNoAplica]        si está deshabilitada no se muestra (p. ej. la estructura)
 */

/** @typedef {{ default: string, colores: Array<{ id: string, nombre: string, hex: string }> }} Paleta */

/**
 * Control de una opción, generado según su tipo en el catálogo. Si está deshabilitada,
 * se muestra igual (no se oculta), sin valor elegido y con el motivo en un tooltip.
 * @param {object} props
 * @param {OpcionUI} props.opcion
 * @param {unknown} props.valor
 * @param {(valor: unknown) => void} props.onCambio
 * @param {string} [props.motivo]         motivo si está deshabilitada
 * @param {Paleta | null} [props.paleta]  solo para tipo 'color'
 * @param {string} props.idBase           prefijo único para los ids de los inputs
 */
const CampoOpcion = ({ opcion, valor, onCambio, motivo, paleta, idBase }) => {
  const deshabilitada = Boolean(motivo);
  const id = `${idBase}-${opcion.id}`;
  const ayuda = deshabilitada ? undefined : (opcion.ayudas?.[String(valor)] ?? opcion.ayuda);

  let control;
  if (opcion.tipo === 'bool') {
    control = (
      <Form.Check
        type="switch"
        id={id}
        label={opcion.nombre}
        checked={valor === true}
        disabled={deshabilitada}
        onChange={(e) => onCambio(e.target.checked)}
      />
    );
  } else if (opcion.tipo === 'color') {
    control = <MuestrasColor paleta={paleta ?? null} valor={valor} onCambio={onCambio} deshabilitada={deshabilitada} />;
  } else {
    const valores = opcion.valores ?? [];
    const cortas = valores.every((v) => textoValor(opcion, v).length <= LARGO_MAX_BOTON);
    control = cortas ? (
      <div className="cfg-botones" role="radiogroup" aria-label={opcion.nombre}>
        {valores.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={v === valor}
            className={`cfg-boton ${v === valor ? 'activo' : ''}`}
            disabled={deshabilitada}
            onClick={() => onCambio(v)}
          >
            {textoValor(opcion, v)}
          </button>
        ))}
      </div>
    ) : (
      <div role="radiogroup" aria-label={opcion.nombre}>
        {valores.map((v) => (
          <Form.Check
            key={v}
            type="radio"
            id={`${id}-${v}`}
            name={id}
            label={textoValor(opcion, v)}
            checked={v === valor}
            disabled={deshabilitada}
            onChange={() => onCambio(v)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`cfg-campo ${deshabilitada ? 'deshabilitada' : ''}`}>
      {opcion.tipo !== 'bool' && <div className="cfg-campo-nombre">{opcion.nombre}</div>}
      <ConMotivo motivo={motivo} id={`${id}-motivo`} bloque>
        {control}
      </ConMotivo>
      {ayuda && <small className="cfg-campo-ayuda">{ayuda}</small>}
    </div>
  );
};

/**
 * Muestras de color de la paleta del material. Sin paleta (inox), una muestra de acero deshabilitada.
 * @param {object} props
 * @param {Paleta | null} props.paleta
 * @param {unknown} props.valor
 * @param {(valor: unknown) => void} props.onCambio
 * @param {boolean} props.deshabilitada
 */
const MuestrasColor = ({ paleta, valor, onCambio, deshabilitada }) => {
  if (!paleta) {
    return (
      <div className="cfg-colores">
        <button type="button" className="cfg-color cfg-color-inox" disabled aria-label="Acero inoxidable, sin pintura" />
        <small className="cfg-color-nombre">Acero inoxidable, sin pintura</small>
      </div>
    );
  }
  const elegido = paleta.colores.find((c) => c.id === valor);
  return (
    <div>
      <div className="cfg-colores" role="radiogroup" aria-label="Color">
        {paleta.colores.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === valor}
            aria-label={c.nombre}
            title={c.nombre}
            className={`cfg-color ${c.id === valor ? 'activo' : ''}`}
            style={/** @type {import('react').CSSProperties} */ ({ '--cfg-color': c.hex })}
            disabled={deshabilitada}
            onClick={() => onCambio(c.id)}
          />
        ))}
      </div>
      {elegido && <small className="cfg-color-nombre">{elegido.nombre}</small>}
    </div>
  );
};

export default CampoOpcion;
