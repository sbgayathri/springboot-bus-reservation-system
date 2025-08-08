import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyBookings = ({ bookings, loading, error, success, onRefresh }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  
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

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await userService.cancelBooking(selectedBooking.id);
      setLocalSuccess('Booking cancelled successfully!');
      setShowCancelModal(false);
      setSelectedBooking(null);
      
      // Refresh bookings
      if (onRefresh) {
        onRefresh();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setLocalSuccess(''), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setLocalError('Failed to cancel booking: ' + (err.response?.data?.message || err.message));
      setShowCancelModal(false);
    }
  };

  return (
    <>
      {(error || localError) && <Alert variant="danger">{error || localError}</Alert>}
      {(success || localSuccess) && <Alert variant="success">{success || localSuccess}</Alert>}
      
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
          <p>Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-4">
          <h5>No bookings found</h5>
          <p>You haven't made any bookings yet.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/user/browse-buses')}
          >
            🚌 Browse Buses
          </Button>
        </div>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Bus Number</th>
              <th>Route</th>
              <th>Departure Time</th>
              <th>Arrival Time</th>
              <th>Seats Booked</th>
              <th>Booking Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <Badge bg="primary">#{booking.id}</Badge>
                </td>
                <td>
                  <strong>{booking.bus?.busnum || 'N/A'}</strong>
                </td>
                <td>
                  <div>
                    <strong>{booking.bus?.source || 'N/A'}</strong>
                    <br />
                    <small className="text-muted">↓</small>
                    <br />
                    <strong>{booking.bus?.destination || 'N/A'}</strong>
                  </div>
                </td>
                <td>{formatDate(booking.bus?.departuretime)}</td>
                <td>{formatDate(booking.bus?.arrivaltime)}</td>
                <td>
                  <Badge bg="info">{booking.seatsBooked || 1}</Badge>
                </td>
                <td>{formatDate(booking.bookingdate)}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowCancelModal(true);
                    }}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Cancel Booking Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this booking?</p>
          {selectedBooking && (
            <div className="bg-light p-3 rounded">
              <strong>Booking Details:</strong>
              <br />
              <strong>Booking ID:</strong> #{selectedBooking.id}
              <br />
              <strong>Bus:</strong> {selectedBooking.bus?.busnum}
              <br />
              <strong>Route:</strong> {selectedBooking.bus?.source} → {selectedBooking.bus?.destination}
              <br />
              <strong>Seats:</strong> {selectedBooking.seatsBooked || 1}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, Keep Booking
          </Button>
          <Button variant="danger" onClick={handleCancelBooking}>
            Yes, Cancel Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MyBookings;
