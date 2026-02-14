// ============================================================================
// ErrorBoundary Component
// ============================================================================
// React error boundary to catch and display errors gracefully.

import React from 'react';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '40px'
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
    background: 'rgba(30, 30, 60, 0.8)',
    padding: '48px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 16px 0'
  },
  message: {
    fontSize: '16px',
    color: '#f87171',
    margin: '0 0 24px 0',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px'
  },
  details: {
    textAlign: 'left',
    marginBottom: '24px',
    color: '#94a3b8'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '8px'
  },
  pre: {
    background: 'rgba(15, 15, 35, 0.8)',
    padding: '16px',
    borderRadius: '8px',
    overflow: 'auto',
    fontSize: '12px',
    maxHeight: '200px'
  },
  button: {
    padding: '14px 28px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer'
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>Oops! Something went wrong</h1>
            <p style={styles.message}>{this.state.error?.toString()}</p>
            {process.env.NODE_ENV === 'development' && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details</summary>
                <pre style={styles.pre}>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
            <button style={styles.button} onClick={this.resetError}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
