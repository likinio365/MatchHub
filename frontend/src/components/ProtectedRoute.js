// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const rawRole = localStorage.getItem('userRole');
  const userRole = rawRole ? rawRole.toLowerCase().trim() : '';

  if (!token) {
   
    return <Navigate to="/login" replace />;
  }


  if (allowedRoles) {
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      
      return <Navigate to="/" replace />;
    }
  }


  
  return children;
};

export default ProtectedRoute;