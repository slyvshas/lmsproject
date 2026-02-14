// ============================================================================
// Instructor Dashboard
// ============================================================================
// Main dashboard for instructors to manage courses, modules, and student progress.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchInstructorCourses, updateCourse, deleteCourse } from '../../services/courseService';
import '../styles/InstructorDashboard.module.css';

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
    <div className="instructor-dashboard">
      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome, {userProfile?.full_name || 'Instructor'}! 👨‍🏫</h1>
          <p>Manage your courses and track student progress</p>
        </div>
        <Link to="/instructor/create-course" className="create-course-btn">
          + Create Course
        </Link>
      </section>

      {/* Quick Stats */}
      <section className="stats-section">
        <div className="stat-card">
          <h3>{courses.length}</h3>
          <p>Total Courses</p>
        </div>
        <div className="stat-card">
          <h3>{courses.filter((c) => c.is_published).length}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h3>
            {courses.reduce((sum, c) => sum + (c.enrollments?.[0]?.count || 0), 0)}
          </h3>
          <p>Total Students</p>
        </div>
      </section>

      {/* Courses List */}
      <section className="courses-section">
        <h2>Your Courses</h2>
        {isLoading ? (
          <div className="loading">Loading courses...</div>
        ) : courses.length > 0 ? (
          <div className="courses-table">
            <table>
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Modules</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="course-title">{course.title}</td>
                    <td>{course.enrollments?.[0]?.count || 0}</td>
                    <td>
                      <span className={`status-badge ${course.is_published ? 'published' : 'draft'}`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{course.modules?.[0]?.count || 0}</td>
                    <td className="actions">
                      <Link to={`/instructor/course/${course.id}`} className="action-link">
                        View
                      </Link>
                      <Link to={`/instructor/course/${course.id}/edit`} className="action-link">
                        Edit
                      </Link>
                      <Link to={`/instructor/course/${course.id}/analytics`} className="action-link">
                        Analytics
                      </Link>
                      <button
                        className={`action-link ${course.is_published ? 'unpublish-btn' : 'publish-btn'}`}
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
                          className="action-link delete-btn"
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
          <div className="empty-state">
            <p>You haven't created any courses yet</p>
            <Link to="/instructor/create-course" className="btn-primary">
              Create Your First Course
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default InstructorDashboard;
