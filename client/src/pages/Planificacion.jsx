import { useEffect } from 'react'
import Configurador from '../configurador/Configurador'

// Página del configurador 3D. Se carga con React.lazy desde AppRouter,
// así three.js y sus librerías quedan en un chunk aparte y solo se bajan en /planificacion.
const Planificacion = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className='planificacion'>
      <header className='page-hero'>
        <div className='container-narrow'>
          <span className='eyebrow'>Planificación</span>
          <h1 className='section-title on-deep'>Planificador en construcción</h1>
          <p className='section-lead on-deep'>
            Prototipo: mové el largo y girá la vista para ver el equipo en 3D.
          </p>
        </div>
      </header>

      <section className='section-pad'>
        <div className='container-narrow'>
          <Configurador />
        </div>
      </section>
    </div>
  )
}

export default Planificacion
