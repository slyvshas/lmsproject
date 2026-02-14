// ============================================================================
// Course Analytics — Instructor Analytics Dashboard
// ============================================================================
// View enrolled students, their progress, quiz performance, and engagement
// metrics for a specific course.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchCourseDetails } from '../../services/courseService';
import supabase from '../../config/supabase';
import '../styles/CourseAnalytics.module.css';

const CourseAnalytics = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, students, quizzes

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        // Fetch course details
        const courseRes = await fetchCourseDetails(courseId);
        if (!courseRes.data) {
          setError('Course not found');
          return;
        }
        setCourse(courseRes.data);

        // Fetch enrolled students with progress
        const { data: enrollments, error: enErr } = await supabase
          .from('enrollments')
          .select(`
            id,
            status,
            enrolled_at,
            users!enrollments_student_id_fkey(id, full_name, email, avatar_url),
            progress_tracking(id, lesson_id, completed, completed_at, time_spent_seconds)
          `)
          .eq('course_id', courseId)
          .order('enrolled_at', { ascending: false });

        if (enErr) console.error('Error fetching enrollments:', enErr);
        setStudents(enrollments || []);

        // Fetch quiz stats
        const { data: quizzes, error: qErr } = await supabase
          .from('quizzes')
          .select(`
            id,
            title,
            passing_score,
            module_id,
            quiz_attempts(id, score, passed, student_id)
          `)
          .eq('module_id', courseRes.data.modules?.map(m => m.id)?.[0] || '');

        // Actually fetch quizzes for ALL modules
        const moduleIds = (courseRes.data.modules || []).map(m => m.id);
        if (moduleIds.length > 0) {
          const { data: allQuizzes } = await supabase
            .from('quizzes')
            .select(`
              id,
              title,
              passing_score,
              module_id,
              quiz_attempts(id, score, passed, student_id)
            `)
            .in('module_id', moduleIds);
          setQuizStats(allQuizzes || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId]);

  // ── Calculated Metrics ──
  const totalStudents = students.length;
  const totalLessons = (course?.modules || []).reduce(
    (sum, m) => sum + (m.lessons?.length || 0), 0
  );

  const studentProgressData = students.map((s) => {
    const completed = (s.progress_tracking || []).filter(p => p.completed).length;
    const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    const totalTime = (s.progress_tracking || []).reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
    return {
      ...s,
      completedLessons: completed,
      progressPercent: percent,
      totalTimeMinutes: Math.round(totalTime / 60),
      isComplete: percent >= 100,
    };
  });

  const avgProgress = totalStudents > 0
    ? Math.round(studentProgressData.reduce((sum, s) => sum + s.progressPercent, 0) / totalStudents)
    : 0;

  const completionCount = studentProgressData.filter(s => s.isComplete).length;
  const completionRate = totalStudents > 0 ? Math.round((completionCount / totalStudents) * 100) : 0;
  const totalTimeMinutes = studentProgressData.reduce((sum, s) => sum + s.totalTimeMinutes, 0);

  // Quiz metrics
  const quizMetrics = quizStats.map(q => {
    const attempts = q.quiz_attempts || [];
    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0;
    const passRate = attempts.length > 0
      ? Math.round(attempts.filter(a => a.passed).length / attempts.length * 100)
      : 0;
    return { ...q, avgScore, passRate, attemptCount: attempts.length };
  });

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <h2>❌ {error}</h2>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <button className="btn-back-analytics" onClick={() => navigate('/instructor/dashboard')}>
            ← Dashboard
          </button>
          <h1>📊 {course?.title}</h1>
          <p className="analytics-subtitle">Course Analytics & Student Progress</p>
        </div>
        <Link to={`/instructor/course/${courseId}/edit`} className="btn-edit-course">
          ✏️ Edit Course
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="stat-icon-circle blue">👥</div>
          <div className="stat-content">
            <span className="stat-value">{totalStudents}</span>
            <span className="stat-label">Enrolled Students</span>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon-circle green">📈</div>
          <div className="stat-content">
            <span className="stat-value">{avgProgress}%</span>
            <span className="stat-label">Avg. Progress</span>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon-circle purple">🎓</div>
          <div className="stat-content">
            <span className="stat-value">{completionRate}%</span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon-circle orange">⏱</div>
          <div className="stat-content">
            <span className="stat-value">{totalTimeMinutes}m</span>
            <span className="stat-label">Total Learning Time</span>
          </div>
        </div>
      </div>

      {/* Progress Distribution */}
      <div className="analytics-section">
        <h2>📊 Progress Distribution</h2>
        <div className="progress-chart">
          {[
            { label: '0-25%', count: studentProgressData.filter(s => s.progressPercent <= 25).length, color: '#ef4444' },
            { label: '26-50%', count: studentProgressData.filter(s => s.progressPercent > 25 && s.progressPercent <= 50).length, color: '#f59e0b' },
            { label: '51-75%', count: studentProgressData.filter(s => s.progressPercent > 50 && s.progressPercent <= 75).length, color: '#6366f1' },
            { label: '76-100%', count: studentProgressData.filter(s => s.progressPercent > 75).length, color: '#10b981' },
          ].map((band) => (
            <div key={band.label} className="progress-band">
              <span className="band-label">{band.label}</span>
              <div className="band-bar-track">
                <div
                  className="band-bar-fill"
                  style={{
                    width: `${totalStudents > 0 ? (band.count / totalStudents) * 100 : 0}%`,
                    backgroundColor: band.color,
                  }}
                />
              </div>
              <span className="band-count">{band.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button
          className={`analytics-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Students ({totalStudents})
        </button>
        <button
          className={`analytics-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          📝 Quizzes ({quizStats.length})
        </button>
      </div>

      {/* Students Table */}
      {activeTab === 'students' && (
        <div className="analytics-section">
          {studentProgressData.length > 0 ? (
            <div className="students-table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Progress</th>
                    <th>Lessons</th>
                    <th>Time Spent</th>
                    <th>Enrolled</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentProgressData.map((student) => (
                    <tr key={student.id}>
                      <td className="student-cell">
                        <div className="student-info">
                          <span className="student-name">{student.users?.full_name || 'Student'}</span>
                          <span className="student-email">{student.users?.email || ''}</span>
                        </div>
                      </td>
                      <td>
                        <div className="mini-progress">
                          <div className="mini-progress-bar">
                            <div
                              className="mini-progress-fill"
                              style={{ width: `${student.progressPercent}%` }}
                            />
                          </div>
                          <span>{student.progressPercent}%</span>
                        </div>
                      </td>
                      <td>{student.completedLessons}/{totalLessons}</td>
                      <td>{student.totalTimeMinutes > 0 ? `${student.totalTimeMinutes}m` : '—'}</td>
                      <td className="date-cell">
                        {new Date(student.enrolled_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`status-pill ${student.isComplete ? 'completed' : 'active'}`}>
                          {student.isComplete ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-analytics">
              <p>No students enrolled yet.</p>
              <p className="empty-hint">Share your course to attract learners!</p>
            </div>
          )}
        </div>
      )}

      {/* Quiz Stats */}
      {activeTab === 'quizzes' && (
        <div className="analytics-section">
          {quizMetrics.length > 0 ? (
            <div className="quiz-stats-grid">
              {quizMetrics.map((quiz) => (
                <div key={quiz.id} className="quiz-stat-card">
                  <h3>{quiz.title}</h3>
                  <div className="quiz-stat-metrics">
                    <div className="quiz-metric">
                      <span className="quiz-metric-value">{quiz.attemptCount}</span>
                      <span className="quiz-metric-label">Attempts</span>
                    </div>
                    <div className="quiz-metric">
                      <span className="quiz-metric-value">{quiz.avgScore}%</span>
                      <span className="quiz-metric-label">Avg Score</span>
                    </div>
                    <div className="quiz-metric">
                      <span className={`quiz-metric-value ${quiz.passRate >= 70 ? 'good' : 'bad'}`}>
                        {quiz.passRate}%
                      </span>
                      <span className="quiz-metric-label">Pass Rate</span>
                    </div>
                  </div>
                  <div className="quiz-pass-bar">
                    <div className="quiz-pass-fill" style={{ width: `${quiz.passRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-analytics">
              <p>No quizzes created for this course yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseAnalytics;
