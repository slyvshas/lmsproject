// ============================================================================
// Signup Page
// ============================================================================
// Form for new user registration with email, password, and full name.
// Includes validation and error handling.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../styles/AuthForm.module.css';

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

    // Validation
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

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join our learning community</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name Input */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Links */}
          <div className="auth-links">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="link-highlight">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Illustration Side */}
        <div className="auth-illustration">
          <div className="illustration-content">
            <h2>Begin Your Learning Journey</h2>
            <p>Unlock unlimited access to premium courses and resources</p>
            <ul className="benefits-list">
              <li>🚀 Fast and free signup</li>
              <li>💡 Learn at your own pace</li>
              <li>🌟 Personalized recommendations</li>
              <li>✅ Complete at your schedule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
