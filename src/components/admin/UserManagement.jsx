// ============================================================================
// User Management Component
// ============================================================================
// Component for managing platform users - view, search, filter, and modify users

import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers, updateUserRole, deleteUser, sendNotification } from '../../services/adminService';
import styles from './AdminComponents.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 15;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAllUsers({
      page,
      limit,
      role: filters.role || undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    });

    if (result.error) {
      setError(result.error);
    } else {
      setUsers(result.data || []);
      setTotalCount(result.count || 0);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(true);
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      alert('Error updating role: ' + result.error);
    } else {
      loadUsers();
      setShowModal(false);
      setSelectedUser(null);
    }
    setActionLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    const result = await deleteUser(userId);
    if (result.error) {
      alert('Error deleting user: ' + result.error);
    } else {
      loadUsers();
    }
    setActionLoading(false);
  };

  const handleSendMessage = async (userId, message) => {
    if (!message.trim()) return;
    setActionLoading(true);
    const result = await sendNotification(userId, 'Message from Admin', message);
    if (result.error) {
      alert('Error sending message: ' + result.error);
    } else {
      alert('Message sent successfully!');
      setShowModal(false);
    }
    setActionLoading(false);
  };

  const totalPages = Math.ceil(totalCount / limit);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return styles.badgeAdmin;
      case 'instructor': return styles.badgeInstructor;
      default: return styles.badgeStudent;
    }
  };

  return (
    <div className={styles.managementSection}>
      <div className={styles.sectionHeader}>
        <h2>👥 User Management</h2>
        <span className={styles.totalCount}>{totalCount} users total</span>
      </div>

      {/* Filters */}
      <form className={styles.filterBar} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className={styles.searchInput}
        />
        <select
          value={filters.role}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, role: e.target.value }));
            setPage(0);
          }}
          className={styles.filterSelect}
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters(prev => ({ ...prev, sortBy, sortOrder }));
          }}
          className={styles.filterSelect}
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="full_name-asc">Name A-Z</option>
          <option value="full_name-desc">Name Z-A</option>
        </select>
        <button type="submit" className={styles.btnSearch}>Search</button>
      </form>

      {/* Error State */}
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.emptyState}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} />
                            ) : (
                              <span>{(user.full_name || user.email || '?')[0].toUpperCase()}</span>
                            )}
                          </div>
                          <span className={styles.userName}>{user.full_name || 'No name'}</span>
                        </div>
                      </td>
                      <td className={styles.emailCell}>{user.email}</td>
                      <td>
                        <span className={`${styles.badge} ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.role === 'instructor' && (
                          <span className={`${styles.badge} ${user.instructor_approved ? styles.badgeApproved : styles.badgePending}`}>
                            {user.instructor_approved ? 'Approved' : 'Pending'}
                          </span>
                        )}
                        {user.role !== 'instructor' && (
                          <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                        )}
                      </td>
                      <td className={styles.dateCell}>{formatDate(user.created_at)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.btnAction}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            title="View/Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.btnAction} ${styles.btnDanger}`}
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === 'admin'}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
                className={styles.pageBtn}
              >
                ← Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page >= totalPages - 1}
                className={styles.pageBtn}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          onRoleChange={handleRoleChange}
          onSendMessage={handleSendMessage}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ user, onClose, onRoleChange, onSendMessage, loading }) => {
  const [newRole, setNewRole] = useState(user.role);
  const [message, setMessage] = useState('');

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>User Details</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.userProfile}>
            <div className={styles.largeAvatar}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} />
              ) : (
                <span>{(user.full_name || user.email || '?')[0].toUpperCase()}</span>
              )}
            </div>
            <h4>{user.full_name || 'No name'}</h4>
            <p>{user.email}</p>
          </div>

          <div className={styles.userDetails}>
            <div className={styles.detailRow}>
              <label>Bio:</label>
              <p>{user.bio || 'No bio provided'}</p>
            </div>
            <div className={styles.detailRow}>
              <label>Member since:</label>
              <p>{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className={styles.actionSection}>
            <h5>Change Role</h5>
            <div className={styles.roleChangeRow}>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className={styles.roleSelect}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => onRoleChange(user.id, newRole)}
                disabled={loading || newRole === user.role}
                className={styles.btnPrimary}
              >
                {loading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>

          <div className={styles.actionSection}>
            <h5>Send Message</h5>
            <textarea
              placeholder="Type a message to send to this user..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.messageInput}
              rows="3"
            />
            <button
              onClick={() => onSendMessage(user.id, message)}
              disabled={loading || !message.trim()}
              className={styles.btnPrimary}
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
