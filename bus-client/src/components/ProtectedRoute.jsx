import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Container, Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p>Loading...</p>
      </Container>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    console.log('🔒 Access denied - not authenticated');
    return <Navigate to="/login?message=Please login to access this page" replace />;
  }

  // If user is authenticated but doesn't have required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    console.log('🚫 Access denied - insufficient permissions. Required:', allowedRoles, 'Has:', currentUser.role);
    
    // Redirect based on user's actual role
    if (currentUser.role === 'ADMIN') {
      console.log('🔄 Redirecting ADMIN to admin panel');
      return <Navigate to="/admin/panel" replace />;
    } else if (currentUser.role === 'USER') {
      console.log('🔄 Redirecting USER to user dashboard');
      return <Navigate to="/user/dashboard" replace />;
    }
    
    // Fallback - show access denied message
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Access denied. You don't have permission to view this page.
        </Alert>
      </Container>
    );
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
