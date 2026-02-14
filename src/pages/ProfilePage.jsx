// ============================================================================
// Profile Page — User Profile Management
// ============================================================================
// View and edit profile with avatar, bio, stats, and account settings.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats } from '../services/progressService';
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers';

// Inline Styles
const styles = {
  profilePage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '2rem',
    color: '#fff',
  },
  profileContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  profileMessage: {
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  profileMessageSuccess: {
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#4ade80',
  },
  profileMessageError: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
  },
  messageCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: 0,
  },
  profileHeaderCard: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  profileAvatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  profileAvatarImg: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid rgba(139, 92, 246, 0.5)',
  },
  profileAvatarInitials: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    border: '4px solid rgba(139, 92, 246, 0.5)',
  },
  avatarEdit: {
    width: '100%',
  },
  avatarUrlInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(15, 15, 35, 0.8)',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  profileInfo: {
    flex: 1,
    minWidth: '200px',
  },
  profileName: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    marginBottom: '0.5rem',
  },
  profileNameInput: {
    fontSize: '1.5rem',
    fontWeight: 700,
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(15, 15, 35, 0.8)',
    color: '#fff',
    width: '100%',
    outline: 'none',
  },
  profileEmail: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    margin: '0.25rem 0',
  },
  profileRole: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginTop: '0.5rem',
  },
  profileJoined: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  profileHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  btnEditProfile: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  editActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  btnSaveProfile: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  btnCancelEdit: {
    background: 'rgba(100, 100, 120, 0.5)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  profileSection: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem 2rem',
  },
  sectionHeading: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    marginBottom: '1rem',
  },
  profileBioInput: {
    width: '100%',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(15, 15, 35, 0.8)',
    color: '#fff',
    fontSize: '1rem',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
  },
  profileBio: {
    color: '#94a3b8',
    fontSize: '1rem',
    lineHeight: 1.6,
    margin: 0,
  },
  profileStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
  },
  profileStatCard: {
    background: 'rgba(15, 15, 35, 0.6)',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'center',
  },
  profileStatIcon: {
    fontSize: '1.75rem',
  },
  profileStatNum: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
  },
  profileStatLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  settingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  settingsItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    background: 'rgba(15, 15, 35, 0.6)',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    borderRadius: '12px',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  settingsItemH3: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  settingsItemP: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    margin: '0.25rem 0 0 0',
  },
  btnSetting: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  verifiedBadge: {
    padding: '0.4rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  verifiedBadgeVerified: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#4ade80',
  },
  verifiedBadgeUnverified: {
    background: 'rgba(234, 179, 8, 0.15)',
    color: '#facc15',
  },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile, updateProfile, user, resetPassword } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        full_name: userProfile.full_name || '',
        avatar_url: userProfile.avatar_url || '',
        bio: userProfile.bio || '',
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const loadStats = async () => {
      if (!userProfile?.id || userProfile.role !== 'student') return;
      const res = await getDashboardStats(userProfile.id);
      if (res.data) setStats(res.data);
    };
    loadStats();
  }, [userProfile]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    try {
      setSaving(true);
      const result = await updateProfile(form);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    const result = await resetPassword(user.email);
    if (result.success) {
      setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const initials = getInitials(userProfile?.full_name || 'U');
  const avatarColor = getAvatarColor(userProfile?.full_name || 'User');

  const roleLabels = { student: '🎓 Student', instructor: '👨‍🏫 Instructor', admin: '🛡️ Admin' };

  return (
    <div style={styles.profilePage}>
      <div style={styles.profileContainer}>
        {/* Message */}
        {message && (
          <div style={{
            ...styles.profileMessage,
            ...(message.type === 'success' ? styles.profileMessageSuccess : styles.profileMessageError),
          }}>
            {message.text}
            <button style={styles.messageCloseBtn} onClick={() => setMessage(null)}>✕</button>
          </div>
        )}

        {/* Profile Header Card */}
        <div style={styles.profileHeaderCard}>
          <div style={styles.profileAvatarSection}>
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Avatar" style={styles.profileAvatarImg} />
            ) : (
              <div style={{ ...styles.profileAvatarInitials, background: avatarColor }}>
                {initials}
              </div>
            )}
            {isEditing && (
              <div style={styles.avatarEdit}>
                <input
                  type="url"
                  placeholder="Avatar URL..."
                  value={form.avatar_url}
                  onChange={(e) => handleChange('avatar_url', e.target.value)}
                  style={styles.avatarUrlInput}
                />
              </div>
            )}
          </div>

          <div style={styles.profileInfo}>
            {isEditing ? (
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                style={styles.profileNameInput}
                placeholder="Your name"
              />
            ) : (
              <h1 style={styles.profileName}>{userProfile?.full_name || 'User'}</h1>
            )}
            <p style={styles.profileEmail}>{user?.email}</p>
            <span style={styles.profileRole}>{roleLabels[userProfile?.role] || '🎓 Student'}</span>
            <p style={styles.profileJoined}>Joined {formatDate(userProfile?.created_at)}</p>
          </div>

          <div style={styles.profileHeaderActions}>
            {!isEditing ? (
              <button style={styles.btnEditProfile} onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={styles.editActions}>
                <button style={styles.btnSaveProfile} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save'}
                </button>
                <button style={styles.btnCancelEdit} onClick={() => { setIsEditing(false); setForm({ full_name: userProfile?.full_name || '', avatar_url: userProfile?.avatar_url || '', bio: userProfile?.bio || '' }); }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={styles.profileSection}>
          <h2 style={styles.sectionHeading}>About</h2>
          {isEditing ? (
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              style={styles.profileBioInput}
              rows={4}
            />
          ) : (
            <p style={styles.profileBio}>{userProfile?.bio || 'No bio yet. Click Edit Profile to add one!'}</p>
          )}
        </div>

        {/* Student Stats */}
        {userProfile?.role === 'student' && stats && (
          <div style={styles.profileSection}>
            <h2 style={styles.sectionHeading}>Learning Stats</h2>
            <div style={styles.profileStatsGrid}>
              <div style={styles.profileStatCard}>
                <span style={styles.profileStatIcon}>📚</span>
                <span style={styles.profileStatNum}>{stats.activeEnrollments}</span>
                <span style={styles.profileStatLabel}>Active Courses</span>
              </div>
              <div style={styles.profileStatCard}>
                <span style={styles.profileStatIcon}>✅</span>
                <span style={styles.profileStatNum}>{stats.completedCourses}</span>
                <span style={styles.profileStatLabel}>Completed</span>
              </div>
              <div style={styles.profileStatCard}>
                <span style={styles.profileStatIcon}>📝</span>
                <span style={styles.profileStatNum}>{stats.totalLessonsCompleted}</span>
                <span style={styles.profileStatLabel}>Lessons Done</span>
              </div>
              <div style={styles.profileStatCard}>
                <span style={styles.profileStatIcon}>🎯</span>
                <span style={styles.profileStatNum}>{stats.averageQuizScore}%</span>
                <span style={styles.profileStatLabel}>Avg Quiz Score</span>
              </div>
              <div style={styles.profileStatCard}>
                <span style={styles.profileStatIcon}>📊</span>
                <span style={styles.profileStatNum}>{stats.totalQuizAttempts}</span>
                <span style={styles.profileStatLabel}>Quiz Attempts</span>
              </div>
              <div style={styles.profileStatCard}>
                <span style={styles.profileStatIcon}>🎓</span>
                <span style={styles.profileStatNum}>{stats.totalEnrollments}</span>
                <span style={styles.profileStatLabel}>Total Enrolled</span>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div style={styles.profileSection}>
          <h2 style={styles.sectionHeading}>Account Settings</h2>
          <div style={styles.settingsList}>
            <div style={styles.settingsItem}>
              <div>
                <h3 style={styles.settingsItemH3}>Password</h3>
                <p style={styles.settingsItemP}>Send a password reset email to your inbox</p>
              </div>
              <button style={styles.btnSetting} onClick={handleResetPassword}>
                Reset Password
              </button>
            </div>
            <div style={styles.settingsItem}>
              <div>
                <h3 style={styles.settingsItemH3}>Email</h3>
                <p style={styles.settingsItemP}>{user?.email}</p>
              </div>
              <span style={{
                ...styles.verifiedBadge,
                ...(user?.email_confirmed_at ? styles.verifiedBadgeVerified : styles.verifiedBadgeUnverified),
              }}>
                {user?.email_confirmed_at ? '✓ Verified' : '⚠ Unverified'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
