import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logo from '../assets/CLL.png';
import '../css/header.css';

export const CollapsibleExample = () => {
  return (
    <Navbar collapseOnSelect expand="lg" className="navbar-container poppins-regular">
      <Container fluid>
        <Navbar.Brand href="/" className='logo-container'>
            <img src={logo} alt="Logo de CLL" className='logoCLL col'/>
        </Navbar.Brand>
        {/* <Navbar.Toggle aria-controls="responsive-navbar-nav" className='toggler-icon'/> */}
        <button aria-controls="responsive-navbar-nav" type="button" aria-label="Toggle navigation" className="toggler-icon navbar-toggler" data-bs-toggle="collapse" data-bs-target="#responsive-navbar-nav" aria-expanded="false">
          <i className="fa-solid fa-bars navbar-toggler-icon"></i>
        </button>
        <Navbar.Collapse className="collapse navbar-collapse" id="responsive-navbar-nav">
          <Nav className="me-auto">
          </Nav>
          <Nav>
            <Nav.Link href="#features">INICIO</Nav.Link>
            <NavDropdown title="FABRICACION" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="REPARACION" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#features">OBRAS</Nav.Link><Nav.Link href="#features">SERVICIOS</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
