import '../css/home.css'

const SecContacto = () => {
  return (
    <>
        <section className="seccion seccion-contacto container-fluid text-center">
          <h1 className='titulo-oscuro'>o Envianos un mensaje por Whatsapp</h1>
          <div className='columnas-2'>
            <div className='texto-contacto text-center'>
              <h5>Contactate con cualquiera de nosotros:</h5>
              <ul className='lista-telefonos container-fluid'>
                <li>Walter Correa: +54 9 11-2154-4111</li>
                <li>Gustavo Ledesma: +54 9 11-5806-9162</li>
                <li>Claudio Ledesma: +54 9 11-2756-5557</li>
              </ul>  
            </div>
            {/* <div className='container-wpp'>
              <p className='m-0'>o Clickeá acá</p>
              <a
                href="https://wa.me/5491121544111?text=Hola%20quiero%20consultar%20por%20equipamientos%20de%20refrigeracion"
                target="_blank"
                rel="noopener noreferrer"
                className='link-wpp'
              >
                <i className="fa-brands fa-whatsapp" alt="WhatsApp"></i>
              </a>
              <p className='m-0'>[ Este link te redirecciona a Whatsapp???? ]</p>  
            </div> */}
          </div>
        </section>
        </>
  )
}

export default SecContacto