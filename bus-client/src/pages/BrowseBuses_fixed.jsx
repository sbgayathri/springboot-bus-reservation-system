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
                              'Fully Booked' : 
                              'Book This Bus'
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

      {/* Book Bus Modal */}
      <Modal show={showBookModal} onHide={() => setShowBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book Bus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBus && (
            <div>
              <div className="bg-light p-3 rounded mb-3">
                <h6>Bus Details</h6>
                <strong>Bus Number:</strong> {selectedBus.busnum}<br />
                <strong>Route:</strong> {selectedBus.source} → {selectedBus.destination}<br />
                <strong>Departure:</strong> {formatDate(selectedBus.departuretime)}<br />
                <strong>Available Seats:</strong> {selectedBus.availableseats}
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Number of Seats to Book</Form.Label>
                <Form.Select
                  value={seatsToBook}
                  onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                >
                  {[...Array(Math.min(selectedBus.availableseats || 1, 5))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} seat{i + 1 > 1 ? 's' : ''}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Maximum 5 seats per booking
                </Form.Text>
              </Form.Group>
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
            {bookingLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Booking...
              </>
            ) : (
              `Book ${seatsToBook} Seat${seatsToBook > 1 ? 's' : ''}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BrowseBuses;
