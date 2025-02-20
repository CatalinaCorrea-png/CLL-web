import { useEffect } from "react";
import CarouselFade from "../components/Carousel"
import SecAbout from "../components/SecAbout"
import SecContacto from "../components/SecContacto";
import SecForm from "../components/SecForm";
import SecTrabajos from "../components/SecTrabajos"
import '../css/home.css';

const Home = () => {
  useEffect(() => window.scrollTo(0, 0),[]);
  return (
    <>
      <section className="carrusel container-fluid p-0">
        <CarouselFade />
      </section>
      <SecAbout />
      <SecTrabajos />
      <SecForm />
      <SecContacto />
    </>
  )
}

export default Home