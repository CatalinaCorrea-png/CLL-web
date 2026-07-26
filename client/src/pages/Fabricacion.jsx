import { useEffect, useState } from 'react';
import '../css/pages/fabricacion.css'
import axios from 'axios';
import DetallesModal from '../components/DetallesModal';
import img from '../assets/logo.png'
import Productos from '../components/Productos';
import OffcanvasFabricacion from '../components/OffcanvasFabricacion';

const categorias = [
  { id: 'murales', label: 'Murales' },
  { id: 'bateas', label: 'Bateas' },
  { id: 'exhibidoras', label: 'Exhibidoras' },
  { id: 'congelados', label: 'Congelados' },
  { id: 'camaras', label: 'Cámaras y WIK' },
  { id: 'usadas', label: 'Usadas' },
];

const Fabricacion = () => {
  const API = import.meta.env.VITE_API_URL;
  /* DETALLES */
  const [murales, setMurales] = useState(null);
  const [bateas, setBateas] = useState(null);
  const [exhibidoras, setExhibidoras] = useState(null);
  const [congelados, setCongelados] = useState(null);
  const [camaras, setCamaras] = useState(null);
  // const [vitrinas, setVitrinas] = useState(null);
  const [usadas, setUsadas] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);

  /* BOOLEANOS DE MODAL */
  const [muralesModal, setMuralesModal] = useState(false);
  const [bateasModal, setBateasModal] = useState(false);
  const [exhibidorasModal, setExhibidorasModal] = useState(false);
  const [congeladosModal, setCongeladosModal] = useState(false);
  const [camarasModal, setCamarasModal] = useState(false);
  // const [vitrinasModal, setVitrinasModal] = useState(false);
  const [usadasModal, setUsadasModal] = useState(false);

  async function getData() {
    try {
      const response = await axios.get(`${API}/fabricacion`);
      setMurales(response.data[0].murales);
      setBateas(response.data[1].bateas);
      setMensajeError(null);
    } catch (error) {
      console.error("Error al obtener los datos:", error.message);
      setMensajeError("Ocurrió un error al obtener los datos. Estamos trabajndo en ello.");
    }
  }

  useEffect(() => {
    getData()
    window.scrollTo(0, 0)
  }, []);

  return (
    <div className='fabricacion'>
      <OffcanvasFabricacion />

      {/* --- Encabezado de la página --- */}
      <header className='fab-hero'>
        <div className='container-narrow'>
          <span className='eyebrow'>Fabricación</span>
          <h1 className='section-title on-deep'>Equipos de frío hechos a medida</h1>
          <p className='section-lead on-deep'>
            Diseñamos y fabricamos equipamiento de refrigeración comercial para
            almacenes, supermercados y comercios. Explorá nuestras categorías.
          </p>
          <nav className='fab-catnav'>
            {categorias.map((c) => (
              <a key={c.id} href={`#${c.id}`} className='fab-chip'>{c.label}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* --- Categorías --- */}
      <section id="murales" className='fab-cat'>
        <div className='container-narrow'>
          <div className='fab-cat-head'>
            <h2 className="fab-cat-title">Murales</h2>
            <button id='detalles-murales' className='fab-detalles' onClick={() => setMuralesModal(true)}>
              <i className="fa-solid fa-circle-info"></i> Ver detalles
            </button>
          </div>
          <DetallesModal mensajeError={mensajeError} isOpen={muralesModal} onClose={() => setMuralesModal(false)} detalles={murales} imagen={img}/>
          <Productos producto="murales" />
        </div>
      </section>

      <section id="bateas" className='fab-cat'>
        <div className='container-narrow'>
          <div className='fab-cat-head'>
            <h2 className="fab-cat-title">Bateas</h2>
            <button id='detalles-bateas' className='fab-detalles' onClick={() => setBateasModal(true)}>
              <i className="fa-solid fa-circle-info"></i> Ver detalles
            </button>
          </div>
          <DetallesModal mensajeError={mensajeError} isOpen={bateasModal} onClose={() => setBateasModal(false)} detalles={bateas} imagen={img}/>
          <Productos producto="bateas" />
        </div>
      </section>

      <section id="exhibidoras" className='fab-cat'>
        <div className='container-narrow'>
          <div className='fab-cat-head'>
            <h2 className="fab-cat-title">Exhibidoras</h2>
          </div>
          <DetallesModal mensajeError={mensajeError} isOpen={exhibidorasModal} onClose={() => setExhibidorasModal(false)} detalles={exhibidoras} imagen={img}/>
          <Productos producto="exhibidoras" />
        </div>
      </section>

      <section id="congelados" className='fab-cat'>
        <div className='container-narrow'>
          <div className='fab-cat-head'>
            <h2 className="fab-cat-title">Congelados</h2>
          </div>
          <DetallesModal mensajeError={mensajeError} isOpen={congeladosModal} onClose={() => setCongeladosModal(false)} detalles={congelados} imagen={img}/>
          <Productos producto="congelados" />
        </div>
      </section>

      <section id="camaras" className='fab-cat'>
        <div className='container-narrow'>
          <div className='fab-cat-head'>
            <h2 className="fab-cat-title">Cámaras y Walk In Cooler</h2>
          </div>
          <DetallesModal mensajeError={mensajeError} isOpen={camarasModal} onClose={() => setCamarasModal(false)} detalles={camaras} imagen={img}/>
          <Productos producto="camaras" />
        </div>
      </section>

      <section id="usadas" className='fab-cat'>
        <div className='container-narrow'>
          <div className='fab-cat-head'>
            <h2 className="fab-cat-title">Usadas Reacondicionadas</h2>
          </div>
          <DetallesModal mensajeError={mensajeError} isOpen={usadasModal} onClose={() => setUsadasModal(false)} detalles={usadas} imagen={img}/>
          <p className='fab-nota'>
            <i className="fa-solid fa-snowflake"></i>
            Consultanos por disponibilidad de equipos usados reacondicionados.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Fabricacion
