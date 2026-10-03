// Pedir presupuesto (prompt 10): resumen de la línea con la captura del 3D, formulario corto,
// envío a POST /presupuestos y pantalla de éxito con "Continuar por WhatsApp".
// Funciona igual sin WebGL: en ese caso no hay captura (el backend la acepta opcional).
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import catalogo from './modelo/catalogo.json';
import { frasesConfiguracion } from './modelo/textos.js';
import { blobADataUrl } from './captura.js';
import { TELEFONOS, linkWhatsApp } from '../constants';

/** @typedef {import('./modelo/reglas.js').ConfigParcial} ConfigParcial */

const API = import.meta.env.VITE_API_URL;
// PROVISORIO: número de WhatsApp para pedidos (lo confirma CLL). Hoy, el primero de los teléfonos del sitio.
const TELEFONO_PEDIDOS = TELEFONOS[0].tel;

const PLAZOS = ['Lo antes posible', 'En el próximo mes', 'En 1 a 3 meses', 'En más de 3 meses', 'Todavía no lo sé'];

const CAMPOS_VACIOS = {
  nombre: '', empresa: '', email: '', telefono: '', localidad: '', plazo: '', cuit: '', medidasEspeciales: '',
};

/**
 * @typedef {{ ref: string, repetido?: boolean, colorDistinto?: boolean, message?: string }} Resultado
 */

/**
 * Mensaje de WhatsApp: el mismo resumen que se ve en el formulario, un renglón por módulo.
 * @param {ReturnType<typeof frasesConfiguracion>} frases
 * @param {string} [ref]  referencia, si el pedido ya se envió
 */
const mensajeWhatsApp = (frases, ref) => [
  ref ? `Hola, pedí presupuesto ${ref} desde el configurador:` : 'Hola, quiero pedir presupuesto desde el configurador:',
  ...frases.modulos.map((m) => `• ${m.nombre}: ${m.texto}`),
  `• Opciones generales: ${frases.linea}`,
].join('\n');

/**
 * @param {object} props
 * @param {boolean} props.mostrar
 * @param {() => void} props.onCerrar
 * @param {ConfigParcial} props.config
 * @param {(() => Promise<Blob | null>) | null} props.capturar  null sin 3D (modo sin WebGL)
 */
const PedirPresupuesto = ({ mostrar, onCerrar, config, capturar }) => {
  const [campos, setCampos] = useState(CAMPOS_VACIOS);
  const [sitioWeb, setSitioWeb] = useState(''); // honeypot: una persona no lo ve ni lo completa
  const [validado, setValidado] = useState(false);
  const [estado, setEstado] = useState(/** @type {'editando' | 'enviando' | 'listo'} */ ('editando'));
  const [error, setError] = useState(/** @type {{ mensaje: string, red?: boolean } | null} */ (null));
  const [erroresCampo, setErroresCampo] = useState(/** @type {Record<string, string>} */ ({}));
  const [resultado, setResultado] = useState(/** @type {Resultado | null} */ (null));
  const [captura, setCaptura] = useState(/** @type {{ blob: Blob, url: string } | null} */ (null));
  const [capturando, setCapturando] = useState(false);
  const apertura = useRef(0);

  const frases = useMemo(() => frasesConfiguracion(config, catalogo), [config]);

  // Al abrir: se toma el tiempo (antispam) y se saca la captura del 3D en la vista de perspectiva
  useEffect(() => {
    if (!mostrar) return;
    apertura.current = Date.now();
    if (!capturar || estado === 'listo') return;
    let vigente = true;
    setCapturando(true);
    capturar()
      .catch(() => null) // sin captura, el pedido se manda igual
      .then((blob) => {
        if (!vigente) return;
        setCaptura(blob ? { blob, url: URL.createObjectURL(blob) } : null);
        setCapturando(false);
      });
    return () => {
      vigente = false;
    };
  }, [mostrar]); // eslint-disable-line react-hooks/exhaustive-deps -- solo al abrir

  // La URL de la miniatura se libera cuando se reemplaza la captura o se desmonta el modal
  useEffect(() => () => {
    if (captura) URL.revokeObjectURL(captura.url);
  }, [captura]);

  /** @param {keyof typeof CAMPOS_VACIOS} campo */
  const cambiar = (campo) => (/** @type {import('react').ChangeEvent<any>} */ e) => {
    setCampos((c) => ({ ...c, [campo]: e.target.value }));
    setErroresCampo((er) => ({ ...er, [campo]: '' }));
  };

  /** Después de un envío exitoso, al cerrar se limpia todo para un pedido nuevo. */
  const cerrar = () => {
    onCerrar();
    if (estado === 'listo') {
      setCampos(CAMPOS_VACIOS);
      setValidado(false);
      setResultado(null);
      setEstado('editando');
    }
  };

  /** @param {import('react').FormEvent<HTMLFormElement>} e */
  const enviar = async (e) => {
    e.preventDefault();
    setValidado(true);
    setError(null);
    if (!e.currentTarget.checkValidity()) return;

    setEstado('enviando');
    try {
      const { data } = await axios.post(`${API}/presupuestos`, {
        config,
        versionCatalogo: catalogo.version,
        contacto: campos,
        snapshot: captura ? await blobADataUrl(captura.blob) : null,
        sitioWeb,
        tiempoFormulario: Date.now() - apertura.current,
      });
      setResultado(data);
      setEstado('listo');
    } catch (err) {
      const respuesta = axios.isAxiosError(err) ? err.response : undefined;
      if (!respuesta) {
        setError({ mensaje: 'No pudimos enviar tu pedido: revisá tu conexión y probá de nuevo.', red: true });
      } else {
        /** @type {Record<string, string>} */
        const porCampo = {};
        for (const { campo, mensaje } of respuesta.data?.errores ?? []) {
          if (String(campo).startsWith('contacto.')) porCampo[String(campo).slice(9)] = mensaje;
        }
        setErroresCampo(porCampo);
        const detalle = (respuesta.data?.errores ?? []).find((/** @type {{ campo: string }} */ x) => !x.campo.startsWith('contacto.'));
        setError({ mensaje: detalle?.mensaje ?? respuesta.data?.message ?? 'No pudimos enviar tu pedido. Probá de nuevo en unos minutos.' });
      }
      setEstado('editando');
    }
  };

  const linkWhats = linkWhatsApp(TELEFONO_PEDIDOS, mensajeWhatsApp(frases, resultado?.ref));
  const enviando = estado === 'enviando';

  /**
   * Campo de texto del formulario.
   * @param {keyof typeof CAMPOS_VACIOS} campo
   * @param {string} etiqueta
   * @param {Record<string, unknown>} [extra]  props del input (type, autoComplete, …)
   */
  const campo = (campo, etiqueta, extra = {}) => (
    <Form.Group className="cfg-campo" controlId={`presupuesto-${campo}`}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Control
        value={campos[campo]}
        onChange={cambiar(campo)}
        isInvalid={Boolean(erroresCampo[campo])}
        disabled={enviando}
        {...extra}
      />
      <Form.Control.Feedback type="invalid">{erroresCampo[campo] || 'Completá este dato.'}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <Modal show={mostrar} onHide={cerrar} size="lg" centered scrollable className="cfg-presupuesto">
      <Modal.Header closeButton>
        <Modal.Title>{estado === 'listo' ? '¡Pedido enviado!' : 'Pedir presupuesto'}</Modal.Title>
      </Modal.Header>

      {estado === 'listo' && resultado ? (
        <Modal.Body className="cfg-presupuesto-exito">
          <p className="cfg-presupuesto-ref-etiqueta">Tu referencia</p>
          <p className="cfg-presupuesto-ref">{resultado.ref}</p>
          {resultado.repetido ? (
            <Alert variant={resultado.colorDistinto ? 'warning' : 'info'} className="text-start">{resultado.message}</Alert>
          ) : (
            <p>
              Te mandamos un mail a <strong>{campos.email}</strong> con el resumen. Si no lo ves, revisá la carpeta de spam.
            </p>
          )}
          <p className="text-muted small">Si querés, seguí la conversación por WhatsApp con tu referencia y el resumen ya escritos.</p>
          <a className="btn-ice cfg-boton-whatsapp" href={linkWhats} target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-whatsapp"></i> Continuar por WhatsApp
          </a>
        </Modal.Body>
      ) : (
        <Form noValidate validated={validado} onSubmit={enviar} className="cfg-presupuesto-form">
          <Modal.Body>
            {/* ---- Resumen ---- */}
            <section className="cfg-resumen">
              <div className="cfg-resumen-imagen">
                {capturando ? (
                  <span className="cfg-resumen-sin-imagen"><Spinner animation="border" size="sm" /> Preparando la imagen…</span>
                ) : captura ? (
                  <img src={captura.url} alt="Vista 3D de la línea configurada" />
                ) : (
                  <span className="cfg-resumen-sin-imagen">
                    {capturar ? 'No pudimos sacar la imagen del 3D; el pedido se envía igual.' : 'Sin imagen: tu navegador no muestra el 3D.'}
                  </span>
                )}
              </div>
              <div className="cfg-resumen-texto">
                <h3 className="cfg-resumen-titulo">Tu equipo</h3>
                <ul>
                  {frases.modulos.map((m) => (
                    <li key={m.nombre}><strong>{m.nombre}:</strong> {m.texto}</li>
                  ))}
                  <li><strong>Opciones generales:</strong> {frases.linea}</li>
                </ul>
              </div>
            </section>

            {/* ---- Formulario ---- */}
            <h3 className="cfg-resumen-titulo">Tus datos</h3>
            <div className="cfg-campos">
              {campo('nombre', 'Nombre', { required: true, maxLength: 120, autoComplete: 'name' })}
              {campo('empresa', 'Empresa o comercio', { required: true, maxLength: 120, autoComplete: 'organization' })}
              {campo('email', 'Email', { required: true, type: 'email', maxLength: 160, autoComplete: 'email' })}
              {campo('telefono', 'Teléfono', { required: true, type: 'tel', minLength: 6, maxLength: 40, pattern: '[0-9+()\\-\\s]+', autoComplete: 'tel' })}
              {campo('localidad', 'Localidad de instalación', { required: true, maxLength: 120, autoComplete: 'address-level2' })}
              <Form.Group className="cfg-campo" controlId="presupuesto-plazo">
                <Form.Label>Plazo</Form.Label>
                <Form.Select value={campos.plazo} onChange={cambiar('plazo')} required disabled={enviando} isInvalid={Boolean(erroresCampo.plazo)}>
                  <option value="">Elegí una opción</option>
                  {PLAZOS.map((p) => <option key={p}>{p}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{erroresCampo.plazo || 'Elegí un plazo.'}</Form.Control.Feedback>
              </Form.Group>
              {campo('cuit', 'CUIT (opcional)', { maxLength: 20, inputMode: 'numeric', pattern: '\\d{2}-?\\d{8}-?\\d', placeholder: '20-12345678-9' })}
            </div>
            <Form.Group className="cfg-campo" controlId="presupuesto-medidas">
              <Form.Label>Medidas especiales o algo que no pudiste simular (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={2000}
                value={campos.medidasEspeciales}
                onChange={cambiar('medidasEspeciales')}
                disabled={enviando}
                placeholder="Por ejemplo: un largo a medida, un ángulo distinto de 90°, otro color…"
              />
            </Form.Group>

            {/* Honeypot: fuera de la pantalla, sin tab ni autocompletar. Si llega con algo, es un bot. */}
            <div className="cfg-trampa" aria-hidden="true">
              <label htmlFor="presupuesto-sitio">Sitio web (no completar)</label>
              <input id="presupuesto-sitio" name="sitioWeb" type="text" tabIndex={-1} autoComplete="off" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} />
            </div>

            {error && (
              <Alert variant="danger" className="mt-3 mb-0">
                {error.mensaje}
                {error.red && (
                  <> También podés <a href={linkWhats} target="_blank" rel="noopener noreferrer">escribirnos por WhatsApp</a>.</>
                )}
              </Alert>
            )}
            <p className="cfg-presupuesto-nota">
              Es una consulta, no una compra: el equipo de CLL revisa tu pedido y te responde con el presupuesto.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="cfg-boton" onClick={cerrar} disabled={enviando}>Volver al configurador</button>
            <button type="submit" className="btn-ice" disabled={enviando || capturando}>
              {enviando ? <><Spinner animation="border" size="sm" /> Enviando…</> : 'Enviar pedido'}
            </button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  );
};

export default PedirPresupuesto;
