// ============================================================================
// Course Details Page
// ============================================================================
// View full course information with modules, lessons, quizzes, reviews, and discussions

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchCourseDetails, enrollInCourse } from '../../services/courseService';
import { completeLesson, getCourseProgress } from '../../services/progressService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CourseReviews from '../../components/course/CourseReviews';
import DiscussionForum from '../../components/course/DiscussionForum';

// Inline Styles
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '2rem',
    color: '#fff',
  },
  errorMessage: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '12px',
    padding: '1.5rem',
    color: '#fca5a5',
    textAlign: 'center',
    margin: '2rem auto',
    maxWidth: '600px',
  },
  header: {
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '1.5rem',
  },
  btnBack: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    transition: 'all 0.2s ease',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  titleSection: {
    flex: 1,
    minWidth: '300px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: '#fff',
  },
  descriptionHeader: {
    color: '#94a3b8',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  metaHeader: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  difficultyBadge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyBeginner: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#4ade80',
  },
  difficultyIntermediate: {
    background: 'rgba(234, 179, 8, 0.2)',
    color: '#facc15',
  },
  difficultyAdvanced: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
  },
  categoryBadge: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  instructorInfo: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  btnEnrollMain: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '1rem 2rem',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  },
  btnEnrollMainDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  enrollmentStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem',
  },
  enrolledBadge: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#4ade80',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  progressSummary: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
    minWidth: '200px',
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '0.5rem',
  },
  tabButton: {
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    color: '#94a3b8',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabButtonActive: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
  },
  contentSection: {
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#fff',
  },
  modulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  moduleItem: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  moduleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  moduleTitleSection: {
    flex: 1,
  },
  moduleNumber: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  moduleTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  moduleDescription: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    marginTop: '0.5rem',
  },
  expandIcon: {
    color: '#6366f1',
    fontSize: '0.9rem',
    marginLeft: '1rem',
  },
  moduleContent: {
    padding: '0 1.5rem 1.5rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  lessonsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  lessonItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },
  lessonIcon: {
    fontSize: '1.2rem',
    opacity: 0.8,
  },
  lessonInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  lessonTitle: {
    color: '#fff',
    fontSize: '0.95rem',
  },
  lessonDuration: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  btnStartLesson: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    color: '#a5b4fc',
    fontSize: '0.85rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  quizzesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  quizItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  quizIcon: {
    fontSize: '1.2rem',
  },
  quizInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  quizTitle: {
    color: '#fff',
    fontSize: '0.95rem',
  },
  quizMeta: {
    color: '#8b5cf6',
    fontSize: '0.8rem',
  },
  btnTakeQuiz: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  noContent: {
    textAlign: 'center',
    color: '#64748b',
    padding: '2rem',
    fontSize: '1rem',
  },
};

const getDifficultyStyle = (level) => {
  const base = styles.difficultyBadge;
  switch (level?.toLowerCase()) {
    case 'intermediate':
      return { ...base, ...styles.difficultyIntermediate };
    case 'advanced':
      return { ...base, ...styles.difficultyAdvanced };
    default:
      return { ...base, ...styles.difficultyBeginner };
  }
};

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [activeTab, setActiveTab] = useState('content'); // content, reviews, discussions

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setIsLoading(true);
      const result = await fetchCourseDetails(courseId);
      const courseData = result?.data;
      
      if (!courseData) {
        setError('Course not found');
        return;
      }
      
      setCourse(courseData);

      // If student and enrolled, load progress
      if (userProfile?.role === 'student' && courseData.enrollment_id) {
        const progressData = await getCourseProgress(courseData.enrollment_id);
        setProgress(progressData);
      }
    } catch (err) {
      console.error('Error loading course details:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!userProfile || userProfile.role !== 'student') {
      alert('Only students can enroll in courses');
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(courseId, userProfile.id);
      alert('Successfully enrolled!');
      loadCourseDetails(); // Reload to show enrollment
    } catch (err) {
      alert('Failed to enroll: ' + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div style={styles.errorMessage}>Error: {error}</div>;
  if (!course) return <div style={styles.errorMessage}>Course not found</div>;

  const isEnrolled = !!course.enrollment_id;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.btnBack}>
          ← Back
        </button>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>{course.title}</h1>
            <p style={styles.descriptionHeader}>{course.description}</p>
            <div style={styles.metaHeader}>
              <span style={getDifficultyStyle(course.difficulty_level)}>
                {course.difficulty_level || 'beginner'}
              </span>
              {course.category && <span style={styles.categoryBadge}>{course.category}</span>}
              <span style={styles.instructorInfo}>👨‍🏫 {course.users?.full_name || 'Instructor'}</span>
            </div>
          </div>
          {!isEnrolled && userProfile?.role === 'student' && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              style={enrolling ? { ...styles.btnEnrollMain, ...styles.btnEnrollMainDisabled } : styles.btnEnrollMain}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}
          {isEnrolled && (
            <div style={styles.enrollmentStatus}>
              <span style={styles.enrolledBadge}>✓ Enrolled</span>
              {progress && (
                <div style={styles.progressSummary}>
                  <div style={styles.progressBarContainer}>
                    <div style={{ ...styles.progressBarFill, width: `${progress.progressPercentage}%` }} />
                  </div>
                  <span style={styles.progressText}>{Math.round(progress.progressPercentage)}% Complete</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={styles.tabs}>
        <button
          style={activeTab === 'content' ? { ...styles.tabButton, ...styles.tabButtonActive } : styles.tabButton}
          onClick={() => setActiveTab('content')}
        >
          📚 Course Content
        </button>
        <button
          style={activeTab === 'reviews' ? { ...styles.tabButton, ...styles.tabButtonActive } : styles.tabButton}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Reviews
        </button>
        <button
          style={activeTab === 'discussions' ? { ...styles.tabButton, ...styles.tabButtonActive } : styles.tabButton}
          onClick={() => setActiveTab('discussions')}
        >
          💬 Discussions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && (
        <div style={styles.contentSection}>
          <h2 style={styles.sectionTitle}>📚 Course Modules</h2>
          {course.modules && course.modules.length > 0 ? (
            <div style={styles.modulesList}>
              {course.modules.map((module, index) => (
                <div key={module.id} style={styles.moduleItem}>
                  <div style={styles.moduleHeader} onClick={() => toggleModule(module.id)}>
                    <div style={styles.moduleTitleSection}>
                      <span style={styles.moduleNumber}>Module {index + 1}</span>
                      <h3 style={styles.moduleTitle}>{module.title}</h3>
                      {module.description && <p style={styles.moduleDescription}>{module.description}</p>}
                    </div>
                    <span style={styles.expandIcon}>{expandedModules[module.id] ? '▼' : '▶'}</span>
                  </div>

                  {expandedModules[module.id] && (
                    <div style={styles.moduleContent}>
                      {/* Lessons */}
                      {module.lessons && module.lessons.length > 0 && (
                        <div style={styles.lessonsList}>
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} style={styles.lessonItem}>
                              <span style={styles.lessonIcon}>📄</span>
                              <div style={styles.lessonInfo}>
                                <span style={styles.lessonTitle}>{lesson.title}</span>
                                {lesson.duration_minutes && (
                                  <span style={styles.lessonDuration}>⏱ {lesson.duration_minutes} min</span>
                                )}
                              </div>
                              {isEnrolled && (
                                <Link to={`/student/courses/${courseId}/lessons/${lesson.id}`} style={styles.btnStartLesson}>
                                  Start
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quizzes */}
                      {module.quizzes && module.quizzes.length > 0 && (
                        <div style={styles.quizzesList}>
                          {module.quizzes.map((quiz) => (
                            <div key={quiz.id} style={styles.quizItem}>
                              <span style={styles.quizIcon}>📝</span>
                              <div style={styles.quizInfo}>
                                <span style={styles.quizTitle}>{quiz.title}</span>
                                <span style={styles.quizMeta}>Passing Score: {quiz.passing_score}%</span>
                              </div>
                              {isEnrolled && (
                                <Link to={`/student/quizzes/${quiz.id}`} style={styles.btnTakeQuiz}>
                                  Take Quiz
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.noContent}>No modules available yet</p>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <CourseReviews courseId={courseId} isEnrolled={isEnrolled} />
      )}

      {activeTab === 'discussions' && (
        <DiscussionForum courseId={courseId} />
      )}
    </div>
  );
};

export default CourseDetails;
