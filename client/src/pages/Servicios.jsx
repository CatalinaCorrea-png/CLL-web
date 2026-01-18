import '../css/pages/servicios.css'
import { useEffect } from 'react'
// import img1 from '/IMG_20210701_110939128.jpg';
// import img2 from '/camaras/wic-1-3.JPG';
// import img3 from '/IMG-20190715-WA0042.jpg';
// import img4 from '/IMG_20190821_170029472.jpg';
import BeforeAfter from '../components/BeforeAfter';


const Servicios = () => {

  const img1 = '/IMG_20210701_110939128.jpg'
  const img2 = '/camaras/wic-1-3.jpg'
  const img3 = '/IMG-20190715-WA0042.jpg'
  const img4 = '/IMG_20190821_170029472.jpg'
    
  useEffect(() => window.scrollTo(0, 0),[]);
  return (
    <div className='seccion seccion-servicios'>
      <div className="texto-container">
        <h1 className='titulo-oscuro'>SERVICIOS</h1>
        <h3 className='titulo-seccion'>- Cómo te ayudamos -</h3>

        <hr className='separator'/>

        <p>Cerramientos con puertas de vidrio DVH corredizas o batientes</p>
        {/* <div className='servicio-img-container'>
          <img className='img-container' src={img2} alt="" />
          </div> */}

        <BeforeAfter 
        img1={"/cerramiento/IMG-20190816-WA0048-1.jpg"} 
        img2={"/cerramiento/IMG-20190816-WA0050-1.jpg"}
        alt1={"Heladera exhibidora antes, abierta, sin puertas"}
        alt2={"Heladera exhibidora después, cerrada con puertas corredizas de vidrio"}
        aditionalClasses={"servicios-before-after"}
        />

        <hr className='separator'/>

        <p>Provision y colocacion de cupulas de vidrio curvo y rectas DVH</p>

        <BeforeAfter 
        img1={"/cerramiento/IMG_20190208_121118122.jpg"} 
        img2={"/cerramiento/IMG_20190311_113329402.jpg"}
        alt1={"Batea recta antes, abierta, sin cupula de vidrio"}
        alt2={"Batea recta despues, cerrada con cupula de vidrio recta"}
        aditionalClasses={"servicios-before-after"}
        />

        <hr className='separator'/>

        <p>Provision y colocacion de cortinas nocturnas</p>
        <div className='servicio-img-container'>
          <img className='servicio-img' src={img1} alt="Heladera exhibidora baja, cerrada con cortina nocturna" />
        </div>

        <hr className='separator'/>

        <h5>Reparacion en general de Cámaras Frigoríficas:</h5>
        <p>Cambio de herrajes, burletes, estanterías para cámaras, sellados de las mismas.</p>

        <div className='servicio-img-container'>
          <img className='servicio-img' src={img2} alt="Interior de camara walk in cooler con estanterias de acero con rejas plastificadas" />
        </div>

        <hr className='separator'/>
        
        <h5>Reparación de heladeras en general:</h5>
        <p>Control frigorífico de las mismas</p>

        <div className="servicios-imagenes-container">
          <div className='servicio-img-container'>
            <img className='servicio-img' src={img3} alt="frente exterior de heladera exhibidora con termostato controlador de temperatura" />
          </div>
          <div className='servicio-img-container'>
            <img className='servicio-img' src={img4} alt="frente exterior de camara frigrorifica con termostato controlador de temperatura" />
          </div>
        </div>
        
        <hr className='separator'/>

        <h5>Reparación de iluminacion de heladeras y Cámaras</h5>

        <BeforeAfter 
        img1={"/cerramiento/IMG-20190423-WA0018.jpg"} 
        img2={"/cerramiento/IMG-20190423-WA0009.jpg"}
        alt1={"Heladera exhibidora antes, abierta, sin puertas y sin iluminacion"}
        alt2={"Heladera exhibidora después, cerrada con puertas corredizas de vidrio e iluminacion interior"}
        aditionalClasses={"servicios-before-after"}
        />

      </div>
    </div>
  )
}

export default Servicios