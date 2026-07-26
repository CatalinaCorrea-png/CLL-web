import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container } from 'react-bootstrap';
import logo from '../assets/CLL.png';
import '../css/header.css';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/fabricacion', label: 'Fabricación' },
  { to: '/reparacion', label: 'Reparación' },
  { to: '/servicios', label: 'Servicios' },
];

export const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const close = () => setExpanded(false);

  return (
    <BSNavbar
      expand="md"
      expanded={expanded}
      onToggle={setExpanded}
      sticky="top"
      className="navbar-container poppins-regular"
    >
      <Container fluid className="navbar-inner">
        <BSNavbar.Brand as={Link} to="/" className="logo-container" onClick={close}>
          <img src={logo} alt="Logo de CLL" className="logoCLL" />
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="main-nav" className="navbar-toggler">
          <i className="fa-solid fa-bars"></i>
        </BSNavbar.Toggle>

        <BSNavbar.Collapse id="main-nav">
          <Nav className="ms-auto navbar-links">
            {links.map((l) => (
              <Nav.Link
                key={l.to}
                as={NavLink}
                to={l.to}
                end={l.end}
                onClick={close}
                className="nav-link-cll"
              >
                {l.label}
              </Nav.Link>
            ))}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};
