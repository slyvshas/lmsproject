// ============================================================================
// Create Course Page — Educative-style Multi-Step Wizard
// ============================================================================
// Professional course creation flow with step-by-step guidance,
// live preview, tags, prerequisites, learning objectives, and more.

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { createCourse } from '../../services/courseService';

// ============================================================================
// Inline Styles
// ============================================================================
const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    color: '#fff',
  },
  sidebar: {
    width: '280px',
    background: 'rgba(30, 30, 60, 0.8)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    marginBottom: '32px',
  },
  btnBack: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '8px 0',
    marginBottom: '8px',
  },
  sidebarTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  stepNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  stepNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    color: '#94a3b8',
  },
  stepNavItemActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
    color: '#fff',
  },
  stepNavItemCompleted: {
    color: '#10b981',
  },
  stepIndicator: {
    fontSize: '20px',
    width: '32px',
    textAlign: 'center',
  },
  stepLabel: {
    fontSize: '15px',
    fontWeight: '500',
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '24px',
  },
  progressBar: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  main: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
  wizardContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  stepContent: {
    marginBottom: '32px',
  },
  stepIntro: {
    marginBottom: '32px',
  },
  stepIntroH2: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  stepIntroP: {
    fontSize: '16px',
    color: '#94a3b8',
    margin: 0,
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '8px',
  },
  required: {
    color: '#ef4444',
    marginLeft: '4px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  fieldMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  hint: {
    fontSize: '13px',
    color: '#64748b',
  },
  charCount: {
    fontSize: '13px',
    color: '#64748b',
  },
  charCountWarn: {
    color: '#f59e0b',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  difficultyCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  difficultyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 16px',
    background: 'rgba(15, 15, 35, 0.8)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  difficultyCardActive: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.15)',
  },
  diffIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  diffLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  diffDesc: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  fieldDescription: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '12px',
    marginTop: 0,
  },
  dynamicList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dynamicListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  listNumber: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '50%',
    fontSize: '13px',
    fontWeight: '600',
    color: '#8b5cf6',
    flexShrink: 0,
  },
  btnRemoveItem: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(239, 68, 68, 0.2)',
    border: 'none',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '18px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  btnAddItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: 'transparent',
    border: '1px dashed rgba(99, 102, 241, 0.5)',
    borderRadius: '10px',
    color: '#8b5cf6',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  tagsPreview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
  },
  tagChip: {
    padding: '6px 12px',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#a5b4fc',
  },
  thumbnailPreview: {
    marginTop: '12px',
    borderRadius: '10px',
    overflow: 'hidden',
    maxWidth: '300px',
  },
  thumbnailImg: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  pricingToggle: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  pricingOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    background: 'rgba(15, 15, 35, 0.8)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  pricingOptionActive: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.15)',
  },
  pricingIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  pricingLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  pricingDesc: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  priceInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '200px',
  },
  currencySymbol: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#94a3b8',
  },
  previewCard: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  previewThumbnail: {
    maxHeight: '200px',
    overflow: 'hidden',
  },
  previewThumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewHeader: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  previewBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  previewBadge: {
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '20px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
  },
  previewBadgeFree: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
  },
  previewBadgePrice: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
  },
  previewTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
    margin: 0,
  },
  previewSubtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    margin: 0,
    marginTop: '8px',
  },
  previewBody: {
    padding: '24px',
  },
  previewSection: {
    marginBottom: '24px',
  },
  previewSectionInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  previewSectionH4: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '12px',
    margin: 0,
  },
  previewDescription: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  previewList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  previewListItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '14px',
    color: '#d1d5db',
  },
  checkIcon: {
    color: '#10b981',
    fontWeight: '700',
  },
  prereqIcon: {
    color: '#8b5cf6',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#fca5a5',
    fontSize: '14px',
    marginBottom: '24px',
  },
  wizardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  actionsRight: {
    marginLeft: 'auto',
  },
  btnSecondary: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnCreate: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  radioHidden: {
    display: 'none',
  },
};

const CATEGORIES = [
  'Web Development', 'Programming', 'Data Science', 'Design',
  'Business', 'Marketing', 'DevOps', 'Mobile Development',
  'Cybersecurity', 'Other',
];

const STEPS = [
  { id: 1, label: 'Basics', icon: '📝' },
  { id: 2, label: 'Details', icon: '📋' },
  { id: 3, label: 'Settings', icon: '⚙️' },
  { id: 4, label: 'Preview', icon: '👁️' },
];

const DIFFICULTY_META = {
  beginner: { label: 'Beginner', icon: '🌱', desc: 'No prior knowledge needed' },
  intermediate: { label: 'Intermediate', icon: '🌿', desc: 'Some experience required' },
  advanced: { label: 'Advanced', icon: '🌳', desc: 'Strong background expected' },
};

const CreateCourse = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'beginner',
    short_description: '',
    estimated_duration: '',
    prerequisites: [''],
    learning_objectives: [''],
    tags: '',
    thumbnail_url: '',
    is_free: true,
    price: '',
    language: 'English',
  });

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  }, []);

  // --- Dynamic list helpers (prerequisites, objectives) ---
  const handleListChange = useCallback((field, index, value) => {
    setForm((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  }, []);

  const addListItem = useCallback((field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  }, []);

  const removeListItem = useCallback((field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  // --- Validation per step ---
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!form.title.trim()) return 'Course title is required';
        if (form.title.trim().length < 5) return 'Title must be at least 5 characters';
        if (!form.short_description.trim()) return 'A short description is required';
        if (!form.category) return 'Please select a category';
        return null;
      case 2:
        if (!form.description.trim()) return 'Full description is required';
        if (form.description.trim().length < 30) return 'Description should be at least 30 characters';
        const objectives = form.learning_objectives.filter((o) => o.trim());
        if (objectives.length === 0) return 'Add at least one learning objective';
        return null;
      case 3:
        if (!form.is_free && (!form.price || parseFloat(form.price) <= 0))
          return 'Enter a valid price or mark the course as free';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const goToStep = (step) => {
    // Only allow navigation to completed or current steps
    if (step < currentStep) {
      setError('');
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const coursePayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        short_description: form.short_description?.trim() || null,
        category: form.category,
        difficulty_level: form.difficulty_level,
        thumbnail_url: form.thumbnail_url || null,
        language: form.language || 'English',
        estimated_duration: form.estimated_duration ? parseInt(form.estimated_duration) : null,
        tags: form.tags?.length > 0 ? form.tags : null,
        prerequisites: form.prerequisites?.filter(Boolean) || null,
        learning_objectives: form.learning_objectives?.filter(Boolean) || null,
        is_free: form.is_free !== false,
        price: form.is_free ? 0 : (parseFloat(form.price) || 0),
      };
      const result = await createCourse(coursePayload, userProfile.id);
      if (result.error) {
        setError(result.error);
      } else {
        navigate(`/instructor/course/${result.data.id}/edit`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = form.description.length;
  const titleCharCount = form.title.length;

  // ---- Step content renderers ----
  const renderStep1 = () => (
    <div style={styles.stepContent}>
      <div style={styles.stepIntro}>
        <h2 style={styles.stepIntroH2}>Let's start with the basics</h2>
        <p style={styles.stepIntroP}>Give your course a compelling title and choose its category. This is what students see first.</p>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="title" style={styles.label}>
          Course Title <span style={styles.required}>*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Mastering React: From Zero to Production"
          disabled={isSubmitting}
          maxLength={100}
          style={styles.input}
        />
        <div style={styles.fieldMeta}>
          <span style={styles.hint}>A clear, specific title performs best</span>
          <span style={{...styles.charCount, ...(titleCharCount > 80 ? styles.charCountWarn : {})}}>
            {titleCharCount}/100
          </span>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="short_description" style={styles.label}>
          Short Description <span style={styles.required}>*</span>
        </label>
        <input
          id="short_description"
          name="short_description"
          type="text"
          value={form.short_description}
          onChange={handleChange}
          placeholder="One-liner summary shown in course cards"
          disabled={isSubmitting}
          maxLength={160}
          style={styles.input}
        />
        <div style={styles.fieldMeta}>
          <span style={styles.hint}>Appears on course cards and search results</span>
          <span style={{...styles.charCount, ...(form.short_description.length > 140 ? styles.charCountWarn : {})}}>
            {form.short_description.length}/160
          </span>
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label htmlFor="category" style={styles.label}>
            Category <span style={styles.required}>*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={isSubmitting}
            style={styles.select}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="language" style={styles.label}>Language</label>
          <select
            id="language"
            name="language"
            value={form.language}
            onChange={handleChange}
            disabled={isSubmitting}
            style={styles.select}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Hindi">Hindi</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Difficulty Level <span style={styles.required}>*</span></label>
        <div style={styles.difficultyCards}>
          {Object.entries(DIFFICULTY_META).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              style={{
                ...styles.difficultyCard,
                ...(form.difficulty_level === key ? styles.difficultyCardActive : {}),
              }}
              onClick={() => setForm((prev) => ({ ...prev, difficulty_level: key }))}
              disabled={isSubmitting}
            >
              <span style={styles.diffIcon}>{meta.icon}</span>
              <span style={styles.diffLabel}>{meta.label}</span>
              <span style={styles.diffDesc}>{meta.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.stepContent}>
      <div style={styles.stepIntro}>
        <h2 style={styles.stepIntroH2}>Describe your course</h2>
        <p style={styles.stepIntroP}>Help students understand what they'll learn and what they need to know beforehand.</p>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="description" style={styles.label}>
          Full Description <span style={styles.required}>*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Write a comprehensive description of your course. Include:&#10;• What topics are covered&#10;• Who this course is for&#10;• What makes it unique"
          rows={8}
          disabled={isSubmitting}
          maxLength={2000}
          style={styles.textarea}
        />
        <div style={styles.fieldMeta}>
          <span style={styles.hint}>Detailed descriptions improve enrollment rates</span>
          <span style={{...styles.charCount, ...(charCount > 1800 ? styles.charCountWarn : {})}}>
            {charCount}/2000
          </span>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Learning Objectives <span style={styles.required}>*</span>
        </label>
        <p style={styles.fieldDescription}>What will students be able to do after completing this course?</p>
        <div style={styles.dynamicList}>
          {form.learning_objectives.map((obj, i) => (
            <div key={i} style={styles.dynamicListItem}>
              <span style={styles.listNumber}>{i + 1}</span>
              <input
                type="text"
                value={obj}
                onChange={(e) => handleListChange('learning_objectives', i, e.target.value)}
                placeholder={`e.g. ${i === 0 ? 'Build production-ready React apps' : i === 1 ? 'Understand component lifecycle' : 'Write clean, maintainable code'}`}
                disabled={isSubmitting}
                style={{...styles.input, flex: 1}}
              />
              {form.learning_objectives.length > 1 && (
                <button
                  type="button"
                  style={styles.btnRemoveItem}
                  onClick={() => removeListItem('learning_objectives', i)}
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {form.learning_objectives.length < 8 && (
            <button type="button" style={styles.btnAddItem} onClick={() => addListItem('learning_objectives')}>
              + Add objective
            </button>
          )}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Prerequisites</label>
        <p style={styles.fieldDescription}>What should students know before starting? (Optional)</p>
        <div style={styles.dynamicList}>
          {form.prerequisites.map((pre, i) => (
            <div key={i} style={styles.dynamicListItem}>
              <span style={styles.listNumber}>{i + 1}</span>
              <input
                type="text"
                value={pre}
                onChange={(e) => handleListChange('prerequisites', i, e.target.value)}
                placeholder={`e.g. ${i === 0 ? 'Basic JavaScript knowledge' : 'Familiarity with HTML & CSS'}`}
                disabled={isSubmitting}
                style={{...styles.input, flex: 1}}
              />
              {form.prerequisites.length > 1 && (
                <button
                  type="button"
                  style={styles.btnRemoveItem}
                  onClick={() => removeListItem('prerequisites', i)}
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {form.prerequisites.length < 6 && (
            <button type="button" style={styles.btnAddItem} onClick={() => addListItem('prerequisites')}>
              + Add prerequisite
            </button>
          )}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="tags" style={styles.label}>Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={form.tags}
          onChange={handleChange}
          placeholder="react, javascript, frontend, hooks (comma-separated)"
          disabled={isSubmitting}
          style={styles.input}
        />
        <span style={styles.hint}>Helps students discover your course via search</span>
        {form.tags && (
          <div style={styles.tagsPreview}>
            {form.tags.split(',').filter(t => t.trim()).map((tag, i) => (
              <span key={i} style={styles.tagChip}>{tag.trim()}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.stepContent}>
      <div style={styles.stepIntro}>
        <h2 style={styles.stepIntroH2}>Course settings</h2>
        <p style={styles.stepIntroP}>Configure additional details like duration, pricing, and course image.</p>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="thumbnail_url" style={styles.label}>Thumbnail URL</label>
        <input
          id="thumbnail_url"
          name="thumbnail_url"
          type="url"
          value={form.thumbnail_url}
          onChange={handleChange}
          placeholder="https://example.com/course-image.jpg"
          disabled={isSubmitting}
          style={styles.input}
        />
        <span style={styles.hint}>Recommended: 1280×720 pixels (16:9 ratio)</span>
        {form.thumbnail_url && (
          <div style={styles.thumbnailPreview}>
            <img
              src={form.thumbnail_url}
              alt="Thumbnail preview"
              style={styles.thumbnailImg}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="estimated_duration" style={styles.label}>Estimated Duration</label>
        <input
          id="estimated_duration"
          name="estimated_duration"
          type="text"
          value={form.estimated_duration}
          onChange={handleChange}
          placeholder="e.g. 12 hours, 6 weeks"
          disabled={isSubmitting}
          style={styles.input}
        />
        <span style={styles.hint}>Approximate time to complete the course</span>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Pricing</label>
        <div style={styles.pricingToggle}>
          <label style={{
            ...styles.pricingOption,
            ...(form.is_free ? styles.pricingOptionActive : {}),
          }}>
            <input
              type="radio"
              name="is_free"
              checked={form.is_free}
              onChange={() => setForm((p) => ({ ...p, is_free: true, price: '' }))}
              style={styles.radioHidden}
            />
            <span style={styles.pricingIcon}>🆓</span>
            <span style={styles.pricingLabel}>Free</span>
            <span style={styles.pricingDesc}>Open to all students</span>
          </label>
          <label style={{
            ...styles.pricingOption,
            ...(!form.is_free ? styles.pricingOptionActive : {}),
          }}>
            <input
              type="radio"
              name="is_free"
              checked={!form.is_free}
              onChange={() => setForm((p) => ({ ...p, is_free: false }))}
              style={styles.radioHidden}
            />
            <span style={styles.pricingIcon}>💰</span>
            <span style={styles.pricingLabel}>Paid</span>
            <span style={styles.pricingDesc}>Set your own price</span>
          </label>
        </div>
        {!form.is_free && (
          <div style={styles.priceInputWrapper}>
            <span style={styles.currencySymbol}>$</span>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="29.99"
              min="0"
              step="0.01"
              disabled={isSubmitting}
              style={styles.input}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const objectives = form.learning_objectives.filter((o) => o.trim());
    const prereqs = form.prerequisites.filter((p) => p.trim());
    const tags = form.tags ? form.tags.split(',').filter((t) => t.trim()) : [];
    const diff = DIFFICULTY_META[form.difficulty_level];

    return (
      <div style={styles.stepContent}>
        <div style={styles.stepIntro}>
          <h2 style={styles.stepIntroH2}>Review & Create</h2>
          <p style={styles.stepIntroP}>Everything look good? You can always edit these details later.</p>
        </div>

        <div style={styles.previewCard}>
          {form.thumbnail_url && (
            <div style={styles.previewThumbnail}>
              <img src={form.thumbnail_url} alt="Course thumbnail"
                style={styles.previewThumbnailImg}
                onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
          <div style={styles.previewHeader}>
            <div style={styles.previewBadges}>
              <span style={styles.previewBadge}>{form.category}</span>
              <span style={styles.previewBadge}>
                {diff.icon} {diff.label}
              </span>
              {form.is_free ? (
                <span style={{...styles.previewBadge, ...styles.previewBadgeFree}}>Free</span>
              ) : (
                <span style={{...styles.previewBadge, ...styles.previewBadgePrice}}>${form.price}</span>
              )}
              <span style={styles.previewBadge}>{form.language}</span>
            </div>
            <h3 style={styles.previewTitle}>{form.title}</h3>
            <p style={styles.previewSubtitle}>{form.short_description}</p>
          </div>

          <div style={styles.previewBody}>
            <div style={styles.previewSection}>
              <h4 style={styles.previewSectionH4}>About This Course</h4>
              <p style={styles.previewDescription}>{form.description}</p>
            </div>

            {objectives.length > 0 && (
              <div style={styles.previewSection}>
                <h4 style={styles.previewSectionH4}>What You'll Learn</h4>
                <ul style={styles.previewList}>
                  {objectives.map((o, i) => (
                    <li key={i} style={styles.previewListItem}><span style={styles.checkIcon}>✓</span> {o}</li>
                  ))}
                </ul>
              </div>
            )}

            {prereqs.length > 0 && (
              <div style={styles.previewSection}>
                <h4 style={styles.previewSectionH4}>Prerequisites</h4>
                <ul style={styles.previewList}>
                  {prereqs.map((p, i) => (
                    <li key={i} style={styles.previewListItem}><span style={styles.prereqIcon}>→</span> {p}</li>
                  ))}
                </ul>
              </div>
            )}

            {form.estimated_duration && (
              <div style={styles.previewSectionInline}>
                <h4 style={{...styles.previewSectionH4, marginBottom: 0}}>⏱️ Estimated Duration</h4>
                <span style={{color: '#94a3b8'}}>{form.estimated_duration}</span>
              </div>
            )}

            {tags.length > 0 && (
              <div style={styles.previewSection}>
                <h4 style={styles.previewSectionH4}>Tags</h4>
                <div style={styles.tagsPreview}>
                  {tags.map((t, i) => (
                    <span key={i} style={styles.tagChip}>{t.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stepRenderers = { 1: renderStep1, 2: renderStep2, 3: renderStep3, 4: renderStep4 };

  return (
    <div style={styles.page}>
      {/* Sidebar progress */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <button onClick={() => navigate(-1)} style={styles.btnBack}>← Back</button>
          <h2 style={styles.sidebarTitle}>Create Course</h2>
        </div>
        <nav style={styles.stepNav}>
          {STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              style={{
                ...styles.stepNavItem,
                ...(currentStep === step.id ? styles.stepNavItemActive : {}),
                ...(currentStep > step.id ? styles.stepNavItemCompleted : {}),
              }}
              onClick={() => goToStep(step.id)}
            >
              <span style={styles.stepIndicator}>
                {currentStep > step.id ? '✓' : step.icon}
              </span>
              <span style={styles.stepLabel}>{step.label}</span>
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${((currentStep - 1) / 3) * 100}%` }} />
          </div>
          <span style={styles.progressText}>Step {currentStep} of 4</span>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.wizardContent}>
          {stepRenderers[currentStep]()}

          {error && (
            <div style={styles.errorMessage}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={styles.wizardActions}>
            {currentStep > 1 && (
              <button type="button" style={styles.btnSecondary} onClick={prevStep} disabled={isSubmitting}>
                ← Previous
              </button>
            )}
            <div style={styles.actionsRight}>
              {currentStep < 4 ? (
                <button type="button" style={styles.btnPrimary} onClick={nextStep}>
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  style={styles.btnCreate}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span style={styles.spinner} />
                      Creating Course...
                    </>
                  ) : (
                    '🚀 Create Course & Add Content'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CreateCourse;
