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
import '../styles/CertificatePage.module.css';

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
      <div className="cert-loading">
        <div className="loading-spinner" />
        <p>Loading certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cert-error">
        <h2>❌ {error}</h2>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="cert-not-eligible">
        <div className="cert-not-eligible-card">
          <span className="cert-lock-icon">🔒</span>
          <h2>Certificate Not Yet Available</h2>
          <p>Complete all lessons in this course to earn your certificate.</p>
          <div className="cert-progress-info">
            <div className="cert-progress-bar">
              <div className="cert-progress-fill" style={{ width: `${progress?.progressPercentage || 0}%` }} />
            </div>
            <span>{progress?.progressPercentage || 0}% complete — {progress?.completedLessons || 0}/{progress?.totalLessons || 0} lessons</span>
          </div>
          <button onClick={() => navigate(`/courses/${courseId}`)} className="btn-continue">
            Continue Learning →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      {/* Actions Bar */}
      <div className="cert-actions no-print">
        <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        <div className="cert-action-btns">
          <button onClick={handlePrint} className="btn-print">🖨️ Print Certificate</button>
          <button onClick={handleShare} className="btn-share">🔗 Share</button>
        </div>
      </div>

      {/* Certificate */}
      <div className="certificate-wrapper" ref={certRef}>
        <div className="certificate">
          {/* Decorative corners */}
          <div className="cert-corner cert-tl"></div>
          <div className="cert-corner cert-tr"></div>
          <div className="cert-corner cert-bl"></div>
          <div className="cert-corner cert-br"></div>

          {/* Top ornament */}
          <div className="cert-ornament-top">✦ ✦ ✦</div>

          <div className="cert-body">
            <div className="cert-logo">📚 LMS Pro</div>
            <h2 className="cert-title">Certificate of Completion</h2>
            <div className="cert-divider"></div>

            <p className="cert-this">This is to certify that</p>
            <h1 className="cert-name">{userProfile?.full_name || 'Student'}</h1>

            <p className="cert-has">has successfully completed the course</p>
            <h3 className="cert-course">{course?.title}</h3>

            <p className="cert-instructor">
              Taught by <strong>{course?.users?.full_name || 'Instructor'}</strong>
            </p>

            <div className="cert-details">
              <div className="cert-detail">
                <span className="cert-detail-label">Date</span>
                <span className="cert-detail-value">{formattedDate}</span>
              </div>
              <div className="cert-detail">
                <span className="cert-detail-label">Lessons</span>
                <span className="cert-detail-value">{progress?.totalLessons || 0}</span>
              </div>
              <div className="cert-detail">
                <span className="cert-detail-label">Certificate ID</span>
                <span className="cert-detail-value">{certId}</span>
              </div>
            </div>

            <div className="cert-signature">
              <div className="cert-sig-line"></div>
              <p>LMS Pro Academy</p>
            </div>
          </div>

          <div className="cert-ornament-bottom">✦ ✦ ✦</div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
