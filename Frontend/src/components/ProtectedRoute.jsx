import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Logged in but wrong role
    if (user.role === 'admin') {
      return <Navigate to="/admin/stalls" replace />;
    } else {
      return <Navigate to="/vendor/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
