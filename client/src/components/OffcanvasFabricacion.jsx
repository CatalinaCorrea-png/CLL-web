import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import '../css/offcanvasFabricacion.css'

const categorias = [
  { href: '#murales', label: 'MURALES' },
  { href: '#bateas', label: 'BATEAS' },
  { href: '#exhibidoras', label: 'EXHIBIDORAS' },
  { href: '#congelados', label: 'CONGELADOS' },
  { href: '#camaras', label: 'CAMARAS' },
  { href: '#usadas', label: 'USADAS' },
];

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
              {categorias.map((c) => (
                <li className='nav-item-cat' key={c.href}>
                  <a className='nav-link-cat' href={c.href} onClick={handleClose}>{c.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default OffcanvasFabricacion