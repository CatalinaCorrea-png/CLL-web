import '../css/home.css';
import img from '../assets/logo.png';

const SecAbout = () => {
  return (
    <>
    <section className="seccion seccion-about container-fluid text-center">
      <h1 className='titulo-oscuro'>ACERCA DE NOSOTROS</h1>
      <div className='columnas-2'>
        <div className='container-img'>
          <img src={img} alt="" className='imagen-nosotros' />
        </div>
        <div className='texto-nosotros text-center'>
          <p>Nos dedicamos a la fabricación y reparación de heladeras y cámaras frigoríficas comerciales. Con experiencia en el rubro, trabajando con empresas líderes por más de 20 años.</p>
          <p>Nuestro objetivo es brindar soluciones integrales de equipamiento de calidad a bajo costo.</p>    
        </div>
      </div>
    </section>
    </>
  )
}

export default SecAbout