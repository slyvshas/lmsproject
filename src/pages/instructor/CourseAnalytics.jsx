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

// ── Inline Styles ──
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '2rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loading: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    gap: '1rem',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(99, 102, 241, 0.3)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    gap: '1.5rem',
  },
  errorButton: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.4)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  backButton: {
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#94a3b8',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginBottom: '0.75rem',
    transition: 'all 0.2s ease',
  },
  title: {
    color: '#fff',
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
  },
  editButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backdropFilter: 'blur(10px)',
  },
  statIconCircle: (color) => ({
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    background: color === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
                color === 'green' ? 'rgba(16, 185, 129, 0.2)' :
                color === 'purple' ? 'rgba(139, 92, 246, 0.2)' :
                'rgba(249, 115, 22, 0.2)',
    border: `1px solid ${
      color === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
      color === 'green' ? 'rgba(16, 185, 129, 0.4)' :
      color === 'purple' ? 'rgba(139, 92, 246, 0.4)' :
      'rgba(249, 115, 22, 0.4)'
    }`,
  }),
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statValue: {
    color: '#fff',
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: 1,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  section: {
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(10px)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0 0 1.5rem 0',
  },
  progressChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  progressBand: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 50px',
    alignItems: 'center',
    gap: '1rem',
  },
  bandLabel: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  bandBarTrack: {
    height: '24px',
    background: 'rgba(15, 15, 35, 0.6)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(99, 102, 241, 0.1)',
  },
  bandBarFill: {
    height: '100%',
    borderRadius: '12px',
    transition: 'width 0.5s ease',
    minWidth: '4px',
  },
  bandCount: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    textAlign: 'right',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    background: 'rgba(30, 30, 60, 0.4)',
    padding: '0.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  tab: (active) => ({
    flex: 1,
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    background: active ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
  }),
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    color: '#94a3b8',
    fontWeight: '600',
    borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '1rem',
    color: '#fff',
    borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
    verticalAlign: 'middle',
  },
  studentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  studentName: {
    color: '#fff',
    fontWeight: '500',
  },
  studentEmail: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  miniProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  miniProgressBar: {
    width: '80px',
    height: '8px',
    background: 'rgba(15, 15, 35, 0.8)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  dateCell: {
    color: '#94a3b8',
  },
  statusPill: (isComplete) => ({
    display: 'inline-block',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: isComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
    color: isComplete ? '#10b981' : '#3b82f6',
    border: `1px solid ${isComplete ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
  }),
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8',
  },
  emptyHint: {
    color: '#64748b',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  },
  quizGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  quizCard: {
    background: 'rgba(15, 15, 35, 0.6)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  quizTitle: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 1rem 0',
  },
  quizMetrics: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  quizMetric: {
    textAlign: 'center',
  },
  quizMetricValue: (isGood) => ({
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: isGood === null ? '#fff' : isGood ? '#10b981' : '#ef4444',
  }),
  quizMetricLabel: {
    color: '#64748b',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  quizPassBar: {
    height: '6px',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  quizPassFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
};

// Add keyframe animation via style tag
const SpinnerStyle = () => (
  <style>{`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}</style>
);

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
      <div style={styles.loading}>
        <SpinnerStyle />
        <div style={styles.spinner} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>❌ {error}</h2>
        <button style={styles.errorButton} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={() => navigate('/instructor/dashboard')}>
            ← Dashboard
          </button>
          <h1 style={styles.title}>📊 {course?.title}</h1>
          <p style={styles.subtitle}>Course Analytics & Student Progress</p>
        </div>
        <Link to={`/instructor/course/${courseId}/edit`} style={styles.editButton}>
          ✏️ Edit Course
        </Link>
      </div>

      {/* Overview Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconCircle('blue')}>👥</div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{totalStudents}</span>
            <span style={styles.statLabel}>Enrolled Students</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconCircle('green')}>📈</div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{avgProgress}%</span>
            <span style={styles.statLabel}>Avg. Progress</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconCircle('purple')}>🎓</div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{completionRate}%</span>
            <span style={styles.statLabel}>Completion Rate</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconCircle('orange')}>⏱</div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{totalTimeMinutes}m</span>
            <span style={styles.statLabel}>Total Learning Time</span>
          </div>
        </div>
      </div>

      {/* Progress Distribution */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📊 Progress Distribution</h2>
        <div style={styles.progressChart}>
          {[
            { label: '0-25%', count: studentProgressData.filter(s => s.progressPercent <= 25).length, color: '#ef4444' },
            { label: '26-50%', count: studentProgressData.filter(s => s.progressPercent > 25 && s.progressPercent <= 50).length, color: '#f59e0b' },
            { label: '51-75%', count: studentProgressData.filter(s => s.progressPercent > 50 && s.progressPercent <= 75).length, color: '#6366f1' },
            { label: '76-100%', count: studentProgressData.filter(s => s.progressPercent > 75).length, color: '#10b981' },
          ].map((band) => (
            <div key={band.label} style={styles.progressBand}>
              <span style={styles.bandLabel}>{band.label}</span>
              <div style={styles.bandBarTrack}>
                <div
                  style={{
                    ...styles.bandBarFill,
                    width: `${totalStudents > 0 ? (band.count / totalStudents) * 100 : 0}%`,
                    backgroundColor: band.color,
                  }}
                />
              </div>
              <span style={styles.bandCount}>{band.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={styles.tab(activeTab === 'students')}
          onClick={() => setActiveTab('students')}
        >
          👥 Students ({totalStudents})
        </button>
        <button
          style={styles.tab(activeTab === 'quizzes')}
          onClick={() => setActiveTab('quizzes')}
        >
          📝 Quizzes ({quizStats.length})
        </button>
      </div>

      {/* Students Table */}
      {activeTab === 'students' && (
        <div style={styles.section}>
          {studentProgressData.length > 0 ? (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Progress</th>
                    <th style={styles.th}>Lessons</th>
                    <th style={styles.th}>Time Spent</th>
                    <th style={styles.th}>Enrolled</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentProgressData.map((student) => (
                    <tr key={student.id}>
                      <td style={styles.td}>
                        <div style={styles.studentInfo}>
                          <span style={styles.studentName}>{student.users?.full_name || 'Student'}</span>
                          <span style={styles.studentEmail}>{student.users?.email || ''}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.miniProgress}>
                          <div style={styles.miniProgressBar}>
                            <div
                              style={{ ...styles.miniProgressFill, width: `${student.progressPercent}%` }}
                            />
                          </div>
                          <span>{student.progressPercent}%</span>
                        </div>
                      </td>
                      <td style={styles.td}>{student.completedLessons}/{totalLessons}</td>
                      <td style={styles.td}>{student.totalTimeMinutes > 0 ? `${student.totalTimeMinutes}m` : '—'}</td>
                      <td style={{ ...styles.td, ...styles.dateCell }}>
                        {new Date(student.enrolled_at).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.statusPill(student.isComplete)}>
                          {student.isComplete ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.empty}>
              <p>No students enrolled yet.</p>
              <p style={styles.emptyHint}>Share your course to attract learners!</p>
            </div>
          )}
        </div>
      )}

      {/* Quiz Stats */}
      {activeTab === 'quizzes' && (
        <div style={styles.section}>
          {quizMetrics.length > 0 ? (
            <div style={styles.quizGrid}>
              {quizMetrics.map((quiz) => (
                <div key={quiz.id} style={styles.quizCard}>
                  <h3 style={styles.quizTitle}>{quiz.title}</h3>
                  <div style={styles.quizMetrics}>
                    <div style={styles.quizMetric}>
                      <span style={styles.quizMetricValue(null)}>{quiz.attemptCount}</span>
                      <span style={styles.quizMetricLabel}>Attempts</span>
                    </div>
                    <div style={styles.quizMetric}>
                      <span style={styles.quizMetricValue(null)}>{quiz.avgScore}%</span>
                      <span style={styles.quizMetricLabel}>Avg Score</span>
                    </div>
                    <div style={styles.quizMetric}>
                      <span style={styles.quizMetricValue(quiz.passRate >= 70)}>
                        {quiz.passRate}%
                      </span>
                      <span style={styles.quizMetricLabel}>Pass Rate</span>
                    </div>
                  </div>
                  <div style={styles.quizPassBar}>
                    <div style={{ ...styles.quizPassFill, width: `${quiz.passRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              <p>No quizzes created for this course yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseAnalytics;
