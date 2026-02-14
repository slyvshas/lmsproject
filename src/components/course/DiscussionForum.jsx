// ============================================================================
// Discussion Forum Component
// ============================================================================
// Q&A forum for course discussions

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCourseDiscussions, createDiscussion } from '../../services/discussionService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import './DiscussionForum.css';

const DiscussionForum = ({ courseId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDiscussions();
  }, [courseId, filter]);

  const loadDiscussions = async () => {
    const filters = {};
    if (filter === 'unanswered') {
      filters.onlyUnanswered = true;
    }
    if (filter === 'questions') {
      filters.onlyQuestions = true;
    }

    const result = await fetchCourseDiscussions(courseId, filters);
    if (result.data) {
      setDiscussions(result.data);
    }
    setLoading(false);
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await createDiscussion(courseId, title, content, null, true);
    if (result.data) {
      alert('Discussion created successfully!');
      setShowNewDiscussion(false);
      setTitle('');
      setContent('');
      loadDiscussions();
    } else {
      alert('Error creating discussion: ' + result.error);
    }
    setSubmitting(false);
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="discussion-forum">
      <div className="forum-header">
        <h2>Course Discussions</h2>
        {user && (
          <button className="btn-primary" onClick={() => setShowNewDiscussion(true)}>
            + Ask a Question
          </button>
        )}
      </div>

      <div className="forum-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'unanswered' ? 'active' : ''}`}
          onClick={() => setFilter('unanswered')}
        >
          Unanswered
        </button>
        <button
          className={`filter-btn ${filter === 'questions' ? 'active' : ''}`}
          onClick={() => setFilter('questions')}
        >
          Questions Only
        </button>
      </div>

      {showNewDiscussion && (
        <form className="new-discussion-form" onSubmit={handleCreateDiscussion}>
          <h3>Ask a Question</h3>
          <input
            type="text"
            placeholder="Question title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Describe your question in detail..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            required
          />
          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Posting...' : 'Post Question'}
            </button>
            <button type="button" onClick={() => setShowNewDiscussion(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="discussions-list">
        {discussions.length === 0 ? (
          <div className="no-discussions">
            <p>No discussions yet. Be the first to start a conversation!</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              className={`discussion-card ${discussion.pinned ? 'pinned' : ''}`}
              onClick={() => navigate(`/discussions/${discussion.id}`)}
            >
              {discussion.pinned && <span className="pinned-badge">📌 Pinned</span>}
              <div className="discussion-header">
                <h3>{discussion.title}</h3>
                {discussion.is_answered && <span className="answered-badge">✓ Answered</span>}
              </div>
              <p className="discussion-preview">{discussion.content.substring(0, 150)}...</p>
              <div className="discussion-meta">
                <span className="author">
                  {discussion.users?.full_name || 'Anonymous'} • {formatTimeAgo(discussion.created_at)}
                </span>
                <div className="discussion-stats">
                  <span>👍 {discussion.upvotes}</span>
                  <span>💬 {discussion.discussion_replies?.[0]?.count || 0} replies</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussionForum;
