import '../css/home.css';
import img from '../assets/img-nosotros.jpg';

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
          <p>Nuestra empresa cuenta con mas de 30 años de experiencia en instalaciones para almacenes, supermercados y comercios. Brindamos también asesoramiento respaldado por proyectos de diseño exclusivos para cada necesidad.</p>
          <p>Nuestra mision es la de brindar soluciones integrales a las necesidades de equipamiento e instalación que nuestros clientes requieran ofreciendo un servicio de altqa calidad de producto, asesoramiento y logística.</p>    
        </div>
      </div>
    </section>
    </>
  )
}

export default SecAbout