import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Table, Button, Alert, Spinner, Badge, Form } from 'react-bootstrap';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('myBuses');
  const [myBuses, setMyBuses] = useState([]);
  const [selectedBusBookings, setSelectedBusBookings] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchMyBuses = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setError('');
    try {
      console.log('Fetching buses for admin:', currentUser.id);
      const response = await adminService.getMyBuses(currentUser.id);
      const busesData = Array.isArray(response.data) ? response.data : [];
      console.log('Admin buses received:', busesData);
      
      // Debug: Check departure times
      busesData.forEach((bus, index) => {
        console.log(`Bus ${index + 1} (${bus.busnum}):`, {
          id: bus.id,
          departuretime: bus.departuretime,
          arrivaltime: bus.arrivaltime,
          departureType: typeof bus.departuretime,
          arrivalType: typeof bus.arrivaltime
        });
      });
      
      setMyBuses(busesData);
    } catch (err) {
      console.error('Error fetching admin buses:', err);
      setError('Failed to fetch buses: ' + err.message);
      setMyBuses([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'ADMIN') {
      fetchMyBuses();
    }
  }, [currentUser, fetchMyBuses]);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        password: ''
      });
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      setError('User not logged in');
      return;
    }
    
    try {
      setProfileLoading(true);
      setError('');
      setSuccess('');
      
      const response = await adminService.updateProfile(currentUser.id, profileData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchBusBookings = async (busId) => {
    if (!busId) return;
    setLoading(true);
    try {
      console.log('Fetching bookings for bus:', busId);
      const response = await adminService.getBookingsForBus(busId);
      const bookingsData = Array.isArray(response.data) ? response.data : [];
      console.log('Bus bookings received:', bookingsData);
      setSelectedBusBookings(bookingsData);
    } catch (err) {
      console.error('Failed to fetch bus bookings:', err);
      setSelectedBusBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBusSelect = (busId) => {
    setSelectedBusId(busId);
    fetchBusBookings(busId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      // Handle different possible date formats
      let date;
      
      // If it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
      }
      // If it's a string, try to parse it
      else if (typeof dateString === 'string') {
        // Check if it's an empty string or 'null'
        if (dateString.trim() === '' || dateString.toLowerCase() === 'null') {
          return 'Not specified';
        }
        
        // Try parsing as ISO string first (from backend LocalDateTime)
        date = new Date(dateString);
        
        // If that fails, try other formats
        if (isNaN(date.getTime())) {
          // Try parsing as timestamp
          const timestamp = parseInt(dateString);
          if (!isNaN(timestamp) && timestamp > 0) {
            date = new Date(timestamp);
          } else {
            return 'Not specified';
          }
        }
      }
      // If it's a number (timestamp)
      else if (typeof dateString === 'number') {
        // Check for zero or negative timestamps (Unix epoch issue)
        if (dateString <= 0) {
          return 'Not specified';
        }
        date = new Date(dateString);
      }
      else {
        return 'Not specified';
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Not specified';
      }
      
      // Check for Unix epoch year (1970) or unrealistic dates
      const year = date.getFullYear();
      if (year <= 1970 || year < 2000) {
        return 'Not specified';
      }
      
      // Format as: DD/MM/YYYY HH:MM AM/PM
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for value:', dateString);
      return 'Not specified';
    }
  };

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body className="bg-primary text-white">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-1">Admin Panel</h4>
                  <p className="mb-0">Welcome, {currentUser.username}</p>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant="light" 
                    onClick={() => navigate('/admin/add-bus')}
                  >
                    Add New Bus
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Main Content */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="myBuses">My Buses</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="profile">Update Profile</Nav.Link>
                  </Nav.Item>
                </Nav>
                
                <Tab.Content>
                  <Tab.Pane eventKey="myBuses">
                    <Row>
                      {/* Bus Fleet Table */}
                      <Col lg={7}>
                        <Card>
                          <Card.Header>
                            <h5 className="mb-0">My Bus Fleet ({myBuses.length})</h5>
                          </Card.Header>
                          <Card.Body>
                            {loading ? (
                              <div className="text-center py-4">
                                <Spinner animation="border" />
                                <p className="mt-2">Loading buses...</p>
                              </div>
                            ) : myBuses.length === 0 ? (
                              <div className="text-center py-4">
                                <h6 className="text-muted">No buses found</h6>
                                <p className="text-muted">Add your first bus to get started</p>
                                <Button 
                                  variant="primary" 
                                  onClick={() => navigate('/admin/add-bus')}
                                >
                                  Add Your First Bus
                                </Button>
                              </div>
                            ) : (
                              <Table striped hover responsive>
                                <thead>
                                  <tr>
                                    <th>Bus Number</th>
                                    <th>Route</th>
                                    <th>Schedule</th>
                                    <th>Seats</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {myBuses.map((bus) => (
                                    <tr key={bus.id} className={selectedBusId === bus.id ? 'table-active' : ''}>
                                      <td>
                                        <strong>{bus.busnum}</strong>
                                        <br />
                                        <small className="text-muted">ID: {bus.id}</small>
                                      </td>
                                      <td>
                                        {bus.source} → {bus.destination}
                                      </td>
                                      <td>
                                        <div>
                                          <strong>Departure:</strong><br />
                                          <small className={formatDate(bus.departuretime) === 'Not specified' ? 'text-warning' : ''}>
                                            {formatDate(bus.departuretime)}
                                          </small>
                                          {formatDate(bus.departuretime) === 'Not specified' && (
                                            <small className="text-muted d-block">⚠️ Please update</small>
                                          )}
                                        </div>
                                        <div className="mt-1">
                                          <strong>Arrival:</strong><br />
                                          <small className={formatDate(bus.arrivaltime) === 'Not specified' ? 'text-warning' : ''}>
                                            {formatDate(bus.arrivaltime)}
                                          </small>
                                          {formatDate(bus.arrivaltime) === 'Not specified' && (
                                            <small className="text-muted d-block">⚠️ Please update</small>
                                          )}
                                        </div>
                                      </td>
                                      <td>
                                        <Badge bg="success" className="me-1">
                                          {bus.availableseats} Available
                                        </Badge>
                                        <br />
                                        <Badge bg="primary">
                                          {bus.totalseats} Total
                                        </Badge>
                                      </td>
                                      <td>
                                        <Button 
                                          variant={selectedBusId === bus.id ? "success" : "outline-primary"}
                                          size="sm"
                                          onClick={() => handleBusSelect(bus.id)}
                                        >
                                          {selectedBusId === bus.id ? 'Viewing' : 'View Passengers'}
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      {/* Passenger Details */}
                      <Col lg={5}>
                        <Card>
                          <Card.Header>
                            <h5 className="mb-0">
                              Passenger Details
                              {selectedBusId && (
                                <Badge bg="info" className="ms-2">
                                  Bus {myBuses.find(b => b.id === selectedBusId)?.busnum}
                                </Badge>
                              )}
                            </h5>
                          </Card.Header>
                          <Card.Body>
                            {!selectedBusId ? (
                              <div className="text-center py-4">
                                <p className="text-muted">Select a bus to view passenger details</p>
                              </div>
                            ) : loading ? (
                              <div className="text-center py-4">
                                <Spinner animation="border" size="sm" />
                                <p className="mt-2">Loading passengers...</p>
                              </div>
                            ) : selectedBusBookings.length === 0 ? (
                              <div className="text-center py-4">
                                <p className="text-muted">No passengers for this bus</p>
                              </div>
                            ) : (
                              <div>
                                <div className="mb-3">
                                  <strong>Total Passengers: {selectedBusBookings.length}</strong>
                                </div>
                                
                                <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                  {selectedBusBookings.map((booking) => (
                                    <Card key={booking.id} className="mb-2">
                                      <Card.Body className="p-3">
                                        <h6 className="mb-1">{booking.users?.username || 'N/A'}</h6>
                                        <p className="mb-1 small">Email: {booking.users?.email || 'N/A'}</p>
                                        <p className="mb-1 small">Phone: {booking.users?.phone || 'N/A'}</p>
                                        <p className="mb-1 small">Booking Date: {booking.bookingdate || 'N/A'}</p>
                                        <Badge bg="primary">
                                          {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}
                                        </Badge>
                                      </Card.Body>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  <Tab.Pane eventKey="profile">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    
                    <Row>
                      <Col md={8} className="mx-auto">
                        <Card>
                          <Card.Header>
                            <h5 className="mb-0">Update Profile</h5>
                          </Card.Header>
                          <Card.Body>
                            <Form onSubmit={handleProfileUpdate}>
                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={profileData.username}
                                      onChange={(e) => setProfileData({
                                        ...profileData,
                                        username: e.target.value
                                      })}
                                      placeholder="Enter username"
                                      required
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                      type="email"
                                      value={profileData.email}
                                      onChange={(e) => setProfileData({
                                        ...profileData,
                                        email: e.target.value
                                      })}
                                      placeholder="Enter email address"
                                      required
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              
                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                      type="tel"
                                      value={profileData.phone}
                                      onChange={(e) => setProfileData({
                                        ...profileData,
                                        phone: e.target.value
                                      })}
                                      placeholder="Enter phone number"
                                      required
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>New Password (Optional)</Form.Label>
                                    <Form.Control
                                      type="password"
                                      value={profileData.password}
                                      onChange={(e) => setProfileData({
                                        ...profileData,
                                        password: e.target.value
                                      })}
                                      placeholder="Leave blank to keep current password"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Role</Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={currentUser?.role || 'ADMIN'}
                                      disabled
                                      className="bg-light"
                                    />
                                    <Form.Text className="text-muted">
                                      Role cannot be changed
                                    </Form.Text>
                                  </Form.Group>
                                </Col>
                              </Row>

                              <Button 
                                type="submit" 
                                variant="primary"
                                disabled={profileLoading}
                              >
                                {profileLoading ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Updating...
                                  </>
                                ) : (
                                  'Update Profile'
                                )}
                              </Button>
                            </Form>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;
