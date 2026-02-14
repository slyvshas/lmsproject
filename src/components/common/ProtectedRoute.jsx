// ============================================================================
// ProtectedRoute Component
// ============================================================================
// Routes that require authentication and optionally specific roles.
// Redirects unauthenticated users to login page.

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * Wrapper component for protected routes
 * @param {React.Component} Component - Component to render if authorized
 * @param {string|string[]} requiredRole - Required role(s) for access (optional)
 */
export const ProtectedRoute = ({ Component, requiredRole }) => {
  const { user, userProfile, isLoading } = useAuth();

  // Debug logging
  console.log('ProtectedRoute check:', {
    isLoading,
    hasUser: !!user,
    userProfile,
    userRole: userProfile?.role,
    requiredRole,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for userProfile to load before checking role
  if (!userProfile) {
    return <LoadingSpinner />;
  }

  // Role check if specified
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(userProfile?.role)) {
      console.error('Access denied - User role:', userProfile?.role, 'Required:', roles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Component />;
};

export default ProtectedRoute;
