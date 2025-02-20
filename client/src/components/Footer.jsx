import '../css/footer.css'
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <>
      <div className='footer container-fluid text-center row-sm p-3'>
        <div className="col-sm mb-2">
          <h5>Acerca de</h5>
          <p className='mb-2'>		Nuestra empresa cuenta con mas de 30 años de experiencia en instalaciones para almacenes, supermercados y comercios. Brindamos también asesoramiento respaldado por proyectos de diseño exclusivos para cada necesidad.<br></br>
          Nuestra mision es la de brindar soluciones integrales a las necesidades de equipamiento e instalación que nuestros clientes requieran ofreciendo un servicio de altqa calidad de producto, asesoramiento y logística.</p>
        </div>
        <div className="col-sm mb-2">
          <h5>Enlaces</h5>
          <div className='container-fluid p-0 enlaces-container'>
            <Link className='nav-link footer-link' to='/'>INICIO</Link>
            <Link className='nav-link footer-link' to='/fabricacion'>FABRICACIÓN</Link>
            <Link className='nav-link footer-link' to='/reparacion'>REPARACIÓN</Link>
            <Link className='nav-link footer-link' to='/obras'>OBRAS</Link>
            <Link className='nav-link footer-link' to='/servicios'>SERVICIOS</Link>
          </div>
        </div>
        <div className="col-sm mb-2">
          <h5>Contacto</h5>
          <p className='mb-2'>Martín Rodríguez 2875 <br></br>(1644) Victoria, Buenos Aires</p>
          <p className='mb-2'>walterdcorrea@gmail.com</p>
          <h6>Telefonos</h6>
          <ul className='lista-telefonos container-fluid'>
            <li>Walter Correa: 11-2154-4111</li>
            <li>Gustavo Ledesma: 11-5806-9162</li>
            <li>Claudio Ledesma: 11-2756-5557</li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default Footer