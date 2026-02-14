// ============================================================================
// Home Page
// ============================================================================
// Landing page for the LMS platform.

import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

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

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    color: '#fff'
  };

  const heroStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 40px',
    minHeight: '70vh',
    gap: '60px'
  };

  const heroContentStyle = {
    maxWidth: '560px'
  };

  const h1Style = {
    fontSize: '52px',
    fontWeight: '800',
    lineHeight: 1.1,
    margin: '0 0 24px 0',
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const heroTextStyle = {
    fontSize: '20px',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: '0 0 36px 0'
  };

  const heroButtonsStyle = {
    display: 'flex',
    gap: '16px'
  };

  const primaryBtnStyle = {
    padding: '16px 32px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '17px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.2s'
  };

  const secondaryBtnStyle = {
    padding: '16px 32px',
    borderRadius: '12px',
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontSize: '17px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'border-color 0.2s'
  };

  const illustrationStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const illustrationBoxStyle = {
    width: '320px',
    height: '320px',
    borderRadius: '32px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '120px',
    boxShadow: '0 25px 50px rgba(99, 102, 241, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const sectionStyle = {
    padding: '80px 40px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const sectionTitleStyle = {
    fontSize: '36px',
    fontWeight: '800',
    textAlign: 'center',
    margin: '0 0 48px 0'
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px'
  };

  const featureCardStyle = {
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '20px',
    padding: '32px 24px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const featureIconStyle = {
    fontSize: '48px',
    marginBottom: '16px'
  };

  const featureHeadingStyle = {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 12px 0',
    color: '#fff'
  };

  const featureTextStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.5
  };

  const ctaStyle = {
    textAlign: 'center',
    padding: '80px 40px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
    borderRadius: '32px',
    maxWidth: '1000px',
    margin: '0 auto 60px auto'
  };

  const ctaTitleStyle = {
    fontSize: '36px',
    fontWeight: '800',
    margin: '0 0 12px 0'
  };

  const ctaTextStyle = {
    fontSize: '18px',
    color: '#94a3b8',
    margin: '0 0 32px 0'
  };

  const largeBtnStyle = {
    ...primaryBtnStyle,
    padding: '18px 48px',
    fontSize: '18px'
  };

  return (
    <div style={pageStyle}>
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={heroContentStyle}>
          <h1 style={h1Style}>Empower Your Learning Journey</h1>
          <p style={heroTextStyle}>
            Join thousands of students worldwide in an AI-powered learning platform
          </p>
          {!isAuthenticated && (
            <div style={heroButtonsStyle}>
              <Link to="/signup" style={primaryBtnStyle}>
                Get Started Free
              </Link>
              <Link to="/login" style={secondaryBtnStyle}>
                Sign In
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div style={heroButtonsStyle}>
              <Link to={getDashboardPath()} style={primaryBtnStyle}>
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
        <div style={illustrationStyle}>
          <div style={illustrationBoxStyle}>📚</div>
        </div>
      </section>

      {/* Features Section */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Why Choose Our LMS?</h2>
        <div style={featuresGridStyle}>
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>🎯</div>
            <h3 style={featureHeadingStyle}>Adaptive Learning</h3>
            <p style={featureTextStyle}>AI-powered recommendations adjust to your learning pace</p>
          </div>
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>🏆</div>
            <h3 style={featureHeadingStyle}>Earn Certificates</h3>
            <p style={featureTextStyle}>Complete courses and earn recognized certificates</p>
          </div>
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>👨‍🏫</div>
            <h3 style={featureHeadingStyle}>Expert Instructors</h3>
            <p style={featureTextStyle}>Learn from industry professionals and subject matter experts</p>
          </div>
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>📊</div>
            <h3 style={featureHeadingStyle}>Track Progress</h3>
            <p style={featureTextStyle}>Monitor your learning with detailed analytics and insights</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={ctaStyle}>
        <h2 style={ctaTitleStyle}>Ready to Start Learning?</h2>
        <p style={ctaTextStyle}>Hundreds of courses waiting for you</p>
        <Link to={isAuthenticated ? getDashboardPath() : '/signup'} style={largeBtnStyle}>
          Explore Now
        </Link>
      </section>
    </div>
  );
};

export default Home;
