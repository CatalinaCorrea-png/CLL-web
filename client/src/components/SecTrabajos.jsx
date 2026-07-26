import '../css/home.css';
import { Link } from 'react-router-dom';

const trabajos = [
  {
    icon: 'fa-snowflake',
    titulo: 'Fabricación',
    to: '/fabricacion',
    descripcion: 'Equipos a medida para almacenes, supermercados y comercios.',
    links: [
      { label: 'Murales', to: '/fabricacion#murales' },
      { label: 'Bateas', to: '/fabricacion#bateas' },
      { label: 'Exhibidoras', to: '/fabricacion#exhibidoras' },
      { label: 'Congelados', to: '/fabricacion#congelados' },
      { label: 'Cámaras y WIK', to: '/fabricacion#camaras' },
      { label: 'Usadas reacondicionadas', to: '/fabricacion#usadas' },
    ],
  },
  {
    icon: 'fa-screwdriver-wrench',
    titulo: 'Reparación',
    to: '/reparacion',
    descripcion: 'Recuperamos tus equipos y los dejamos como nuevos.',
    links: [
      { label: 'Antes y después', to: '/reparacion' },
      { label: 'Cambio de pintura', to: '/reparacion' },
    ],
  },
  {
    icon: 'fa-gear',
    titulo: 'Servicios',
    to: '/servicios',
    descripcion: 'Cerramientos y mejoras para optimizar el consumo del frío.',
    links: [
      { label: 'Cerramientos con puertas de vidrio', to: '/servicios' },
      { label: 'Cerramientos de bateas con vidrio curvo', to: '/servicios' },
    ],
  },
];

const SecTrabajos = () => {
  return (
    <section className="section-pad seccion-trabajos">
      <div className="container-narrow">
        <header className="sec-head">
          <span className="eyebrow">Nuestro trabajo</span>
          <h2 className="section-title on-deep">Lo que realizamos</h2>
          <p className="section-lead on-deep">
            Todo el ciclo del frío comercial, de la fabricación a medida al
            mantenimiento de tus equipos.
          </p>
        </header>

        <div className="trabajos-grid">
          {trabajos.map((t) => (
            <article className="ice-card trabajo-card" key={t.titulo}>
              <div className="trabajo-icon">
                <i className={`fa-solid ${t.icon}`}></i>
              </div>
              <h3 className="trabajo-titulo">{t.titulo}</h3>
              <p className="trabajo-desc">{t.descripcion}</p>

              <ul className="trabajo-links">
                {t.links.map((l, i) => (
                  <li key={i}>
                    <Link to={l.to}>
                      <i className="fa-solid fa-angle-right"></i>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link to={t.to} className="trabajo-cta">
                Ver más <i className="fa-solid fa-arrow-right-long"></i>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecTrabajos;
