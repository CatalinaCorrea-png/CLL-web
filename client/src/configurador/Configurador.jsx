import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Escena from './Escena';
import PanelOpciones from './PanelOpciones';
import BotonCopiarLink from './BotonCopiarLink';
import SelectorProducto from './SelectorProducto';
import { useUrlConfig } from './useUrlConfig';
import { useConfigurador } from './store.js';
import './configurador.css';

const AVISO =
  'Este planificador es una simulación para que te hagas una idea de tu equipo. Cuando nos mandes tu configuración, ' +
  'el equipo de CLL te va a asesorar para definir cada detalle: medidas especiales, instalación y lo que necesites.';

// Botones de vista sobre el 3D (el Prompt 7 suma frente, costado, perspectiva y arriba).
const VISTAS = [
  { lado: 'cliente', texto: 'Cliente' },
  { lado: 'vendedor', texto: 'Vendedor' },
];

// Paso 1: elegir el producto. Si la URL ya trae ?producto=bateas (o una configuración), se abre directo la batea.
const Configurador = () => {
  const [params] = useSearchParams();
  const enBatea = params.get('producto') === 'bateas' || params.has('m');
  return enBatea ? <ConfiguradorBatea /> : <SelectorProducto />;
};

// Paso 2: configurar la línea de bateas.
const ConfiguradorBatea = () => {
  useUrlConfig();
  const config = useConfigurador((s) => s.config);
  const [panelAbierto, setPanelAbierto] = useState(false);
  // Lado desde el que se mira; n sube en cada clic para poder volver a la misma vista
  const [vista, setVista] = useState({ lado: 'cliente', n: 0 });
  const barra = useRef(/** @type {HTMLDivElement | null} */ (null));
  const listo = config !== null;

  // Desde md, al abrir el configurador se lo encuadra: la barra arriba (debajo del navbar) y el panel
  // con el 3D llenando el resto de la pantalla. En mobile no hace falta (el 3D ya queda arriba).
  useEffect(() => {
    if (!listo || !barra.current || !window.matchMedia('(min-width: 768px)').matches) return;
    const alturaNavbar = document.querySelector('.navbar-container')?.getBoundingClientRect().height ?? 80;
    window.scrollTo({ top: barra.current.getBoundingClientRect().top + window.scrollY - alturaNavbar - 12 });
  }, [listo]);

  if (!config) return null;

  return (
    <div className="cfg-configurador">
      <p className="callout cfg-aviso">
        <i className="fa-solid fa-circle-info"></i>
        <span>{AVISO}</span>
      </p>

      <div className="cfg-barra" ref={barra}>
        <Link to="/planificacion" className="cfg-volver">
          <i className="fa-solid fa-arrow-left"></i> Cambiar producto
        </Link>
        <div className="cfg-barra-acciones">
          <button type="button" className="btn-ice cfg-accion d-md-none" onClick={() => setPanelAbierto(true)}>
            <i className="fa-solid fa-sliders"></i> Opciones
          </button>
          <BotonCopiarLink />
        </div>
      </div>

      <div className="cfg-layout">
        <PanelOpciones mostrar={panelAbierto} onCerrar={() => setPanelAbierto(false)} />
        <div className="cfg-visor">
          <Escena vista={vista} config={config} />
          <div className="cfg-vistas" role="group" aria-label="Vista">
            {VISTAS.map(({ lado, texto }) => (
              <button
                key={lado}
                type="button"
                className={`cfg-boton ${vista.lado === lado ? 'activo' : ''}`}
                aria-pressed={vista.lado === lado}
                onClick={() => setVista(({ n }) => ({ lado, n: n + 1 }))}
              >
                {texto}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configurador;
