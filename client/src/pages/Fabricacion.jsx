import { useEffect, useState } from 'react';
import '../css/fabricacion.css'
import axios from 'axios';
import DetallesModal from '../components/DetallesModal';
import img from '../assets/logo.png'
import { Link } from 'react-router-dom';
import Productos from '../components/Productos';
import BotonTrazo from '../components/BotonTrazo';
import OffcanvasFabricacion from '../components/OffcanvasFabricacion';

const Fabricacion = () => {
  
  /* DETALLES */
  const [murales, setMurales] = useState({});
  const [bateas, setBateas] = useState({});
  const [exhibidoras, setExhibidoras] = useState({});
  const [congelados, setCongelados] = useState({});
  const [camaras, setCamaras] = useState({});
  const [vitrinas, setVitrinas] = useState({});
  const [usadas, setUsadas] = useState({});
  
  /* BOOLEANOS DE MODAL */
  const [muralesModal, setMuralesModal] = useState(false);
  const [bateasModal, setBateasModal] = useState(false);
  const [exhibidorasModal, setExhibidorasModal] = useState(false);
  const [congeladosModal, setCongeladosModal] = useState(false);
  const [camarasModal, setCamarasModal] = useState(false);
  const [vitrinasModal, setVitrinasModal] = useState(false);
  const [usadasModal, setUsadasModal] = useState(false);

  async function getData() {
    try {
      const response = await axios.get('http://localhost:3001/fabricacion');
      console.log(response.data);
      // setFabricacion(response.data);
      setMurales(response.data[0].murales);
      setBateas(response.data[1].bateas);
      // setExhibidoras(response.data[2].exhibidoras);
      // setCongelados(response.data[3].congelados);
      // setCamaras(response.data[4].camaras);
      // setVitrinas(response.data[5].vitrinas);
      // setUsadas(response.data[6].usadas);
    } catch (error) {
      console.error("Error al obtener los datos:", error.message);
    }
  }

  useEffect(() => {
    getData()
  }, []);
  
  // console.log(muralesModal);
  // console.log(bateasModal);
  // console.log("fabricacion:", fabricacion);
  // console.log("murales:",murales);
  // console.log("bateas:",bateas);
  
  // useEffect(() => window.scrollTo(0, 0),[]);
  return (
    <>
    <div className='seccion seccion-fabricacion'>
      <OffcanvasFabricacion />
      <h1 className='titulo-oscuro'>FABRICACION</h1>
      <h3 className='titulo-seccion'>- Lo Que Hacemos -</h3>

      <section id="murales" className='container-fluid container-cat p-0'>
        <h1 className="titulo-oscuro titulo-seccion">MURALES</h1>
        <a id='detalles-murales' onClick={() => setMuralesModal(true)}><BotonTrazo texto={"DETALLES"}/></a>
        <DetallesModal isOpen={muralesModal} onClose={() => setMuralesModal(false)} detalles={murales} imagen={img}/>
        <Productos producto="murales" />
      </section>

      <section id="bateas" className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">BATEAS</h1>
        <a id='detalles-bateas' onClick={() => setBateasModal(true)}><BotonTrazo texto={"DETALLES"}/></a>
        <DetallesModal isOpen={bateasModal} onClose={() => setBateasModal(false)} detalles={bateas} imagen={img}/>
        <Productos producto="bateas" />
      </section>

      <section id="exhibidoras"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">EXHIBIDORAS</h1>
        <a id='detalles-exhibidoras' onClick={() => setExhibidorasModal(true)}><BotonTrazo texto={"DETALLES"}/></a>
        <DetallesModal isOpen={exhibidorasModal} onClose={() => setExhibidorasModal(false)} detalles={exhibidoras} imagen={img}/>

      </section>

      <section id="congelados"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">CONGELADOS</h1>
        <a id='detalles-exhibidoras' onClick={() => setExhibidorasModal(true)}><BotonTrazo texto={"DETALLES"}/></a>
        <DetallesModal isOpen={congeladosModal} onClose={() => setCongeladosModal(false)} detalles={congelados} imagen={img}/>

      </section>

      <section id="camaras"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">CAMARAS Y WALK IN COOLER</h1>
        <a id='detalles-camaras' onClick={() => setCamarasModal(true)}><BotonTrazo texto={"DETALLES"}/></a>
        <DetallesModal isOpen={camarasModal} onClose={() => setCamarasModal(false)} detalles={camaras} imagen={img}/>

      </section>
      <section id="vitrinas"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">VITRINAS</h1>
        <a id='detalles-vitrinas' onClick={() => setVitrinasModal(true)}><BotonTrazo texto={"DETALLES"}/></a>
        <DetallesModal isOpen={vitrinasModal} onClose={() => setVitrinasModal(false)} detalles={vitrinas} imagen={img}/>

      </section>

      <section id="usadas"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">USADAS REACONDICIONADAS</h1>
        <a id='detalles-usadas' onClick={() => setUsadasModal(true)}><BotonTrazo texto={"DETALLES"}/></a>
        <DetallesModal isOpen={usadasModal} onClose={() => setUsadasModal(false)} detalles={usadas} imagen={img}/>

      </section>

    </div>
    
    </>
  )
}

export default Fabricacion