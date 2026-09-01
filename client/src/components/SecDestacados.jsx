import '../css/home.css';
import { Link } from 'react-router-dom';
import BeforeAfter from './BeforeAfter';

const SecDestacados = () => {
  return (
    <section className="section-pad seccion-destacados">
      <div className="container-narrow">
        <header className="sec-head">
          <span className="eyebrow">Trabajos destacados</span>
          <h2 className="section-title">Algunos de nuestros trabajos</h2>
          <p className="section-lead">
            Una muestra de lo que hacemos: cerramientos que transforman equipos
            existentes y fabricación a medida.
          </p>
        </header>

        <div className="destacados-grid">
          {/* --- Cerramiento: antes y después --- */}
          <article className="ice-card destacado destacado-ba">
            <div className="destacado-media">
              <BeforeAfter
                img1="/cerramiento2.jpeg"
                img2="/cerramiento4.jpeg"
                alt1="Isla de lácteos abierta, sin cerramiento, antes de la intervención"
                alt2="La misma isla de lácteos cerrada con puertas corredizas de vidrio"
                aditionalClasses="destacado-before-after"
              />

              <div className="destacado-proceso">
                <span className="proceso-label">
                  <i className="fa-solid fa-camera"></i> El proceso
                </span>
                <div className="proceso-thumbs">
                  <figure className="proceso-item">
                    <img
                      src="/cerramiento1.jpeg"
                      alt="La isla de lácteos abierta antes del trabajo, vista desde el pasillo"
                      loading="lazy"
                    />
                    <figcaption>El equipo original, abierto</figcaption>
                  </figure>
                  <figure className="proceso-item">
                    <img
                      src="/cerramiento3.jpeg"
                      alt="Montaje del cerramiento: colocación de los vidrios sobre la isla"
                      loading="lazy"
                    />
                    <figcaption>Cerramiento en montaje</figcaption>
                  </figure>
                  <figure className="proceso-item">
                    <img
                      src="/cerramiento5.jpeg"
                      alt="Cerramiento superior terminado, con paños de vidrio laminado fijo sobre la isla"
                      loading="lazy"
                    />
                    <figcaption>Vidrio laminado de 4+4 fijo</figcaption>
                  </figure>
                </div>
              </div>
            </div>

            <div className="destacado-body">
              <span className="destacado-tag">
                <i className="fa-solid fa-gear"></i> Servicios · Cerramientos
              </span>
              <h3 className="destacado-titulo">
                Cerramiento de isla con puertas corredizas
              </h3>
              <p className="destacado-desc">
                Convertimos una isla de lácteos abierta en un equipo cerrado con
                puertas corredizas de vidrio. Menor consumo, temperatura estable
                y la misma exhibición de siempre.
              </p>
              <Link to="/servicios" className="destacado-cta">
                Ver servicios <i className="fa-solid fa-arrow-right-long"></i>
              </Link>
            </div>
          </article>

          {/* --- Fabricación --- */}
          <article className="ice-card destacado destacado-fab">
            <div className="destacado-media">
              <div className="destacado-frame">
                <img
                  src="/camaras/wic-1.webp"
                  alt="Cámara Walk In Cooler con frente de puertas de vidrio iluminadas"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="destacado-body">
              <span className="destacado-tag">
                <i className="fa-solid fa-snowflake"></i> Fabricación
              </span>
              <h3 className="destacado-titulo">
                Cámara Walk In Cooler a medida
              </h3>
              <p className="destacado-desc">
                Cámara frigorífica con frente de puertas de vidrio e iluminación
                interior, fabricada según el espacio y las necesidades del
                cliente.
              </p>
              <Link to="/fabricacion#camaras" className="destacado-cta">
                Ver fabricación <i className="fa-solid fa-arrow-right-long"></i>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default SecDestacados;
