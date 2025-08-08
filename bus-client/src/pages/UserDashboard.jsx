import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Button, Alert, Form, Spinner } from 'react-bootstrap';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MyBookings from '../components/MyBookings';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  
  const { currentUser, fetchUser } = useAuth();
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const response = await userService.getUserBookings(currentUser.id);
      const bookingsData = Array.isArray(response.data) ? response.data : [];
      setBookings(bookingsData);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings: ' + (err.response?.data?.message || err.message));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
      setProfileData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        password: ''
      });
    }
  }, [currentUser, fetchBookings]);

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
      
      const response = await userService.updateProfile(currentUser.id, profileData);
      setSuccess('Profile updated successfully!');
      await fetchUser();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <Row>
                <Col>
                  <h4 className="mb-1">Welcome, {currentUser?.username}!</h4>
                  <small>Manage your bookings and profile</small>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => navigate('/user/browse-buses')}
                  >
                    Browse Buses
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Tabs 
                activeKey={activeTab} 
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                {/* Dashboard Tab */}
                <Tab eventKey="dashboard" title="Dashboard">
                  <Card>
                    <Card.Header className="bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">My Bookings</h5>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate('/user/browse-buses')}
                        >
                          Book New Journey
                        </Button>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <MyBookings 
                        bookings={bookings}
                        loading={loading}
                        error={error}
                        success={success}
                        onRefresh={fetchBookings}
                      />
                    </Card.Body>
                  </Card>
                </Tab>

                {/* Profile Tab */}
                <Tab eventKey="profile" title="Profile">
                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}
                  
                  <Card>
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Edit Profile</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleProfileUpdate}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Username</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData({
                                  ...profileData,
                                  username: e.target.value
                                })}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({
                                  ...profileData,
                                  email: e.target.value
                                })}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({
                                  ...profileData,
                                  phone: e.target.value
                                })}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
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
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Role</Form.Label>
                              <Form.Control
                                type="text"
                                value={currentUser?.role || 'USER'}
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
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;
