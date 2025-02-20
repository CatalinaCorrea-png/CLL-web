import '../css/header.css';
import logo from '../assets/CLL.png';
import { Link } from 'react-router-dom';
import { useState } from 'react';


export const Navbar = () => {
  const [fabricbool, setFabricbool] = useState(false);
  const [repbool, setRepbool] = useState(false);
  // console.log(repbool);
  // console.log(fabricbool);

  const toggleFabric = () => {
    setRepbool(false);
    setFabricbool(!fabricbool);
    // console.log(fabricbool);
  }

  const toggleRep = () => {
    setFabricbool(false);
    setRepbool(!repbool);
    // console.log(repbool);
  }
  
  const closeNavs = () => {
    setFabricbool(false);
    setRepbool(false);
    // console.log(fabricbool);
    // console.log(repbool);
  }
  const links = document.querySelectorAll(".react-link");
  links.forEach((link) => link.addEventListener('click', closeNavs));

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-container poppins-regular">
        <div className="container-fluid">
          <Link className="navbar-brand logo-container" to="/"><img src={logo} alt="Logo de CLL" className='logoCLL'/></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <i className="fa-solid fa-bars navbar-toggler-icon"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <div className="me-auto navbar-nav"></div>
            <div className="navbar-nav">
              <Link className="nav-link react-link" aria-current="page" to='/'>INICIO</Link>

              <a className="nav-link dropdown-toggle" 
              href="#" role="button"  
              onClick={toggleFabric}
              >
                FABRICACION
              </a>

              <a className="nav-link dropdown-toggle" 
              href="#" role="button" 
              onClick={toggleRep}
              >
                REPARACION
              </a>

              <Link className="nav-link react-link" to="/obras">OBRAS</Link>
              <Link className="nav-link react-link" to="/servicios">SERVICIOS</Link>
            </div>
          </div>
          
        </div>
      </nav>

      <div className={`navbar navbar-expand-sm navbar-container navbar-container-sec poppins-regular ${fabricbool ? "showNav" : "hiddenNav"}`} id='fabricacionnav'>
        <div className="container-fluid container-sec text-center">
          <Link className="nav-link disabled poppins-bold-italic" to="/fabricacion">FABRICACION :</Link>
          <div className="navbar-nav container-fluid row-cols-3">
            <Link className="nav-link col link-todo react-link" to="/fabricacion">TODO</Link>
            <Link className="nav-link col react-link" to="/fabricacion/murales">MURALES</Link>
            <Link className="nav-link col react-link" to="/fabricacion/bateas">BATEAS</Link>
            <Link className="nav-link col react-link" to="/fabricacion/exhibidoras">EXHIBIDORAS</Link>
            <Link className="nav-link col react-link" to="/fabricacion/congelados">CONGELADOS</Link>
            <Link className="nav-link col react-link" to="/fabricacion/camaras">CAMARAS Y WALK IN COOLER</Link>
            <Link className="nav-link col react-link" to="/fabricacion/vitrinas">VITRINAS</Link>
            <Link className="nav-link col react-link" to="/fabricacion/usadas">USADAS REACONDICIONADAS</Link>
          </div>
        </div>
      </div>

      <div className={`navbar navbar-expand-sm navbar-container navbar-container-sec poppins-regular ${repbool ? "showNav" : "hiddenNav"}`}  id='reparacionesnav' >
        <div className="container-fluid container-sec text-center">
          <a className="nav-link disabled poppins-bold-italic row" href="#">REPARACION :</a>
          <div className="navbar-nav container-fluid row-cols-3">
            <Link className="nav-link col link-todo react-link" to="/reparacion">TODO</Link>
            <Link className="nav-link col react-link" to="/reparacion/antesydespues">ANTES Y DESPUES</Link>
            <Link className="nav-link col react-link" to="/reparacion/cerramientos">CERRAMIENTOS CON PUERTAS DE VIDRIO</Link>
          </div>
        </div>
      </div>

  </>
  )
}
