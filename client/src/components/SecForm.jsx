import '../css/home.css';

const SecForm = () => {
  const to = 'walterdcorrea@gmail.com';
  const subject = encodeURIComponent('Consulta desde la web');
  const body = encodeURIComponent(
    'Hola CLL,\n\nQuiero consultar por equipamientos de refrigeración.\n\nGracias.'
  );
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;

  const telefonos = [
    { nombre: 'Walter Correa', tel: '11-2154-4111' },
    { nombre: 'Gustavo Ledesma', tel: '11-5806-9162' },
    { nombre: 'Claudio Ledesma', tel: '11-2756-5557' },
  ];

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
              <i className="fa-regular fa-envelope"></i> {to}
            </p>
          </div>

          <div className="contacto-tel">
            <h3 className="contacto-tel-title">
              <i className="fa-solid fa-phone"></i> Teléfonos
            </h3>
            <ul>
              {telefonos.map((t) => (
                <li key={t.tel}>
                  <span className="contacto-tel-nombre">{t.nombre}</span>
                  <a href={`https://wa.me/54911${t.tel.replace(/\D/g, '').slice(2)}`}
                     target="_blank" rel="noopener noreferrer" className="contacto-tel-num">
                    <i className="fa-brands fa-whatsapp"></i> {t.tel}
                  </a>
                </li>
              ))}
            </ul>
            <p className="contacto-dir">
              <i className="fa-solid fa-location-dot"></i>
              Martín Rodríguez 2875 · (1644) Victoria, Buenos Aires
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecForm;
