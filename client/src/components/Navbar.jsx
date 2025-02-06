import '../css/header.css';
import logo from '../assets/CLL.png';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';


export const Navbar = () => {
  const [fabricbool, setFabricbool] = useState(false);
  const [repbool, setRepbool] = useState(false);

  // const changeRepbool = () => {
  //   setFabricbool(!fabricbool);
  //   if(repbool) {
  //     setRepbool(!repbool);
  //   }
  //   console.log(repbool);
  // }
  // const changeFabricbool = () => {
  //   setRepbool(!repbool);
  //   if(fabricbool) {
  //     setFabricbool(!fabricbool);
  //   }
  //   console.log(fabricbool);
  // }

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-container poppins-regular">
        <div className="container-fluid">
          <Link className="navbar-brand logo-container" to="#"><img src={logo} alt="Logo de CLL" className='logoCLL'/></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <i className="fa-solid fa-bars navbar-toggler-icon"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <div className="me-auto navbar-nav"></div>
            <div className="navbar-nav">
              <Link className="nav-link" aria-current="page" to='/'>INICIO</Link>

              <a className="nav-link dropdown-toggle" 
              href="#" role="button" 
              data-bs-toggle="collapse"
              data-bs-target="#fabricacionnav"
              aria-controls="fabricacionnav" 
              aria-expanded={fabricbool}
              // onClick={changeRepbool}
              >
                FABRICACION
              </a>

              <a className="nav-link dropdown-toggle" 
              href="#" role="button" 
              data-bs-toggle="collapse"
              data-bs-target="#reparacionesnav"
              aria-controls="reparacionesnav" 
              aria-expanded={repbool}
              // onClick={changeFabricbool}
              >
                REPARACION
              </a>

              <Link className="nav-link" to="/obras">OBRAS</Link>
              <Link className="nav-link" to="/servicios">SERVICIOS</Link>
            </div>
          </div>
          
        </div>
      </nav>

      <div className={`navbar navbar-expand-sm navbar-container navbar-container-sec poppins-regular collapse`} id='fabricacionnav' data-bs-dismiss="reparacionesnav">
        <div className="container-fluid container-sec text-center">
            <Link className="nav-link disabled poppins-bold-italic" to="/fabricacion">FABRICACION :</Link>
            <div className="navbar-nav container-fluid row-cols-3">
              <Link className="nav-link col link-todo" to="/fabricacion">TODO</Link>
              <Link className="nav-link col" to="/fabricacion/murales">MURALES</Link>
              <Link className="nav-link col" to="/fabricacion/bateas">BATEAS</Link>
              <Link className="nav-link col" to="/fabricacion/congelados">CONGELADOS</Link>
              <Link className="nav-link col" to="/fabricacion/exhibidoras">EXHIBIDORAS</Link>
              <Link className="nav-link col" to="/fabricacion/camaras">CAMARAS Y WALK IN COOLER</Link>
              <Link className="nav-link col" to="/fabricacion/vitrinas">VITRINAS</Link>
              <Link className="nav-link col" to="/fabricacion/usadas">USADAS REACONDICIONADAS</Link>
            </div>

          
        </div>
      </div>

      <div className={`navbar navbar-expand-sm navbar-container navbar-container-sec poppins-regular collapse`} id='reparacionesnav' >
        <div className="container-fluid container-sec text-center">
          <a className="nav-link disabled poppins-bold-italic row" href="#">REPARACION :</a>
          <div className="navbar-nav container-fluid row-cols-3">
            <Link className="nav-link col link-todo" to="/reparacion">TODO</Link>
            <Link className="nav-link col" to="/reparacion/antesydespues">ANTES Y DESPUES</Link>
            <Link className="nav-link col" to="/reparacion/cerramientos">CERRAMIENTOS CON PUERTAS DE VIDRIO</Link>
          </div>
        </div>
      </div>

  </>
  )
}
