import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and access control
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for server connection issues
    if (!error.response && (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || 
        error.message.includes('Network Error'))) {
      console.log('🔄 Server connection lost - clearing session...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect immediately, let the app handle this gracefully
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      console.log('🔒 Authentication failed - clearing session...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?message=Session expired. Please login again.';
    }
    
    return Promise.reject(error);
  }
);

// User Services
export const userService = {
  getBuses: async () => {
    console.log('🚌 Calling getUserBuses API...');
    try {
      const response = await api.get('/user/buses');
      console.log('✅ User buses response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching user buses:', error);
      throw error;
    }
  },
  getUserBookings: async (userId) => {
    console.log('📋 Calling getUserBookings API for user:', userId);
    try {
      const response = await api.get(`/user/bookings/${userId}`);
      console.log('✅ User bookings response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching user bookings:', error);
      throw error;
    }
  },
  bookBus: (busId, userId, seatsToBook = 1) => api.post(`/user/book/${busId}/user/${userId}?seatsToBook=${seatsToBook}`),
  cancelBooking: (bookingId) => api.post(`/user/cancel/${bookingId}`),
  updateProfile: async (userId, profileData) => {
    console.log('📝 Calling updateProfile API for user:', userId);
    console.log('📝 Profile data:', profileData);
    try {
      const response = await api.put(`/user/update/${userId}`, profileData);
      console.log('✅ Profile update response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  },
};

// Admin Services
export const adminService = {
  addBus: async (busData) => {
    console.log('🚌 Calling addBus API...');
    console.log('📝 Bus data:', busData);
    try {
      const response = await api.post('/admin/addbus', busData);
      console.log('✅ Add bus response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error adding bus:', error);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  },
  getAllBuses: async () => {
    console.log('🚌 Calling getAllBuses API...');
    try {
      const response = await api.get('/admin/buses');
      console.log('✅ Admin all buses response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching admin buses:', error);
      throw error;
    }
  },
  getMyBuses: async (adminId) => {
    console.log('🚌 Calling getMyBuses API for admin:', adminId);
    try {
      const response = await api.get(`/admin/buses/${adminId}`);
      console.log('✅ Admin my buses response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching admin my buses:', error);
      throw error;
    }
  },
  getBookingsForBus: async (busId) => {
    console.log('📋 Calling getBookingsForBus API for bus:', busId);
    try {
      const response = await api.get(`/admin/allbooking/${busId}`);
      console.log('✅ Bus bookings response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching bus bookings:', error);
      throw error;
    }
  },
  getAllBookings: async () => {
    console.log('📋 Calling getAllBookings API...');
    try {
      const response = await api.get('/admin/bookings');
      console.log('✅ All bookings response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching all bookings:', error);
      throw error;
    }
  },
  updateProfile: async (userId, profileData) => {
    console.log('📝 Calling admin updateProfile API for user:', userId);
    console.log('📝 Profile data:', profileData);
    try {
      const response = await api.put(`/admin/update/${userId}`, profileData);
      console.log('✅ Admin profile update response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error updating admin profile:', error);
      throw error;
    }
  },
};

// Auth Services  
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export { api };
