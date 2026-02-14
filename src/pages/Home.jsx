// ============================================================================
// Home Page
// ============================================================================
// Landing page for the LMS platform.

import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './styles/Home.module.css';

const Home = () => {
  const { isAuthenticated, userProfile } = useAuth();

  const getDashboardPath = () => {
    switch (userProfile?.role) {
      case 'instructor':
        return '/instructor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Empower Your Learning Journey</h1>
          <p>
            Join thousands of students worldwide in an AI-powered learning platform
          </p>
          {!isAuthenticated && (
            <div className="hero-buttons">
              <Link to="/signup" className="btn-primary-hero">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary-hero">
                Sign In
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="hero-buttons">
              <Link to={getDashboardPath()} className="btn-primary-hero">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
        <div className="hero-illustration">
          <div className="illustration-box">📚</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our LMS?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Adaptive Learning</h3>
            <p>AI-powered recommendations adjust to your learning pace</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Earn Certificates</h3>
            <p>Complete courses and earn recognized certificates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Expert Instructors</h3>
            <p>Learn from industry professionals and subject matter experts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your learning with detailed analytics and insights</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-home-section">
        <h2>Ready to Start Learning?</h2>
        <p>Hundreds of courses waiting for you</p>
        <Link to={isAuthenticated ? getDashboardPath() : '/signup'} className="btn-large">
          Explore Now
        </Link>
      </section>
    </div>
  );
};

export default Home;
