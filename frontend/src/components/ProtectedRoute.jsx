import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * A wrapper component to protect routes based on authentication status and user roles.
 * 
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route (e.g., ['teacher', 'admin'])
 * @param {React.ReactNode} children - The component to render if allowed
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const location = useLocation();

  // If the user isn't logged in, send them to the login page
  // We pass the location they were trying to go to in state, so we can redirect them back after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the route requires specific roles, and the user's role isn't in the list
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Send them somewhere safe, like an unauthorized page or back to a general dashboard
    // For now, if a student tries to hit a teacher route, we'll kick them to a "not allowed" or just login
    return <Navigate to="/login" replace />; 
  }

  // If authenticated and role is valid, render the requested screen
  return children;
};

export default ProtectedRoute;
