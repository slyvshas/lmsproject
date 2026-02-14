// ============================================================================
// Navbar Component
// ============================================================================
// Main navigation bar showing user info and navigation links based on role.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const { user, userProfile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const getUserDashboard = () => {
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
    <nav className={styles.navbar} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      height: '72px',
      background: 'rgba(15, 15, 35, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className={styles.navbarContainer} style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 2rem' 
      }}>
        {/* Logo */}
        <Link to="/" className={styles.navbarLogo} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>📚 LMS Pro</span>
        </Link>

        {/* Navigation Links */}
        <ul className={styles.navbarMenu} style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: '8px', 
          listStyle: 'none', 
          margin: 0, 
          padding: 0 
        }}>
          {isAuthenticated ? (
            <>
              <li style={{ display: 'inline-flex' }}>
                <Link to={getUserDashboard()} style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}>Dashboard</Link>
              </li>
              <li style={{ display: 'inline-flex' }}>
                <Link to="/courses" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}>Courses</Link>
              </li>
              <li style={{ display: 'inline-flex' }}>
                <Link to="/articles" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}>Articles</Link>
              </li>

              {/* Instructor Links */}
              {userProfile?.role === 'instructor' && (
                <>
                  <li style={{ display: 'inline-flex' }}>
                    <Link to="/instructor/create-course" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none', 
                      padding: '10px 16px', 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}>Create Course</Link>
                  </li>
                </>
              )}

              {/* Admin Links */}
              {userProfile?.role === 'admin' && (
                <>
                  <li style={{ display: 'inline-flex' }}>
                    <Link to="/admin/users" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none', 
                      padding: '10px 16px', 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}>Users</Link>
                  </li>
                  <li style={{ display: 'inline-flex' }}>
                    <Link to="/admin/statistics" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none', 
                      padding: '10px 16px', 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}>Statistics</Link>
                  </li>
                </>
              )}

              {/* User Menu */}
              <li 
                className={styles.userMenuTrigger} 
                onMouseEnter={() => setShowUserMenu(true)} 
                onMouseLeave={() => setShowUserMenu(false)}
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}
              >
                <span style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 16px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '24px',
                  color: '#f1f5f9',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  <span style={{ 
                    width: '28px', 
                    height: '28px', 
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {(userProfile?.full_name || user?.email)?.charAt(0).toUpperCase()}
                  </span>
                  {userProfile?.full_name || user?.email}
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
                </span>
                {showUserMenu && (
                  <div style={{ 
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: 'rgba(20, 20, 45, 0.98)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    minWidth: '200px',
                    overflow: 'hidden',
                    zIndex: 1001
                  }}>
                    <Link to="/profile" style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <span>👤</span> Profile
                    </Link>
                    <Link to={getUserDashboard()} style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <span>📊</span> Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '14px 16px',
                        background: 'none',
                        border: 'none',
                        color: '#f43f5e',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li style={{ display: 'inline-flex' }}>
                <Link to="/courses" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}>Courses</Link>
              </li>
              <li style={{ display: 'inline-flex' }}>
                <Link to="/articles" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}>Articles</Link>
              </li>
              <li style={{ display: 'inline-flex' }}>
                <Link to="/login" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}>Login</Link>
              </li>
              <li style={{ display: 'inline-flex' }}>
                <Link to="/signup" style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white', 
                  textDecoration: 'none', 
                  padding: '10px 24px', 
                  borderRadius: '24px', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.2s'
                }}>Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
