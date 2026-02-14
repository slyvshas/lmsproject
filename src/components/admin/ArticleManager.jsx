import React, { useState, useEffect, useCallback } from 'react';
import TipTapEditor from '../../components/common/TipTapEditor';
import useAuth from '../../hooks/useAuth';
import {
  fetchAllArticles,
  fetchArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchArticleStats
} from '../../services/articleService';

const ArticleManager = ({ onBack }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [editingArticle, setEditingArticle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    category: '',
    tags: '',
    status: 'draft'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [articlesRes, statsRes] = await Promise.all([
        fetchAllArticles(),
        fetchArticleStats()
      ]);
      
      if (articlesRes.data) setArticles(articlesRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading articles:', error);
      setMessage({ type: 'error', text: 'Failed to load articles' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      cover_image: '',
      category: '',
      tags: '',
      status: 'draft'
    });
    setEditingArticle(null);
  };

  const handleCreate = () => {
    resetForm();
    setView('create');
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const { data, error } = await fetchArticleById(id);
      if (error) throw error;
      
      setFormData({
        title: data.title || '',
        content: data.content || '',
        excerpt: data.excerpt || '',
        cover_image: data.cover_image || '',
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        status: data.status || 'draft'
      });
      setEditingArticle(data);
      setView('edit');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load article' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const { error } = await deleteArticle(id);
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Article deleted successfully' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete article' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }
    if (!formData.content.trim() || formData.content === '<p></p>') {
      setMessage({ type: 'error', text: 'Content is required' });
      return;
    }

    setSaving(true);
    try {
      const articlePayload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      let result;
      if (editingArticle) {
        result = await updateArticle(editingArticle.id, articlePayload);
      } else {
        result = await createArticle(articlePayload, user?.id);
      }

      if (result.error) throw result.error;

      setMessage({ 
        type: 'success', 
        text: editingArticle ? 'Article updated successfully!' : 'Article created successfully!' 
      });
      
      resetForm();
      setView('list');
      loadData();
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save article' });
    } finally {
      setSaving(false);
    }
  };

  const handleBackToList = () => {
    resetForm();
    setView('list');
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Styles
  const containerStyle = {
    padding: '24px',
    maxWidth: '100%'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
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

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };

  const primaryButton = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
  };

  const secondaryButton = {
    ...buttonStyle,
    background: 'rgba(255,255,255,0.1)',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.2)'
  };

  const dangerButton = {
    ...buttonStyle,
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    padding: '8px 14px'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  };

  const statCardStyle = {
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center'
  };

  const tableContainerStyle = {
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thStyle = {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)'
  };

  const tdStyle = {
    padding: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#e2e8f0',
    fontSize: '14px',
    verticalAlign: 'middle'
  };

  const formContainerStyle = {
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(255,255,255,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(15, 15, 35, 0.8)',
    color: '#fff',
    fontSize: '15px',
    marginTop: '8px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '4px'
  };

  const fieldGroupStyle = {
    marginBottom: '24px'
  };

  const getStatusBadge = (status) => ({
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
    background: status === 'published' 
      ? 'rgba(34, 197, 94, 0.2)' 
      : status === 'draft'
      ? 'rgba(234, 179, 8, 0.2)'
      : 'rgba(156, 163, 175, 0.2)',
    color: status === 'published' 
      ? '#4ade80' 
      : status === 'draft'
      ? '#facc15'
      : '#9ca3af'
  });

  const messageStyle = {
    padding: '14px 18px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: message.type === 'error' 
      ? 'rgba(239, 68, 68, 0.15)' 
      : 'rgba(34, 197, 94, 0.15)',
    color: message.type === 'error' ? '#f87171' : '#4ade80',
    border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
  };

  const filterBarStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  };

  const searchInputStyle = {
    ...inputStyle,
    flex: '1',
    minWidth: '250px',
    marginTop: 0
  };

  const selectStyle = {
    ...inputStyle,
    width: 'auto',
    minWidth: '150px',
    marginTop: 0,
    cursor: 'pointer'
  };

  // Loading state
  if (loading && view === 'list' && articles.length === 0) {
    return (
      <div style={{ ...containerStyle, textAlign: 'center', padding: '80px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <div style={{ fontSize: '20px', color: '#6366f1' }}>Loading articles...</div>
      </div>
    );
  }

  // Create/Edit View
  if (view === 'create' || view === 'edit') {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            {view === 'create' ? '✍️ Create New Article' : '📝 Edit Article'}
          </h1>
          <button onClick={handleBackToList} style={secondaryButton}>
            ← Back to Articles
          </button>
        </div>

        {message.text && (
          <div style={messageStyle}>
            {message.type === 'error' ? '⚠️' : '✅'} {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            {/* Main Content */}
            <div style={formContainerStyle}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a compelling title"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Content *</label>
                <TipTapEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your article content here..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div style={formContainerStyle}>
                <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                  📋 Article Settings
                </h3>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">✅ Published</option>
                    <option value="archived">📦 Archived</option>
                  </select>
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary (shown in article cards)"
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    style={inputStyle}
                  />
                  {formData.cover_image && (
                    <img 
                      src={formData.cover_image} 
                      alt="Cover preview" 
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover', 
                        borderRadius: '8px', 
                        marginTop: '12px' 
                      }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Learning Tips, Technology"
                    style={inputStyle}
                  />
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="react, javascript, web"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button 
                    type="submit" 
                    style={{ ...primaryButton, flex: 1 }} 
                    disabled={saving}
                  >
                    {saving ? '⏳ Saving...' : (view === 'create' ? '🚀 Publish' : '💾 Update')}
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={handleBackToList} 
                  style={{ ...secondaryButton, width: '100%', marginTop: '12px', justifyContent: 'center' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // List View
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          📰 Article Manager
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onBack && (
            <button onClick={onBack} style={secondaryButton}>
              ← Back to Dashboard
            </button>
          )}
          <button onClick={handleCreate} style={primaryButton}>
            ✍️ Create Article
          </button>
        </div>
      </div>

      {message.text && (
        <div style={messageStyle}>
          {message.type === 'error' ? '⚠️' : '✅'} {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#6366f1' }}>{stats.total}</div>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Total Articles</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#22c55e' }}>{stats.published}</div>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Published</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#eab308' }}>{stats.draft}</div>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Drafts</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#8b5cf6' }}>{stats.totalViews}</div>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Total Views</div>
        </div>
      </div>

      {/* Filters */}
      <div style={filterBarStyle}>
        <input
          type="text"
          placeholder="🔍 Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Articles Table */}
      <div style={tableContainerStyle}>
        {filteredArticles.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📝</div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>
              {articles.length === 0 ? 'No articles yet' : 'No matching articles'}
            </div>
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
              {articles.length === 0 ? 'Create your first article to get started!' : 'Try adjusting your search or filters'}
            </div>
            {articles.length === 0 && (
              <button onClick={handleCreate} style={primaryButton}>
                ✍️ Create First Article
              </button>
            )}
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Article</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Views</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {article.cover_image ? (
                        <img 
                          src={article.cover_image} 
                          alt="" 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '8px', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '8px', 
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          📄
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '600', color: '#fff', marginBottom: '3px' }}>
                          {article.title}
                        </div>
                        {article.author?.full_name && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            by {article.author.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {article.category ? (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        fontSize: '13px'
                      }}>
                        {article.category}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={getStatusBadge(article.status)}>
                      {article.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: '#8b5cf6', fontWeight: '600' }}>
                      {article.views || 0}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {new Date(article.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(article.id)}
                        style={{ ...secondaryButton, padding: '8px 14px' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
                        style={dangerButton}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ArticleManager;
