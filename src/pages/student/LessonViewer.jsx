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

// ── Inline Styles ────────────────────────────────────────────────────────
const styles = {
  // Block styles
  block: {
    marginBottom: '1.5rem',
    lineHeight: 1.7,
    color: '#e2e8f0',
  },
  blockText: {
    marginBottom: '1.5rem',
    lineHeight: 1.7,
    color: '#e2e8f0',
    fontSize: '1.05rem',
  },
  blockTextParagraph: {
    margin: '0 0 0.75rem 0',
    color: '#e2e8f0',
  },
  blockHeading: {
    color: '#fff',
    fontWeight: 600,
    marginTop: '2rem',
    marginBottom: '1rem',
  },
  blockH1: { fontSize: '2rem' },
  blockH2: { fontSize: '1.75rem' },
  blockH3: { fontSize: '1.5rem' },
  blockH4: { fontSize: '1.25rem' },
  blockCode: {
    marginBottom: '1.5rem',
    background: 'rgba(15, 15, 35, 0.8)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: 'rgba(99, 102, 241, 0.15)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  codeLang: {
    color: '#8b5cf6',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  codeCopyBtn: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#a5b4fc',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.2s ease',
  },
  codePre: {
    margin: 0,
    padding: '1.25rem',
    overflow: 'auto',
    maxHeight: '500px',
  },
  codeContent: {
    fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  blockImage: {
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  blockImageImg: {
    maxWidth: '100%',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  blockImageCaption: {
    marginTop: '0.75rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  blockVideo: {
    marginBottom: '1.5rem',
  },
  videoWrapper: {
    position: 'relative',
    paddingBottom: '56.25%',
    height: 0,
    overflow: 'hidden',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  videoIframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  videoCaption: {
    marginTop: '0.75rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  blockCallout: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid',
  },
  calloutInfo: {
    background: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  calloutTip: {
    background: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  calloutWarning: {
    background: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  calloutDanger: {
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  calloutNote: {
    background: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  calloutIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  calloutContent: {
    color: '#e2e8f0',
    lineHeight: 1.6,
  },
  blockDivider: {
    border: 'none',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    margin: '2rem 0',
  },
  blockList: {
    marginBottom: '1.5rem',
    paddingLeft: '1.5rem',
    color: '#e2e8f0',
    lineHeight: 1.8,
  },
  blockListItem: {
    marginBottom: '0.5rem',
  },
  blockQuote: {
    marginBottom: '1.5rem',
    padding: '1.5rem 2rem',
    background: 'rgba(139, 92, 246, 0.08)',
    borderLeft: '4px solid #8b5cf6',
    borderRadius: '0 12px 12px 0',
    fontStyle: 'italic',
  },
  blockQuoteP: {
    margin: 0,
    color: '#e2e8f0',
    fontSize: '1.1rem',
    lineHeight: 1.7,
  },
  blockQuoteCite: {
    display: 'block',
    marginTop: '1rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontStyle: 'normal',
  },

  // Main layout
  lessonViewer: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  lessonViewerCollapsed: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Sidebar
  sidebar: {
    width: '320px',
    background: 'rgba(20, 20, 45, 0.95)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 100,
    transition: 'transform 0.3s ease',
    backdropFilter: 'blur(20px)',
  },
  sidebarClosed: {
    transform: 'translateX(-100%)',
  },
  sidebarHeader: {
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  courseTitle: {
    color: '#a5b4fc',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    transition: 'color 0.2s ease',
  },
  sidebarToggle: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  progressSection: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    color: '#94a3b8',
    fontSize: '0.8rem',
  },
  nav: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem 0',
  },
  module: {
    marginBottom: '0.5rem',
  },
  moduleTitle: {
    padding: '0.75rem 1.25rem',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  moduleNumber: {
    color: '#6366f1',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 600,
  },
  lessonList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  lessonItem: {
    borderLeft: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  lessonItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderLeftColor: '#6366f1',
  },
  lessonItemCompleted: {
    opacity: 0.8,
  },
  lessonLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.25rem',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  lessonLinkActive: {
    color: '#fff',
  },
  lessonStatus: {
    fontSize: '0.85rem',
    width: '1.25rem',
    textAlign: 'center',
    flexShrink: 0,
  },
  lessonStatusCompleted: {
    color: '#22c55e',
  },
  lessonStatusActive: {
    color: '#6366f1',
  },
  lessonName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lessonDuration: {
    color: '#64748b',
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  certificateCta: {
    padding: '1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(34, 197, 94, 0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  certCtaText: {
    color: '#22c55e',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  certBtn: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },

  // Main content
  main: {
    flex: 1,
    marginLeft: '320px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    transition: 'margin-left 0.3s ease',
  },
  mainCollapsed: {
    marginLeft: 0,
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(20, 20, 45, 0.5)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  sidebarOpenBtn: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#a5b4fc',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'all 0.2s ease',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
    flex: 1,
    overflow: 'hidden',
  },
  breadcrumbSep: {
    color: '#64748b',
  },
  topbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  readTime: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontFamily: '"Fira Code", monospace',
  },

  // Lesson content
  content: {
    flex: 1,
    padding: '3rem',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  },
  lessonTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '2rem',
    lineHeight: 1.3,
  },
  blocks: {
    marginBottom: '3rem',
  },
  emptyContent: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  emptyContentP: {
    color: '#94a3b8',
    fontSize: '1.1rem',
    margin: '0.5rem 0',
  },

  // Bottom navigation
  bottomNav: {
    display: 'flex',
    alignItems: 'stretch',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(20, 20, 45, 0.5)',
    backdropFilter: 'blur(10px)',
  },
  navLeft: {
    flex: 1,
    display: 'flex',
  },
  navCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem 2rem',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  navRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  navBtn: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 2rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    minWidth: '200px',
  },
  navBtnPrev: {
    background: 'transparent',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  navBtnNext: {
    background: 'transparent',
    textAlign: 'right',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
  },
  navLabel: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    marginBottom: '0.25rem',
  },
  navTitle: {
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  completeBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    color: '#fff',
    padding: '0.875rem 2rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
  },
  completeBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  completedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#22c55e',
    fontWeight: 600,
    fontSize: '1rem',
  },
  navCert: {
    background: 'rgba(34, 197, 94, 0.1)',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    padding: '1.5rem 2rem',
    minWidth: '200px',
  },
  navCertLabel: {
    color: '#22c55e',
    fontWeight: 600,
  },

  // Loading/Error states
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    color: '#94a3b8',
    gap: '1rem',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    color: '#e2e8f0',
    gap: '1rem',
    padding: '2rem',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: '2rem',
    margin: 0,
  },
  errorMsg: {
    color: '#94a3b8',
    fontSize: '1.1rem',
    margin: 0,
  },
  btnBackError: {
    marginTop: '1rem',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#a5b4fc',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
};

// Add keyframes style to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  if (!document.querySelector('[data-lesson-viewer-styles]')) {
    styleSheet.setAttribute('data-lesson-viewer-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

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
        <div style={styles.blockText}>
          {block.content.split('\n').map((line, i) => (
            <p key={i} style={styles.blockTextParagraph}>{line || '\u00A0'}</p>
          ))}
        </div>
      );

    case 'heading': {
      const Tag = `h${block.level || 2}`;
      const headingStyle = {
        ...styles.blockHeading,
        ...(block.level === 1 ? styles.blockH1 : {}),
        ...(block.level === 2 || !block.level ? styles.blockH2 : {}),
        ...(block.level === 3 ? styles.blockH3 : {}),
        ...(block.level === 4 ? styles.blockH4 : {}),
      };
      return <Tag style={headingStyle}>{block.content}</Tag>;
    }

    case 'code':
      return (
        <div style={styles.blockCode}>
          <div style={styles.codeHeader}>
            <span style={styles.codeLang}>{block.language || 'code'}</span>
            <button
              style={styles.codeCopyBtn}
              onClick={() => {
                navigator.clipboard.writeText(block.content);
              }}
              title="Copy code"
            >
              📋 Copy
            </button>
          </div>
          <pre style={styles.codePre}><code style={styles.codeContent}>{block.content}</code></pre>
        </div>
      );

    case 'image':
      return (
        <figure style={styles.blockImage}>
          <img src={block.url} alt={block.alt || 'Lesson image'} loading="lazy" style={styles.blockImageImg} />
          {block.caption && <figcaption style={styles.blockImageCaption}>{block.caption}</figcaption>}
        </figure>
      );

    case 'video': {
      const embedUrl = getYouTubeEmbedUrl(block.url);
      return (
        <div style={styles.blockVideo}>
          <div style={styles.videoWrapper}>
            <iframe
              src={embedUrl}
              title={block.caption || 'Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={styles.videoIframe}
            />
          </div>
          {block.caption && <p style={styles.videoCaption}>{block.caption}</p>}
        </div>
      );
    }

    case 'callout': {
      const icons = { info: 'ℹ️', tip: '💡', warning: '⚠️', danger: '🚨', note: '📝' };
      const calloutType = block.calloutType || 'info';
      const calloutStyles = {
        ...styles.blockCallout,
        ...(calloutType === 'info' ? styles.calloutInfo : {}),
        ...(calloutType === 'tip' ? styles.calloutTip : {}),
        ...(calloutType === 'warning' ? styles.calloutWarning : {}),
        ...(calloutType === 'danger' ? styles.calloutDanger : {}),
        ...(calloutType === 'note' ? styles.calloutNote : {}),
      };
      return (
        <div style={calloutStyles}>
          <span style={styles.calloutIcon}>{icons[calloutType] || 'ℹ️'}</span>
          <div style={styles.calloutContent}>{block.content}</div>
        </div>
      );
    }

    case 'divider':
      return <hr style={styles.blockDivider} />;

    case 'list': {
      const Tag = block.listType === 'ordered' ? 'ol' : 'ul';
      const items = (block.items || block.content?.split('\n') || []).filter(Boolean);
      return (
        <Tag style={styles.blockList}>
          {items.map((item, i) => (
            <li key={i} style={styles.blockListItem}>{item}</li>
          ))}
        </Tag>
      );
    }

    case 'quote':
      return (
        <blockquote style={styles.blockQuote}>
          <p style={styles.blockQuoteP}>{block.content}</p>
          {block.author && <cite style={styles.blockQuoteCite}>— {block.author}</cite>}
        </blockquote>
      );

    default:
      return <div style={styles.blockText}><p style={styles.blockTextParagraph}>{block.content || ''}</p></div>;
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
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Oops!</h2>
        <p style={styles.errorMsg}>{error}</p>
        <button onClick={() => navigate(-1)} style={styles.btnBackError}>← Go Back</button>
      </div>
    );
  }

  // ── Render ──
  return (
    <div style={sidebarOpen ? styles.lessonViewer : styles.lessonViewerCollapsed}>
      {/* ── Sidebar ── */}
      <aside style={sidebarOpen ? styles.sidebar : { ...styles.sidebar, ...styles.sidebarClosed }}>
        <div style={styles.sidebarHeader}>
          <Link to={`/courses/${courseId}`} style={styles.courseTitle} title={course?.title}>
            ← {course?.title}
          </Link>
          <button style={styles.sidebarToggle} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
          </div>
          <span style={styles.progressText}>{progressPercent}% complete • {completedLessons.size}/{orderedLessons.length} lessons</span>
        </div>

        {/* Module/Lesson Tree */}
        <nav style={styles.nav}>
          {(modules || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map((mod, mi) => (
              <div key={mod.id} style={styles.module}>
                <div style={styles.moduleTitle}>
                  <span style={styles.moduleNumber}>Module {mi + 1}</span>
                  {mod.title}
                </div>
                <ul style={styles.lessonList}>
                  {(mod.lessons || [])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson) => {
                      const isCurrent = lesson.id === lessonId;
                      const isDone = completedLessons.has(lesson.id);
                      const itemStyle = {
                        ...styles.lessonItem,
                        ...(isCurrent ? styles.lessonItemActive : {}),
                        ...(isDone ? styles.lessonItemCompleted : {}),
                      };
                      const linkStyle = {
                        ...styles.lessonLink,
                        ...(isCurrent ? styles.lessonLinkActive : {}),
                      };
                      const statusStyle = {
                        ...styles.lessonStatus,
                        ...(isDone ? styles.lessonStatusCompleted : {}),
                        ...(isCurrent && !isDone ? styles.lessonStatusActive : {}),
                      };
                      return (
                        <li key={lesson.id} style={itemStyle}>
                          <Link to={`/student/courses/${courseId}/lessons/${lesson.id}`} style={linkStyle}>
                            <span style={statusStyle}>
                              {isDone ? '✓' : isCurrent ? '▶' : '○'}
                            </span>
                            <span style={styles.lessonName}>{lesson.title}</span>
                            {lesson.duration_minutes && (
                              <span style={styles.lessonDuration}>{lesson.duration_minutes}m</span>
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
          <div style={styles.certificateCta}>
            <span style={styles.certCtaText}>🎉 Course Complete!</span>
            <Link to={`/student/courses/${courseId}/certificate`} style={styles.certBtn}>
              View Certificate →
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main style={sidebarOpen ? styles.main : { ...styles.main, ...styles.mainCollapsed }}>
        {/* Top bar */}
        <div style={styles.topbar}>
          {!sidebarOpen && (
            <button style={styles.sidebarOpenBtn} onClick={() => setSidebarOpen(true)}>☰</button>
          )}
          <div style={styles.breadcrumb}>
            <span>{currentLesson?.modules?.title || 'Module'}</span>
            <span style={styles.breadcrumbSep}>/</span>
            <span>{currentLesson?.title}</span>
          </div>
          <div style={styles.topbarActions}>
            <span style={styles.readTime}>⏱ {Math.floor(readTime / 60)}:{String(readTime % 60).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Lesson Content */}
        <article style={styles.content}>
          <h1 style={styles.lessonTitle}>{currentLesson?.title}</h1>

          {blocks.length > 0 ? (
            <div style={styles.blocks}>
              {blocks.map((block, i) => (
                <BlockRenderer key={block.id || i} block={block} />
              ))}
            </div>
          ) : (
            <div style={styles.emptyContent}>
              <p style={styles.emptyContentP}>📭 This lesson has no content yet.</p>
              <p style={styles.emptyContentP}>The instructor is still working on it. Check back soon!</p>
            </div>
          )}
        </article>

        {/* Bottom Navigation */}
        <div style={styles.bottomNav}>
          <div style={styles.navLeft}>
            {prevLesson ? (
              <Link
                to={`/student/courses/${courseId}/lessons/${prevLesson.id}`}
                style={{ ...styles.navBtn, ...styles.navBtnPrev }}
              >
                <span style={styles.navLabel}>← Previous</span>
                <span style={styles.navTitle}>{prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}
          </div>

          <div style={styles.navCenter}>
            {!isCurrentCompleted ? (
              <button
                style={isCompleting ? { ...styles.completeBtn, ...styles.completeBtnDisabled } : styles.completeBtn}
                onClick={handleComplete}
                disabled={isCompleting}
              >
                {isCompleting ? 'Completing...' : '✓ Mark as Complete'}
              </button>
            ) : (
              <span style={styles.completedBadge}>✓ Completed</span>
            )}
          </div>

          <div style={styles.navRight}>
            {nextLesson ? (
              <Link
                to={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
                style={{ ...styles.navBtn, ...styles.navBtnNext }}
              >
                <span style={styles.navLabel}>Next →</span>
                <span style={styles.navTitle}>{nextLesson.title}</span>
              </Link>
            ) : allComplete ? (
              <Link to={`/student/courses/${courseId}/certificate`} style={styles.navCert}>
                <span style={styles.navCertLabel}>🎓 Get Certificate</span>
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
