// ============================================================================
// Course Reviews Component
// ============================================================================
// Display and submit course reviews and ratings

import React, { useState, useEffect } from 'react';
import { fetchCourseReviews, getCourseRatingStats, submitCourseReview, getUserReview } from '../../services/reviewService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import './CourseReviews.css';

const CourseReviews = ({ courseId, isEnrolled }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
    loadRatingStats();
    if (user) {
      loadUserReview();
    }
  }, [courseId, user]);

  const loadReviews = async () => {
    const result = await fetchCourseReviews(courseId);
    if (result.data) {
      setReviews(result.data);
    }
    setLoading(false);
  };

  const loadRatingStats = async () => {
    const result = await getCourseRatingStats(courseId);
    if (result.data) {
      setRatingStats(result.data);
    }
  };

  const loadUserReview = async () => {
    const result = await getUserReview(courseId, user.id);
    if (result.data) {
      setUserReview(result.data);
      setRating(result.data.rating);
      setReviewText(result.data.review_text || '');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await submitCourseReview(courseId, rating, reviewText);
    if (result.data) {
      alert('Review submitted successfully!');
      setShowReviewForm(false);
      loadReviews();
      loadRatingStats();
      loadUserReview();
    } else {
      alert('Error submitting review: ' + result.error);
    }
    setSubmitting(false);
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!ratingStats) return null;

    return (
      <div className="rating-distribution">
        <div className="rating-summary">
          <div className="average-rating">
            <h2>{ratingStats.averageRating.toFixed(1)}</h2>
            {renderStars(Math.round(ratingStats.averageRating))}
            <p>{ratingStats.totalReviews} reviews</p>
          </div>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats.distribution[star];
              const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="rating-bar-row">
                  <span>{star} ★</span>
                  <div className="rating-bar">
                    <div className="rating-bar-fill" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="course-reviews">
      <h2>Student Reviews</h2>

      {renderRatingDistribution()}

      {isEnrolled && user && (
        <div className="user-review-section">
          {userReview ? (
            <div className="user-review-card">
              <p>Your review:</p>
              {renderStars(userReview.rating)}
              <p>{userReview.review_text}</p>
              <button onClick={() => setShowReviewForm(true)}>Edit Review</button>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setShowReviewForm(true)}>
              Write a Review
            </button>
          )}
        </div>
      )}

      {showReviewForm && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <h3>{userReview ? 'Edit Your Review' : 'Write a Review'}</h3>
          <div className="form-group">
            <label>Rating:</label>
            {renderStars(rating, true, setRating)}
          </div>
          <div className="form-group">
            <label>Review (optional):</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="4"
              placeholder="Share your experience with this course..."
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        <h3>All Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this course!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  {review.users?.avatar_url && (
                    <img src={review.users.avatar_url} alt={review.users.full_name} className="avatar" />
                  )}
                  <div>
                    <h4>{review.users?.full_name || 'Anonymous'}</h4>
                    <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.review_text && <p className="review-text">{review.review_text}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseReviews;
