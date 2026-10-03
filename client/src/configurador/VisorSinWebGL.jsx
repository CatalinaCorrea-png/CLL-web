// Visor sin 3D (prompt 7): si el navegador no tiene WebGL, en el lugar de la escena se muestran
// imágenes de referencia de cada tipo de módulo de la línea. El panel, el link y el pedido de
// presupuesto siguen funcionando igual (no dependen del 3D).
import { useMemo } from 'react';
import { imagenesDeLinea } from './imagenesRespaldo.js';

/**
 * @param {object} props
 * @param {import('./modelo/reglas.js').ConfigParcial} props.config
 */
const VisorSinWebGL = ({ config }) => {
  const imagenes = useMemo(() => imagenesDeLinea(config), [config]);
  return (
    <div className="cfg-sin3d">
      <p className="cfg-sin3d-aviso">
        <i className="fa-solid fa-circle-info"></i> Tu navegador no puede mostrar el 3D. Estas son imágenes de
        referencia de lo que elegiste; la configuración y el link funcionan igual.
      </p>
      <div className="cfg-sin3d-grilla">
        {imagenes.map(({ clave, src, texto }) => (
          <figure key={clave} className="cfg-sin3d-figura">
            <img src={src} alt={texto} loading="lazy" />
            <figcaption>{texto}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};

export default VisorSinWebGL;
