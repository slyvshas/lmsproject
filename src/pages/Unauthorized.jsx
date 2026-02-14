// ============================================================================
// Unauthorized Page
// ============================================================================
// Page shown when user doesn't have permission to access a resource.

import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '20px'
  };

  const containerStyle = {
    textAlign: 'center',
    maxWidth: '500px'
  };

  const errorCodeStyle = {
    fontSize: '120px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ef4444, #f87171)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 16px 0',
    lineHeight: 1
  };

  const h1Style = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 12px 0'
  };

  const pStyle = {
    fontSize: '18px',
    color: '#94a3b8',
    margin: '0 0 32px 0'
  };

  const actionsStyle = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
  };

  const primaryBtnStyle = {
    padding: '14px 28px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '15px'
  };

  const secondaryBtnStyle = {
    padding: '14px 28px',
    borderRadius: '10px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '15px',
    border: '1px solid rgba(99, 102, 241, 0.3)'
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={errorCodeStyle}>403</div>
        <h1 style={h1Style}>Access Denied</h1>
        <p style={pStyle}>You don't have permission to access this page.</p>
        <div style={actionsStyle}>
          <Link to="/" style={primaryBtnStyle}>Go to Home</Link>
          <Link to="/student/dashboard" style={secondaryBtnStyle}>Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
