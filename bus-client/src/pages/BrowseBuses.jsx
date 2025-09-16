import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Spinner, Badge } from 'react-bootstrap';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BrowseBuses = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filters, setFilters] = useState({ source: '', destination: '', date: '' });

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' :
      date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
  };

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await userService.getBuses();
      const busesData = Array.isArray(response.data) ? response.data : [];
      setBuses(busesData);
      setFilteredBuses(busesData);
      setError('');
    } catch (err) {
      setError('Failed to fetch buses: ' + (err.response?.data?.message || err.message));
      setBuses([]);
      setFilteredBuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuses(); }, []);

  useEffect(() => {
    let filtered = buses;
    if (filters.source) {
      filtered = filtered.filter(bus => bus.source?.toLowerCase().includes(filters.source.toLowerCase()));
    }
    if (filters.destination) {
      filtered = filtered.filter(bus => bus.destination?.toLowerCase().includes(filters.destination.toLowerCase()));
    }
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      filtered = filtered.filter(bus => new Date(bus.departuretime).toDateString() === filterDate);
    }
    setFilteredBuses(filtered);
  }, [filters, buses]);

  const handleBookBus = (bus) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    navigate(`/user/book/${bus.id}`, { 
      state: { 
        bus: bus,
        fromPage: '/user/browse-buses'
      }
    });
  };

  const getUniqueLocations = (type) => {
    const locations = buses.map(bus => bus[type]).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  const clearFilters = () => setFilters({ source: '', destination: '', date: '' });

  if (!currentUser) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Please login to browse and book buses.</Alert>
      </Container>
    );
  }

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
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="mb-3">Search Filters</h6>
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>From (Source)</Form.Label>
                      <Form.Select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
                        <option value="">Select Source</option>
                        {getUniqueLocations('source').map(loc => <option key={loc}>{loc}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>To (Destination)</Form.Label>
                      <Form.Select value={filters.destination} onChange={(e) => setFilters({ ...filters, destination: e.target.value })}>
                        <option value="">Select Destination</option>
                        {getUniqueLocations('destination').map(loc => <option key={loc}>{loc}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Travel Date</Form.Label>
                      <Form.Control type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button variant="outline-secondary" onClick={clearFilters}>Clear Filters</Button>
                  </Col>
                </Row>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading buses...</p>
                </div>
              ) : filteredBuses.length === 0 ? (
                <Alert variant="info">No buses found.</Alert>
              ) : (
                <Row>
                  {filteredBuses.map((bus) => (
                    <Col md={6} lg={4} key={bus.id} className="mb-4">
                      <Card className="h-100 clickable-card" onClick={() => bus.availableseats > 0 && handleBookBus(bus)} style={{ cursor: bus.availableseats > 0 ? 'pointer' : 'not-allowed', boxShadow: '0 0 8px #eee' }}>
                        <Card.Header className="bg-secondary text-white">Bus #{bus.busnum}</Card.Header>
                        <Card.Body>
                          <h6>Route</h6>
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold text-success">{bus.source}</span>
                            <span>→</span>
                            <span className="fw-bold text-danger">{bus.destination}</span>
                          </div>
                          <h6 className="mt-3">Schedule</h6>
                          <div>Departure: {formatDate(bus.departuretime)}</div>
                          <div>Arrival: {formatDate(bus.arrivaltime)}</div>
                          <h6 className="mt-3">Seats</h6>
                          <Badge bg="success" className="me-2">Available: {bus.availableseats}</Badge>
                          <Badge bg="secondary">Total: {bus.totalseats}</Badge>
                        </Card.Body>
                        <Card.Footer className="bg-light">
                          <Button 
                            variant="primary" 
                            className="w-100"
                            type="button"
                            disabled={!bus.availableseats || bus.availableseats <= 0}
                            onClick={e => { e.stopPropagation(); handleBookBus(bus); }}
                          >
                            {(!bus.availableseats || bus.availableseats <= 0) ? 'No Seats Available' : 'Book Now'}
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
    </Container>
  );
};

export default BrowseBuses;
