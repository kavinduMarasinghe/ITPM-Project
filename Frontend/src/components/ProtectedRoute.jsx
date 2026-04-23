import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const roles = allowedRoles?.length
    ? allowedRoles
    : allowedRole
      ? [allowedRole]
      : null;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/stalls" replace />;
    }
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
