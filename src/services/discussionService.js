// ============================================================================
// Discussion Forum Service
// ============================================================================
// Handles Q&A discussions for courses

import supabase from '../config/supabase';

/**
 * Fetch discussions for a course
 */
export const fetchCourseDiscussions = async (courseId, filters = {}) => {
  try {
    let query = supabase
      .from('discussions')
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          avatar_url
        ),
        discussion_replies (count)
      `)
      .eq('course_id', courseId);

    // Apply filters
    if (filters.lessonId) {
      query = query.eq('lesson_id', filters.lessonId);
    }
    if (filters.onlyQuestions) {
      query = query.eq('is_question', true);
    }
    if (filters.onlyUnanswered) {
      query = query.eq('is_answered', false);
    }

    // Sort: pinned first, then by creation date
    query = query.order('pinned', { ascending: false });
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Fetch a single discussion with replies
 */
export const fetchDiscussionWithReplies = async (discussionId) => {
  try {
    const { data: discussion, error: discussionError } = await supabase
      .from('discussions')
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('id', discussionId)
      .single();

    if (discussionError) throw discussionError;

    const { data: replies, error: repliesError } = await supabase
      .from('discussion_replies')
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('discussion_id', discussionId)
      .order('is_answer', { ascending: false })
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    return {
      data: { ...discussion, replies },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching discussion:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Create a new discussion
 */
export const createDiscussion = async (courseId, title, content, lessonId = null, isQuestion = true) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('You must be logged in');

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        course_id: courseId,
        user_id: user.id,
        lesson_id: lessonId,
        title,
        content,
        is_question: isQuestion,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating discussion:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Reply to a discussion
 */
export const replyToDiscussion = async (discussionId, content, isAnswer = false) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('You must be logged in');

    const { data, error } = await supabase
      .from('discussion_replies')
      .insert({
        discussion_id: discussionId,
        user_id: user.id,
        content,
        is_answer: isAnswer,
      })
      .select()
      .single();

    if (error) throw error;

    // If marked as answer, update discussion
    if (isAnswer) {
      await supabase
        .from('discussions')
        .update({ is_answered: true })
        .eq('id', discussionId);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error replying to discussion:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Upvote a discussion
 */
export const upvoteDiscussion = async (discussionId) => {
  try {
    const { data, error } = await supabase.rpc('increment_discussion_upvotes', {
      discussion_id: discussionId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error upvoting discussion:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Mark reply as answer
 */
export const markReplyAsAnswer = async (replyId, discussionId) => {
  try {
    // Mark reply as answer
    const { error: replyError } = await supabase
      .from('discussion_replies')
      .update({ is_answer: true })
      .eq('id', replyId);

    if (replyError) throw replyError;

    // Mark discussion as answered
    const { error: discussionError } = await supabase
      .from('discussions')
      .update({ is_answered: true })
      .eq('id', discussionId);

    if (discussionError) throw discussionError;

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error marking as answer:', error);
    return { data: null, error: error.message };
  }
};
