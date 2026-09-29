// Sincroniza la configuración del store con la URL (links compartibles).
// - Al montar: lee ?v, ?l y ?m (migra links de versiones anteriores), normaliza y valida;
//   si falla, usa la configuración por defecto.
// - En cada cambio: reescribe la URL con `replace` (sin recargar ni llenar el historial).
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import catalogo from './modelo/catalogo.json';
import { serializar, configDesdeLink } from './modelo/url.js';
import { useConfigurador } from './store.js';

/**
 * Configuración que indica la URL, o la de por defecto si no hay o no es válida.
 * @param {URLSearchParams} params
 */
const configDesdeUrl = (params) =>
  configDesdeLink({ v: params.get('v'), l: params.get('l'), m: params.get('m') }, catalogo).config;

export const useUrlConfig = () => {
  const [params, setParams] = useSearchParams();
  const config = useConfigurador((s) => s.config);
  const cargar = useConfigurador((s) => s.cargar);

  // Al montar, cargar desde la URL. Al desmontar, vaciar el store: si se vuelve a la página
  // con otro link, se tiene que leer ese link y no la configuración anterior.
  useEffect(() => {
    cargar(configDesdeUrl(params));
    return () => cargar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar: después la URL la escribe este hook
  }, []);

  // En cada cambio, escribir la URL (solo si cambió, para no entrar en un bucle con el router).
  useEffect(() => {
    if (!config) return;
    const { v, l, m } = serializar(config, catalogo);
    if (params.get('producto') === 'bateas' && params.get('v') === v && params.get('l') === l && params.get('m') === m) return;
    setParams({ producto: 'bateas', v, l, m }, { replace: true });
  }, [config, params, setParams]);
};
