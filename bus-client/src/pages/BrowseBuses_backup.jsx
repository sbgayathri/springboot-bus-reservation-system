import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Spinner, Badge, Modal } from 'react-bootstrap';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BrowseBuses = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    source: '',
    destination: '',
    date: ''
  });

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await userService.getBuses();
      console.log('Buses API response:', response.data);
      const busesData = Array.isArray(response.data) ? response.data : [];
      setBuses(busesData);
      setFilteredBuses(busesData);
      setError('');
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Failed to fetch buses: ' + (err.response?.data?.message || err.message));
      setBuses([]);
      setFilteredBuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // Filter buses based on search criteria
  useEffect(() => {
    let filtered = buses;

    if (filters.source) {
      filtered = filtered.filter(bus => 
        bus.source?.toLowerCase().includes(filters.source.toLowerCase())
      );
    }

    if (filters.destination) {
      filtered = filtered.filter(bus => 
        bus.destination?.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }

    if (filters.date) {
      filtered = filtered.filter(bus => {
        if (!bus.departuretime) return false;
        const busDate = new Date(bus.departuretime).toDateString();
        const filterDate = new Date(filters.date).toDateString();
        return busDate === filterDate;
      });
    }

    setFilteredBuses(filtered);
  }, [filters, buses]);

  const handleBookBus = async () => {
    if (!currentUser) {
      navigate('/login?message=Please login to book this bus');
      return;
    }

    if (currentUser.role !== 'USER') {
      setError('Only users can book buses');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await userService.bookBus(selectedBus.id, currentUser.id, seatsToBook);
      setSuccess(`Successfully booked ${seatsToBook} seat(s)!`);
      setShowBookModal(false);
      fetchBuses(); // Refresh the bus list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Booking failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ source: '', destination: '', date: '' });
  };

  const getUniqueLocations = (type) => {
    const locations = buses.map(bus => bus[type]).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Browse Available Buses</h4>
            </Card.Header>
            <Card.Body>
              {/* Search Filters */}
              <div className="mb-4">
                <h6 className="mb-3">Search Filters</h6>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>From (Source)</Form.Label>
                      <Form.Select
                        value={filters.source}
                        onChange={(e) => setFilters({...filters, source: e.target.value})}
                      >
                        <option value="">Select Source</option>
                        {getUniqueLocations('source').map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>To (Destination)</Form.Label>
                      <Form.Select
                        value={filters.destination}
                        onChange={(e) => setFilters({...filters, destination: e.target.value})}
                      >
                        <option value="">Select Destination</option>
                        {getUniqueLocations('destination').map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Travel Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters({...filters, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>&nbsp;</Form.Label>
                      <div>
                        <Button variant="outline-secondary" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="lg" />
                  <p className="mt-3">Loading available buses...</p>
                </div>
              ) : filteredBuses.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No buses found</h5>
                  <p>Try adjusting your search filters or check back later.</p>
                  {(filters.source || filters.destination || filters.date) && (
                    <Button variant="primary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <Row>
                  {filteredBuses.map((bus) => (
                    <Col md={6} lg={4} key={bus.id} className="mb-4">
                      <Card className="h-100">
                        <Card.Header className="bg-primary text-white">
                          <Row>
                            <Col>
                              <h6 className="mb-0">{bus.busnum}</h6>
                            </Col>
                            <Col xs="auto">
                              <Badge bg="light" text="dark">
                                {bus.availableseats || 0} seats left
                              </Badge>
                            </Col>
                          </Row>
                        </Card.Header>
                        <Card.Body>
                          <div className="mb-3">
                            <h6>Route</h6>
                            <div className="d-flex align-items-center">
                              <span className="fw-bold">{bus.source}</span>
                              <span className="mx-2">→</span>
                              <span className="fw-bold">{bus.destination}</span>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <h6>Schedule</h6>
                            <div>
                              <small className="text-muted">Departure:</small>
                              <div>{formatDate(bus.departuretime)}</div>
                            </div>
                            <div className="mt-2">
                              <small className="text-muted">Arrival:</small>
                              <div>{formatDate(bus.arrivaltime)}</div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <h6>Capacity</h6>
                            <div>
                              <Badge bg="success" className="me-2">
                                Available: {bus.availableseats || 0}
                              </Badge>
                              <Badge bg="secondary">
                                Total: {bus.totalseats || 0}
                              </Badge>
                            </div>
                          </div>
                        </Card.Body>
                        <Card.Footer className="bg-light">
                          <Button
                            variant="primary"
                            className="w-100"
                            onClick={() => {
                              setSelectedBus(bus);
                              setShowBookModal(true);
                            }}
                            disabled={!bus.availableseats || bus.availableseats <= 0}
                          >
                            {!bus.availableseats || bus.availableseats <= 0 ? 
                              'No Seats Available' : 
                              'Book Bus'
                            }
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bus Information Modal */}
      <Modal show={showBookModal} onHide={() => setShowBookModal(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Bus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBus && (
            <div>
              <h5>Bus Details</h5>
              <table className="table">
                <tbody>
                  <tr>
                    <td>Bus Number:</td>
                    <td>{selectedBus.busnum}</td>
                  </tr>
                  <tr>
                    <td>From:</td>
                    <td>{selectedBus.source}</td>
                  </tr>
                  <tr>
                    <td>To:</td>
                    <td>{selectedBus.destination}</td>
                  </tr>
                  <tr>
                    <td>Departure Time:</td>
                    <td>{formatDate(selectedBus.departuretime)}</td>
                  </tr>
                  <tr>
                    <td>Arrival Time:</td>
                    <td>{formatDate(selectedBus.arrivaltime)}</td>
                  </tr>
                  <tr>
                    <td>Available Seats:</td>
                    <td>{selectedBus.availableseats}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4">
                <Form.Group>
                  <Form.Label>Number of Seats:</Form.Label>
                  <Form.Select
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                  >
                    {[...Array(Math.min(selectedBus.availableseats || 1, 5))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="mt-4">
                <h6>Passenger Information</h6>
                <p>Name: {currentUser?.username}</p>
                <p>Email: {currentUser?.email}</p>
                <p>Phone: {currentUser?.phone || 'Not provided'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bus-icon-large me-4">
                        <span style={{fontSize: '4rem', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3)'}}>🚌</span>
                      </div>
                      <div>
                        <h2 className="mb-1 fw-bold">{selectedBus.busnum}</h2>
                        <p className="mb-0 fs-5 opacity-75">Premium Express Service</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-center">
                    <div className="status-badge p-3 bg-white bg-opacity-20 rounded-3">
                      <div className="h4 mb-1 text-success">{selectedBus.availableseats}</div>
                      <small>Seats Available</small>
                    </div>
                  </div>
                </div>
              </Modal.Footer>

              {/* Route Information */}
              <div className="route-section p-4 bg-light border-bottom">
                <h5 className="mb-4 text-center text-dark">
                  <span className="me-2">🛣️</span>
                  Route Information
                </h5>
                <div className="route-display">
                  <div className="row align-items-center">
                    <div className="col-4 text-center">
                      <div className="location-card p-3 bg-success text-white rounded-3 shadow-sm">
                        <div className="h3 mb-2">📍</div>
                        <h4 className="mb-1">{selectedBus.source}</h4>
                        <small className="opacity-75">Departure Point</small>
                      </div>
                    </div>
                    <div className="col-4 text-center">
                      <div className="journey-arrow">
                        <span className="h1 text-primary">✈️</span>
                        <div className="mt-2">
                          <div className="journey-line bg-primary mx-auto" style={{height: '3px', width: '80px'}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-4 text-center">
                      <div className="location-card p-3 bg-danger text-white rounded-3 shadow-sm">
                        <div className="h3 mb-2">🏁</div>
                        <h4 className="mb-1">{selectedBus.destination}</h4>
                        <small className="opacity-75">Arrival Point</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="schedule-section p-4">
                <h5 className="mb-4 text-center">
                  <span className="me-2">⏰</span>
                  Schedule Details
                </h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="time-card p-3 bg-primary bg-opacity-10 rounded-3 mb-3">
                      <div className="d-flex align-items-center">
                        <span className="me-3 fs-3">�</span>
                        <div>
                          <h6 className="mb-1 text-primary">Departure Time</h6>
                          <div className="h5 mb-0">{formatDate(selectedBus.departuretime)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="time-card p-3 bg-success bg-opacity-10 rounded-3 mb-3">
                      <div className="d-flex align-items-center">
                        <span className="me-3 fs-3">🎯</span>
                        <div>
                          <h6 className="mb-1 text-success">Arrival Time</h6>
                          <div className="h5 mb-0">{formatDate(selectedBus.arrivaltime)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus Capacity */}
              <div className="capacity-section p-4 bg-light">
                <h5 className="mb-4 text-center">
                  <span className="me-2">🪑</span>
                  Seating Information
                </h5>
                <div className="row text-center">
                  <div className="col-4">
                    <div className="capacity-card p-3 bg-white rounded-3 shadow-sm">
                      <div className="h2 text-info mb-2">{selectedBus.totalseats}</div>
                      <small className="text-muted">Total Seats</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="capacity-card p-3 bg-white rounded-3 shadow-sm">
                      <div className="h2 text-success mb-2">{selectedBus.availableseats}</div>
                      <small className="text-muted">Available</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="capacity-card p-3 bg-white rounded-3 shadow-sm">
                      <div className="h2 text-warning mb-2">{selectedBus.totalseats - selectedBus.availableseats}</div>
                      <small className="text-muted">Booked</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div className="features-section p-4 border-top">
                <h5 className="mb-3 text-center">
                  <span className="me-2">⭐</span>
                  Bus Features
                </h5>
                <div className="row text-center">
                  <div className="col-3">
                    <div className="feature-item p-2">
                      <div className="fs-3 mb-1">❄️</div>
                      <small>AC</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="feature-item p-2">
                      <div className="fs-3 mb-1">📱</div>
                      <small>WiFi</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="feature-item p-2">
                      <div className="fs-3 mb-1">🔌</div>
                      <small>Charging</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="feature-item p-2">
                      <div className="fs-3 mb-1">🛡️</div>
                      <small>Safe</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBookBus}
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Booking...' : `Book ${seatsToBook} Seat${seatsToBook > 1 ? 's' : ''}`}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BrowseBuses;
