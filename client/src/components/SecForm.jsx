import '../css/home.css';
import { MAIL_CONTACTO, DIRECCION, TELEFONOS, linkWhatsApp, linkGmail } from '../constants';

const SecForm = () => {
  const gmail = linkGmail(
    'Consulta desde la web',
    'Hola CLL,\n\nQuiero consultar por equipamientos de refrigeración.\n\nGracias.'
  );

  return (
    <section className="section-pad seccion-form">
      <div className="container-narrow">
        <div className="ice-card contacto-card">
          <div className="contacto-info">
            <span className="eyebrow">Contacto</span>
            <h2 className="section-title">¿Necesitás equipamiento frío?</h2>
            <p className="contacto-lead">
              Escribinos y te asesoramos sobre fabricación, reparación o
              service de tus equipos.
            </p>

            <a href={gmail} target="_blank" rel="noopener noreferrer" className="btn-ice">
              <i className="fa-regular fa-envelope"></i> Enviar correo
            </a>

            <p className="contacto-mail">
              <i className="fa-regular fa-envelope"></i> {MAIL_CONTACTO}
            </p>
          </div>

          <div className="contacto-tel">
            <h3 className="contacto-tel-title">
              <i className="fa-solid fa-phone"></i> Teléfonos
            </h3>
            <ul>
              {TELEFONOS.map((t) => (
                <li key={t.tel}>
                  <span className="contacto-tel-nombre">{t.nombre}</span>
                  <a href={linkWhatsApp(t.tel)}
                     target="_blank" rel="noopener noreferrer" className="contacto-tel-num">
                    <i className="fa-brands fa-whatsapp"></i> {t.tel}
                  </a>
                </li>
              ))}
            </ul>
            <p className="contacto-dir">
              <i className="fa-solid fa-location-dot"></i>
              {DIRECCION}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecForm;
