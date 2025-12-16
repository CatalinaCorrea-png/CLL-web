import '../css/footer.css'
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <>
      <div className='footer container-fluid text-center row-sm p-3'>
        <div className="col-sm mb-2">
          <h5>Acerca de</h5>
          <p className='mb-2'>Nos dedicamos a la fabricación y reparación de heladeras y cámaras frigoríficas comerciales. Con experiencia en el rubro, trabajando con empresas líderes por más de 20 años. <br />
          Nuestro objetivo es brindar soluciones integrales de equipamiento de calidad a bajo costo.</p>
        </div>
        <div className="col-sm mb-2">
          <h5>Enlaces</h5>
          <div className='container-fluid p-0 enlaces-container'>
            <Link className='nav-link footer-link' to='/'>INICIO</Link>
            <Link className='nav-link footer-link' to='/fabricacion'>FABRICACIÓN</Link>
            <Link className='nav-link footer-link' to='/reparacion'>REPARACIÓN</Link>
            {/* <Link className='nav-link footer-link' to='/obras'>OBRAS</Link> */}
            <Link className='nav-link footer-link' to='/servicios'>SERVICIOS</Link>
          </div>
        </div>
        <div className="col-sm mb-2">
          <h5>Contacto</h5>
          <h6 className='mb-0'>Direccion</h6>
          <p className='mb-2'>Martín Rodríguez 2875 <br></br>(1644) Victoria, Buenos Aires</p>
          <p className='mb-2'>walterdcorrea@gmail.com</p>
          <h6 className='mb-0'>Telefonos</h6>
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