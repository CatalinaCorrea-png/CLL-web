import '../css/pages/reparacion.css'
import { useEffect } from 'react'
import BeforeAfter from '../components/BeforeAfter'

const trabajos = [
  'Bases',
  'Brazos cúpula',
  'Cajas de aire con forzadores',
  'Rejillas de succión',
  'Bandejas en acero inoxidable, chapa prepintada o galvanizada con pintura epoxi',
  'Zócalos, faldones y laterales de cierre',
  'Pintado de bachas con antióxido, esmalte sintético, epoxi, etc.',
  'Fabricación y colocación de cúpulas de vidrio curvos y rectos',
  'Provisión y colocación de cortinas nocturnas',
];

const Reparacion = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className='reparacion'>
      {/* --- Encabezado --- */}
      <header className='page-hero'>
        <div className='container-narrow'>
          <span className='eyebrow'>Reparación</span>
          <h1 className='section-title on-deep'>Reparación y mantenimiento</h1>
          <p className='section-lead on-deep'>
            Técnicos especializados en refrigeración comercial e industrial.
            Diagnosticamos y solucionamos fallas para prolongar la vida útil de
            tus equipos.
          </p>
        </div>
      </header>

      {/* --- Intro --- */}
      <section className='rep-sec'>
        <div className='container-narrow rep-intro'>
          <p>
            En CLL Equipamientos contamos con un equipo de técnicos
            especializados en la reparación y mantenimiento de equipos de
            refrigeración comercial e industrial. Nos encargamos de diagnosticar
            y solucionar cualquier problema, asegurando su correcto
            funcionamiento y prolongando su vida útil.
          </p>
          <p>
            Ofrecemos servicios de reparación para una amplia gama de equipos:
            cámaras frigoríficas, vitrinas refrigeradas, exhibidoras, sistemas de
            aire acondicionado y más.
          </p>
          <div className='callout'>
            <i className="fa-solid fa-snowflake"></i>
            <span>
              Nos encargamos de la fabricación, cambio y colocación de piezas y
              partes de heladeras, cámaras y gabinetes.
            </span>
          </div>
        </div>
      </section>

      {/* --- Qué reparamos / fabricamos --- */}
      <section className='rep-sec rep-sec-alt'>
        <div className='container-narrow'>
          <header className='rep-head'>
            <h2 className='sec-title-accent'>Piezas y partes que trabajamos</h2>
          </header>
          <ul className='rep-list'>
            {trabajos.map((t, i) => (
              <li className='rep-item' key={i}>
                <i className="fa-solid fa-snowflake"></i>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Antes / Después --- */}
      <section className='rep-sec'>
        <div className='container-narrow'>
          <header className='rep-head'>
            <h2 className='sec-title-accent'>Un antes y un después</h2>
          </header>
          <BeforeAfter
            img1={"/cerramiento/cerramiento-1.jpg"}
            img2={"/cerramiento/cerramiento-2.jpg"}
            alt1={"Heladera exhibidora antes, abierta, sin puertas"}
            alt2={"Heladera exhibidora después, cerrada con puertas corredizas de vidrio"}
            aditionalClasses={"reparacion-before-after"}
          />
        </div>
      </section>

      {/* --- Mantenimiento y prevención --- */}
      <section className='rep-sec rep-sec-alt'>
        <div className='container-narrow rep-intro'>
          <header className='rep-head'>
            <h2 className='sec-title-accent'>Mantenimiento y prevención</h2>
          </header>
          <p>
            Además de la reparación, ofrecemos mantenimiento preventivo para
            evitar futuros problemas y asegurar el rendimiento óptimo de tus
            equipos. Realizamos inspecciones regulares, limpieza y ajustes
            necesarios para mantenerlos en las mejores condiciones.
          </p>
          <div className='callout'>
            <i className="fa-solid fa-bolt"></i>
            <span>
              Minimizamos los tiempos de inactividad y garantizamos una
              reparación eficiente.
            </span>
          </div>
          <p>
            Confiá en CLL Equipamientos para todas tus necesidades de reparación
            y mantenimiento. Nuestro equipo está listo para mantener tus equipos
            en las mejores condiciones y asegurar el correcto funcionamiento de
            tu negocio.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Reparacion
