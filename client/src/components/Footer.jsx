import '../css/footer.css'
import { Link } from "react-router-dom";
import logo from '../assets/CLL.png';

const enlaces = [
  { to: '/', label: 'Inicio' },
  { to: '/fabricacion', label: 'Fabricación' },
  { to: '/reparacion', label: 'Reparación' },
  { to: '/servicios', label: 'Servicios' },
];

const telefonos = [
  { nombre: 'Walter Correa', tel: '11-2154-4111' },
  { nombre: 'Gustavo Ledesma', tel: '11-5806-9162' },
  { nombre: 'Claudio Ledesma', tel: '11-2756-5557' },
];

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='container-narrow footer-grid'>

        <div className='footer-col footer-brand'>
          <img src={logo} alt="CLL" className='footer-logo' />
          <p>
            Fabricación y reparación de heladeras y cámaras frigoríficas
            comerciales. Más de 30 años brindando soluciones integrales de
            equipamiento de calidad.
          </p>
        </div>

        <div className='footer-col'>
          <h5>Enlaces</h5>
          <ul className='footer-links'>
            {enlaces.map((e) => (
              <li key={e.to}>
                <Link className='footer-link' to={e.to}>{e.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className='footer-col'>
          <h5>Contacto</h5>
          <p className='footer-line'>
            <i className="fa-solid fa-location-dot"></i>
            Martín Rodríguez 2875 · (1644) Victoria, Buenos Aires
          </p>
          <p className='footer-line'>
            <i className="fa-regular fa-envelope"></i>
            walterdcorrea@gmail.com
          </p>
          <ul className='footer-tels'>
            {telefonos.map((t) => (
              <li key={t.tel}>
                <a
                  href={`https://wa.me/54911${t.tel.replace(/\D/g, '').slice(2)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>{t.nombre}: {t.tel}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='footer-bottom'>
        <div className='container-narrow footer-bottom-inner'>
          <span>© {new Date().getFullYear()} CLL Equipamientos</span>
          <span className='footer-bottom-tag'>
            <i className="fa-solid fa-snowflake"></i> Heladeras comerciales
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
