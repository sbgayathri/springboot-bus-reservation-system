import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import BrowseBuses from './pages/BrowseBuses';
import AdminPanel from './pages/AdminPanel';
import AddBus from './pages/AddBus';
import BookBus from './pages/BookBus';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/buses" element={
              <ProtectedRoute allowedRoles={['USER']}>
                <BrowseBuses />
              </ProtectedRoute>
            } />
            
            {/* Redirect old dashboard route to user dashboard */}
            <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
            
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/browse-buses" 
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <BrowseBuses />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/book/:busId" 
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <BookBus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/book/:busId" 
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <BookBus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/buses/user/book" 
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <BookBus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/buses/user/book/:busId" 
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <BookBus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/panel" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/add-bus" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AddBus />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
