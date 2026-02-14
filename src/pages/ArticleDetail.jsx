import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchArticleBySlug } from '../services/articleService';

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await fetchArticleBySlug(slug);
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!data) {
        setError('Article not found');
      } else {
        setArticle(data);
      }
    } catch (err) {
      console.error('Error loading article:', err);
      setError('Failed to load article');
    }
    setLoading(false);
  };

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '40px 20px'
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto'
  };

  const backLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '32px',
    transition: 'color 0.2s'
  };

  const headerStyle = {
    marginBottom: '40px'
  };

  const categoryStyle = {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '25px',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px'
  };

  const titleStyle = {
    fontSize: '42px',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1.2',
    marginBottom: '24px'
  };

  const metaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    color: '#94a3b8',
    fontSize: '14px'
  };

  const authorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const avatarStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600'
  };

  const coverImageStyle = {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '16px',
    marginBottom: '40px',
    border: '1px solid rgba(255,255,255,0.1)'
  };

  const contentStyle = {
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '16px',
    padding: '48px',
    border: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '40px'
  };

  const proseStyle = `
    .article-content {
      color: #e2e8f0;
      font-size: 17px;
      line-height: 1.85;
    }
    .article-content h1 {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      margin: 40px 0 20px;
    }
    .article-content h2 {
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      margin: 36px 0 18px;
    }
    .article-content h3 {
      font-size: 22px;
      font-weight: 600;
      color: #fff;
      margin: 32px 0 16px;
    }
    .article-content p {
      margin: 0 0 20px;
    }
    .article-content a {
      color: #6366f1;
      text-decoration: underline;
    }
    .article-content strong {
      color: #fff;
      font-weight: 600;
    }
    .article-content em {
      font-style: italic;
    }
    .article-content ul, .article-content ol {
      margin: 0 0 20px 24px;
      padding: 0;
    }
    .article-content li {
      margin-bottom: 8px;
    }
    .article-content blockquote {
      margin: 24px 0;
      padding: 20px 24px;
      border-left: 4px solid #6366f1;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 0 8px 8px 0;
      font-style: italic;
    }
    .article-content code {
      background: rgba(99, 102, 241, 0.2);
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
      color: #a5b4fc;
    }
    .article-content pre {
      background: rgba(15, 15, 35, 0.8);
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      margin: 24px 0;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .article-content pre code {
      background: none;
      padding: 0;
    }
    .article-content img {
      max-width: 100%;
      border-radius: 12px;
      margin: 24px 0;
    }
    .article-content hr {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 40px 0;
    }
  `;

  const tagsStyle = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  };

  const tagStyle = {
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#c4b5fd',
    fontSize: '13px',
    fontWeight: '500'
  };

  const footerStyle = {
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  };

  const shareButtonStyle = {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#6366f1'
  };

  const errorStyle = {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#94a3b8'
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📄</div>
          <div style={{ fontSize: '20px', color: '#6366f1' }}>Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <Link to="/articles" style={backLinkStyle}>
            ← Back to Articles
          </Link>
          <div style={errorStyle}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>📭</div>
            <div style={{ fontSize: '28px', color: '#fff', marginBottom: '12px' }}>
              {error || 'Article not found'}
            </div>
            <div style={{ marginBottom: '24px' }}>
              The article you're looking for doesn't exist or has been removed.
            </div>
            <button 
              onClick={() => navigate('/articles')}
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Browse Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <style>{proseStyle}</style>
      <div style={containerStyle}>
        <Link to="/articles" style={backLinkStyle}>
          ← Back to Articles
        </Link>

        {/* Header */}
        <header style={headerStyle}>
          {article.category && (
            <span style={categoryStyle}>{article.category}</span>
          )}
          <h1 style={titleStyle}>{article.title}</h1>
          
          <div style={metaStyle}>
            <div style={authorStyle}>
              <div style={avatarStyle}>
                {article.author?.full_name?.charAt(0) || 'A'}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: '600' }}>
                  {article.author?.full_name || 'Unknown Author'}
                </div>
                <div style={{ fontSize: '13px' }}>
                  {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <span>•</span>
            <span>{article.views || 0} views</span>
            {article.tags && article.tags.length > 0 && (
              <>
                <span>•</span>
                <span>{article.tags.length} tags</span>
              </>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {article.cover_image && (
          <img 
            src={article.cover_image} 
            alt={article.title}
            style={coverImageStyle}
          />
        )}

        {/* Content */}
        <div style={contentStyle}>
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#94a3b8', 
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              Tags
            </div>
            <div style={tagsStyle}>
              {article.tags.map((tag, index) => (
                <span key={index} style={tagStyle}>#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={footerStyle}>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>
            Did you find this article helpful?
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              style={shareButtonStyle}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
            >
              📋 Copy Link
            </button>
            <button 
              style={shareButtonStyle}
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank');
              }}
            >
              🐦 Share on X
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
