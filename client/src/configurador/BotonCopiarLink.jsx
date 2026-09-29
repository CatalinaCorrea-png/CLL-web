import { useEffect, useState } from 'react';

/**
 * Copia un texto al portapapeles. Si la API moderna no está disponible (p. ej. al abrir el sitio
 * por http con la IP de la compu, desde el celu), usa un textarea oculto con execCommand.
 * @param {string} texto
 * @returns {Promise<boolean>} true si se pudo copiar
 */
const copiarAlPortapapeles = async (texto) => {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
};

// Copia el link de la configuración actual (la URL ya tiene la configuración serializada).
const BotonCopiarLink = () => {
  const [estado, setEstado] = useState(/** @type {'listo' | 'copiado' | 'error'} */ ('listo'));

  useEffect(() => {
    if (estado === 'listo') return;
    const t = setTimeout(() => setEstado('listo'), 2000);
    return () => clearTimeout(t);
  }, [estado]);

  const copiar = async () => {
    setEstado((await copiarAlPortapapeles(window.location.href)) ? 'copiado' : 'error');
  };

  return (
    <button type="button" className="btn-ice ghost cfg-accion" onClick={copiar} aria-live="polite">
      {estado === 'copiado' && <><i className="fa-solid fa-check"></i> ¡Link copiado!</>}
      {estado === 'error' && <><i className="fa-solid fa-triangle-exclamation"></i> No se pudo copiar</>}
      {estado === 'listo' && <><i className="fa-solid fa-link"></i> Copiar link</>}
    </button>
  );
};

export default BotonCopiarLink;
