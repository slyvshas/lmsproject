// ============================================================================
// Course Editor — Educative-style Block Content Editor
// ============================================================================
// Full course editor with modules, lessons, and a block-based content system.
// Supports rich text editing, YouTube video embeds, images, code blocks,
// callout boxes, and more — similar to Educative.io / Notion.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchCourseDetails, updateCourse } from '../../services/courseService';
import {
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../../services/contentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../styles/CourseEditor.module.css';

// ---- Block types ----
const BLOCK_TYPES = [
  { type: 'text', icon: '📝', label: 'Text', desc: 'Rich text paragraph' },
  { type: 'heading', icon: '🔤', label: 'Heading', desc: 'Section heading' },
  { type: 'code', icon: '💻', label: 'Code', desc: 'Code block with syntax' },
  { type: 'image', icon: '🖼️', label: 'Image', desc: 'Image from URL' },
  { type: 'video', icon: '▶️', label: 'Video', desc: 'YouTube / video embed' },
  { type: 'callout', icon: '💡', label: 'Callout', desc: 'Info / tip / warning box' },
  { type: 'divider', icon: '➖', label: 'Divider', desc: 'Horizontal separator' },
  { type: 'list', icon: '📋', label: 'List', desc: 'Bullet or numbered list' },
  { type: 'quote', icon: '❝', label: 'Quote', desc: 'Blockquote' },
];

const CALLOUT_STYLES = [
  { type: 'info', icon: '💡', label: 'Info', color: '#3b82f6' },
  { type: 'tip', icon: '✅', label: 'Tip', color: '#10b981' },
  { type: 'warning', icon: '⚠️', label: 'Warning', color: '#f59e0b' },
  { type: 'danger', icon: '❌', label: 'Danger', color: '#ef4444' },
  { type: 'note', icon: '📌', label: 'Note', color: '#8b5cf6' },
];

const CODE_LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'csharp', 'typescript',
  'html', 'css', 'sql', 'bash', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
];

// ---- Helpers ----
const createBlock = (type, extra = {}) => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  type,
  ...getDefaultBlockData(type),
  ...extra,
});

const getDefaultBlockData = (type) => {
  switch (type) {
    case 'text': return { content: '' };
    case 'heading': return { content: '', level: 2 };
    case 'code': return { content: '', language: 'javascript' };
    case 'image': return { url: '', alt: '', caption: '' };
    case 'video': return { url: '', caption: '' };
    case 'callout': return { content: '', calloutType: 'info' };
    case 'divider': return {};
    case 'list': return { items: [''], ordered: false };
    case 'quote': return { content: '', author: '' };
    default: return { content: '' };
  }
};

// Extract YouTube embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // Already an embed URL
  if (url.includes('youtube.com/embed/')) return url;
  return null;
};

// Serialize blocks to JSON string for storage
const serializeBlocks = (blocks) => JSON.stringify(blocks);

// Deserialize content — handle both legacy markdown and new block format
const deserializeContent = (content) => {
  if (!content) return [createBlock('text')];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    // Legacy markdown content — wrap in a single text block
    return [createBlock('text', { content })];
  }
  return [createBlock('text')];
};

// ============================================================================
// Main CourseEditor component
// ============================================================================
const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lesson editing
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);
  const [blocks, setBlocks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Module creation
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');

  // Lesson creation
  const [addingLessonToModule, setAddingLessonToModule] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Publish & UI
  const [isPublishing, setIsPublishing] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(null); // index to insert after
  const [collapsedModules, setCollapsedModules] = useState({});
  const [previewMode, setPreviewMode] = useState(false);

  // ---- Load course ----
  const loadCourse = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchCourseDetails(courseId);
      if (result.error) { setError(result.error); return; }
      const courseData = result.data;
      if (courseData?.modules) {
        courseData.modules.sort((a, b) => a.order_index - b.order_index);
        courseData.modules.forEach((m) => {
          if (m.lessons) m.lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        });
      }
      setCourse(courseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  // ---- Module CRUD ----
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setIsAddingModule(true);
    try {
      const orderIndex = (course.modules?.length || 0) + 1;
      const result = await createModule({
        course_id: courseId,
        title: newModuleTitle.trim(),
        order_index: orderIndex,
      });
      if (result.error) alert('Failed: ' + result.error);
      else { setNewModuleTitle(''); await loadCourse(); }
    } catch (err) { alert(err.message); }
    finally { setIsAddingModule(false); }
  };

  const handleRenameModule = async (moduleId) => {
    if (!editModuleTitle.trim()) return;
    await updateModule(moduleId, { title: editModuleTitle.trim() });
    setEditingModuleId(null);
    await loadCourse();
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    const result = await deleteModule(moduleId);
    if (result.error) alert('Failed: ' + result.error);
    else {
      if (activeLesson?.module_id === moduleId) setActiveLesson(null);
      await loadCourse();
    }
  };

  const toggleModuleCollapse = (moduleId) => {
    setCollapsedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // ---- Lesson CRUD ----
  const handleAddLesson = async (moduleId) => {
    if (!newLessonTitle.trim()) return;
    try {
      const mod = course.modules.find((m) => m.id === moduleId);
      const orderIndex = (mod?.lessons?.length || 0) + 1;
      const initialContent = serializeBlocks([createBlock('text')]);
      const result = await createLesson({
        module_id: moduleId,
        title: newLessonTitle.trim(),
        content: initialContent,
        order_index: orderIndex,
        duration_minutes: 5,
      });
      if (result.error) alert('Failed: ' + result.error);
      else {
        setNewLessonTitle('');
        setAddingLessonToModule(null);
        await loadCourse();
        openLesson({ ...result.data, module_id: moduleId });
      }
    } catch (err) { alert(err.message); }
  };

  const openLesson = (lesson) => {
    // Warn about unsaved changes
    if (hasChanges && activeLesson) {
      if (!window.confirm('You have unsaved changes. Discard and switch?')) return;
    }
    setActiveLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDuration(lesson.duration_minutes || 10);
    setBlocks(deserializeContent(lesson.content));
    setHasChanges(false);
    setSaveStatus('');
    setPreviewMode(false);
    setShowBlockMenu(null);
  };

  const handleSaveLesson = async () => {
    if (!activeLesson) return;
    setIsSaving(true);
    setSaveStatus('');
    try {
      const result = await updateLesson(activeLesson.id, {
        title: lessonTitle,
        content: serializeBlocks(blocks),
        duration_minutes: parseInt(lessonDuration) || 5,
      });
      if (result.error) {
        setSaveStatus('Error saving');
        alert('Failed: ' + result.error);
      } else {
        setSaveStatus('Saved ✓');
        setHasChanges(false);
        await loadCourse();
        setActiveLesson((prev) => ({ ...prev, ...result.data }));
      }
    } catch (err) { setSaveStatus('Error'); }
    finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    const result = await deleteLesson(lessonId);
    if (result.error) alert('Failed: ' + result.error);
    else {
      if (activeLesson?.id === lessonId) {
        setActiveLesson(null);
        setBlocks([]);
      }
      await loadCourse();
    }
  };

  // ---- Publish ----
  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await updateCourse(courseId, { is_published: !course.is_published });
      if (result.error) alert('Failed: ' + result.error);
      else await loadCourse();
    } catch (err) { alert(err.message); }
    finally { setIsPublishing(false); }
  };

  // ---- Block operations ----
  const updateBlock = (blockId, updates) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b)));
    setHasChanges(true);
  };

  const addBlockAfter = (index, type) => {
    const newBlock = createBlock(type);
    setBlocks((prev) => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });
    setShowBlockMenu(null);
    setHasChanges(true);
  };

  const removeBlock = (blockId) => {
    setBlocks((prev) => {
      const filtered = prev.filter((b) => b.id !== blockId);
      return filtered.length === 0 ? [createBlock('text')] : filtered;
    });
    setHasChanges(true);
  };

  const moveBlock = (blockId, direction) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const updated = [...prev];
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      return updated;
    });
    setHasChanges(true);
  };

  const duplicateBlock = (blockId) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx < 0) return prev;
      const clone = { ...prev[idx], id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
      const updated = [...prev];
      updated.splice(idx + 1, 0, clone);
      return updated;
    });
    setHasChanges(true);
  };

  // ---- Keyboard shortcut ----
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeLesson) handleSaveLesson();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeLesson, blocks, lessonTitle, lessonDuration]);

  // ---- Render ----
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="editor-error">Error: {error}</div>;
  if (!course) return <div className="editor-error">Course not found</div>;

  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="course-editor">
      {/* Top Bar */}
      <div className="editor-topbar">
        <div className="topbar-left">
          <button onClick={() => navigate('/instructor/dashboard')} className="btn-back-editor">
            ← Back
          </button>
          <div className="course-info-bar">
            <h2>{course.title}</h2>
            <span className={`pub-badge ${course.is_published ? 'published' : 'draft'}`}>
              {course.is_published ? '● Live' : '○ Draft'}
            </span>
          </div>
        </div>
        <div className="topbar-right">
          <span className="lesson-count">{totalLessons} lesson{totalLessons !== 1 ? 's' : ''}</span>
          {saveStatus && <span className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>{saveStatus}</span>}
          {hasChanges && <span className="unsaved-dot" title="Unsaved changes">●</span>}
          <button
            onClick={handleTogglePublish}
            disabled={isPublishing}
            className={`btn-publish ${course.is_published ? 'unpublish' : ''}`}
          >
            {isPublishing ? '...' : course.is_published ? 'Unpublish' : '🚀 Publish'}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* ---- Sidebar ---- */}
        <aside className="editor-sidebar">
          <div className="sidebar-header">
            <h3>📚 Course Content</h3>
          </div>

          <div className="modules-tree">
            {course.modules?.map((mod, mIdx) => (
              <div key={mod.id} className="module-tree-item">
                <div className="module-tree-header" onClick={() => toggleModuleCollapse(mod.id)}>
                  <span className={`collapse-arrow ${collapsedModules[mod.id] ? 'collapsed' : ''}`}>▾</span>
                  <span className="module-tree-number">M{mIdx + 1}</span>
                  {editingModuleId === mod.id ? (
                    <input
                      className="module-rename-input"
                      value={editModuleTitle}
                      onChange={(e) => setEditModuleTitle(e.target.value)}
                      onBlur={() => handleRenameModule(mod.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameModule(mod.id);
                        if (e.key === 'Escape') setEditingModuleId(null);
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="module-tree-title">{mod.title}</span>
                  )}
                  <div className="module-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-icon-sm"
                      onClick={() => { setEditingModuleId(mod.id); setEditModuleTitle(mod.title); }}
                      title="Rename"
                    >✏️</button>
                    <button className="btn-icon-sm delete-icon" onClick={() => handleDeleteModule(mod.id)} title="Delete">×</button>
                  </div>
                </div>

                {!collapsedModules[mod.id] && (
                  <div className="lessons-tree">
                    {mod.lessons?.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className={`lesson-tree-item ${activeLesson?.id === lesson.id ? 'active' : ''}`}
                        onClick={() => openLesson({ ...lesson, module_id: mod.id })}
                      >
                        <span className="lesson-tree-icon">📄</span>
                        <span className="lesson-tree-title">{lesson.title}</span>
                        <span className="lesson-tree-duration">{lesson.duration_minutes || 0}m</span>
                        <button
                          className="btn-icon-sm delete-icon"
                          onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                          title="Delete"
                        >×</button>
                      </div>
                    ))}

                    {addingLessonToModule === mod.id ? (
                      <div className="add-lesson-inline">
                        <input
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="Lesson title..."
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddLesson(mod.id);
                            if (e.key === 'Escape') { setAddingLessonToModule(null); setNewLessonTitle(''); }
                          }}
                        />
                        <button onClick={() => handleAddLesson(mod.id)} className="btn-add-inline">+</button>
                      </div>
                    ) : (
                      <button
                        className="btn-add-lesson"
                        onClick={() => { setAddingLessonToModule(mod.id); setNewLessonTitle(''); }}
                      >
                        + Add Lesson
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="add-module-section">
            <input
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="New module title..."
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddModule(); }}
              disabled={isAddingModule}
            />
            <button onClick={handleAddModule} disabled={isAddingModule || !newModuleTitle.trim()} className="btn-add-module">
              {isAddingModule ? '...' : '+ Module'}
            </button>
          </div>
        </aside>

        {/* ---- Main: Block Editor ---- */}
        <main className="editor-main">
          {activeLesson ? (
            <div className="lesson-editor">
              {/* Lesson header */}
              <div className="lesson-editor-header">
                <input
                  className="lesson-title-input"
                  value={lessonTitle}
                  onChange={(e) => { setLessonTitle(e.target.value); setHasChanges(true); }}
                  placeholder="Lesson Title"
                />
                <div className="lesson-meta-row">
                  <label className="duration-label">
                    ⏱️
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={lessonDuration}
                      onChange={(e) => { setLessonDuration(e.target.value); setHasChanges(true); }}
                      className="duration-input"
                    />
                    min
                  </label>
                  <div className="editor-mode-toggle">
                    <button
                      className={`mode-btn ${!previewMode ? 'active' : ''}`}
                      onClick={() => setPreviewMode(false)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={`mode-btn ${previewMode ? 'active' : ''}`}
                      onClick={() => setPreviewMode(true)}
                    >
                      👁️ Preview
                    </button>
                  </div>
                  <button onClick={handleSaveLesson} disabled={isSaving} className="btn-save-lesson">
                    {isSaving ? 'Saving...' : '💾 Save'}
                  </button>
                </div>
              </div>

              {previewMode ? (
                /* ---- Preview mode ---- */
                <div className="lesson-preview">
                  <div className="preview-lesson-title">{lessonTitle}</div>
                  {blocks.map((block) => (
                    <BlockPreview key={block.id} block={block} />
                  ))}
                </div>
              ) : (
                /* ---- Edit mode: Block editor ---- */
                <div className="blocks-editor">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="block-wrapper">
                      <BlockEditor
                        block={block}
                        onChange={(updates) => updateBlock(block.id, updates)}
                        onRemove={() => removeBlock(block.id)}
                        onMoveUp={() => moveBlock(block.id, -1)}
                        onMoveDown={() => moveBlock(block.id, 1)}
                        onDuplicate={() => duplicateBlock(block.id)}
                        isFirst={index === 0}
                        isLast={index === blocks.length - 1}
                      />

                      {/* Add block button between blocks */}
                      <div className="block-insert-zone">
                        <button
                          className="btn-insert-block"
                          onClick={() => setShowBlockMenu(showBlockMenu === index ? null : index)}
                          title="Add content block"
                        >
                          <span className="insert-line" />
                          <span className="insert-icon">+</span>
                          <span className="insert-line" />
                        </button>

                        {showBlockMenu === index && (
                          <div className="block-menu">
                            <div className="block-menu-header">Add Content Block</div>
                            <div className="block-menu-grid">
                              {BLOCK_TYPES.map((bt) => (
                                <button
                                  key={bt.type}
                                  className="block-menu-item"
                                  onClick={() => addBlockAfter(index, bt.type)}
                                >
                                  <span className="bmi-icon">{bt.icon}</span>
                                  <div className="bmi-info">
                                    <span className="bmi-label">{bt.label}</span>
                                    <span className="bmi-desc">{bt.desc}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Initial add block if empty */}
                  {blocks.length === 0 && (
                    <div className="empty-blocks">
                      <p>Click below to add your first content block</p>
                      <div className="block-menu-grid initial">
                        {BLOCK_TYPES.map((bt) => (
                          <button
                            key={bt.type}
                            className="block-menu-item"
                            onClick={() => addBlockAfter(-1, bt.type)}
                          >
                            <span className="bmi-icon">{bt.icon}</span>
                            <div className="bmi-info">
                              <span className="bmi-label">{bt.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ---- Empty state ---- */
            <div className="editor-empty-state">
              <div className="empty-icon">✨</div>
              <h2>Start Building Your Course</h2>
              <p>Select a lesson from the sidebar or create one to start adding content.</p>
              <div className="empty-tips">
                <div className="tip-card"><span>📝</span><div><strong>Rich Text</strong><p>Write formatted text with headings and lists</p></div></div>
                <div className="tip-card"><span>▶️</span><div><strong>Video Embeds</strong><p>Paste YouTube URLs to embed videos</p></div></div>
                <div className="tip-card"><span>🖼️</span><div><strong>Images</strong><p>Add images via URL with captions</p></div></div>
                <div className="tip-card"><span>💻</span><div><strong>Code Blocks</strong><p>Add code with language selection</p></div></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// BlockEditor — Editable view of a single content block
// ============================================================================
const BlockEditor = ({ block, onChange, onRemove, onMoveUp, onMoveDown, onDuplicate, isFirst, isLast }) => {
  const [showActions, setShowActions] = useState(false);

  const blockMeta = BLOCK_TYPES.find((bt) => bt.type === block.type) || BLOCK_TYPES[0];

  return (
    <div
      className={`block-editor block-${block.type}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Block controls */}
      <div className={`block-controls ${showActions ? 'visible' : ''}`}>
        <span className="block-type-badge">{blockMeta.icon} {blockMeta.label}</span>
        <div className="block-control-buttons">
          {!isFirst && <button onClick={onMoveUp} title="Move up" className="ctrl-btn">↑</button>}
          {!isLast && <button onClick={onMoveDown} title="Move down" className="ctrl-btn">↓</button>}
          <button onClick={onDuplicate} title="Duplicate" className="ctrl-btn">⧉</button>
          <button onClick={onRemove} title="Delete block" className="ctrl-btn danger">🗑️</button>
        </div>
      </div>

      {/* Block content */}
      <div className="block-body">
        {block.type === 'text' && (
          <TextBlockEditor content={block.content} onChange={(content) => onChange({ content })} />
        )}
        {block.type === 'heading' && (
          <HeadingBlockEditor content={block.content} level={block.level} onChange={onChange} />
        )}
        {block.type === 'code' && (
          <CodeBlockEditor content={block.content} language={block.language} onChange={onChange} />
        )}
        {block.type === 'image' && (
          <ImageBlockEditor url={block.url} alt={block.alt} caption={block.caption} onChange={onChange} />
        )}
        {block.type === 'video' && (
          <VideoBlockEditor url={block.url} caption={block.caption} onChange={onChange} />
        )}
        {block.type === 'callout' && (
          <CalloutBlockEditor content={block.content} calloutType={block.calloutType} onChange={onChange} />
        )}
        {block.type === 'divider' && <div className="divider-block"><hr /></div>}
        {block.type === 'list' && (
          <ListBlockEditor items={block.items} ordered={block.ordered} onChange={onChange} />
        )}
        {block.type === 'quote' && (
          <QuoteBlockEditor content={block.content} author={block.author} onChange={onChange} />
        )}
      </div>
    </div>
  );
};

// ---- Individual block editors ----

const TextBlockEditor = ({ content, onChange }) => {
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  // Sync format toolbar
  const [selectionFormat, setSelectionFormat] = useState({});
  
  useEffect(() => { setLocalContent(content); }, [content]);

  const applyFormat = (tag) => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = localContent.substring(start, end);
    let wrapped;
    switch (tag) {
      case 'bold': wrapped = `**${selected}**`; break;
      case 'italic': wrapped = `*${selected}*`; break;
      case 'code': wrapped = `\`${selected}\``; break;
      case 'link': wrapped = `[${selected || 'link text'}](url)`; break;
      case 'strikethrough': wrapped = `~~${selected}~~`; break;
      default: return;
    }
    const newContent = localContent.substring(0, start) + wrapped + localContent.substring(end);
    setLocalContent(newContent);
    onChange(newContent);
  };

  return (
    <div className={`text-block-editor ${isFocused ? 'focused' : ''}`}>
      <div className="text-format-bar">
        <button onClick={() => applyFormat('bold')} title="Bold (Ctrl+B)" className="fmt-btn"><b>B</b></button>
        <button onClick={() => applyFormat('italic')} title="Italic" className="fmt-btn"><i>I</i></button>
        <button onClick={() => applyFormat('strikethrough')} title="Strikethrough" className="fmt-btn"><s>S</s></button>
        <button onClick={() => applyFormat('code')} title="Inline Code" className="fmt-btn mono">&lt;/&gt;</button>
        <button onClick={() => applyFormat('link')} title="Link" className="fmt-btn">🔗</button>
      </div>
      <textarea
        ref={ref}
        value={localContent}
        onChange={(e) => { setLocalContent(e.target.value); onChange(e.target.value); }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Write your text here... Use **bold**, *italic*, `code`"
        rows={4}
      />
    </div>
  );
};

const HeadingBlockEditor = ({ content, level, onChange }) => (
  <div className="heading-block-editor">
    <div className="heading-level-selector">
      {[1, 2, 3, 4].map((l) => (
        <button
          key={l}
          className={`level-btn ${level === l ? 'active' : ''}`}
          onClick={() => onChange({ level: l })}
        >
          H{l}
        </button>
      ))}
    </div>
    <input
      className={`heading-input h${level}`}
      value={content}
      onChange={(e) => onChange({ content: e.target.value })}
      placeholder={`Heading ${level}`}
    />
  </div>
);

const CodeBlockEditor = ({ content, language, onChange }) => (
  <div className="code-block-editor">
    <div className="code-header">
      <select
        value={language}
        onChange={(e) => onChange({ language: e.target.value })}
        className="lang-select"
      >
        {CODE_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
      <span className="code-label">Code Block</span>
    </div>
    <textarea
      className="code-textarea"
      value={content}
      onChange={(e) => onChange({ content: e.target.value })}
      placeholder="Paste or write your code here..."
      spellCheck={false}
      rows={6}
    />
  </div>
);

const ImageBlockEditor = ({ url, alt, caption, onChange }) => (
  <div className="image-block-editor">
    <div className="image-inputs">
      <div className="img-input-row">
        <span className="input-icon">🖼️</span>
        <input
          value={url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="Paste image URL (e.g. https://example.com/image.png)"
          className="img-url-input"
        />
      </div>
      <div className="img-input-row">
        <span className="input-icon">📝</span>
        <input
          value={alt}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder="Alt text (accessibility)"
          className="img-alt-input"
        />
      </div>
      <div className="img-input-row">
        <span className="input-icon">💬</span>
        <input
          value={caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Caption (optional)"
          className="img-caption-input"
        />
      </div>
    </div>
    {url && (
      <div className="image-preview-container">
        <img
          src={url}
          alt={alt || 'Image'}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="img-error" style={{ display: 'none' }}>
          ⚠️ Could not load image — check the URL
        </div>
        {caption && <p className="img-caption">{caption}</p>}
      </div>
    )}
  </div>
);

const VideoBlockEditor = ({ url, caption, onChange }) => {
  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <div className="video-block-editor">
      <div className="video-input-row">
        <span className="input-icon">▶️</span>
        <input
          value={url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
          className="video-url-input"
        />
      </div>
      <div className="video-input-row">
        <span className="input-icon">💬</span>
        <input
          value={caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Video caption (optional)"
        />
      </div>
      {embedUrl ? (
        <div className="video-embed-container">
          <iframe
            src={embedUrl}
            title="Video embed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-iframe"
          />
          {caption && <p className="video-caption">{caption}</p>}
        </div>
      ) : url ? (
        <div className="video-error">
          ⚠️ Could not parse video URL. Supported: YouTube links
        </div>
      ) : (
        <div className="video-placeholder">
          <span>▶️</span>
          <p>Paste a YouTube link above to embed a video</p>
        </div>
      )}
    </div>
  );
};

const CalloutBlockEditor = ({ content, calloutType, onChange }) => {
  const style = CALLOUT_STYLES.find((s) => s.type === calloutType) || CALLOUT_STYLES[0];

  return (
    <div className="callout-block-editor" style={{ borderLeftColor: style.color }}>
      <div className="callout-type-selector">
        {CALLOUT_STYLES.map((s) => (
          <button
            key={s.type}
            className={`callout-type-btn ${calloutType === s.type ? 'active' : ''}`}
            onClick={() => onChange({ calloutType: s.type })}
            title={s.label}
          >
            {s.icon}
          </button>
        ))}
      </div>
      <div className="callout-content-area">
        <span className="callout-icon">{style.icon}</span>
        <textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder={`Write your ${style.label.toLowerCase()} here...`}
          rows={2}
        />
      </div>
    </div>
  );
};

const ListBlockEditor = ({ items = [''], ordered, onChange }) => {
  const updateItem = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    onChange({ items: updated });
  };

  const addItem = () => onChange({ items: [...items, ''] });

  const removeItem = (index) => {
    if (items.length <= 1) return;
    onChange({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="list-block-editor">
      <div className="list-type-toggle">
        <button className={`list-type-btn ${!ordered ? 'active' : ''}`} onClick={() => onChange({ ordered: false })}>
          • Bullet
        </button>
        <button className={`list-type-btn ${ordered ? 'active' : ''}`} onClick={() => onChange({ ordered: true })}>
          1. Numbered
        </button>
      </div>
      <div className="list-items">
        {items.map((item, i) => (
          <div key={i} className="list-item-row">
            <span className="list-marker">{ordered ? `${i + 1}.` : '•'}</span>
            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder="List item..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addItem(); }
                if (e.key === 'Backspace' && !item && items.length > 1) { e.preventDefault(); removeItem(i); }
              }}
            />
            {items.length > 1 && (
              <button className="btn-remove-list-item" onClick={() => removeItem(i)}>×</button>
            )}
          </div>
        ))}
      </div>
      <button className="btn-add-list-item" onClick={addItem}>+ Add item</button>
    </div>
  );
};

const QuoteBlockEditor = ({ content, author, onChange }) => (
  <div className="quote-block-editor">
    <textarea
      value={content}
      onChange={(e) => onChange({ content: e.target.value })}
      placeholder="Enter quote text..."
      rows={3}
      className="quote-textarea"
    />
    <input
      value={author}
      onChange={(e) => onChange({ author: e.target.value })}
      placeholder="— Author (optional)"
      className="quote-author"
    />
  </div>
);

// ============================================================================
// BlockPreview — Read-only rendered view of a block (Preview mode)
// ============================================================================
const BlockPreview = ({ block }) => {
  switch (block.type) {
    case 'text':
      return <div className="preview-text">{renderInlineMarkdown(block.content)}</div>;
    case 'heading': {
      const Tag = `h${block.level || 2}`;
      return <Tag className="preview-heading">{block.content}</Tag>;
    }
    case 'code':
      return (
        <div className="preview-code">
          {block.language && <span className="code-lang-badge">{block.language}</span>}
          <pre><code>{block.content}</code></pre>
        </div>
      );
    case 'image':
      return block.url ? (
        <figure className="preview-image">
          <img src={block.url} alt={block.alt || ''} />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      ) : null;
    case 'video': {
      const embedUrl = getYouTubeEmbedUrl(block.url);
      return embedUrl ? (
        <div className="preview-video">
          <iframe src={embedUrl} title="Video" allowFullScreen className="video-iframe" />
          {block.caption && <p className="video-caption">{block.caption}</p>}
        </div>
      ) : null;
    }
    case 'callout': {
      const style = CALLOUT_STYLES.find((s) => s.type === block.calloutType) || CALLOUT_STYLES[0];
      return (
        <div className="preview-callout" style={{ borderLeftColor: style.color, background: style.color + '10' }}>
          <span className="callout-preview-icon">{style.icon}</span>
          <p>{block.content}</p>
        </div>
      );
    }
    case 'divider':
      return <hr className="preview-divider" />;
    case 'list':
      return block.ordered ? (
        <ol className="preview-list">{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ol>
      ) : (
        <ul className="preview-list">{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>
      );
    case 'quote':
      return (
        <blockquote className="preview-quote">
          <p>{block.content}</p>
          {block.author && <cite>— {block.author}</cite>}
        </blockquote>
      );
    default:
      return <p>{block.content}</p>;
  }
};

// Simple inline markdown renderer for preview text blocks
const renderInlineMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    // Process inline formatting
    let processed = line;
    const parts = [];
    let key = 0;
    let remaining = processed;

    while (remaining.length > 0) {
      let match;
      match = remaining.match(/`([^`]+)`/);
      if (match) {
        const idx = match.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.substring(0, idx)}</span>);
        parts.push(<code key={key++} className="md-inline-code">{match[1]}</code>);
        remaining = remaining.substring(idx + match[0].length);
        continue;
      }
      match = remaining.match(/\*\*([^*]+)\*\*/);
      if (match) {
        const idx = match.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.substring(0, idx)}</span>);
        parts.push(<strong key={key++}>{match[1]}</strong>);
        remaining = remaining.substring(idx + match[0].length);
        continue;
      }
      match = remaining.match(/\*([^*]+)\*/);
      if (match) {
        const idx = match.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.substring(0, idx)}</span>);
        parts.push(<em key={key++}>{match[1]}</em>);
        remaining = remaining.substring(idx + match[0].length);
        continue;
      }
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return <React.Fragment key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</React.Fragment>;
  });
};

export default CourseEditor;
