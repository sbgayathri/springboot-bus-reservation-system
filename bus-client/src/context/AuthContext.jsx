import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    console.log('🧹 Clearing session...');
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setLoading(false);
  }, []);

  const verifyToken = useCallback(async (tokenToVerify, userData) => {
    try {
      // Make a simple API call to verify token is still valid AND server is running
      await api.get('/auth/profile');
      console.log('✅ Token verified, session restored');
      setLoading(false);
    } catch (error) {
      console.error('❌ Token expired, invalid, or server is down:', error);
      
      // Check if the error is due to server being down (connection error)
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || 
          error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
        console.log('🔄 Server appears to be down, clearing session...');
      }
      
      // Clear session for any error (invalid token, expired token, or server down)
      clearSession();
    }
  }, [clearSession]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      const userData = response.data;
      console.log('👤 User data fetched:', userData.username, userData.role);
      
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      clearSession();
      throw error;
    }
  }, [clearSession]);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('🔄 Restoring session for:', userData.username || userData.email);
        setToken(storedToken);
        setCurrentUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Verify token is still valid
        verifyToken(storedToken, userData);
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        clearSession();
      }
    } else {
      console.log('📝 No session found, user needs to login');
      setLoading(false);
    }
  }, [verifyToken, clearSession]);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('🌐 API Base URL:', 'http://localhost:8080/api');
      
      const response = await api.post('/auth/login', { email, password });
      console.log('📡 Login response received:', response);
      
      // Check if response has error property
      if (response.data.error) {
        console.log('❌ Login failed:', response.data.error);
        return { 
          success: false, 
          message: response.data.error 
        };
      }
      
      const { token: newToken, user: userData } = response.data;
      console.log('✅ Login successful for:', userData.username, '- Role:', userData.role);
      
      setToken(newToken);
      setCurrentUser(userData);
      
      // Store both token and user data in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      console.log('💾 Session data stored in localStorage');
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      // More specific error messages
      let errorMessage = 'Login failed';
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:8080';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const response = await api.post('/auth/register', userData);

      if (response.data.success === false) {
        console.log('❌ Registration failed:', response.data.message);
        return {
          success: false,
          message: response.data.message
        };
      }

      console.log('✅ Registration successful');
      return {
        success: true,
        message: response.data.message || 'Registration successful'
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    console.log('👋 User logging out');
    clearSession();
  };

  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
    loading,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
