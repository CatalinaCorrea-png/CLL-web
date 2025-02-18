import { useEffect, useState } from 'react';
import '../css/home.css';
import { Link } from 'react-router-dom';

const SecTrabajos = () => {
  const [animate, setAnimate] = useState(false);

  const onScroll = () => {
    window.scrollY > 700 ? setAnimate(true) : setAnimate(false);
  }

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
  })


  return (
    <section className="seccion seccion-trabajos container-fluid text-center">
      <h1 className='titulo-claro'>LO QUE REALIZAMOS</h1>
      <div className='container-fluid trabajos-container text-center'>
        
        <div className='row m-4'>
          <div id='trabajo' className="trabajo col">
            <div className={`link-trabajo ${animate ? "izqder" : ""}`}>
                {/* <span>ICONO</span> */}
                <i class="fa-solid fa-snowflake"></i>
                <Link to='/fabricacion'><h5 className=''>FABRICACION</h5></Link>
            </div>

            <div id='texto-trabajo' className='texto-trabajo'>
              <ul className='lista-links container-fluid m-0'>
                <li><Link to='/fabricacion'>Murales</Link></li>
                <li><Link to='/fabricacion'>Bateas</Link></li>
                <li><Link to='/fabricacion'>Congelados</Link></li>
                <li><Link to='/fabricacion'>Exhibidoras</Link></li>
                <li><Link to='/fabricacion'>Camaras y WIK</Link></li>
                <li><Link to='/fabricacion'>Vitrinas</Link></li>
                <li><Link to='/fabricacion'>Usadas Reacondicionadas</Link></li>
              </ul>
            </div>
          </div>

          <div id='trabajo' className="trabajo col">
            <div className={`link-trabajo ${animate ? "izqder" : ""}`}>
                {/* <span>ICONO</span> */}
                <i class="fa-solid fa-screwdriver-wrench"></i>
                <Link to='/reparacion'><h5 className=''>REPARACION</h5></Link>
            </div>

            <div id='texto-trabajo' className='texto-trabajo'>
              <ul className='lista-links container-fluid m-0'>
                <li><Link to='/reparacion'>Antes y Después</Link></li>
                <li><Link to='/reparacion'>Cerramientos con Puertas de Vidrio</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row m-4">
          <div id='trabajo' className="trabajo col">
            <div className={`link-trabajo ${animate ? "izqder" : ""}`}>
                {/* <span>ICONO</span> */}
                <i class="fa-solid fa-helmet-safety"></i>
                <Link to='/obras'><h5 className=''>OBRAS</h5></Link>
            </div>

            <div id='texto-trabajo' className='texto-trabajo'>
              <ul className='lista-links container-fluid m-0'>
                <li><Link to='/obras'>Mira nuestras obras</Link></li>
              </ul>
            </div>
          </div>

          <div id='trabajo' className="trabajo col">
            <div className={`link-trabajo ${animate ? "izqder" : ""}`}>
                {/* <span>ICONO</span> */}
                <i class="fa-solid fa-gear"></i>
                <Link to='/servicios'><h5 className=''>SERVICIOS</h5></Link>
            </div>

            <div id='texto-trabajo' className='texto-trabajo'>
              <ul className='lista-links container-fluid m-0'>
                <li><Link to='/servicios'>Mira nuestros servicios</Link></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default SecTrabajos