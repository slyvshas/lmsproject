import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedArticles, fetchCategories, searchArticles } from '../services/articleService';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        fetchPublishedArticles(),
        fetchCategories()
      ]);
      
      console.log('Articles response:', articlesRes);
      
      if (articlesRes.error) {
        console.error('Articles fetch error:', articlesRes.error);
      }
      if (articlesRes.data) setArticles(articlesRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await searchArticles(searchQuery);
      if (data) setArticles(data);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const filteredArticles = selectedCategory 
    ? articles.filter(a => a.category === selectedCategory)
    : articles;

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '40px 20px'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '48px'
  };

  const titleStyle = {
    fontSize: '48px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '16px'
  };

  const subtitleStyle = {
    fontSize: '18px',
    color: '#94a3b8',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const searchBarStyle = {
    display: 'flex',
    gap: '12px',
    maxWidth: '600px',
    margin: '0 auto 32px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };

  const searchInputStyle = {
    flex: '1',
    minWidth: '280px',
    padding: '14px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(30, 30, 60, 0.8)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none'
  };

  const searchButtonStyle = {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const categoriesStyle = {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '40px'
  };

  const categoryButtonStyle = (isActive) => ({
    padding: '10px 20px',
    borderRadius: '25px',
    border: '1px solid',
    borderColor: isActive ? '#6366f1' : 'rgba(255,255,255,0.15)',
    background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 30, 60, 0.5)',
    color: isActive ? '#a5b4fc' : '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '28px'
  };

  const cardStyle = {
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column'
  };

  const cardImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  };

  const cardImagePlaceholder = {
    width: '100%',
    height: '200px',
    background: 'linear-gradient(135deg, #2d2d5a 0%, #1a1a3e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  };

  const cardContentStyle = {
    padding: '24px',
    flex: '1',
    display: 'flex',
    flexDirection: 'column'
  };

  const cardCategoryStyle = {
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: '20px',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
    alignSelf: 'flex-start'
  };

  const cardTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '12px',
    lineHeight: '1.4'
  };

  const cardExcerptStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.7',
    marginBottom: '16px',
    flex: '1'
  };

  const cardFooterStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.05)'
  };

  const authorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600'
  };

  const readMoreStyle = {
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#94a3b8'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#6366f1'
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📰</div>
          <div style={{ fontSize: '20px' }}>Loading articles...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Articles & Insights</h1>
          <p style={subtitleStyle}>
            Explore our latest articles, tutorials, and insights to enhance your learning journey.
          </p>
        </div>

        {/* Search */}
        <div style={searchBarStyle}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={searchInputStyle}
          />
          <button onClick={handleSearch} style={searchButtonStyle}>
            🔍 Search
          </button>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div style={categoriesStyle}>
            <button 
              onClick={() => setSelectedCategory('')}
              style={categoryButtonStyle(!selectedCategory)}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={categoryButtonStyle(selectedCategory === cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>📭</div>
            <div style={{ fontSize: '24px', color: '#fff', marginBottom: '10px' }}>
              No articles found
            </div>
            <div style={{ fontSize: '16px' }}>
              Check back later for new content!
            </div>
          </div>
        ) : (
          <div style={gridStyle}>
            {filteredArticles.map((article) => (
              <Link 
                to={`/articles/${article.slug}`} 
                key={article.id}
                style={{ textDecoration: 'none' }}
              >
                <div 
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
                  {article.cover_image ? (
                    <img 
                      src={article.cover_image} 
                      alt={article.title}
                      style={cardImageStyle}
                    />
                  ) : (
                    <div style={cardImagePlaceholder}>📄</div>
                  )}
                  
                  <div style={cardContentStyle}>
                    {article.category && (
                      <span style={cardCategoryStyle}>{article.category}</span>
                    )}
                    <h2 style={cardTitleStyle}>{article.title}</h2>
                    <p style={cardExcerptStyle}>
                      {article.excerpt || 'No excerpt available...'}
                    </p>
                    
                    <div style={cardFooterStyle}>
                      <div style={authorStyle}>
                        <div style={avatarStyle}>
                          {article.author?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>
                            {article.author?.full_name || 'Unknown Author'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <span style={readMoreStyle}>
                        Read more →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
