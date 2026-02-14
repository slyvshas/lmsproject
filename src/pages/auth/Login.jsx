// ============================================================================
// Login Page
// ============================================================================
// Form for user authentication with email and password.
// Includes validation and error handling.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../styles/AuthForm.module.css';

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

    // Validation
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
        // Navigate based on role (handled in login function)
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

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Links */}
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="link-highlight">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Illustration Side */}
        <div className="auth-illustration">
          <div className="illustration-content">
            <h2>Start Learning Today</h2>
            <p>Join thousands of students worldwide on their learning journey</p>
            <ul className="benefits-list">
              <li>📚 Access to thousands of courses</li>
              <li>🎓 Learn from industry experts</li>
              <li>📊 Track your progress</li>
              <li>🏆 Earn certificates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
