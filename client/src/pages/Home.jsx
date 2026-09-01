import { useEffect } from "react";
import CarouselFade from "../components/Carousel";
import SecAbout from "../components/SecAbout";
import SecForm from "../components/SecForm";
import SecTrabajos from "../components/SecTrabajos";
import SecDestacados from "../components/SecDestacados";
import '../css/home.css';

const Home = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <CarouselFade />
      <SecAbout />
      <SecTrabajos />
      <SecDestacados />
      <SecForm />
    </>
  );
};

export default Home;
