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
import { calculateProgress } from '../../utils/helpers';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [weakAreas, setWeakAreas] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const { data: enrolledCourses, isLoading: isLoadingCourses, error: courseError } = useSupabaseQuery(
    () => fetchEnrolledCourses(userProfile?.id),
    [userProfile?.id]
  );

  const [enrollmentProgress, setEnrollmentProgress] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?.id) return;
      try {
        setIsLoadingStats(true);
        const statsResult = await getDashboardStats(userProfile.id);
        setStats(statsResult.data);
        const weakAreasResult = await fetchWeakAreas(userProfile.id);
        setWeakAreas(weakAreasResult.data || []);
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
  }, [userProfile?.id, enrolledCourses]);

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '32px 40px',
    color: '#fff'
  };

  const welcomeStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    padding: '32px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const welcomeH1 = {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 8px 0'
  };

  const welcomeP = {
    fontSize: '16px',
    color: '#94a3b8',
    margin: 0
  };

  const exploreBtnStyle = {
    padding: '14px 28px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '700',
    textDecoration: 'none',
    fontSize: '15px'
  };

  const sectionStyle = {
    marginBottom: '40px'
  };

  const sectionTitleStyle = {
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 24px 0',
    color: '#fff'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px'
  };

  const statCardStyle = {
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  };

  const statIconStyle = {
    fontSize: '36px'
  };

  const statH3 = {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 4px 0',
    color: '#fff'
  };

  const statP = {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  };

  const coursesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  };

  const courseCardStyle = {
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '16px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const courseContentStyle = {
    padding: '20px'
  };

  const courseH3 = {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#fff'
  };

  const courseInstructorStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 16px 0'
  };

  const progressBarStyle = {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  };

  const progressTextStyle = {
    fontSize: '13px',
    color: '#a5b4fc',
    margin: 0
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '48px',
    background: 'rgba(30, 30, 60, 0.4)',
    borderRadius: '16px',
    color: '#94a3b8'
  };

  const btnPrimaryStyle = {
    display: 'inline-block',
    marginTop: '16px',
    padding: '12px 24px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '600',
    textDecoration: 'none'
  };

  const weakAreasListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const weakAreaItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  };

  const weakAreaH4 = {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: '#fff'
  };

  const weakAreaP = {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 8px 0'
  };

  const scoreBadgeStyle = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    fontSize: '13px',
    fontWeight: '600'
  };

  const reviewBtnStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '14px'
  };

  const ctaSectionStyle = {
    textAlign: 'center',
    padding: '48px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
    borderRadius: '20px',
    marginTop: '40px'
  };

  const ctaH2 = {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 12px 0'
  };

  const ctaP = {
    fontSize: '16px',
    color: '#94a3b8',
    margin: '0 0 24px 0'
  };

  const btnPrimaryLgStyle = {
    display: 'inline-block',
    padding: '16px 36px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '16px',
    textDecoration: 'none'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8'
  };

  const isLoading = isLoadingCourses || isLoadingStats;

  return (
    <div style={pageStyle}>
      {/* Welcome Section */}
      <section style={welcomeStyle}>
        <div>
          <h1 style={welcomeH1}>Welcome back, {userProfile?.full_name || 'Student'}! 👋</h1>
          <p style={welcomeP}>Keep up the momentum and continue learning</p>
        </div>
        <Link to="/courses" style={exploreBtnStyle}>
          Explore Courses
        </Link>
      </section>

      {/* Stats Overview */}
      {stats && !isLoadingStats && (
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Your Learning Progress</h2>
          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <div style={statIconStyle}>📚</div>
              <div>
                <h3 style={statH3}>{stats.activeEnrollments}</h3>
                <p style={statP}>Active Courses</p>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle}>✅</div>
              <div>
                <h3 style={statH3}>{stats.completedCourses}</h3>
                <p style={statP}>Completed</p>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle}>📝</div>
              <div>
                <h3 style={statH3}>{stats.totalLessonsCompleted}</h3>
                <p style={statP}>Lessons Completed</p>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle}>⭐</div>
              <div>
                <h3 style={statH3}>{stats.averageQuizScore}%</h3>
                <p style={statP}>Avg Quiz Score</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enrolled Courses */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Your Courses</h2>
        {isLoadingCourses ? (
          <div style={loadingStyle}>Loading courses...</div>
        ) : courseError ? (
          <div style={{ ...loadingStyle, color: '#f87171' }}>Failed to load courses: {courseError}</div>
        ) : enrolledCourses && enrolledCourses.length > 0 ? (
          <div style={coursesGridStyle}>
            {enrolledCourses.map((enrollment) => {
              const course = enrollment.courses;
              const progress = enrollmentProgress[enrollment.id] ?? calculateProgress(
                enrollment.progress_tracking?.length || 0,
                10
              );
              return (
                <Link key={enrollment.id} to={`/courses/${course.id}`} style={courseCardStyle}>
                  {course.thumbnail_url && (
                    <div style={{
                      height: '160px',
                      backgroundImage: `url(${course.thumbnail_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />
                  )}
                  <div style={courseContentStyle}>
                    <h3 style={courseH3}>{course.title}</h3>
                    <p style={courseInstructorStyle}>by {course.users?.full_name || 'Unknown'}</p>
                    <div style={progressBarStyle}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <p style={progressTextStyle}>{progress}% complete</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={emptyStateStyle}>
            <p>You haven't enrolled in any courses yet</p>
            <Link to="/courses" style={btnPrimaryStyle}>Browse Courses</Link>
          </div>
        )}
      </section>

      {/* Weak Areas & Recommendations */}
      {weakAreas && weakAreas.length > 0 && (
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Areas That Need Revision 📌</h2>
          <p style={{ ...welcomeP, marginBottom: '20px' }}>Based on your recent quiz attempts, here are topics to review:</p>
          <div style={weakAreasListStyle}>
            {weakAreas.map((area) => (
              <div key={area.id} style={weakAreaItemStyle}>
                <div>
                  <h4 style={weakAreaH4}>{area.topic_name}</h4>
                  <p style={weakAreaP}>{area.modules?.title}</p>
                  <span style={scoreBadgeStyle}>Score: {Math.round(area.score)}%</span>
                </div>
                <Link to={`/student/course/${area.modules?.course_id}`} style={reviewBtnStyle}>
                  Review Module →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Continue Learning CTA */}
      <section style={ctaSectionStyle}>
        <h2 style={ctaH2}>Ready to Learn More?</h2>
        <p style={ctaP}>Discover new courses and expert instructors</p>
        <Link to="/courses" style={btnPrimaryLgStyle}>Browse All Courses</Link>
      </section>
    </div>
  );
};

export default StudentDashboard;
