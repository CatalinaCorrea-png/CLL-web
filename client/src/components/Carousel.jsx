import Carousel from 'react-bootstrap/Carousel';
import { Link } from 'react-router-dom';
import img1 from '../assets/IMG-20210531-WA0020-2.jpeg';
import img2 from '../assets/IMG-20190802-WA0045.jpg';
import img3 from '../assets/IMG-20230515-WA0020.jpg';
import img4 from '/DSC_7088_th.jpg';
import img5 from '/DSC_7116_th.jpg';
import '../css/carousel.css';

const slides = [img1, img2, img3, img4, img5];

function CarouselFade() {
  return (
    <section className="hero">
      <Carousel fade controls={false} indicators={false} interval={5000} pause={false} className="hero-carousel">
        {slides.map((src, i) => (
          <Carousel.Item key={i}>
            <img src={src} alt="" className="hero-image" />
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Capa de degradado frío + contenido fijo sobre el carrusel */}
      <div className="hero-overlay"></div>

      <div className="hero-content container-narrow">
        <span className="eyebrow">Equipamiento de refrigeración comercial</span>
        <h1 className="hero-title">
          Heladeras y cámaras frigoríficas
          <br />
          <span className="hero-title-accent">hechas para durar</span>
        </h1>
        <p className="hero-sub">
          Más de 30 años fabricando y reparando equipamiento frío para
          supermercados, carnicerías y comercios.
        </p>
        <div className="hero-actions">
          <Link to="/fabricacion" className="btn-ice solid-light">
            Ver fabricación
          </Link>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=walterdcorrea@gmail.com&su=Consulta%20desde%20la%20web"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ice on-deep"
          >
            <i className="fa-regular fa-envelope"></i> Contactar
          </a>
        </div>

        <ul className="hero-stats">
          <li><strong>+30</strong><span>años de experiencia</span></li>
          <li><strong>100%</strong><span>fabricación propia</span></li>
          <li><strong>Service</strong><span>reparación post-venta</span></li>
        </ul>
      </div>

      <div className="hero-frost-edge" aria-hidden="true"></div>
    </section>
  );
}

export default CarouselFade;
