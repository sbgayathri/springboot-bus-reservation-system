import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState({});
  
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await userService.getBuses();
      console.log('Buses API response:', response.data); // Debug log
      const busesData = Array.isArray(response.data) ? response.data : [];
      setBuses(busesData);
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Failed to fetch buses');
      setBuses([]); // Ensure buses is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleBookBus = async (busId) => {
    if (!currentUser || currentUser.role !== 'USER') {
      alert('Please login as a user to book buses');
      return;
    }

    const seatsToBook = prompt('How many seats would you like to book?', '1');
    if (!seatsToBook || isNaN(seatsToBook) || seatsToBook < 1) {
      alert('Please enter a valid number of seats');
      return;
    }

    setBookingLoading({ ...bookingLoading, [busId]: true });
    
    try {
      const response = await userService.bookBus(busId, currentUser.id, parseInt(seatsToBook));
      alert('Bus booked successfully!');
      fetchBuses(); // Refresh the list to update available seats
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data || 'Booking failed. Please try again.';
      alert(errorMessage);
    } finally {
      setBookingLoading({ ...bookingLoading, [busId]: false });
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Available Buses</h2>
      
      {buses.length === 0 ? (
        <div className="alert alert-info">No buses available at the moment.</div>
      ) : (
        <div className="row">
          {buses.map((bus) => (
            <div key={bus.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">Bus #{bus.busnum}</h5>
                </div>
                <div className="card-body">
                  <p className="card-text">
                    <strong>From:</strong> {bus.source}<br/>
                    <strong>To:</strong> {bus.destination}<br/>
                    <strong>Departure:</strong> {new Date(bus.departuretime).toLocaleString()}<br/>
                    <strong>Arrival:</strong> {new Date(bus.arrivaltime).toLocaleString()}<br/>
                    <strong>Total Seats:</strong> {bus.totalseats}<br/>
                    <strong>Available Seats:</strong> 
                    <span className={`badge ${bus.availableseats > 0 ? 'bg-success' : 'bg-danger'} ms-2`}>
                      {bus.availableseats}
                    </span>
                  </p>
                </div>
                <div className="card-footer">
                  {currentUser && currentUser.role === 'USER' ? (
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleBookBus(bus.id)}
                      disabled={bus.availableseats === 0 || bookingLoading[bus.id]}
                    >
                      {bookingLoading[bus.id] ? 'Booking...' : 
                       bus.availableseats === 0 ? 'No Seats Available' : 'Book Now'}
                    </button>
                  ) : (
                    <small className="text-muted">Login as user to book</small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusList;