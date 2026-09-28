import '../css/home.css'
import { TELEFONOS } from '../constants'

const SecContacto = () => {
  return (
    <>
        <section className="seccion seccion-contacto container-fluid text-center">
          <h1 className='titulo-oscuro'>o Envianos un mensaje por Whatsapp</h1>
          <div className='columnas-2'>
            <div className='texto-contacto text-center'>
              <h5>Contactate con cualquiera de nosotros:</h5>
              <ul className='lista-telefonos container-fluid'>
                {TELEFONOS.map((t) => (
                  <li key={t.tel}>{t.nombre}: +54 9 {t.tel}</li>
                ))}
              </ul>
            </div>
            {/* <div className='container-wpp'>
              <p className='m-0'>o Clickeá acá</p>
              <a
                href={linkWhatsApp(TELEFONOS[0].tel, 'Hola quiero consultar por equipamientos de refrigeracion')}
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