import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddBus = () => {
  const [formData, setFormData] = useState({
    busnum: '',
    source: '',
    destination: '',
    departuretime: '',
    arrivaltime: '',
    totalseats: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    // Ensure the datetime string has seconds
    if (dateTimeString.length === 16) { // YYYY-MM-DDTHH:MM
      return dateTimeString + ':00'; // Add seconds
    }
    return dateTimeString;
  };

  const validateForm = () => {
    const errors = {};
    // Bus number: e.g., KA01AB1234
    if (!/^([A-Z]{2}\d{2}[A-Z]{2}\d{4})$/.test(formData.busnum.trim())) {
      errors.busnum = 'Bus number must be in format KA01AB1234.';
    }
    // Total seats
    if (!formData.totalseats || isNaN(formData.totalseats) || formData.totalseats < 1 || formData.totalseats > 100) {
      errors.totalseats = 'Total seats must be a number between 1 and 100.';
    }
    // Source and destination
    if (!formData.source.trim()) {
      errors.source = 'Source is required.';
    }
    if (!formData.destination.trim()) {
      errors.destination = 'Destination is required.';
    }
    // Departure and arrival time
    const now = new Date();
    if (!formData.departuretime) {
      errors.departuretime = 'Departure time is required.';
    } else {
      const dep = new Date(formData.departuretime);
      if (dep < now) {
        errors.departuretime = 'Departure time cannot be in the past.';
      }
    }
    if (!formData.arrivaltime) {
      errors.arrivaltime = 'Arrival time is required.';
    } else {
      const arr = new Date(formData.arrivaltime);
      if (arr < now) {
        errors.arrivaltime = 'Arrival time cannot be in the past.';
      }
    }
    if (formData.departuretime && formData.arrivaltime) {
      const dep = new Date(formData.departuretime);
      const arr = new Date(formData.arrivaltime);
      if (arr <= dep) {
        errors.arrivaltime = 'Arrival time must be after departure time.';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    if (!validateForm()) {
      setIsError(true);
      setMessage('Please fix the validation errors.');
      return;
    }
    setLoading(true);
    try {
      const busData = {
        ...formData,
        departuretime: formatDateTime(formData.departuretime),
        arrivaltime: formatDateTime(formData.arrivaltime),
        totalseats: parseInt(formData.totalseats),
        availableseats: parseInt(formData.totalseats),
        adminId: currentUser.id
      };
      await adminService.addBus(busData);
      setMessage('Bus added successfully!');
      setIsError(false);
      setFormData({
        busnum: '',
        source: '',
        destination: '',
        departuretime: '',
        arrivaltime: '',
        totalseats: ''
      });
      setValidationErrors({});
      setTimeout(() => {
        navigate('/admin/panel');
      }, 2000);
    } catch (error) {
      console.error('Error adding bus:', error);
      setMessage(error.response?.data?.message || error.message || 'Failed to add bus. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
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
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4>Add New Bus</h4>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={isError ? 'danger' : 'success'}>
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Bus Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="busnum"
                    value={formData.busnum}
                    onChange={handleChange}
                    required
                    placeholder="e.g., KA01AB1234"
                    isInvalid={!!validationErrors.busnum}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.busnum}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Total Seats</Form.Label>
                  <Form.Control
                    type="number"
                    name="totalseats"
                    value={formData.totalseats}
                    onChange={handleChange}
                    required
                    min="1"
                    max="100"
                    placeholder="e.g., 40"
                    isInvalid={!!validationErrors.totalseats}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.totalseats}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Source</Form.Label>
                  <Form.Control
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Bangalore"
                    isInvalid={!!validationErrors.source}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.source}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Destination</Form.Label>
                  <Form.Control
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Mysore"
                    isInvalid={!!validationErrors.destination}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.destination}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Departure Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="departuretime"
                    value={formData.departuretime}
                    onChange={handleChange}
                    required
                    isInvalid={!!validationErrors.departuretime}
                    min={new Date().toISOString().slice(0,16)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.departuretime}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Arrival Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="arrivaltime"
                    value={formData.arrivaltime}
                    onChange={handleChange}
                    required
                    isInvalid={!!validationErrors.arrivaltime}
                    min={new Date().toISOString().slice(0,16)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.arrivaltime}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate('/admin/panel')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding Bus...' : 'Add Bus'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddBus;
