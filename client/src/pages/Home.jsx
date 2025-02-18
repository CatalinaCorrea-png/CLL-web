import CarouselFade from "../components/Carousel"
import SecAbout from "../components/SecAbout"
import SecTrabajos from "../components/SecTrabajos"
import '../css/home.css';

const Home = () => {
  return (
    <>
      <section className="carrusel container-fluid p-0">
        <CarouselFade />
      </section>
      <SecAbout />
      <SecTrabajos />
      <section className="container-fluid seccion seccion-about">
        <div>
        Envianos tu consulta por email o a través del formulario de contacto
        </div>
      </section>
      <section className="container-fluid">
        <div>
          Contanto
        </div>
      </section>
    </>
  )
}

export default Home