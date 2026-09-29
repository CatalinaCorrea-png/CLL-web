import { useState } from 'react';
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

  if (!config) return null;
  // Por ahora la escena muestra una caja con el largo de la primera batea (la batea real llega en el Prompt 6).
  const primeraBatea = config.modulos.find((m) => m.tipo === 'batea');
  const largo = Number(primeraBatea?.largo ?? 2000);

  return (
    <div className="cfg-configurador">
      <p className="callout cfg-aviso">
        <i className="fa-solid fa-circle-info"></i>
        <span>{AVISO}</span>
      </p>

      <div className="cfg-barra">
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
          <Escena largo={largo} />
        </div>
      </div>
    </div>
  );
};

export default Configurador;
