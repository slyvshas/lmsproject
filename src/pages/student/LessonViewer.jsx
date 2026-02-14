// ============================================================================
// Lesson Viewer / Course Player
// ============================================================================
// Full-featured course player with sidebar navigation, block content rendering,
// progress tracking, lesson completion, and keyboard navigation.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchCourseDetails } from '../../services/courseService';
import { fetchLesson, fetchCourseLessons } from '../../services/contentService';
import { completeLesson, getCourseProgress } from '../../services/progressService';
import '../styles/LessonViewer.module.css';

// ── YouTube URL → embed URL ──────────────────────────────────────────────
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return url;
};

// ── Parse block content (JSON blocks or legacy markdown) ─────────────────
const parseContent = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy markdown fallback
    return [{ id: 'legacy', type: 'text', content: raw }];
  }
  return [{ id: 'legacy', type: 'text', content: raw }];
};

// ── Block Renderers ──────────────────────────────────────────────────────
const BlockRenderer = ({ block }) => {
  switch (block.type) {
    case 'text':
      return (
        <div className="block block-text">
          {block.content.split('\n').map((line, i) => (
            <p key={i}>{line || '\u00A0'}</p>
          ))}
        </div>
      );

    case 'heading': {
      const Tag = `h${block.level || 2}`;
      return <Tag className={`block block-heading block-h${block.level || 2}`}>{block.content}</Tag>;
    }

    case 'code':
      return (
        <div className="block block-code">
          <div className="code-header">
            <span className="code-lang">{block.language || 'code'}</span>
            <button
              className="code-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(block.content);
              }}
              title="Copy code"
            >
              📋 Copy
            </button>
          </div>
          <pre><code>{block.content}</code></pre>
        </div>
      );

    case 'image':
      return (
        <figure className="block block-image">
          <img src={block.url} alt={block.alt || 'Lesson image'} loading="lazy" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );

    case 'video': {
      const embedUrl = getYouTubeEmbedUrl(block.url);
      return (
        <div className="block block-video">
          <div className="video-wrapper">
            <iframe
              src={embedUrl}
              title={block.caption || 'Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {block.caption && <p className="video-caption">{block.caption}</p>}
        </div>
      );
    }

    case 'callout': {
      const icons = { info: 'ℹ️', tip: '💡', warning: '⚠️', danger: '🚨', note: '📝' };
      return (
        <div className={`block block-callout callout-${block.calloutType || 'info'}`}>
          <span className="callout-icon">{icons[block.calloutType] || 'ℹ️'}</span>
          <div className="callout-content">{block.content}</div>
        </div>
      );
    }

    case 'divider':
      return <hr className="block block-divider" />;

    case 'list': {
      const Tag = block.listType === 'ordered' ? 'ol' : 'ul';
      const items = (block.items || block.content?.split('\n') || []).filter(Boolean);
      return (
        <Tag className="block block-list">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      );
    }

    case 'quote':
      return (
        <blockquote className="block block-quote">
          <p>{block.content}</p>
          {block.author && <cite>— {block.author}</cite>}
        </blockquote>
      );

    default:
      return <div className="block block-text"><p>{block.content || ''}</p></div>;
  }
};

// ── Main Component ───────────────────────────────────────────────────────
const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [readTime, setReadTime] = useState(0);

  // Build flat ordered list of all lessons for prev/next navigation
  const orderedLessons = useMemo(() => {
    const flat = [];
    (modules || [])
      .sort((a, b) => a.order_index - b.order_index)
      .forEach((mod) => {
        (mod.lessons || [])
          .sort((a, b) => a.order_index - b.order_index)
          .forEach((lesson) => {
            flat.push({ ...lesson, moduleTitle: mod.title, moduleId: mod.id });
          });
      });
    return flat;
  }, [modules]);

  const currentIndex = orderedLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < orderedLessons.length - 1 ? orderedLessons[currentIndex + 1] : null;

  // Calculate overall progress
  const progressPercent = orderedLessons.length > 0
    ? Math.round((completedLessons.size / orderedLessons.length) * 100)
    : 0;

  // Load course + lesson data
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        // Fetch course details (includes enrollment info)
        const courseRes = await fetchCourseDetails(courseId);
        if (courseRes.error || !courseRes.data) {
          setError('Course not found');
          return;
        }
        setCourse(courseRes.data);

        // If enrolled, load progress
        const enrollId = courseRes.data.enrollment_id;
        if (enrollId) {
          setEnrollmentId(enrollId);
          const progressRes = await getCourseProgress(enrollId);
          if (progressRes.data?.progress_tracking) {
            setCompletedLessons(
              new Set(progressRes.data.progress_tracking.filter((p) => p.completed).map((p) => p.lesson_id))
            );
          }
        }

        // Fetch full course structure with lesson content
        const lessonsRes = await fetchCourseLessons(courseId);
        setModules(lessonsRes.data || []);

        // Fetch current lesson content
        const lessonRes = await fetchLesson(lessonId);
        if (lessonRes.data) {
          setCurrentLesson(lessonRes.data);
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [courseId, lessonId]);

  // Track reading time
  useEffect(() => {
    const timer = setInterval(() => setReadTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [lessonId]);

  // Reset read time on lesson change
  useEffect(() => {
    setReadTime(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && prevLesson) {
        navigate(`/student/courses/${courseId}/lessons/${prevLesson.id}`);
      } else if (e.key === 'ArrowRight' && nextLesson) {
        navigate(`/student/courses/${courseId}/lessons/${nextLesson.id}`);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prevLesson, nextLesson, courseId, navigate]);

  // Mark lesson complete
  const handleComplete = useCallback(async () => {
    if (!enrollmentId || isCompleting) return;
    try {
      setIsCompleting(true);
      const result = await completeLesson(enrollmentId, lessonId, readTime);
      if (!result.error) {
        setCompletedLessons((prev) => new Set([...prev, lessonId]));
        // Auto-advance to next lesson after a short delay
        if (nextLesson) {
          setTimeout(() => {
            navigate(`/student/courses/${courseId}/lessons/${nextLesson.id}`);
          }, 800);
        }
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setIsCompleting(false);
    }
  }, [enrollmentId, lessonId, readTime, nextLesson, courseId, navigate, isCompleting]);

  const isCurrentCompleted = completedLessons.has(lessonId);
  const allComplete = orderedLessons.length > 0 && orderedLessons.every((l) => completedLessons.has(l.id));
  const blocks = parseContent(currentLesson?.content);

  // ── Loading / Error States ──
  if (isLoading) {
    return (
      <div className="lesson-viewer-loading">
        <div className="loading-spinner" />
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-viewer-error">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-back-error">← Go Back</button>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className={`lesson-viewer ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* ── Sidebar ── */}
      <aside className={`lv-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="lv-sidebar-header">
          <Link to={`/courses/${courseId}`} className="lv-course-title" title={course?.title}>
            ← {course?.title}
          </Link>
          <button className="lv-sidebar-toggle" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        {/* Progress Bar */}
        <div className="lv-progress-section">
          <div className="lv-progress-bar">
            <div className="lv-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="lv-progress-text">{progressPercent}% complete • {completedLessons.size}/{orderedLessons.length} lessons</span>
        </div>

        {/* Module/Lesson Tree */}
        <nav className="lv-nav">
          {(modules || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map((mod, mi) => (
              <div key={mod.id} className="lv-module">
                <div className="lv-module-title">
                  <span className="lv-module-number">Module {mi + 1}</span>
                  {mod.title}
                </div>
                <ul className="lv-lesson-list">
                  {(mod.lessons || [])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson) => {
                      const isCurrent = lesson.id === lessonId;
                      const isDone = completedLessons.has(lesson.id);
                      return (
                        <li
                          key={lesson.id}
                          className={`lv-lesson-item ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                        >
                          <Link to={`/student/courses/${courseId}/lessons/${lesson.id}`}>
                            <span className="lv-lesson-status">
                              {isDone ? '✓' : isCurrent ? '▶' : '○'}
                            </span>
                            <span className="lv-lesson-name">{lesson.title}</span>
                            {lesson.duration_minutes && (
                              <span className="lv-lesson-duration">{lesson.duration_minutes}m</span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
        </nav>

        {/* Certificate link if all done */}
        {allComplete && (
          <div className="lv-certificate-cta">
            <span>🎉 Course Complete!</span>
            <Link to={`/student/courses/${courseId}/certificate`} className="lv-cert-btn">
              View Certificate →
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main className="lv-main">
        {/* Top bar */}
        <div className="lv-topbar">
          {!sidebarOpen && (
            <button className="lv-sidebar-open-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          )}
          <div className="lv-breadcrumb">
            <span>{currentLesson?.modules?.title || 'Module'}</span>
            <span className="lv-breadcrumb-sep">/</span>
            <span>{currentLesson?.title}</span>
          </div>
          <div className="lv-topbar-actions">
            <span className="lv-read-time">⏱ {Math.floor(readTime / 60)}:{String(readTime % 60).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Lesson Content */}
        <article className="lv-content">
          <h1 className="lv-lesson-title">{currentLesson?.title}</h1>

          {blocks.length > 0 ? (
            <div className="lv-blocks">
              {blocks.map((block, i) => (
                <BlockRenderer key={block.id || i} block={block} />
              ))}
            </div>
          ) : (
            <div className="lv-empty-content">
              <p>📭 This lesson has no content yet.</p>
              <p>The instructor is still working on it. Check back soon!</p>
            </div>
          )}
        </article>

        {/* Bottom Navigation */}
        <div className="lv-bottom-nav">
          <div className="lv-nav-left">
            {prevLesson ? (
              <Link
                to={`/student/courses/${courseId}/lessons/${prevLesson.id}`}
                className="lv-nav-btn lv-prev"
              >
                <span className="lv-nav-label">← Previous</span>
                <span className="lv-nav-title">{prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}
          </div>

          <div className="lv-nav-center">
            {!isCurrentCompleted ? (
              <button
                className="lv-complete-btn"
                onClick={handleComplete}
                disabled={isCompleting}
              >
                {isCompleting ? 'Completing...' : '✓ Mark as Complete'}
              </button>
            ) : (
              <span className="lv-completed-badge">✓ Completed</span>
            )}
          </div>

          <div className="lv-nav-right">
            {nextLesson ? (
              <Link
                to={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
                className="lv-nav-btn lv-next"
              >
                <span className="lv-nav-label">Next →</span>
                <span className="lv-nav-title">{nextLesson.title}</span>
              </Link>
            ) : allComplete ? (
              <Link to={`/student/courses/${courseId}/certificate`} className="lv-nav-btn lv-cert">
                <span className="lv-nav-label">🎓 Get Certificate</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonViewer;
