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
                <li>Walter Correa: 11-2154-4111</li>
                <li>Gustavo Ledesma: 11-5806-9162</li>
                <li>Claudio Ledesma: 11-2756-5557</li>
              </ul>  
            </div>
            <div className='container-wpp'>
              <p className='m-0'>o Clickeá acá</p>
              <a className='link-wpp' href=""><i className="fa-brands fa-whatsapp"></i></a>
              <p className='m-0'>[ Este link te redirecciona a Whatsapp???? ]</p>  
            </div>
          </div>
        </section>
        </>
  )
}

export default SecContacto