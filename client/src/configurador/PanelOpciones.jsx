import { useMemo } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import catalogo from './modelo/catalogo.json';
import { opcionesDeshabilitadas, paletaDeColor } from './modelo/reglas.js';
import { puedeAgregarBatea, puedeQuitarBatea } from './modelo/edicion.js';
import { nombreModulo, textoValor } from './modelo/textos.js';
import { useConfigurador } from './store.js';
import CampoOpcion from './CampoOpcion';
import ConMotivo from './ConMotivo';

/** @typedef {import('./CampoOpcion').OpcionUI} OpcionUI */

// El JSON se infiere como una unión de formas distintas por opción: se lo trata con la forma genérica.
const OPCIONES_LINEA = /** @type {OpcionUI[]} */ (/** @type {unknown} */ (catalogo.opcionesLinea));
const OPCIONES_MODULO = /** @type {Record<string, OpcionUI[]>} */ (/** @type {unknown} */ (catalogo.modulos));

/**
 * Detalle corto que se muestra debajo del nombre de cada módulo en la fila de "Tu línea".
 * @param {Record<string, unknown>} modulo
 */
const detalleModulo = (modulo) => {
  const opcion = (/** @type {string} */ id) => OPCIONES_MODULO[String(modulo.tipo)]?.find((o) => o.id === id) ?? { id, nombre: id, tipo: 'select' };
  if (modulo.tipo === 'batea') return textoValor(opcion('largo'), modulo.largo);
  if (modulo.tipo === 'esquina') return textoValor(opcion('forma'), modulo.forma);
  return modulo.valor === 'mostrador' ? 'Mostrador' : '—';
};

/**
 * Panel de opciones, generado a partir del catálogo.
 * Desde md se ve fijo al costado del 3D; en mobile es un Offcanvas que sube desde abajo.
 * @param {object} props
 * @param {boolean} props.mostrar   abierto (solo mobile)
 * @param {() => void} props.onCerrar
 */
const PanelOpciones = ({ mostrar, onCerrar }) => {
  const config = useConfigurador((s) => s.config);
  const seleccionado = useConfigurador((s) => s.seleccionado);
  const seleccionar = useConfigurador((s) => s.seleccionar);
  const setOpcionLinea = useConfigurador((s) => s.setOpcionLinea);
  const setOpcionModulo = useConfigurador((s) => s.setOpcionModulo);
  const agregarBatea = useConfigurador((s) => s.agregarBatea);
  const quitarBatea = useConfigurador((s) => s.quitarBatea);

  const deshabilitadas = useMemo(() => (config ? opcionesDeshabilitadas(config, catalogo) : []), [config]);
  if (!config) return null;

  const motivoLinea = (/** @type {string} */ id) =>
    deshabilitadas.find((d) => d.ambito === 'linea' && d.opcion === id)?.motivo;
  const motivoModulo = (/** @type {number} */ indice, /** @type {string} */ id) =>
    deshabilitadas.find((d) => d.ambito === 'modulo' && d.indice === indice && d.opcion === id)?.motivo;

  const modulo = config.modulos[seleccionado] ?? config.modulos[1];
  const agregar = puedeAgregarBatea(config, catalogo);
  const quitar = puedeQuitarBatea(config, seleccionado);

  return (
    <Offcanvas
      show={mostrar}
      onHide={onCerrar}
      responsive="md"
      placement="bottom"
      backdrop={false}
      scroll
      className="cfg-offcanvas"
      aria-labelledby="cfg-panel-titulo"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="cfg-panel-titulo">Opciones</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="cfg-panel ice-card">
          {/* ------------------------------------------------ Tu línea */}
          <section className="cfg-seccion">
            <h3 className="cfg-seccion-titulo">Tu línea</h3>

            <div className="cfg-modulos" role="tablist" aria-label="Módulos de la línea">
              {config.modulos.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === seleccionado}
                  className={`cfg-modulo cfg-modulo-${m.tipo} ${i === seleccionado ? 'activo' : ''}`}
                  onClick={() => seleccionar(i)}
                >
                  <span className="cfg-modulo-nombre">{nombreModulo(config, i, catalogo)}</span>
                  <span className="cfg-modulo-detalle">{detalleModulo(m)}</span>
                </button>
              ))}
            </div>

            <div className="cfg-acciones">
              <ConMotivo motivo={agregar.motivo} id="cfg-motivo-agregar">
                <button type="button" className="btn-ice ghost cfg-accion" disabled={!agregar.ok} onClick={agregarBatea}>
                  <i className="fa-solid fa-plus"></i> Agregar batea
                </button>
              </ConMotivo>
              <ConMotivo motivo={quitar.motivo} id="cfg-motivo-quitar">
                <button type="button" className="btn-ice ghost cfg-accion" disabled={!quitar.ok} onClick={() => quitarBatea(seleccionado)}>
                  <i className="fa-solid fa-trash-can"></i> Quitar batea
                </button>
              </ConMotivo>
            </div>

            <div className="cfg-editor">
              <h4 className="cfg-editor-titulo">{nombreModulo(config, seleccionado, catalogo)}</h4>
              {(OPCIONES_MODULO[String(modulo.tipo)] ?? []).map((o) => (
                <CampoOpcion
                  key={o.id}
                  idBase={`cfg-m${seleccionado}`}
                  opcion={o}
                  valor={modulo[o.id]}
                  motivo={motivoModulo(seleccionado, o.id)}
                  onCambio={(v) => setOpcionModulo(seleccionado, o.id, v)}
                />
              ))}
            </div>
          </section>

          {/* ------------------------------------------------ Opciones generales */}
          <section className="cfg-seccion">
            <h3 className="cfg-seccion-titulo">Opciones generales</h3>
            <p className="cfg-seccion-nota">Valen para toda la línea.</p>
            {OPCIONES_LINEA.map((o) => (
              <CampoOpcion
                key={o.id}
                idBase="cfg-linea"
                opcion={o}
                valor={config.linea[o.id]}
                motivo={motivoLinea(o.id)}
                paleta={o.tipo === 'color' ? paletaDeColor(catalogo, config.linea.material) : undefined}
                onCambio={(v) => setOpcionLinea(o.id, v)}
              />
            ))}
          </section>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default PanelOpciones;
