import ReactDOM from "react-dom";
import React, { useEffect, useState } from 'react';
import '../css/galeriaModal.css';
import Carousel from 'react-bootstrap/Carousel';

function ControlledCarousel({ imagenes, id }) {
  const [index, setIndex] = useState(null);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Encontrar el indice de la imagen que se presionó
  const handleFindIndex = () => {
    const imagenBuscada = '"' + imagenes[id].imageUrl + '"';
    const imagenElemento = document.querySelector(`#miCarrusel .carousel-item img[src=${imagenBuscada}]`);
    const item = imagenElemento.closest('.carousel-item');
    const items = Array.from(document.querySelectorAll('#miCarrusel .carousel-item'));
    setIndex(items.indexOf(item));
  
    // DEBUG:
    // console.log("Índice:", index);
    // console.log("imagenBuscada:", imagenBuscada);
    // console.log("imagenElemento:", imagenElemento);
    // console.log("item:", item);
    // console.log("items:", items);
    // console.log("items.indexOf(item):", items.indexOf(item));
  }

  useEffect(() => {
    console.log("IDX:", id);
    handleFindIndex(); // buscar indice de imagen seleccionada
  }, [])


  return (
    <>
    <Carousel id="miCarrusel" activeIndex={index} onSelect={handleSelect} interval={100000} slide={false}>

    {imagenes?.map((imagen, idx) => (
      imagen.imageUrl2 != null ? [
        <Carousel.Item key={`${idx}-1`}>
          <img src={imagen.imageUrl} alt="" className="imagen-galery-detalle"/>
          <Carousel.Caption>
            <h3></h3>
          </Carousel.Caption>
        </Carousel.Item>,
        <Carousel.Item key={`${idx}-2`}>
          <img src={imagen.imageUrl2} alt="" className="imagen-galery-detalle"/>
          <Carousel.Caption>
            <h3></h3>
          </Carousel.Caption>
        </Carousel.Item>
        // El array es interpretado como varios JSX.
        // Uso eso en vez de React Fragment
      ] : (
        <Carousel.Item key={`${idx}-solo`}>
        <img src={imagen.imageUrl} alt="" className="imagen-galery-detalle"/>
        <Carousel.Caption>
          <h3></h3>
        </Carousel.Caption>
      </Carousel.Item>
      )
    )
    )}
    </Carousel>



      
    </>
  );
};




const ModalGalery = ({ isOpen, onClose, imagenes, id }) => {
  if (!isOpen) return null;
  // console.log({imagenes});
  // console.log(id);

  return ReactDOM.createPortal(
    <div className='modal-galery-overlay' onClick={onClose}>
      <div className='modal-galery' onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-modal-galery poppins-semibold" onClick={onClose}>X</button>
        <ControlledCarousel imagenes={imagenes} id={id} />
      </div>
    </div>,
    document.getElementById("modal-root") // Se renderiza fuera del root principal, en modal-root
  );
}

export default ModalGalery;

// e.stopPropagation(): se usa para detener la propagación del evento de clic desde el div.modal hacia su contenedor padre (div.modal-overlay).
// Si no usas e.stopPropagation(), al hacer clic dentro del modal también se activará el evento onClick del modal-overlay, lo que cerraría el modal de inmediato.

// Desventaja de este modal: Requiere un <div id="modal-root"></div> en el index.html.