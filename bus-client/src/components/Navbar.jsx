import React from 'react';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="shadow">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold">
          🚌 Bus Booking System
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {currentUser && currentUser.role === 'USER' && (
              <>
                <Nav.Link as={Link} to="/user/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/buses">Browse Buses</Nav.Link>
              </>
            )}
            
            {currentUser && currentUser.role === 'ADMIN' && (
              <>
                <Nav.Link as={Link} to="/admin/panel">Admin Panel</Nav.Link>
                <Nav.Link as={Link} to="/admin/add-bus">Add Bus</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {currentUser ? (
              <>
                <Nav.Link disabled className="text-light">
                  Welcome, {currentUser.username} ({currentUser.role})
                </Nav.Link>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ms-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
