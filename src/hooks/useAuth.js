// ============================================================================
// useAuth Hook
// ============================================================================
// Custom hook to access authentication context throughout the app.
// Simplifies auth state and methods access in components.

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
