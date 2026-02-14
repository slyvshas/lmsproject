// ============================================================================
// Profile Page — User Profile Management
// ============================================================================
// View and edit profile with avatar, bio, stats, and account settings.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats } from '../services/progressService';
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers';
import './styles/ProfilePage.module.css';

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
    <div className="profile-page">
      <div className="profile-container">
        {/* Message */}
        {message && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage(null)}>✕</button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-section">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-initials" style={{ background: avatarColor }}>
                {initials}
              </div>
            )}
            {isEditing && (
              <div className="avatar-edit">
                <input
                  type="url"
                  placeholder="Avatar URL..."
                  value={form.avatar_url}
                  onChange={(e) => handleChange('avatar_url', e.target.value)}
                  className="avatar-url-input"
                />
              </div>
            )}
          </div>

          <div className="profile-info">
            {isEditing ? (
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="profile-name-input"
                placeholder="Your name"
              />
            ) : (
              <h1 className="profile-name">{userProfile?.full_name || 'User'}</h1>
            )}
            <p className="profile-email">{user?.email}</p>
            <span className="profile-role">{roleLabels[userProfile?.role] || '🎓 Student'}</span>
            <p className="profile-joined">Joined {formatDate(userProfile?.created_at)}</p>
          </div>

          <div className="profile-header-actions">
            {!isEditing ? (
              <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save'}
                </button>
                <button className="btn-cancel-edit" onClick={() => { setIsEditing(false); setForm({ full_name: userProfile?.full_name || '', avatar_url: userProfile?.avatar_url || '', bio: userProfile?.bio || '' }); }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="profile-section">
          <h2>About</h2>
          {isEditing ? (
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="profile-bio-input"
              rows={4}
            />
          ) : (
            <p className="profile-bio">{userProfile?.bio || 'No bio yet. Click Edit Profile to add one!'}</p>
          )}
        </div>

        {/* Student Stats */}
        {userProfile?.role === 'student' && stats && (
          <div className="profile-section">
            <h2>Learning Stats</h2>
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <span className="profile-stat-icon">📚</span>
                <span className="profile-stat-num">{stats.activeEnrollments}</span>
                <span className="profile-stat-label">Active Courses</span>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-icon">✅</span>
                <span className="profile-stat-num">{stats.completedCourses}</span>
                <span className="profile-stat-label">Completed</span>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-icon">📝</span>
                <span className="profile-stat-num">{stats.totalLessonsCompleted}</span>
                <span className="profile-stat-label">Lessons Done</span>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-icon">🎯</span>
                <span className="profile-stat-num">{stats.averageQuizScore}%</span>
                <span className="profile-stat-label">Avg Quiz Score</span>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-icon">📊</span>
                <span className="profile-stat-num">{stats.totalQuizAttempts}</span>
                <span className="profile-stat-label">Quiz Attempts</span>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-icon">🎓</span>
                <span className="profile-stat-num">{stats.totalEnrollments}</span>
                <span className="profile-stat-label">Total Enrolled</span>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div className="profile-section">
          <h2>Account Settings</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div>
                <h3>Password</h3>
                <p>Send a password reset email to your inbox</p>
              </div>
              <button className="btn-setting" onClick={handleResetPassword}>
                Reset Password
              </button>
            </div>
            <div className="settings-item">
              <div>
                <h3>Email</h3>
                <p>{user?.email}</p>
              </div>
              <span className="verified-badge">
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
