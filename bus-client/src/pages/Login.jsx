import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for booking-related messages from URL params
  useEffect(() => {
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
      setIsError(false);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Check for intended booking URL or return URL
      const returnUrl = searchParams.get('returnUrl') || localStorage.getItem('intendedBooking');
      
      if (returnUrl && result.user?.role === 'USER') {
        // Clear stored booking URL
        localStorage.removeItem('intendedBooking');
        navigate(returnUrl);
      } else {
        // Navigate based on user role
        if (result.user?.role === 'ADMIN') {
          navigate('/admin/panel');
        } else {
          navigate('/user/dashboard');
        }
      }
    } else {
      setMessage(result.message || 'Login failed');
      setIsError(true);
    }
    
    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <Card>
            <Card.Header className="text-center">
              <h3>Login</h3>
              <p className="text-muted">Sign in to your account</p>
            </Card.Header>
            <Card.Body>
              {message && (
                <Alert variant={isError ? 'danger' : 'info'}>
                  {message}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center">
                <p className="text-muted">Don't have an account?</p>
                <Link to="/register" className="text-decoration-none">
                  <Button variant="outline-primary">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Login;
