import ReactDOM from "react-dom";
import '../css/galeriaModal.css';
import Carousel from 'react-bootstrap/Carousel';

function UncontrolledCarousel({ image1, image2 }) {
  return (
    <>
      { image2 != null ? (
        <Carousel interval={100000} slide={false}>
          <Carousel.Item>
            <img src={image1} alt="" className="imagen-galery-detalle"/>
            <Carousel.Caption>
              <h3></h3>
            </Carousel.Caption>
          </Carousel.Item>
        
          <Carousel.Item>
            <img src={image2} alt="" className="imagen-galery-detalle"/>
            <Carousel.Caption>
              <h3></h3>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      ) : (
        <div id="carouselExample" class="carousel slide">
          <div class="carousel-inner">
            <div class="carousel-item active">
              <img src={image1} alt="" className="imagen-galery-detalle"/>
            </div>
          </div>
        </div>
      )}
    </>
  );
};




const ModalGalery = ({ isOpen, onClose, imagen, imagen2 }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className='modal-galery-overlay' onClick={onClose}>
      <div className='modal-galery' onClick={(e) => e.stopPropagation()}>
      <button className="btn-close-modal-galery poppins-semibold" onClick={onClose}>X</button>
      <UncontrolledCarousel image1={imagen} image2={imagen2} />
      </div>
    </div>,
    document.getElementById("modal-root") // Se renderiza fuera del root principal, en modal-root
  );
}

export default ModalGalery;

// e.stopPropagation(): se usa para detener la propagación del evento de clic desde el div.modal hacia su contenedor padre (div.modal-overlay).
// Si no usas e.stopPropagation(), al hacer clic dentro del modal también se activará el evento onClick del modal-overlay, lo que cerraría el modal de inmediato.

// Desventaja de este modal: Requiere un <div id="modal-root"></div> en el index.html.