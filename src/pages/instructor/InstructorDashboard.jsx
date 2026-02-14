// ============================================================================
// Instructor Dashboard
// ============================================================================
// Main dashboard for instructors to manage courses, modules, and student progress.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchInstructorCourses, updateCourse, deleteCourse } from '../../services/courseService';

// Inline Styles
const styles = {
  dashboard: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '2rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  welcomeSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeHeading: {
    color: '#fff',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  welcomeSubtext: {
    color: '#94a3b8',
    fontSize: '1rem',
  },
  createCourseBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    color: '#fff',
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  coursesSection: {
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
  },
  sectionHeading: {
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  loading: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    textAlign: 'left',
    padding: '1rem',
    color: '#94a3b8',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  tableCell: {
    padding: '1rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  courseTitle: {
    padding: '1rem',
    color: '#fff',
    fontWeight: '500',
    fontSize: '0.875rem',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  statusPublished: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
  },
  statusDraft: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
  },
  actionsCell: {
    padding: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  actionLink: {
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  publishBtn: {
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.1)',
  },
  unpublishBtn: {
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)',
  },
  deleteBtn: {
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyText: {
    color: '#94a3b8',
    marginBottom: '1.5rem',
    fontSize: '1rem',
  },
  btnPrimary: {
    display: 'inline-block',
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  },
};

const InstructorDashboard = () => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      if (!userProfile?.id) return;
      try {
        const result = await fetchInstructorCourses(userProfile.id);
        setCourses(result.data || []);
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [userProfile?.id]);

  const togglePublish = async (course) => {
    try {
      setTogglingId(course.id);
      const result = await updateCourse(course.id, { is_published: !course.is_published });
      if (result.error) {
        alert('Failed to update course: ' + result.error);
      } else {
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, is_published: !c.is_published } : c))
        );
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) return;
    try {
      setDeletingId(course.id);
      const result = await deleteCourse(course.id);
      if (result.error) {
        alert('Failed to delete course: ' + result.error);
      } else {
        setCourses((prev) => prev.filter((c) => c.id !== course.id));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* Welcome Section */}
      <section style={styles.welcomeSection}>
        <div style={styles.welcomeContent}>
          <h1 style={styles.welcomeHeading}>Welcome, {userProfile?.full_name || 'Instructor'}! 👨‍🏫</h1>
          <p style={styles.welcomeSubtext}>Manage your courses and track student progress</p>
        </div>
        <Link to="/instructor/create-course" style={styles.createCourseBtn}>
          + Create Course
        </Link>
      </section>

      {/* Quick Stats */}
      <section style={styles.statsSection}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{courses.length}</h3>
          <p style={styles.statLabel}>Total Courses</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{courses.filter((c) => c.is_published).length}</h3>
          <p style={styles.statLabel}>Published</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>
            {courses.reduce((sum, c) => sum + (c.enrollments?.[0]?.count || 0), 0)}
          </h3>
          <p style={styles.statLabel}>Total Students</p>
        </div>
      </section>

      {/* Courses List */}
      <section style={styles.coursesSection}>
        <h2 style={styles.sectionHeading}>Your Courses</h2>
        {isLoading ? (
          <div style={styles.loading}>Loading courses...</div>
        ) : courses.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Course Title</th>
                  <th style={styles.tableHeader}>Students</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Modules</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} style={styles.tableRow}>
                    <td style={styles.courseTitle}>{course.title}</td>
                    <td style={styles.tableCell}>{course.enrollments?.[0]?.count || 0}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(course.is_published ? styles.statusPublished : styles.statusDraft)
                      }}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{course.modules?.[0]?.count || 0}</td>
                    <td style={styles.actionsCell}>
                      <Link to={`/instructor/course/${course.id}`} style={styles.actionLink}>
                        View
                      </Link>
                      <Link to={`/instructor/course/${course.id}/edit`} style={styles.actionLink}>
                        Edit
                      </Link>
                      <Link to={`/instructor/course/${course.id}/analytics`} style={styles.actionLink}>
                        Analytics
                      </Link>
                      <button
                        style={{
                          ...styles.actionLink,
                          ...(course.is_published ? styles.unpublishBtn : styles.publishBtn)
                        }}
                        onClick={() => togglePublish(course)}
                        disabled={togglingId === course.id}
                      >
                        {togglingId === course.id
                          ? '...'
                          : course.is_published
                          ? 'Unpublish'
                          : 'Publish'}
                      </button>
                      {!course.is_published && (
                        <button
                          style={{ ...styles.actionLink, ...styles.deleteBtn }}
                          onClick={() => handleDelete(course)}
                          disabled={deletingId === course.id}
                        >
                          {deletingId === course.id ? '...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>You haven't created any courses yet</p>
            <Link to="/instructor/create-course" style={styles.btnPrimary}>
              Create Your First Course
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default InstructorDashboard;
