import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import '../css/offcanvasFabricacion.css'

const OffcanvasFabricacion = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const toggleShow = () => setShow((s) => !s);

  return (
    <>
    <Button variant="primary" onClick={toggleShow} className="btn-offcanvas">
    <i className="fa-solid fa-angles-left"></i>
      </Button>
      <Offcanvas show={show} onHide={handleClose} placement={"end"} scroll>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Ir a Categoría</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <h6 className='titulo-offcanvas'>Ir a Categoría:</h6>
          <nav>
            <ul className='nav-container-cat poppins-regular'>
              <li className='nav-item-cat'><a className='nav-link-cat' href="#murales">MURALES</a></li>
              <li className='nav-item-cat'><a className='nav-link-cat' href="#bateas">BATEAS</a></li>
              <li className='nav-item-cat'><a className='nav-link-cat' href="#exhibidoras">EXHIBIDORAS</a></li>
              <li className='nav-item-cat'><a className='nav-link-cat' href="#camaras">CAMARAS</a></li>
              <li className='nav-item-cat'><a className='nav-link-cat' href="#vitrinas">VITRINAS</a></li>
              <li className='nav-item-cat'><a className='nav-link-cat' href="#usadas">USADAS</a></li>
            </ul>
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default OffcanvasFabricacion