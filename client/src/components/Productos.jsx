import { useEffect, useRef, useState } from 'react';
import '../css/pages/fabricacion.css'
import axios from 'axios';
import CardDouble from './CardDouble';
import ModalGalery from './ModalGalery';
import Loader from './Loader';

const Productos = ({ producto }) => {
  const API = import.meta.env.VITE_API_URL;
  const [imagenes, setImagenes] = useState([]);
  const isInitializedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState(null);
  const [modalBool,setModalBool] = useState(false);
  const [id, setId] = useState(0);

  async function getData() {
    setLoading(true)
    try {
      const response = await axios.get(`${API}/fabricacion/imagenes/${producto}`)
      setImagenes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al obtener imagenes:", error.message);
      setMensajeError("Error al obtener los datos");
    } finally {
      setLoading(false)
    }
  }

  if (!isInitializedRef.current) {
    getData()
    isInitializedRef.current = true;
  }

  const imgUrl = (id) => `${API}/imagen/${id}`;

  return (
    <>
      <ul className='productos'>
        {!loading && imagenes?.map((item, index) => (
          <li key={item._id}>
            {item.imagen2 ? (
              <a className='imagen-producto-a' onClick={() => { setId(index); setModalBool(true)}}>
                <CardDouble id={index} image1={imgUrl(item.imagen1)} image2={imgUrl(item.imagen2)} />
              </a>
            ) : (
              <a className='imagen-producto-a' onClick={() => {setId(index); setModalBool(true)}}>
                <img id={index}
                  className='imagen-producto-img'
                  src={imgUrl(item.imagen1)}
                  loading='lazy'
                  alt="" />
              </a>
            )}
          </li>
        ))}
      </ul>
      {loading && <Loader />}

      <ModalGalery isOpen={modalBool} onClose={() => setModalBool(false)} imagenes={imagenes} id={id} imgUrl={imgUrl}/>
    </>
  )
}

export default Productos
