// ============================================================================
// Signup Page
// ============================================================================
// Form for new user registration with email, password, and full name.
// Includes validation and error handling.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (result.success) {
        if (result.needsEmailConfirmation) {
          setError('');
          alert('Success! Please check your email to verify your account, then login.');
          navigate('/login');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(result.error || 'Signup failed');
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
    padding: '40px 48px'
  };

  const headerStyle = {
    marginBottom: '28px'
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
    marginBottom: '20px'
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
    padding: '12px 14px',
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
    marginBottom: '16px',
    fontSize: '14px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
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
    marginTop: '20px',
    textAlign: 'center'
  };

  const linkStyle = {
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600'
  };

  const illustrationStyle = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c026d3 100%)',
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
            <h1 style={titleStyle}>Create Account</h1>
            <p style={subtitleStyle}>Join our learning community</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={isLoading}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isLoading}
                style={inputStyle}
              />
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <button type="submit" style={buttonStyle} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div style={linksStyle}>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
              Already have an account?{' '}
              <Link to="/login" style={linkStyle}>Sign in</Link>
            </p>
          </div>
        </div>

        <div style={illustrationStyle}>
          <div style={illustrationContentStyle}>
            <h2 style={illustrationTitleStyle}>Begin Your Learning Journey</h2>
            <p style={illustrationTextStyle}>Unlock unlimited access to premium courses and resources</p>
            <ul style={benefitsListStyle}>
              <li style={benefitItemStyle}>🚀 Fast and free signup</li>
              <li style={benefitItemStyle}>💡 Learn at your own pace</li>
              <li style={benefitItemStyle}>🌟 Personalized recommendations</li>
              <li style={benefitItemStyle}>✅ Complete at your schedule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
