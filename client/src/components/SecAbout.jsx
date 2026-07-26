import '../css/home.css';
import img from '../assets/logo.png';

const SecAbout = () => {
  return (
    <section className="section-pad seccion-about">
      <div className="container-narrow about-grid">
        <div className="about-media">
          <div className="about-img-ring">
            <img src={img} alt="Logo CLL" className="about-img" />
          </div>
        </div>

        <div className="about-text">
          <span className="eyebrow">Acerca de nosotros</span>
          <h2 className="section-title">
            Soluciones integrales en equipamiento frío
          </h2>
          <p>
            Nos dedicamos a la fabricación y reparación de heladeras y cámaras
            frigoríficas comerciales. Con amplia experiencia en el rubro,
            trabajando junto a empresas líderes por más de 20 años.
          </p>
          <p>
            Nuestro objetivo es brindar soluciones integrales de equipamiento de
            calidad, a un costo accesible.
          </p>

          <div className="about-chips">
            <span className="ice-chip"><i className="fa-solid fa-snowflake"></i> Fabricación propia</span>
            <span className="ice-chip"><i className="fa-solid fa-screwdriver-wrench"></i> Reparación y service</span>
            <span className="ice-chip"><i className="fa-solid fa-award"></i> +30 años de trayectoria</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecAbout;
