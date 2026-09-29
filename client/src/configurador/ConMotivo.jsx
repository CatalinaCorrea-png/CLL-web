import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

/**
 * Envuelve un control deshabilitado y muestra el motivo en un tooltip.
 * Los elementos deshabilitados no disparan eventos del mouse, por eso el tooltip va en un <span>
 * que puede recibir foco: en el celular aparece al tocarlo.
 * Si no hay motivo, devuelve el control tal cual.
 * @param {object} props
 * @param {string} [props.motivo]
 * @param {string} props.id           id del tooltip (único en la página)
 * @param {boolean} [props.bloque]    true si el control ocupa todo el ancho
 * @param {import('react').ReactNode} props.children
 */
const ConMotivo = ({ motivo, id, bloque = false, children }) => {
  if (!motivo) return children;
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{motivo}</Tooltip>}>
      <span className={`cfg-con-motivo ${bloque ? 'd-block' : 'd-inline-block'}`} tabIndex={0} aria-label={motivo}>
        {children}
      </span>
    </OverlayTrigger>
  );
};

export default ConMotivo;
