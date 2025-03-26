import { useEffect, useState } from 'react';
import '../css/fabricacion.css'
import axios from 'axios';
import CardDouble from './CardDouble';
import ModalGalery from './ModalGalery';

const Productos = ({ producto }) => {
    /* IMAGENES */
    const [imagenes, setImagenes] = useState([]);

    // MODAL BOOL
  const [modalBool,setModalBool] = useState(false);
  const [modalImg1,setModalImg1] = useState("");
  const [modalImg2,setModalImg2] = useState("");

    useEffect(() => {
      console.log(producto);

      axios.get(`http://localhost:3001/fabricacion/imagenes/${producto}`)
      .then( (response) => {
        console.log(response.data);
        setImagenes(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      })
    }, []);

  return (
    <>
      <ul className='productos'>
          {imagenes?.map((item, index) => (
            <li key={index}>
              {item.imageUrl2 ? (
                <>
                  <a className='imagen-producto-a' onClick={() => { setModalImg1(item.imageUrl); setModalImg2(item.imageUrl2); setModalBool(true)}}>
                    <CardDouble image1={item.imageUrl} image2={item.imageUrl2} />
                    {/* <img className='imagen-producto-img' src={item.imageUrl} alt="" />
                    <img className='imagen-producto-img' src={item.imageUrl2} alt="" /> */}
                  </a>
                </>
              ) : (
                <>
                  <a className='imagen-producto-a' onClick={() => {setModalImg1(item.imageUrl); setModalImg2(null); setModalBool(true)}}>
                    <img className='imagen-producto-img' src={item.imageUrl} alt="" />
                  </a>
                </>
              )}
            </li>
          ))}
          </ul>

          <ModalGalery isOpen={modalBool} onClose={() => setModalBool(false)} imagen={modalImg1} imagen2={modalImg2}/>
    </>
  )
}

export default Productos