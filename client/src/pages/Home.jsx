import CarouselFade from "../components/Carousel"
import SecAbout from "../components/SecAbout"

const Home = () => {
  return (
    <>
      <section className="carrusel container-fluid p-0">
        <CarouselFade />
      </section>
      <SecAbout />
      <section className="container-fluid">
        <div>
          Que realizamos / Servicios
        </div>
      </section>
      <section className="container-fluid">
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