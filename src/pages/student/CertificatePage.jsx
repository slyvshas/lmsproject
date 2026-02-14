// ============================================================================
// Certificate Page — Course Completion Certificate
// ============================================================================
// Beautiful, printable certificate with course details, completion date,
// and a unique certificate ID.

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchCourseDetails } from '../../services/courseService';
import { getCourseProgress } from '../../services/progressService';

// ============================================================================
// Inline Styles
// ============================================================================

const styles = {
  // Page background
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  // Loading state
  loading: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#e0e0e0',
    gap: '1rem',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(138, 43, 226, 0.3)',
    borderTopColor: '#8a2be2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // Error state
  error: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#e0e0e0',
    gap: '1.5rem',
    textAlign: 'center',
    padding: '2rem',
  },
  errorHeading: {
    fontSize: '1.5rem',
    color: '#ff6b6b',
    margin: 0,
  },
  errorButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },

  // Not eligible state
  notEligible: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  notEligibleCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '3rem',
    textAlign: 'center',
    maxWidth: '500px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  lockIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  notEligibleHeading: {
    color: '#fff',
    fontSize: '1.75rem',
    marginBottom: '0.75rem',
  },
  notEligibleText: {
    color: '#b0b0b0',
    fontSize: '1rem',
    marginBottom: '1.5rem',
  },
  progressInfo: {
    marginBottom: '1.5rem',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    color: '#b0b0b0',
    fontSize: '0.875rem',
  },
  btnContinue: {
    padding: '0.875rem 2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },

  // Actions bar
  actions: {
    width: '100%',
    maxWidth: '900px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  btnBack: {
    padding: '0.625rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#e0e0e0',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background 0.2s ease',
  },
  actionBtns: {
    display: 'flex',
    gap: '0.75rem',
  },
  btnPrint: {
    padding: '0.625rem 1.25rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  btnShare: {
    padding: '0.625rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#e0e0e0',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },

  // Certificate wrapper
  certificateWrapper: {
    width: '100%',
    maxWidth: '850px',
    perspective: '1000px',
  },

  // Certificate card (light background like real certificate)
  certificate: {
    position: 'relative',
    background: 'linear-gradient(145deg, #fffef5 0%, #fff9e6 50%, #fffef5 100%)',
    borderRadius: '8px',
    padding: '3rem',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 8px #c9a227, 0 0 0 12px #1a1a3e',
    border: '2px solid #d4af37',
    overflow: 'hidden',
  },

  // Decorative corners
  corner: {
    position: 'absolute',
    width: '60px',
    height: '60px',
    borderColor: '#c9a227',
    borderStyle: 'solid',
    borderWidth: '0',
  },
  cornerTL: {
    top: '20px',
    left: '20px',
    borderTopWidth: '3px',
    borderLeftWidth: '3px',
    borderTopLeftRadius: '8px',
  },
  cornerTR: {
    top: '20px',
    right: '20px',
    borderTopWidth: '3px',
    borderRightWidth: '3px',
    borderTopRightRadius: '8px',
  },
  cornerBL: {
    bottom: '20px',
    left: '20px',
    borderBottomWidth: '3px',
    borderLeftWidth: '3px',
    borderBottomLeftRadius: '8px',
  },
  cornerBR: {
    bottom: '20px',
    right: '20px',
    borderBottomWidth: '3px',
    borderRightWidth: '3px',
    borderBottomRightRadius: '8px',
  },

  // Ornaments
  ornamentTop: {
    textAlign: 'center',
    fontSize: '1.25rem',
    color: '#c9a227',
    letterSpacing: '1rem',
    marginBottom: '1rem',
  },
  ornamentBottom: {
    textAlign: 'center',
    fontSize: '1.25rem',
    color: '#c9a227',
    letterSpacing: '1rem',
    marginTop: '1.5rem',
  },

  // Certificate body
  body: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '0.5rem',
    letterSpacing: '0.1em',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.5rem',
    fontFamily: 'Georgia, serif',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
  },
  divider: {
    width: '150px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #c9a227, transparent)',
    margin: '1rem auto',
  },

  // Text styles
  certifyText: {
    fontSize: '1rem',
    color: '#555',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
    fontStyle: 'italic',
  },
  recipientName: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0.5rem 0',
    fontFamily: 'Georgia, serif',
    borderBottom: '2px solid #c9a227',
    display: 'inline-block',
    paddingBottom: '0.25rem',
  },
  hasText: {
    fontSize: '1rem',
    color: '#555',
    marginTop: '1rem',
    marginBottom: '0.5rem',
    fontStyle: 'italic',
  },
  courseName: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0.5rem 0 1rem',
    fontFamily: 'Georgia, serif',
  },
  instructorText: {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '1.5rem',
  },

  // Details section
  details: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
  },
  detail: {
    textAlign: 'center',
  },
  detailLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.25rem',
  },
  detailValue: {
    display: 'block',
    fontSize: '1rem',
    color: '#2c3e50',
    fontWeight: '600',
  },

  // Signature
  signature: {
    marginTop: '2rem',
    paddingTop: '1rem',
  },
  sigLine: {
    width: '200px',
    height: '1px',
    background: '#333',
    margin: '0 auto 0.5rem',
  },
  sigText: {
    fontSize: '0.9rem',
    color: '#555',
    fontStyle: 'italic',
    margin: 0,
  },
};

// Keyframes for spinner (injected via style tag)
const spinnerKeyframes = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @media print {
    .no-print { display: none !important; }
  }
`;

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const certRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const courseRes = await fetchCourseDetails(courseId);
        if (!courseRes.data) {
          setError('Course not found');
          return;
        }
        setCourse(courseRes.data);

        const enrollId = courseRes.data.enrollment_id;
        if (!enrollId) {
          setError('You are not enrolled in this course');
          return;
        }

        const progressRes = await getCourseProgress(enrollId);
        if (progressRes.data) {
          setProgress(progressRes.data);
          setIsEligible(progressRes.data.progressPercentage >= 100);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId]);

  const handlePrint = () => window.print();

  const handleShare = () => {
    const text = `I completed "${course?.title}" on LMS Pro! 🎓`;
    if (navigator.share) {
      navigator.share({ title: 'Course Certificate', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Generate a deterministic certificate ID from course + user
  const certId = course && userProfile
    ? `LMS-${courseId?.slice(0, 4).toUpperCase()}-${userProfile.id?.slice(0, 4).toUpperCase()}-${new Date().getFullYear()}`
    : '';

  const completionDate = progress?.progress_tracking?.reduce((latest, p) => {
    if (p.completed_at && new Date(p.completed_at) > new Date(latest)) return p.completed_at;
    return latest;
  }, '2020-01-01');

  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.loadingSpinner} />
        <p>Loading certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <style>{spinnerKeyframes}</style>
        <h2 style={styles.errorHeading}>❌ {error}</h2>
        <button style={styles.errorButton} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div style={styles.notEligible}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.notEligibleCard}>
          <span style={styles.lockIcon}>🔒</span>
          <h2 style={styles.notEligibleHeading}>Certificate Not Yet Available</h2>
          <p style={styles.notEligibleText}>Complete all lessons in this course to earn your certificate.</p>
          <div style={styles.progressInfo}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress?.progressPercentage || 0}%` }} />
            </div>
            <span style={styles.progressText}>
              {progress?.progressPercentage || 0}% complete — {progress?.completedLessons || 0}/{progress?.totalLessons || 0} lessons
            </span>
          </div>
          <button
            style={styles.btnContinue}
            onClick={() => navigate(`/courses/${courseId}`)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Continue Learning →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{spinnerKeyframes}</style>

      {/* Actions Bar */}
      <div style={styles.actions} className="no-print">
        <button
          style={styles.btnBack}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          ← Back
        </button>
        <div style={styles.actionBtns}>
          <button
            style={styles.btnPrint}
            onClick={handlePrint}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            🖨️ Print Certificate
          </button>
          <button
            style={styles.btnShare}
            onClick={handleShare}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            🔗 Share
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div style={styles.certificateWrapper} ref={certRef}>
        <div style={styles.certificate}>
          {/* Decorative corners */}
          <div style={{ ...styles.corner, ...styles.cornerTL }}></div>
          <div style={{ ...styles.corner, ...styles.cornerTR }}></div>
          <div style={{ ...styles.corner, ...styles.cornerBL }}></div>
          <div style={{ ...styles.corner, ...styles.cornerBR }}></div>

          {/* Top ornament */}
          <div style={styles.ornamentTop}>✦ ✦ ✦</div>

          <div style={styles.body}>
            <div style={styles.logo}>📚 LMS Pro</div>
            <h2 style={styles.title}>Certificate of Completion</h2>
            <div style={styles.divider}></div>

            <p style={styles.certifyText}>This is to certify that</p>
            <h1 style={styles.recipientName}>{userProfile?.full_name || 'Student'}</h1>

            <p style={styles.hasText}>has successfully completed the course</p>
            <h3 style={styles.courseName}>{course?.title}</h3>

            <p style={styles.instructorText}>
              Taught by <strong>{course?.users?.full_name || 'Instructor'}</strong>
            </p>

            <div style={styles.details}>
              <div style={styles.detail}>
                <span style={styles.detailLabel}>Date</span>
                <span style={styles.detailValue}>{formattedDate}</span>
              </div>
              <div style={styles.detail}>
                <span style={styles.detailLabel}>Lessons</span>
                <span style={styles.detailValue}>{progress?.totalLessons || 0}</span>
              </div>
              <div style={styles.detail}>
                <span style={styles.detailLabel}>Certificate ID</span>
                <span style={styles.detailValue}>{certId}</span>
              </div>
            </div>

            <div style={styles.signature}>
              <div style={styles.sigLine}></div>
              <p style={styles.sigText}>LMS Pro Academy</p>
            </div>
          </div>

          <div style={styles.ornamentBottom}>✦ ✦ ✦</div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
