import { useEffect, useState } from 'react';
import '../css/fabricacion.css'
import axios from 'axios';
import DetallesModal from '../components/DetallesModal';
import img from '../assets/logo.png'

const Fabricacion = () => {
  const [fabricacion, setFabricacion] = useState([]);
  const [murales, setMurales] = useState({});
  const [bateas, setBateas] = useState({});
  const [exhibidoras, setExhibidoras] = useState({});
  const [congelados, setCongelados] = useState({});
  const [camaras, setCamaras] = useState({});
  const [vitrinas, setVitrinas] = useState({});
  const [usadas, setUsadas] = useState({});

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

  // useEffect(() => {
  //   axios.get('http://localhost:3001/fabricacion/imagenes')
  //   .then( (response) => {
  //     // console.log(response.data);
  //     setFabricacion(response.data);
  //   })
  //   .catch((error) => {
  //     console.error("Error al obtener los datos:", error);
  //   })
  // }, []);
  
  // console.log(muralesModal);
  // console.log(bateasModal);
  // console.log("fabricacion:", fabricacion);
  // console.log("murales:",murales);
  // console.log("bateas:",bateas);
  
  useEffect(() => window.scrollTo(0, 0),[]);
  return (
    <>
    <div className='seccion seccion-fabricacion'>
      <h1 className='titulo-oscuro'>FABRICACION</h1>

      <section id="murales" className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">MURALES</h1>
        <button className='btn-indigo' onClick={() => setMuralesModal(true)}>VER DETALLES DE MURALES</button>
        <DetallesModal isOpen={muralesModal} onClose={() => setMuralesModal(false)} detalles={murales} imagen={img}/>
        {/* <ul className='productos'>
        {murales.detallesTecnicos?.map((item, index) => (
          <li key={index}>
            {item}
          </li>
        ))}
        </ul> */}
      </section>

      <section id="bateas" className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">BATEAS</h1>
        <button className='btn-indigo' onClick={() => setBateasModal(true)}>VER DETALLES DE BATEAS</button>
        <DetallesModal isOpen={bateasModal} onClose={() => setBateasModal(false)} detalles={bateas} imagen={img}/>
        {/* <ul className='productos'>
        {bateas.detallesTecnicos?.map((item, index) => (
          <li key={index}>
            {item.includes("Cúpulas de vidrio") ? (
              <>
                {item} <a id="dvh" className=''>DVH</a>
              </>
            ) : (
              item
            )}
          </li>
        ))}
        </ul> */}
      </section>

      <section id="exhibidoras"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">EXHIBIDORAS</h1>
        <button className='btn-indigo' onClick={() => setExhibidorasModal(true)}>VER DETALLES DE EXHIBIDORAS</button>
        <DetallesModal isOpen={exhibidorasModal} onClose={() => setExhibidorasModal(false)} detalles={exhibidoras} imagen={img}/>

      </section>

      <section id="congelados"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">CONGELADOS</h1>
        <button className='btn-indigo' onClick={() => setCongeladosModal(true)}>VER DETALLES DE CONGELADOS</button>
        <DetallesModal isOpen={congeladosModal} onClose={() => setCongeladosModal(false)} detalles={congelados} imagen={img}/>

      </section>

      <section id="camaras"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">CAMARAS Y WALK IN COOLER</h1>
        <button className='btn-indigo' onClick={() => setCamarasModal(true)}>VER DETALLES DE CAMARAS</button>
        <DetallesModal isOpen={camarasModal} onClose={() => setCamarasModal(false)} detalles={camaras} imagen={img}/>

      </section>
      <section id="vitrinas"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">VITRINAS</h1>
        <button className='btn-indigo' onClick={() => setVitrinasModal(true)}>VER DETALLES DE VITRINAS</button>
        <DetallesModal isOpen={vitrinasModal} onClose={() => setVitrinasModal(false)} detalles={vitrinas} imagen={img}/>

      </section>

      <section id="usadas"  className='container-fluid container-cat'>
        <h1 className="titulo-oscuro titulo-seccion">USADAS REACONDICIONADAS</h1>
        <button className='btn-indigo' onClick={() => setUsadasModal(true)}>VER DETALLES DE USADAS</button>
        <DetallesModal isOpen={usadasModal} onClose={() => setUsadasModal(false)} detalles={usadas} imagen={img}/>

      </section>

    </div>
    
    </>
  )
}

export default Fabricacion