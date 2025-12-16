import '../css/pages/reparacion.css'
import '../css/highlight.css'
import '../css/cold-flow.css'
import { useEffect } from 'react'


const Reparacion = () => {
  useEffect(() => window.scrollTo(0, 0),[]);
  return (
    <div className='seccion seccion-reparacion'>
      <div className="texto-container">
        <h1 className='titulo-oscuro'>REPARACION</h1>
        <h3 className='titulo-seccion'>- Cómo te ayudamos -</h3>
        <p>En CLL Equipamientos contamos con un equipo de tecnicos especializados en la reparacion y mantenimiento de equipos de refrigeracion comercial e industrial. Nos encargamos de diagnosticar y solucionar cualquier problema que pueda surgir en sus equipos, asegurando su correcto funcionamiento y prolongando su vida util.</p>
        <p>Ofrecemos servicios de reparacion para una amplia gama de equipos, incluyendo camaras frigorificas, vitrinas refrigeradas, exhibidoras, sistemas de aire acondicionado y mas. </p>
        <h5 className="texto-centrado frost">Nos encargamos de la fabricación, cambio y colocación de piezas y partes de heladeras, cámaras y gabinetes.</h5>
        {/* <h6 className="danger-text">Nuestro equipo esta capacitado para trabajar con diferentes marcas y modelos, garantizando una reparacion eficiente y de calidad.</h6> */}
        <ul className="mb-2 reparacion-list ">
          <li className='reparacion-item cold-flow'>Bases</li>
          <li className='reparacion-item cold-flow'>Brazos cúpula</li>
          <li className='reparacion-item cold-flow'>Cajas de aire con forzadores</li>
          <li className='reparacion-item cold-flow'>Rejillas de succión</li>
          <li className='reparacion-item cold-flow'>Bandejas en acero inoxidable, en chapa prepintada, en chapa galvanizadas con pintura epoxi</li>
          <li className='reparacion-item cold-flow cold-flow'>Zócalos, Faldones y Laterales de cierre</li>
          <li className='reparacion-item cold-flow'>Pintado de bachas con antioxido, esmalte sintético, epoxi, etc.</li>
          <li className='reparacion-item cold-flow'>Fabricación y colocación de cúpulas de vidrio curvos y rectos</li>
          <li className='reparacion-item cold-flow'>Provisión y colocación de cortinas nocturnas</li>
        </ul>
        <p>Ademas de la reparacion, tambien ofrecemos servicios de mantenimiento preventivo para ayudar a prevenir futuros problemas y asegurar el rendimiento optimo de sus equipos. Nuestros tecnicos realizaran inspecciones regulares, limpieza y ajustes necesarios para mantener sus equipos en las mejores condiciones.</p>
        <p>En CLL Equipamientos nos comprometemos a brindar un servicio rapido y confiable. Entendemos la importancia de contar con equipos de refrigeracion en buen estado para el funcionamiento de su negocio, por lo que:</p>
        <h5 className="texto-centrado frost">Nos esforzamos por minimizar los tiempos de inactividad y garantizar una reparacion eficiente.</h5>
        <p>Confie en CLL Equipamientos para todas sus necesidades de reparacion y mantenimiento de equipos de refrigeracion. Nuestro equipo de tecnicos especializados esta listo para ayudarlo a mantener sus equipos en las mejores condiciones y asegurar el correcto funcionamiento de su negocio.</p>
      </div>

      <div className="imagenes-container">
        <div className="imagen-container">
          <img src="/cerramiento/cerramiento-1.jpg" alt="Reparacion de Equipos de Refrigeracion" className="cerramiento-img"/>
        </div>
        <i className="fa-solid fa-angles-right"></i>
        <div className='imagen-container'>
          <img src="/cerramiento/cerramiento-2.jpg" alt="Reparacion de Equipos de Refrigeracion" className="cerramiento-img"/>
        </div>
      </div>

    </div>
  )
}

export default Reparacion