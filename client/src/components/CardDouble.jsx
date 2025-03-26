import '../css/cardDouble.css'

const CardDouble = ({image1, image2}) => {
  return (
    <div className="card-double">
      <div className="first-content">
        <span><img className='imagen-producto-img' src={image1} alt="" /></span>
      </div>
      <div className="second-content">
        <span><img className='imagen-producto-img' src={image2} alt="" /></span>
      </div>
    </div>
  )
}

export default CardDouble