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
import '../styles/CourseDetails.module.css';

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
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!course) return <div className="error-message">Course not found</div>;

  const isEnrolled = !!course.enrollment_id;

  return (
    <div className="course-details-page">
      {/* Header */}
      <div className="course-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back
        </button>
        <div className="course-header-content">
          <div className="course-title-section">
            <h1>{course.title}</h1>
            <p className="course-description-header">{course.description}</p>
            <div className="course-meta-header">
              <span className={`difficulty-badge ${course.difficulty_level}`}>
                {course.difficulty_level || 'beginner'}
              </span>
              {course.category && <span className="category-badge">{course.category}</span>}
              <span className="instructor-info">👨‍🏫 {course.users?.full_name || 'Instructor'}</span>
            </div>
          </div>
          {!isEnrolled && userProfile?.role === 'student' && (
            <button onClick={handleEnroll} disabled={enrolling} className="btn-enroll-main">
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}
          {isEnrolled && (
            <div className="enrollment-status">
              <span className="enrolled-badge">✓ Enrolled</span>
              {progress && (
                <div className="progress-summary">
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress.progressPercentage}%` }} />
                  </div>
                  <span className="progress-text">{Math.round(progress.progressPercentage)}% Complete</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="course-tabs">
        <button
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📚 Course Content
        </button>
        <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Reviews
        </button>
        <button
          className={`tab-button ${activeTab === 'discussions' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussions')}
        >
          💬 Discussions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && (
        <div className="course-content-section">
          <h2>📚 Course Modules</h2>
          {course.modules && course.modules.length > 0 ? (
            <div className="modules-list">
              {course.modules.map((module, index) => (
                <div key={module.id} className="module-item">
                  <div className="module-header" onClick={() => toggleModule(module.id)}>
                    <div className="module-title-section">
                      <span className="module-number">Module {index + 1}</span>
                      <h3>{module.title}</h3>
                      {module.description && <p className="module-description">{module.description}</p>}
                    </div>
                    <span className="expand-icon">{expandedModules[module.id] ? '▼' : '▶'}</span>
                  </div>

                  {expandedModules[module.id] && (
                    <div className="module-content">
                      {/* Lessons */}
                      {module.lessons && module.lessons.length > 0 && (
                        <div className="lessons-list">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="lesson-item">
                              <span className="lesson-icon">📄</span>
                              <div className="lesson-info">
                                <span className="lesson-title">{lesson.title}</span>
                                {lesson.duration_minutes && (
                                  <span className="lesson-duration">⏱ {lesson.duration_minutes} min</span>
                                )}
                              </div>
                              {isEnrolled && (
                                <Link to={`/student/courses/${courseId}/lessons/${lesson.id}`} className="btn-start-lesson">
                                  Start
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quizzes */}
                      {module.quizzes && module.quizzes.length > 0 && (
                        <div className="quizzes-list">
                          {module.quizzes.map((quiz) => (
                            <div key={quiz.id} className="quiz-item">
                              <span className="quiz-icon">📝</span>
                              <div className="quiz-info">
                                <span className="quiz-title">{quiz.title}</span>
                                <span className="quiz-meta">Passing Score: {quiz.passing_score}%</span>
                              </div>
                              {isEnrolled && (
                                <Link to={`/student/quizzes/${quiz.id}`} className="btn-take-quiz">
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
            <p className="no-content">No modules available yet</p>
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
