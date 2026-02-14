// ============================================================================
// Unauthorized Page
// ============================================================================
// Page shown when user doesn't have permission to access a resource.

import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Unauthorized.module.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="error-code">403</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div className="unauthorized-actions">
          <Link to="/" className="btn-primary">
            Go to Home
          </Link>
          <Link to="/student/dashboard" className="btn-secondary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
