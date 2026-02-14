// ============================================================================
// Login Page
// ============================================================================
// Form for user authentication with email and password.
// Includes validation and error handling.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/student/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '20px'
  };

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    maxWidth: '1000px',
    width: '100%',
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const cardStyle = {
    padding: '48px'
  };

  const headerStyle = {
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 8px 0'
  };

  const subtitleStyle = {
    fontSize: '15px',
    color: '#94a3b8',
    margin: 0
  };

  const formGroupStyle = {
    marginBottom: '24px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(15, 15, 35, 0.8)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box'
  };

  const errorStyle = {
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    marginBottom: '20px',
    fontSize: '14px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.2s'
  };

  const linksStyle = {
    marginTop: '24px',
    textAlign: 'center'
  };

  const linkStyle = {
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  };

  const illustrationStyle = {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px'
  };

  const illustrationContentStyle = {
    color: '#fff',
    textAlign: 'center'
  };

  const illustrationTitleStyle = {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 12px 0'
  };

  const illustrationTextStyle = {
    fontSize: '15px',
    opacity: 0.9,
    margin: '0 0 32px 0'
  };

  const benefitsListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    textAlign: 'left'
  };

  const benefitItemStyle = {
    fontSize: '15px',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>Welcome Back</h1>
            <p style={subtitleStyle}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                style={inputStyle}
              />
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <button type="submit" style={buttonStyle} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={linksStyle}>
            <Link to="/forgot-password" style={linkStyle}>Forgot password?</Link>
            <p style={{ color: '#94a3b8', marginTop: '16px', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ ...linkStyle, fontWeight: '600' }}>Sign up</Link>
            </p>
          </div>
        </div>

        <div style={illustrationStyle}>
          <div style={illustrationContentStyle}>
            <h2 style={illustrationTitleStyle}>Start Learning Today</h2>
            <p style={illustrationTextStyle}>Join thousands of students worldwide on their learning journey</p>
            <ul style={benefitsListStyle}>
              <li style={benefitItemStyle}>📚 Access to thousands of courses</li>
              <li style={benefitItemStyle}>🎓 Learn from industry experts</li>
              <li style={benefitItemStyle}>📊 Track your progress</li>
              <li style={benefitItemStyle}>🏆 Earn certificates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
