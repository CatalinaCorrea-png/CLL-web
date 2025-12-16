import ReactDOM from "react-dom";
import '../css/modal.css';

const DetallesModal = ({ isOpen, onClose, detalles, imagen, mensajeError }) => {
  if (!isOpen) return null;

  // console.log(!detalles);
  // console.log(mensajeError);
  // console.log(Object.keys(detalles)[0].toUpperCase());

  return ReactDOM.createPortal(
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-detalles' onClick={(e) => e.stopPropagation()}>
      <button className="btn-indigo btn-close-modal poppins-semibold" onClick={onClose}>X</button>
        {!detalles ? (
          <div className="error-detalles poppins-semibold">
            <h4>Ups!</h4>
            <p>{mensajeError}</p>
          </div>
        ) : (
          <>
            <div className="titulo-detalle">
              <img src={imagen} alt="" className="imagen-detalle" />
              <h1 className="poppins-regular m-0">DETALLES TECNICOS</h1>
            </div>
            <ul className='lista-detalles poppins-semibold'>
            {detalles.detallesTecnicos?.map((item, index) => (
              <li key={index}>
                {item.includes("Cúpulas de vidrio") ? (
                  <>
                    {item} <div className='dvh-link tooltip-dvh'> DVH
                      <span className="texto-dhv tooltiptext-dvh">El doble vidriado hermético (DVH) es un aislante térmico y acústico transparente constituido por dos hojas de float, separadas entre sí por una cámara de aire deshidratado.</span>
                    </div>
                    
                  </>
                ) : (
                  item
                )}
              </li>
            ))}
            </ul>

            <div className="titulo-detalle">
              <img src={imagen} alt="" className="imagen-detalle" />
              <h1 className="poppins-regular m-0">DETALLES DIFERENCIALES</h1>
            </div>
            <ul className='lista-detalles poppins-semibold'>
              {detalles.detallesDiferenciales?.map((item, index) => (
                <li key={index}>
                  {item}
                </li>
              ))}
            </ul>
            <div className="colores-container poppins-semibold">
              <h4>Colores</h4>
              <ul className="lista-colores">
                {colores.map((item, index) => (
                  <li key={index}>
                    {Object.keys(item).includes("Opcional") ? (
                      <>
                      <div className="color" style={{backgroundColor:"ghostwhite"}}></div>
                      <span className="color-text">
                        {Object.keys(item).toString().toUpperCase()}: {Object.values(item)}
                      </span>
                      </>
                    ) : (
                      <>
                      <div className="color" style={{backgroundColor: Object.values(item)}}></div>
                      <span className="color-text">
                        {Object.keys(item).toString().toUpperCase()}
                      </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            </>
            )}

      </div>
    </div>,
    document.getElementById("modal-root") // Se renderiza fuera del root principal, en modal-root
  );
}

export default DetallesModal;

// e.stopPropagation(): se usa para detener la propagación del evento de clic desde el div.modal hacia su contenedor padre (div.modal-overlay).
// Si no usas e.stopPropagation(), al hacer clic dentro del modal también se activará el evento onClick del modal-overlay, lo que cerraría el modal de inmediato.

// Desventaja de este modal: Requiere un <div id="modal-root"></div> en el index.html.

const colores = [
    {"plata": "#DEDEDE"},
    {"oro": "#C4B98A"},
    {"amarillo": "#FFCC00"},
    {"verde Tel": "#EAFF66"},
    {"verde Ral": "#4EA300"},
    {"naranja": "#FF8800"},
    {"rojo": "#FF0000"},
    {"rojo Bermellon": "#B80000"},
    {"rosa": "#FFCFEB"},
    {"magenta": "#FF37CD"},
    {"lila": "#F7CFFF"},
    {"violeta": "#7F0098"},
    {"celeste": "#DCFFFE"},
    {"azul": "#0082DD"},
    {"Opcional": "Pintura bicapa metalizada."}
]