// ============================================================================
// LoadingSpinner Component
// ============================================================================
// Simple loading spinner component used during async operations.

import React from 'react';
import '../styles/LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner">
        <div className="spinner-ring"></div>
      </div>
      <p className="spinner-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
