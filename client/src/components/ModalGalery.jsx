import ReactDOM from "react-dom";
import { useEffect, useState } from 'react';
import '../css/galeriaModal.css';
import Carousel from 'react-bootstrap/Carousel';

function ControlledCarousel({ imagenes, id, imgUrl }) {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  useEffect(() => {
    // Calcular el indice real en el carousel (cada entrada con imagen2 ocupa 2 slides)
    let realIndex = 0;
    for (let i = 0; i < id; i++) {
      realIndex += imagenes[i].imagen2 ? 2 : 1;
    }
    setIndex(realIndex);
  }, [id, imagenes]);

  return (
    <Carousel id="miCarrusel" activeIndex={index} onSelect={handleSelect} interval={100000} slide={false}>
      {imagenes?.map((imagen, idx) => (
        imagen.imagen2 ? [
          <Carousel.Item key={`${idx}-1`}>
            <img src={imgUrl(imagen.imagen1)} alt="" className="imagen-galery-detalle"/>
          </Carousel.Item>,
          <Carousel.Item key={`${idx}-2`}>
            <img src={imgUrl(imagen.imagen2)} alt="" className="imagen-galery-detalle"/>
          </Carousel.Item>
        ] : (
          <Carousel.Item key={`${idx}-solo`}>
            <img src={imgUrl(imagen.imagen1)} alt="" className="imagen-galery-detalle"/>
          </Carousel.Item>
        )
      ))}
    </Carousel>
  );
}

const ModalGalery = ({ isOpen, onClose, imagenes, id, imgUrl }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className='modal-galery-overlay' onClick={onClose}>
      <div className='modal-galery' onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-modal-galery poppins-semibold" onClick={onClose}>X</button>
        <ControlledCarousel imagenes={imagenes} id={id} imgUrl={imgUrl} />
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default ModalGalery;

// e.stopPropagation(): se usa para detener la propagación del evento de clic desde el div.modal hacia su contenedor padre (div.modal-overlay).
// Si no usas e.stopPropagation(), al hacer clic dentro del modal también se activará el evento onClick del modal-overlay, lo que cerraría el modal de inmediato.
// Desventaja de este modal: Requiere un <div id="modal-root"></div> en el index.html.