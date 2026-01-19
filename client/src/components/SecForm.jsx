import { useState } from 'react'
import '../css/home.css'

const SecForm = () => {

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const to = "walterdcorrea@gmail.com";
  const subject = encodeURIComponent("Consulta desde la web");
  const body = encodeURIComponent(
    "Hola CLL,\n\nQuiero consultar por equipamientos de refrigeración.\n\nGracias."
  );

  return (
    <>
        <section className="seccion seccion-form container-fluid text-center">
          <h1 className='titulo-claro'>CONTACTATE CON NOSOTROS</h1>
          <div className='columnas-2'>
            <div className='container-icon'>
              <p className='texto-form'>Envianos un correo electrónico</p>
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`}
                target="_blank"
                rel="noopener noreferrer"
                className='link-gmail'
              >
                <i className="fa-regular fa-envelope"></i>
                <p className='texto-form'>walterdcorrea@gmail.com</p>
                {/* <img src="/gmail-icon.png" alt="Email" /> */}
              </a>
              {/* <a className='link-wpp'
              href={`mailto:walterdcorrea@gmail.com?subject=${subject}&body=${body}`}
              >
              </a> */}
            </div>
            
            {/* <div className="form-contact" data-aos="fade-right" data-aos-delay="40">
              <form className="container-sm">
                
                <div className="row">
                  <div className="form-input col">
                    <label>Nombre:</label>
                    <input
                      id=""
                      placeholder="Su nombre"
                      type="text"
                      // required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />  
                  </div>
                  <div className="form-input col">
                    <label>Apellido:</label>
                    <input
                      id=""
                      placeholder="Su apellido"
                      type="text"
                      // required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                    />  
                  </div>
                </div>

                <div className="form-input row">
                  <label>Email:</label>
                  <input
                    id=""
                    placeholder="Email"
                    type="text"
                    // required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-input row">
                  <label>Mensaje:</label>
                  <input
                    id=""
                    placeholder="Escriba su mensaje..."
                    as="textarea"
                    // required
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                  />
                </div>

                <div className="row-sm">
                  <button type="submit" className="btn-form-contact">
                    ENVIAR
                  </button>
                </div>

              </form>
            </div> */}
            
          </div>
        </section>
        </>
  )
}

export default SecForm
