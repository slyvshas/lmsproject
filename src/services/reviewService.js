// ============================================================================
// Course Reviews Service
// ============================================================================
// Handles course ratings and reviews

import supabase from '../config/supabase';

/**
 * Fetch all reviews for a course
 */
export const fetchCourseReviews = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('course_reviews')
      .select(`
        *,
        users:student_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get course rating statistics
 */
export const getCourseRatingStats = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('average_rating, total_reviews')
      .eq('id', courseId)
      .single();

    if (error) throw error;

    // Get rating distribution
    const { data: distribution } = await supabase
      .from('course_reviews')
      .select('rating')
      .eq('course_id', courseId);

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution?.forEach((review) => {
      ratingCounts[review.rating]++;
    });

    return {
      data: {
        averageRating: data.average_rating,
        totalReviews: data.total_reviews,
        distribution: ratingCounts,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Submit or update a course review
 */
export const submitCourseReview = async (courseId, rating, reviewText) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in to review');
    }

    const { data, error } = await supabase
      .from('course_reviews')
      .upsert(
        {
          course_id: courseId,
          student_id: user.id,
          rating,
          review_text: reviewText,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'course_id,student_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error submitting review:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Check if user has reviewed a course
 */
export const getUserReview = async (courseId, userId) => {
  try {
    const { data, error } = await supabase
      .from('course_reviews')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user review:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from('course_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { data: null, error: error.message };
  }
};
