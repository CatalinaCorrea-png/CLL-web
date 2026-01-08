import '../css/beforeAfter.css'

const BeforeAfter = ({img1, img2, alt1, alt2, aditionalClasses}) => {
  return (
    <div className={`imagenes-container ${aditionalClasses}`}>
      <div className="imagen-container">
        <img src={img1} alt={alt1} className="cerramiento-img"/>
      </div>
      <i className="fa-solid fa-angles-right"></i>
      <div className='imagen-container'>
        <img src={img2} alt={alt2} className="cerramiento-img"/>
      </div>
    </div>
  )
}

export default BeforeAfter