// ============================================================================
// Student Dashboard
// ============================================================================
// Main dashboard for students showing enrolled courses, progress, and stats.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useSupabaseQuery from '../../hooks/useSupabaseQuery';
import { fetchEnrolledCourses } from '../../services/courseService';
import { getDashboardStats, getCourseProgress } from '../../services/progressService';
import { fetchWeakAreas } from '../../services/quizService';
import { formatDate, calculateProgress } from '../../utils/helpers';
import '../styles/StudentDashboard.module.css';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [weakAreas, setWeakAreas] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch enrolled courses
  const { data: enrolledCourses, isLoading: isLoadingCourses, error: courseError } = useSupabaseQuery(
    () => fetchEnrolledCourses(userProfile?.id),
    [userProfile?.id]
  );

  // Track per-enrollment progress
  const [enrollmentProgress, setEnrollmentProgress] = useState({});

  // Fetch stats and weak areas
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?.id) return;

      try {
        setIsLoadingStats(true);

        // Get stats
        const statsResult = await getDashboardStats(userProfile.id);
        setStats(statsResult.data);

        // Get weak areas
        const weakAreasResult = await fetchWeakAreas(userProfile.id);
        setWeakAreas(weakAreasResult.data || []);

        // Get per-enrollment progress
        if (enrolledCourses && enrolledCourses.length > 0) {
          const progressMap = {};
          for (const enrollment of enrolledCourses) {
            try {
              const pRes = await getCourseProgress(enrollment.id);
              if (pRes.data) {
                progressMap[enrollment.id] = pRes.data.progressPercentage || 0;
              }
            } catch { /* ignore */ }
          }
          setEnrollmentProgress(progressMap);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchData();
  }, [userProfile?.id]);

  const isLoading = isLoadingCourses || isLoadingStats;

  return (
    <div className="student-dashboard">
      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {userProfile?.full_name || 'Student'}! 👋</h1>
          <p>Keep up the momentum and continue learning</p>
        </div>
        <Link to="/courses" className="explore-btn">
          Explore Courses
        </Link>
      </section>

      {/* Stats Overview */}
      {stats && !isLoadingStats && (
        <section className="stats-section">
          <h2>Your Learning Progress</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>{stats.activeEnrollments}</h3>
                <p>Active Courses</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.completedCourses}</h3>
                <p>Completed</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>{stats.totalLessonsCompleted}</h3>
                <p>Lessons Completed</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>{stats.averageQuizScore}%</h3>
                <p>Avg Quiz Score</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enrolled Courses */}
      <section className="courses-section">
        <h2>Your Courses</h2>
        {isLoadingCourses ? (
          <div className="loading">Loading courses...</div>
        ) : courseError ? (
          <div className="error">Failed to load courses: {courseError}</div>
        ) : enrolledCourses && enrolledCourses.length > 0 ? (
          <div className="courses-grid">
            {enrolledCourses.map((enrollment) => {
              const course = enrollment.courses;
              const progress = enrollmentProgress[enrollment.id] ?? calculateProgress(
                enrollment.progress_tracking?.length || 0,
                10
              );

              return (
                <Link
                  key={enrollment.id}
                  to={`/courses/${course.id}`}
                  className="course-card"
                >
                  {course.thumbnail_url && (
                    <div
                      className="course-thumbnail"
                      style={{
                        backgroundImage: `url(${course.thumbnail_url})`,
                      }}
                    />
                  )}
                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p className="course-instructor">
                      by {course.users?.full_name || 'Unknown'}
                    </p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="progress-text">{progress}% complete</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet</p>
            <Link to="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        )}
      </section>

      {/* Weak Areas & Recommendations */}
      {weakAreas && weakAreas.length > 0 && (
        <section className="weak-areas-section">
          <h2>Areas That Need Revision 📌</h2>
          <p className="section-subtitle">
            Based on your recent quiz attempts, here are topics to review:
          </p>
          <div className="weak-areas-list">
            {weakAreas.map((area) => (
              <div key={area.id} className="weak-area-item">
                <div className="weak-area-info">
                  <h4>{area.topic_name}</h4>
                  <p>{area.modules?.title}</p>
                  <div className="score-badge">
                    Score: {Math.round(area.score)}%
                  </div>
                </div>
                <Link to={`/student/course/${area.modules?.course_id}`} className="review-btn">
                  Review Module →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Continue Learning */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Learn More?</h2>
          <p>Discover new courses and expert instructors</p>
          <Link to="/courses" className="btn-primary-lg">
            Browse All Courses
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
