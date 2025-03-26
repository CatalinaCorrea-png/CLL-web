import '../css/botonTrazo.css'

const BotonTrazo = ({texto}) => {
  return (
    <button id='botonTrazo'> {texto}
      <span></span>
    </button>
  )
}

export default BotonTrazo