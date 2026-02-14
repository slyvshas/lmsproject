// ============================================================================
// Create Course Page — Educative-style Multi-Step Wizard
// ============================================================================
// Professional course creation flow with step-by-step guidance,
// live preview, tags, prerequisites, learning objectives, and more.

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { createCourse } from '../../services/courseService';
import '../styles/CreateCourse.module.css';

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
    <div className="step-content">
      <div className="step-intro">
        <h2>Let's start with the basics</h2>
        <p>Give your course a compelling title and choose its category. This is what students see first.</p>
      </div>

      <div className="form-group">
        <label htmlFor="title">
          Course Title <span className="required">*</span>
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
        />
        <div className="field-meta">
          <span className="hint">A clear, specific title performs best</span>
          <span className={`char-count ${titleCharCount > 80 ? 'warn' : ''}`}>
            {titleCharCount}/100
          </span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="short_description">
          Short Description <span className="required">*</span>
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
        />
        <div className="field-meta">
          <span className="hint">Appears on course cards and search results</span>
          <span className={`char-count ${form.short_description.length > 140 ? 'warn' : ''}`}>
            {form.short_description.length}/160
          </span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            name="language"
            value={form.language}
            onChange={handleChange}
            disabled={isSubmitting}
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

      <div className="form-group">
        <label>Difficulty Level <span className="required">*</span></label>
        <div className="difficulty-cards">
          {Object.entries(DIFFICULTY_META).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              className={`difficulty-card ${form.difficulty_level === key ? 'active' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, difficulty_level: key }))}
              disabled={isSubmitting}
            >
              <span className="diff-icon">{meta.icon}</span>
              <span className="diff-label">{meta.label}</span>
              <span className="diff-desc">{meta.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-intro">
        <h2>Describe your course</h2>
        <p>Help students understand what they'll learn and what they need to know beforehand.</p>
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Full Description <span className="required">*</span>
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
        />
        <div className="field-meta">
          <span className="hint">Detailed descriptions improve enrollment rates</span>
          <span className={`char-count ${charCount > 1800 ? 'warn' : ''}`}>
            {charCount}/2000
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>
          Learning Objectives <span className="required">*</span>
        </label>
        <p className="field-description">What will students be able to do after completing this course?</p>
        <div className="dynamic-list">
          {form.learning_objectives.map((obj, i) => (
            <div key={i} className="dynamic-list-item">
              <span className="list-number">{i + 1}</span>
              <input
                type="text"
                value={obj}
                onChange={(e) => handleListChange('learning_objectives', i, e.target.value)}
                placeholder={`e.g. ${i === 0 ? 'Build production-ready React apps' : i === 1 ? 'Understand component lifecycle' : 'Write clean, maintainable code'}`}
                disabled={isSubmitting}
              />
              {form.learning_objectives.length > 1 && (
                <button
                  type="button"
                  className="btn-remove-item"
                  onClick={() => removeListItem('learning_objectives', i)}
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {form.learning_objectives.length < 8 && (
            <button type="button" className="btn-add-item" onClick={() => addListItem('learning_objectives')}>
              + Add objective
            </button>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Prerequisites</label>
        <p className="field-description">What should students know before starting? (Optional)</p>
        <div className="dynamic-list">
          {form.prerequisites.map((pre, i) => (
            <div key={i} className="dynamic-list-item">
              <span className="list-number">{i + 1}</span>
              <input
                type="text"
                value={pre}
                onChange={(e) => handleListChange('prerequisites', i, e.target.value)}
                placeholder={`e.g. ${i === 0 ? 'Basic JavaScript knowledge' : 'Familiarity with HTML & CSS'}`}
                disabled={isSubmitting}
              />
              {form.prerequisites.length > 1 && (
                <button
                  type="button"
                  className="btn-remove-item"
                  onClick={() => removeListItem('prerequisites', i)}
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {form.prerequisites.length < 6 && (
            <button type="button" className="btn-add-item" onClick={() => addListItem('prerequisites')}>
              + Add prerequisite
            </button>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={form.tags}
          onChange={handleChange}
          placeholder="react, javascript, frontend, hooks (comma-separated)"
          disabled={isSubmitting}
        />
        <span className="hint">Helps students discover your course via search</span>
        {form.tags && (
          <div className="tags-preview">
            {form.tags.split(',').filter(t => t.trim()).map((tag, i) => (
              <span key={i} className="tag-chip">{tag.trim()}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="step-intro">
        <h2>Course settings</h2>
        <p>Configure additional details like duration, pricing, and course image.</p>
      </div>

      <div className="form-group">
        <label htmlFor="thumbnail_url">Thumbnail URL</label>
        <input
          id="thumbnail_url"
          name="thumbnail_url"
          type="url"
          value={form.thumbnail_url}
          onChange={handleChange}
          placeholder="https://example.com/course-image.jpg"
          disabled={isSubmitting}
        />
        <span className="hint">Recommended: 1280×720 pixels (16:9 ratio)</span>
        {form.thumbnail_url && (
          <div className="thumbnail-preview">
            <img
              src={form.thumbnail_url}
              alt="Thumbnail preview"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="estimated_duration">Estimated Duration</label>
        <input
          id="estimated_duration"
          name="estimated_duration"
          type="text"
          value={form.estimated_duration}
          onChange={handleChange}
          placeholder="e.g. 12 hours, 6 weeks"
          disabled={isSubmitting}
        />
        <span className="hint">Approximate time to complete the course</span>
      </div>

      <div className="form-group">
        <label>Pricing</label>
        <div className="pricing-toggle">
          <label className={`pricing-option ${form.is_free ? 'active' : ''}`}>
            <input
              type="radio"
              name="is_free"
              checked={form.is_free}
              onChange={() => setForm((p) => ({ ...p, is_free: true, price: '' }))}
            />
            <span className="pricing-icon">🆓</span>
            <span className="pricing-label">Free</span>
            <span className="pricing-desc">Open to all students</span>
          </label>
          <label className={`pricing-option ${!form.is_free ? 'active' : ''}`}>
            <input
              type="radio"
              name="is_free"
              checked={!form.is_free}
              onChange={() => setForm((p) => ({ ...p, is_free: false }))}
            />
            <span className="pricing-icon">💰</span>
            <span className="pricing-label">Paid</span>
            <span className="pricing-desc">Set your own price</span>
          </label>
        </div>
        {!form.is_free && (
          <div className="price-input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="29.99"
              min="0"
              step="0.01"
              disabled={isSubmitting}
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
      <div className="step-content">
        <div className="step-intro">
          <h2>Review & Create</h2>
          <p>Everything look good? You can always edit these details later.</p>
        </div>

        <div className="preview-card">
          {form.thumbnail_url && (
            <div className="preview-thumbnail">
              <img src={form.thumbnail_url} alt="Course thumbnail"
                onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
          <div className="preview-header">
            <div className="preview-badges">
              <span className="preview-badge category">{form.category}</span>
              <span className="preview-badge difficulty">
                {diff.icon} {diff.label}
              </span>
              {form.is_free ? (
                <span className="preview-badge free">Free</span>
              ) : (
                <span className="preview-badge price">${form.price}</span>
              )}
              <span className="preview-badge lang">{form.language}</span>
            </div>
            <h3 className="preview-title">{form.title}</h3>
            <p className="preview-subtitle">{form.short_description}</p>
          </div>

          <div className="preview-body">
            <div className="preview-section">
              <h4>About This Course</h4>
              <p className="preview-description">{form.description}</p>
            </div>

            {objectives.length > 0 && (
              <div className="preview-section">
                <h4>What You'll Learn</h4>
                <ul className="preview-list objectives">
                  {objectives.map((o, i) => (
                    <li key={i}><span className="check-icon">✓</span> {o}</li>
                  ))}
                </ul>
              </div>
            )}

            {prereqs.length > 0 && (
              <div className="preview-section">
                <h4>Prerequisites</h4>
                <ul className="preview-list prereqs">
                  {prereqs.map((p, i) => (
                    <li key={i}><span className="prereq-icon">→</span> {p}</li>
                  ))}
                </ul>
              </div>
            )}

            {form.estimated_duration && (
              <div className="preview-section inline">
                <h4>⏱️ Estimated Duration</h4>
                <span>{form.estimated_duration}</span>
              </div>
            )}

            {tags.length > 0 && (
              <div className="preview-section">
                <h4>Tags</h4>
                <div className="tags-preview">
                  {tags.map((t, i) => (
                    <span key={i} className="tag-chip">{t.trim()}</span>
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
    <div className="create-course-page">
      {/* Sidebar progress */}
      <aside className="wizard-sidebar">
        <div className="sidebar-header">
          <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
          <h2>Create Course</h2>
        </div>
        <nav className="step-nav">
          {STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              className={`step-nav-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              onClick={() => goToStep(step.id)}
            >
              <span className="step-indicator">
                {currentStep > step.id ? '✓' : step.icon}
              </span>
              <span className="step-label">{step.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
          </div>
          <span className="progress-text">Step {currentStep} of 4</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="wizard-main">
        <div className="wizard-content">
          {stepRenderers[currentStep]()}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          <div className="wizard-actions">
            {currentStep > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                ← Previous
              </button>
            )}
            <div className="actions-right">
              {currentStep < 4 ? (
                <button type="button" className="btn-primary" onClick={nextStep}>
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-create"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><span className="spinner" /> Creating Course...</>
                  ) : (
                    '🚀 Create Course & Add Content'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCourse;
