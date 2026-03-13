import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUtensils, FaSignOutAlt, FaUser,} from 'react-icons/fa';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-3 mb-4">
      <Container>
        <Navbar.Brand as={Link} to={isAuthenticated ? "/dashboard" : "/"} className="d-flex align-items-center fw-bold text-success">
          <FaUtensils className="me-2" />
          ShareBite
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/profile" className="mx-2">
                  <FaUser className="me-1" /> Profile
                </Nav.Link>
                <Button variant="outline-danger" size="sm" onClick={handleLogout} className="ms-2">
                  <FaSignOutAlt className="me-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="mx-2">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="mx-2">
                  <Button variant="success" size="sm" className="px-4">Register</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
