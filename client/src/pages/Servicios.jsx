import '../css/pages/servicios.css'
import { useEffect } from 'react'

const Servicios = () => {
  
  useEffect(() => window.scrollTo(0, 0),[]);
  return (
    <div className='seccion seccion-servicios'>
      <div className="texto-container">
        <h1 className='titulo-oscuro'>SERVICIOS</h1>
        <h3 className='titulo-seccion'>- Cómo te ayudamos -</h3>

        <p>Cerramientos con puertas e vidrio DVH corredizas o batientes</p>
        <p>Provision y colocacion de cupulas de vidrio curvo y rectas DVH</p>
        <h5>Reparacion en general de Cámaras Frigoríficas:</h5>
        <p>Cambio de herrajes, burletes, estanterías para cámaras, sellados de las mismas.</p>
        <h5>Reparación de heladeras en general:</h5>
        <p>Control frigorífico de las mismas</p>
        <h5>Reparación de iluminacion de heladeras y Cámaras</h5>
      </div>
    </div>
  )
}

export default Servicios