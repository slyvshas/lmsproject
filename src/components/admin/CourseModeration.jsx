// ============================================================================
// Course Moderation Component
// ============================================================================
// Component for managing and moderating platform courses

import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllCourses, toggleCoursePublish, deleteCourse } from '../../services/adminService';

const CourseModeration = ({ onUpdate }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const limit = 12;

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAllCourses({
      page,
      limit,
      status: filters.status || undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    });

    if (result.error) {
      setError(result.error);
    } else {
      setCourses(result.data || []);
      setTotalCount(result.count || 0);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadCourses();
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    setActionLoading(courseId);
    const result = await toggleCoursePublish(courseId, !currentStatus);
    if (result.error) {
      alert('Error updating course: ' + result.error);
    } else {
      loadCourses();
      if (onUpdate) onUpdate();
    }
    setActionLoading(null);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? All related data (modules, lessons, enrollments) will be permanently deleted.')) {
      return;
    }
    setActionLoading(courseId);
    const result = await deleteCourse(courseId);
    if (result.error) {
      alert('Error deleting course: ' + result.error);
    } else {
      loadCourses();
      if (onUpdate) onUpdate();
    }
    setActionLoading(null);
  };

  const totalPages = Math.ceil(totalCount / limit);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Styles
  const containerStyle = {
    padding: '8px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const countBadgeStyle = {
    padding: '8px 16px',
    borderRadius: '20px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    fontSize: '14px',
    fontWeight: '600'
  };

  const filterBarStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '28px',
    flexWrap: 'wrap'
  };

  const inputStyle = {
    flex: '1',
    minWidth: '250px',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(30, 30, 60, 0.8)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const selectStyle = {
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(30, 30, 60, 0.8)',
    color: '#e2e8f0',
    fontSize: '14px',
    cursor: 'pointer',
    minWidth: '150px'
  };

  const searchButtonStyle = {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
    marginBottom: '28px'
  };

  const cardStyle = {
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease'
  };

  const thumbnailContainerStyle = {
    position: 'relative',
    height: '180px',
    background: 'linear-gradient(135deg, #2d2d5a 0%, #1a1a3e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  const thumbnailStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const placeholderStyle = {
    fontSize: '48px'
  };

  const statusBadgeStyle = (isPublished) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: isPublished ? 'rgba(34, 197, 94, 0.9)' : 'rgba(234, 179, 8, 0.9)',
    color: '#fff',
    backdropFilter: 'blur(8px)'
  });

  const cardContentStyle = {
    padding: '20px'
  };

  const courseTitleStyle = {
    fontSize: '17px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 12px 0',
    lineHeight: '1.4'
  };

  const metaRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  };

  const instructorStyle = {
    fontSize: '13px',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const difficultyBadgeStyle = (level) => {
    const colors = {
      beginner: { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' },
      intermediate: { bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15' },
      advanced: { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }
    };
    const c = colors[level] || { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' };
    return {
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'capitalize',
      background: c.bg,
      color: c.color
    };
  };

  const descriptionStyle = {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '16px',
    minHeight: '40px'
  };

  const statsRowStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  };

  const statItemStyle = {
    fontSize: '12px',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  };

  const actionsRowStyle = {
    display: 'flex',
    gap: '8px'
  };

  const buttonBaseStyle = {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  };

  const publishButtonStyle = (isPublished) => ({
    ...buttonBaseStyle,
    background: isPublished ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
    color: isPublished ? '#facc15' : '#4ade80'
  });

  const viewButtonStyle = {
    ...buttonBaseStyle,
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc'
  };

  const deleteButtonStyle = {
    ...buttonBaseStyle,
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    flex: 'none',
    padding: '10px 12px'
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px'
  };

  const pageButtonStyle = (disabled) => ({
    padding: '12px 24px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: disabled ? 'rgba(30, 30, 60, 0.5)' : 'rgba(30, 30, 60, 0.8)',
    color: disabled ? '#64748b' : '#e2e8f0',
    fontSize: '14px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s'
  });

  const pageInfoStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '500'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '80px 20px'
  };

  const errorStyle = {
    padding: '16px 20px',
    borderRadius: '12px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  // Modal Styles
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle = {
    background: 'rgba(30, 30, 60, 0.95)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.15)',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto'
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  };

  const modalTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    margin: 0
  };

  const closeButtonStyle = {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#94a3b8',
    fontSize: '24px',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  };

  const modalBodyStyle = {
    padding: '24px'
  };

  const detailHeaderStyle = {
    display: 'flex',
    gap: '20px',
    marginBottom: '28px',
    alignItems: 'flex-start'
  };

  const detailThumbnailStyle = {
    width: '120px',
    height: '80px',
    borderRadius: '12px',
    objectFit: 'cover',
    flexShrink: 0
  };

  const detailPlaceholderStyle = {
    width: '120px',
    height: '80px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #2d2d5a, #1a1a3e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    flexShrink: 0
  };

  const detailGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  };

  const detailItemStyle = {
    background: 'rgba(255,255,255,0.03)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)'
  };

  const detailLabelStyle = {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const detailValueStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e2e8f0',
    margin: 0
  };

  const descriptionBoxStyle = {
    background: 'rgba(255,255,255,0.03)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '24px'
  };

  const modalActionsStyle = {
    display: 'flex',
    gap: '12px'
  };

  const modalButtonStyle = (variant) => {
    const styles = {
      publish: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' },
      unpublish: { bg: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#fff' },
      delete: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }
    };
    const s = styles[variant] || styles.publish;
    return {
      flex: 1,
      padding: '14px 24px',
      borderRadius: '12px',
      border: 'none',
      background: s.bg,
      color: s.color,
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    };
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>📚 Course Moderation</h1>
        </div>
        <div style={loadingStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <div style={{ fontSize: '18px', color: '#6366f1' }}>Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <span>📚</span> Course Moderation
        </h1>
        <span style={countBadgeStyle}>{totalCount} courses total</span>
      </div>

      {/* Filters */}
      <form style={filterBarStyle} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="🔍 Search courses..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          style={inputStyle}
        />
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, status: e.target.value }));
            setPage(0);
          }}
          style={selectStyle}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters(prev => ({ ...prev, sortBy, sortOrder }));
          }}
          style={selectStyle}
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
        </select>
        <button type="submit" style={searchButtonStyle}>Search</button>
      </form>

      {/* Error State */}
      {error && (
        <div style={errorStyle}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '8px' }}>No Courses Found</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {courses.map(course => (
            <div 
              key={course.id} 
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={thumbnailContainerStyle}>
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} style={thumbnailStyle} />
                ) : (
                  <span style={placeholderStyle}>📖</span>
                )}
                <span style={statusBadgeStyle(course.is_published)}>
                  {course.is_published ? '✓ Published' : '📝 Draft'}
                </span>
              </div>

              <div style={cardContentStyle}>
                <h4 style={courseTitleStyle}>{course.title}</h4>
                
                <div style={metaRowStyle}>
                  <span style={instructorStyle}>
                    👤 {course.users?.full_name || 'Unknown'}
                  </span>
                  {course.difficulty_level && (
                    <span style={difficultyBadgeStyle(course.difficulty_level)}>
                      {course.difficulty_level}
                    </span>
                  )}
                </div>

                <p style={descriptionStyle}>
                  {course.description ? 
                    (course.description.length > 80 ? 
                      course.description.substring(0, 80) + '...' : 
                      course.description) : 
                    'No description'}
                </p>

                <div style={statsRowStyle}>
                  <span style={statItemStyle}>📚 {course.modules?.[0]?.count || 0} modules</span>
                  <span style={statItemStyle}>👥 {course.enrollments?.[0]?.count || 0} enrolled</span>
                  <span style={statItemStyle}>📅 {formatDate(course.created_at)}</span>
                </div>

                <div style={actionsRowStyle}>
                  <button
                    style={publishButtonStyle(course.is_published)}
                    onClick={() => handleTogglePublish(course.id, course.is_published)}
                    disabled={actionLoading === course.id}
                  >
                    {actionLoading === course.id ? '...' : 
                      (course.is_published ? '⏸ Unpublish' : '▶ Publish')}
                  </button>
                  <button
                    style={viewButtonStyle}
                    onClick={() => setSelectedCourse(course)}
                  >
                    👁 View
                  </button>
                  <button
                    style={deleteButtonStyle}
                    onClick={() => handleDeleteCourse(course.id)}
                    disabled={actionLoading === course.id}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationStyle}>
          <button
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
            style={pageButtonStyle(page === 0)}
          >
            ← Previous
          </button>
          <span style={pageInfoStyle}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
            style={pageButtonStyle(page >= totalPages - 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div style={modalOverlayStyle} onClick={() => setSelectedCourse(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>📋 Course Details</h3>
              <button 
                style={closeButtonStyle} 
                onClick={() => setSelectedCourse(null)}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                ×
              </button>
            </div>

            <div style={modalBodyStyle}>
              <div style={detailHeaderStyle}>
                {selectedCourse.thumbnail_url ? (
                  <img src={selectedCourse.thumbnail_url} alt={selectedCourse.title} style={detailThumbnailStyle} />
                ) : (
                  <div style={detailPlaceholderStyle}>📖</div>
                )}
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' }}>
                    {selectedCourse.title}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 12px 0' }}>
                    by {selectedCourse.users?.full_name || 'Unknown'}
                  </p>
                  <span style={statusBadgeStyle(selectedCourse.is_published)}>
                    {selectedCourse.is_published ? '✓ Published' : '📝 Draft'}
                  </span>
                </div>
              </div>

              <div style={detailGridStyle}>
                <div style={detailItemStyle}>
                  <div style={detailLabelStyle}>Category</div>
                  <p style={detailValueStyle}>{selectedCourse.category || 'Uncategorized'}</p>
                </div>
                <div style={detailItemStyle}>
                  <div style={detailLabelStyle}>Difficulty</div>
                  <p style={detailValueStyle}>{selectedCourse.difficulty_level || 'Not set'}</p>
                </div>
                <div style={detailItemStyle}>
                  <div style={detailLabelStyle}>Modules</div>
                  <p style={detailValueStyle}>{selectedCourse.modules?.[0]?.count || 0}</p>
                </div>
                <div style={detailItemStyle}>
                  <div style={detailLabelStyle}>Enrollments</div>
                  <p style={detailValueStyle}>{selectedCourse.enrollments?.[0]?.count || 0}</p>
                </div>
                <div style={detailItemStyle}>
                  <div style={detailLabelStyle}>Created</div>
                  <p style={detailValueStyle}>{formatDate(selectedCourse.created_at)}</p>
                </div>
                <div style={detailItemStyle}>
                  <div style={detailLabelStyle}>Updated</div>
                  <p style={detailValueStyle}>{formatDate(selectedCourse.updated_at)}</p>
                </div>
              </div>

              <div style={descriptionBoxStyle}>
                <div style={detailLabelStyle}>Description</div>
                <p style={{ color: '#e2e8f0', margin: '8px 0 0 0', lineHeight: '1.7' }}>
                  {selectedCourse.description || 'No description provided.'}
                </p>
              </div>

              <div style={modalActionsStyle}>
                <button
                  style={modalButtonStyle(selectedCourse.is_published ? 'unpublish' : 'publish')}
                  onClick={() => handleTogglePublish(selectedCourse.id, selectedCourse.is_published)}
                  disabled={actionLoading === selectedCourse.id}
                >
                  {actionLoading === selectedCourse.id ? 'Processing...' : 
                    (selectedCourse.is_published ? '⏸ Unpublish Course' : '▶ Publish Course')}
                </button>
                <button
                  style={modalButtonStyle('delete')}
                  onClick={() => handleDeleteCourse(selectedCourse.id)}
                  disabled={actionLoading === selectedCourse.id}
                >
                  🗑️ Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseModeration;
