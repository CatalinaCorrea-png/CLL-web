import '../css/pages/servicios.css'
import { useEffect } from 'react'
import BeforeAfter from '../components/BeforeAfter';

const Servicios = () => {
  const img1 = '/IMG_20210701_110939128.jpg'
  const img2 = '/camaras/wic-1-3.webp'
  const img3 = '/IMG-20190715-WA0042.jpg'
  const img4 = '/IMG_20190821_170029472.jpg'

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className='servicios'>
      {/* --- Encabezado --- */}
      <header className='page-hero'>
        <div className='container-narrow'>
          <span className='eyebrow'>Servicios</span>
          <h1 className='section-title on-deep'>Cómo te ayudamos</h1>
          <p className='section-lead on-deep'>
            Cerramientos, cúpulas de vidrio, cortinas nocturnas y reparación
            integral de tus equipos de frío.
          </p>
        </div>
      </header>

      {/* --- Cerramientos con puertas de vidrio --- */}
      <section className='srv-block'>
        <div className='container-narrow'>
          <header className='srv-head'>
            <h2 className='sec-title-accent'>Cerramientos con puertas de vidrio</h2>
            <p className='srv-desc'>Puertas de vidrio DVH corredizas o batientes.</p>
          </header>
          <BeforeAfter
            img1={"/cerramiento/IMG-20190816-WA0048-1.jpg"}
            img2={"/cerramiento/IMG-20190816-WA0050-1.jpg"}
            alt1={"Heladera exhibidora antes, abierta, sin puertas"}
            alt2={"Heladera exhibidora después, cerrada con puertas corredizas de vidrio"}
            aditionalClasses={"servicios-before-after"}
          />
        </div>
      </section>

      {/* --- Cúpulas de vidrio --- */}
      <section className='srv-block srv-block-alt'>
        <div className='container-narrow'>
          <header className='srv-head'>
            <h2 className='sec-title-accent'>Cúpulas de vidrio</h2>
            <p className='srv-desc'>Provisión y colocación de cúpulas de vidrio curvo y rectas DVH.</p>
          </header>
          <BeforeAfter
            img1={"/cerramiento/IMG_20190208_121118122.jpg"}
            img2={"/cerramiento/IMG_20190311_113329402.jpg"}
            alt1={"Batea recta antes, abierta, sin cupula de vidrio"}
            alt2={"Batea recta despues, cerrada con cupula de vidrio recta"}
            aditionalClasses={"servicios-before-after"}
          />
        </div>
      </section>

      {/* --- Cortinas nocturnas --- */}
      <section className='srv-block'>
        <div className='container-narrow'>
          <header className='srv-head'>
            <h2 className='sec-title-accent'>Cortinas nocturnas</h2>
            <p className='srv-desc'>Provisión y colocación de cortinas nocturnas.</p>
          </header>
          <div className='srv-media'>
            <img className='servicio-img' src={img1} alt="Heladera exhibidora baja, cerrada con cortina nocturna" />
          </div>
        </div>
      </section>

      {/* --- Reparación de cámaras --- */}
      <section className='srv-block srv-block-alt'>
        <div className='container-narrow'>
          <header className='srv-head'>
            <h2 className='sec-title-accent'>Reparación de cámaras frigoríficas</h2>
            <p className='srv-desc'>Cambio de herrajes, burletes, estanterías para cámaras y sellados.</p>
          </header>
          <div className='srv-media'>
            <img className='servicio-img' src={img2} alt="Interior de camara walk in cooler con estanterias de acero con rejas plastificadas" />
          </div>
        </div>
      </section>

      {/* --- Reparación de heladeras --- */}
      <section className='srv-block'>
        <div className='container-narrow'>
          <header className='srv-head'>
            <h2 className='sec-title-accent'>Reparación de heladeras</h2>
            <p className='srv-desc'>Control frigorífico y puesta a punto de tus equipos.</p>
          </header>
          <div className='srv-media srv-media-2'>
            <img className='servicio-img' src={img3} alt="frente exterior de heladera exhibidora con termostato controlador de temperatura" />
            <img className='servicio-img' src={img4} alt="frente exterior de camara frigrorifica con termostato controlador de temperatura" />
          </div>
        </div>
      </section>

      {/* --- Reparación de iluminación --- */}
      <section className='srv-block srv-block-alt'>
        <div className='container-narrow'>
          <header className='srv-head'>
            <h2 className='sec-title-accent'>Reparación de iluminación</h2>
            <p className='srv-desc'>Iluminación interior de heladeras y cámaras.</p>
          </header>
          <BeforeAfter
            img1={"/cerramiento/IMG-20190423-WA0018.jpg"}
            img2={"/cerramiento/IMG-20190423-WA0009.jpg"}
            alt1={"Heladera exhibidora antes, abierta, sin puertas y sin iluminacion"}
            alt2={"Heladera exhibidora después, cerrada con puertas corredizas de vidrio e iluminacion interior"}
            aditionalClasses={"servicios-before-after"}
          />
        </div>
      </section>
    </div>
  )
}

export default Servicios
