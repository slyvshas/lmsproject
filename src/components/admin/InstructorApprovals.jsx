// ============================================================================
// Instructor Approvals Component
// ============================================================================
// Component for reviewing and approving/rejecting instructor applications

import React, { useState, useEffect, useCallback } from 'react';
import { fetchPendingInstructors, approveInstructor, rejectInstructor } from '../../services/adminService';
import styles from './AdminComponents.module.css';

const InstructorApprovals = ({ onUpdate }) => {
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadPendingInstructors = useCallback(async () => {
    setLoading(true);
    const result = await fetchPendingInstructors();
    if (result.error) {
      setError(result.error);
    } else {
      setPendingInstructors(result.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPendingInstructors();
  }, [loadPendingInstructors]);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    const result = await approveInstructor(userId);
    if (result.error) {
      alert('Error approving instructor: ' + result.error);
    } else {
      loadPendingInstructors();
      if (onUpdate) onUpdate();
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!selectedInstructor) return;
    
    setActionLoading(selectedInstructor.id);
    const result = await rejectInstructor(selectedInstructor.id, rejectReason);
    if (result.error) {
      alert('Error rejecting application: ' + result.error);
    } else {
      loadPendingInstructors();
      setShowRejectModal(false);
      setSelectedInstructor(null);
      setRejectReason('');
      if (onUpdate) onUpdate();
    }
    setActionLoading(null);
  };

  const openRejectModal = (instructor) => {
    setSelectedInstructor(instructor);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className={styles.managementSection}>
        <div className={styles.sectionHeader}>
          <h2>✅ Instructor Approvals</h2>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.managementSection}>
      <div className={styles.sectionHeader}>
        <h2>✅ Instructor Approvals</h2>
        <span className={`${styles.badge} ${styles.badgePending}`}>
          {pendingInstructors.length} Pending
        </span>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️</span> {error}
        </div>
      )}

      {pendingInstructors.length === 0 ? (
        <div className={styles.emptyStateCard}>
          <span className={styles.emptyIcon}>🎉</span>
          <h3>All Caught Up!</h3>
          <p>No pending instructor applications at the moment.</p>
        </div>
      ) : (
        <div className={styles.applicationsGrid}>
          {pendingInstructors.map(instructor => (
            <div key={instructor.id} className={styles.applicationCard}>
              <div className={styles.applicationHeader}>
                <div className={styles.applicantInfo}>
                  <div className={styles.avatar}>
                    {instructor.avatar_url ? (
                      <img src={instructor.avatar_url} alt={instructor.full_name} />
                    ) : (
                      <span>{(instructor.full_name || instructor.email || '?')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h4>{instructor.full_name || 'No name provided'}</h4>
                    <p className={styles.emailText}>{instructor.email}</p>
                  </div>
                </div>
                <span className={styles.timeAgo}>{getTimeAgo(instructor.created_at)}</span>
              </div>

              <div className={styles.applicationBody}>
                {instructor.bio ? (
                  <div className={styles.bioSection}>
                    <label>Bio / Qualifications:</label>
                    <p>{instructor.bio}</p>
                  </div>
                ) : (
                  <p className={styles.noBio}>No bio provided by applicant</p>
                )}

                <div className={styles.applicationMeta}>
                  <span>📅 Applied: {formatDate(instructor.created_at)}</span>
                </div>
              </div>

              <div className={styles.applicationActions}>
                <button
                  className={`${styles.btnAction} ${styles.btnApprove}`}
                  onClick={() => handleApprove(instructor.id)}
                  disabled={actionLoading === instructor.id}
                >
                  {actionLoading === instructor.id ? (
                    <span className={styles.btnSpinner}></span>
                  ) : (
                    '✓ Approve'
                  )}
                </button>
                <button
                  className={`${styles.btnAction} ${styles.btnReject}`}
                  onClick={() => openRejectModal(instructor)}
                  disabled={actionLoading === instructor.id}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedInstructor && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Reject Application</h3>
              <button className={styles.closeBtn} onClick={() => setShowRejectModal(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              <p>
                You are about to reject the instructor application from{' '}
                <strong>{selectedInstructor.full_name || selectedInstructor.email}</strong>.
              </p>
              <p className={styles.warningText}>
                The user will be reverted to a student role and notified of this decision.
              </p>

              <div className={styles.formGroup}>
                <label>Reason for Rejection (Optional)</label>
                <textarea
                  placeholder="Provide a reason for the rejection that will be sent to the applicant..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className={styles.messageInput}
                  rows="4"
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.btnAction} ${styles.btnReject}`}
                  onClick={handleReject}
                  disabled={actionLoading === selectedInstructor?.id}
                >
                  {actionLoading === selectedInstructor?.id ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorApprovals;
