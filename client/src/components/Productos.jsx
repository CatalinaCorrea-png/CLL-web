import { useEffect, useState } from 'react';
import '../css/pages/fabricacion.css'
import axios from 'axios';
import CardDouble from './CardDouble';
import ModalGalery from './ModalGalery';
import Loader from './Loader';

const Productos = ({ producto }) => {
    /* IMAGENES */
    const [imagenes, setImagenes] = useState([]);
      /* LOADING */
    const [loading, setLoading] = useState(true);
    const [mensajeError, setMensajeError] = useState(null);

    // MODAL BOOL
  const [modalBool,setModalBool] = useState(false);
  const [id, setId] = useState(0);
  // const [modalImg2,setModalImg2] = useState("");

  async function getData() {
      setLoading(true)
    try {
      const response = await axios.get(`http://localhost:3001/fabricacion/imagenes/${producto}`)
      // console.log(response.data);
      setLoading(false)
      setImagenes(response.data);
    } catch (error) {
      setMensajeError("Error al obtener los datos:", error);
    }
  }

  useEffect(() => {
    getData()
  }, []);

  return (
    <>
      <ul className='productos'>
          {!loading && imagenes?.map((item, index) => (
            <li key={index}>
              {item.imageUrl2 ? (
                <>
                  <a className='imagen-producto-a' onClick={() => { setId(index); setModalBool(true)}}>
                    <CardDouble id={index} image1={item.imageUrl} image2={item.imageUrl2} />
                    {/* <img className='imagen-producto-img' src={item.imageUrl} alt="" />
                    <img className='imagen-producto-img' src={item.imageUrl2} alt="" /> */}
                  </a>
                </>
              ) : (
                <>
                  <a className='imagen-producto-a' onClick={() => {setId(index); setModalBool(true)}}>
                    <img id={index} className='imagen-producto-img' src={item.imageUrl} alt="" />
                  </a>
                </>
              )}
            </li>
          ))}
          </ul>
          {loading && <Loader />}

          <ModalGalery isOpen={modalBool} onClose={() => setModalBool(false)} imagenes={imagenes} id={id}/>
    </>
  )
}

export default Productos