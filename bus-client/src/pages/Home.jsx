import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center display-4 text-primary">Welcome to Bus Booking System</h1>
          <p className="text-center lead">Your reliable partner for comfortable bus travel</p>
        </Col>
      </Row>

      {/* Hero Section */}
      <Row className="mb-5">
        <Col md={6}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="text-primary mb-3">🚌 Easy Bus Booking</h3>
              <p className="mb-3">Book your bus tickets quickly and easily. Choose from a wide range of destinations and comfortable buses.</p>
              <div className="d-grid gap-2">
                {currentUser ? (
                  currentUser.role === 'USER' ? (
                    <Button as={Link} to="/user/dashboard" variant="primary" size="lg">
                      Go to Dashboard
                    </Button>
                  ) : currentUser.role === 'ADMIN' ? (
                    <Button as={Link} to="/admin/panel" variant="primary" size="lg">
                      Go to Admin Panel
                    </Button>
                  ) : null
                ) : (
                  <>
                    <Button as={Link} to="/login" variant="primary" size="lg">
                      Login to Book
                    </Button>
                    <Button as={Link} to="/register" variant="outline-primary" size="lg">
                      Create Account
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="text-success mb-3">🎯 Why Choose Us?</h3>
              <ul className="list-unstyled">
                <li className="mb-2">✅ <strong>Reliable Service:</strong> On-time departures</li>
                <li className="mb-2">✅ <strong>Comfortable Buses:</strong> Modern fleet with AC</li>
                <li className="mb-2">✅ <strong>Easy Booking:</strong> Quick online reservation</li>
                <li className="mb-2">✅ <strong>Safe Travel:</strong> Experienced drivers</li>
                <li className="mb-2">✅ <strong>24/7 Support:</strong> Customer assistance</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="display-4 text-primary mb-3">🕒</div>
              <h5>Real-time Updates</h5>
              <p className="text-muted">Get live updates on bus schedules and availability</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="display-4 text-success mb-3">💳</div>
              <h5>Secure Payments</h5>
              <p className="text-muted">Safe and secure online payment options</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="display-4 text-info mb-3">📱</div>
              <h5>Mobile Friendly</h5>
              <p className="text-muted">Book tickets on any device, anywhere</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      {!currentUser && (
        <Row>
          <Col className="text-center">
            <Card className="border-primary">
              <Card.Body>
                <h4 className="text-primary">Ready to Start Your Journey?</h4>
                <p>Join thousands of satisfied customers who trust us for their travel needs.</p>
                <Button as={Link} to="/register" variant="primary" className="me-2">
                  Sign Up Now
                </Button>
                <Button as={Link} to="/login" variant="outline-primary">
                  Already Have Account?
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home;
