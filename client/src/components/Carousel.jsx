import Carousel from 'react-bootstrap/Carousel';
import img1 from '../assets/IMG-20210531-WA0020.jpg';
import img2 from '../assets/IMG-20190802-WA0045.jpg';
import img3 from '../assets/IMG-20230515-WA0020.jpg';
import '../css/carousel.css';

function Caption() {
  return (
    <div className='container-fluid container-text'>
      <h1 className="carousel-h1">CLL</h1>
      <h1 className="carousel-h1">HELADERAS COMERCIALES</h1>
      <p className="carousel-p">Más de 30 años de experiencia en instalaciones para almacenes, supermercados y comercios.</p>
    </div>
  )
}

function CarouselFade() {
  return (
    <section className="container-fluid p-0">
    <Carousel fade className='carousel-container p-0'>
      <Carousel.Item>
        <img src={img1} alt="" className="carousel-image"/>
        <Carousel.Caption className="carousel-text">
          <Caption />
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img src={img2} alt="" className="carousel-image"/>        
        <Carousel.Caption className="carousel-text">
          <Caption />
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img src={img3} alt="" className="carousel-image"/>        
        <Carousel.Caption className="carousel-text">
          <Caption />
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
    </section>
  );
}

export default CarouselFade;