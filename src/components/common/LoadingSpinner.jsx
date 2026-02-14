// ============================================================================
// LoadingSpinner Component
// ============================================================================
// Simple loading spinner component used during async operations.

import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    padding: '40px',
    color: '#fff'
  };

  const spinnerStyle = {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(99, 102, 241, 0.2)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const messageStyle = {
    marginTop: '16px',
    fontSize: '16px',
    color: '#94a3b8'
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        <p style={messageStyle}>{message}</p>
      </div>
    </>
  );
};

export default LoadingSpinner;
