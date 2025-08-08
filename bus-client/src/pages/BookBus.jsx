import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookBus = () => {
  const [bus, setBus] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const { busId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchBusDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if bus data was passed via navigation state
      if (location.state?.bus) {
        setBus(location.state.bus);
        setLoading(false);
        return;
      }
      
      // Otherwise fetch from API (for direct URL access)
      const response = await userService.getBuses();
      const busesData = Array.isArray(response.data) ? response.data : [];
      const selectedBus = busesData.find(b => b.id === parseInt(busId));
      if (selectedBus) {
        setBus(selectedBus);
      } else {
        setMessage('Bus not found');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Failed to fetch bus details');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [busId, location.state]);

  useEffect(() => {
    fetchBusDetails();
  }, [fetchBusDetails]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login?message=Please login to book this bus');
      return;
    }

    if (currentUser.role !== 'USER') {
      setMessage('Only users can book buses. Admins cannot book seats.');
      setIsError(true);
      return;
    }

    if (seatsToBook > bus.availableseats) {
      setMessage(`Only ${bus.availableseats} seats are available`);
      setIsError(true);
      return;
    }

    setBooking(true);
    setMessage('');

    try {
      const response = await userService.bookBus(bus.id, currentUser.id, parseInt(seatsToBook));
      setMessage(`${seatsToBook} seat(s) booked successfully! Redirecting to your dashboard...`);
      setIsError(false);
      
      // Update available seats locally
      setBus(prev => ({
        ...prev,
        availableseats: prev.availableseats - seatsToBook
      }));
      
      // Redirect to user dashboard after 3 seconds
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data || 'Booking failed. Please try again.';
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p>Loading bus details...</p>
      </Container>
    );
  }

  if (!bus) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Bus not found or has been removed.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Back Button */}
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={() => {
              const fromPage = location.state?.fromPage || '/user/browse-buses';
              navigate(fromPage);
            }}
          >
            ← Back to Browse Buses
          </Button>
          
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4>Book Bus - {bus.busnum}</h4>
            </Card.Header>
            <Card.Body>
              {message && (
                <Alert variant={isError ? 'danger' : 'success'}>
                  {message}
                </Alert>
              )}

              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Bus Details</h5>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <td><strong>Bus Number:</strong></td>
                        <td>{bus.busnum}</td>
                      </tr>
                      <tr>
                        <td><strong>Route:</strong></td>
                        <td>{bus.source} → {bus.destination}</td>
                      </tr>
                      <tr>
                        <td><strong>Departure:</strong></td>
                        <td>{formatDate(bus.departuretime)}</td>
                      </tr>
                      <tr>
                        <td><strong>Arrival:</strong></td>
                        <td>{formatDate(bus.arrivaltime)}</td>
                      </tr>
                      <tr>
                        <td><strong>Available Seats:</strong></td>
                        <td>
                          <span className="badge bg-success">{bus.availableseats}</span>
                          {' '} out of {bus.totalseats}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="col-md-6">
                  <h5>Booking Form</h5>
                  <Form onSubmit={handleBooking}>
                    <Form.Group className="mb-3">
                      <Form.Label>Number of Seats</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={bus.availableseats}
                        value={seatsToBook}
                        onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                        required
                        disabled={bus.availableseats === 0}
                      />
                      <Form.Text className="text-muted">
                        Maximum {bus.availableseats} seats available
                      </Form.Text>
                    </Form.Group>

                    {currentUser ? (
                      currentUser.role === 'USER' ? (
                        <div className="d-grid gap-2">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={booking || bus.availableseats === 0}
                          >
                            {booking ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Booking...
                              </>
                            ) : (
                              `Book ${seatsToBook} Seat(s)`
                            )}
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => navigate('/buses')}
                          >
                            Back to Bus List
                          </Button>
                        </div>
                      ) : (
                        <Alert variant="warning">
                          Only users can book buses. Admins cannot book seats.
                        </Alert>
                      )
                    ) : (
                      <Alert variant="info">
                        Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>login</Button> to book this bus.
                      </Alert>
                    )}
                  </Form>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default BookBus;
