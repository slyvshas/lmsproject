// ============================================================================
// Quiz Service
// ============================================================================
// Service functions for quiz-related database operations with Supabase.

import supabase from '../config/supabase';

/**
 * Fetch quiz details with all questions and answers
 */
export const fetchQuizDetails = async (quizId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select(
        `
        *,
        quiz_questions(
          id,
          question_text,
          question_type,
          difficulty,
          order_index,
          quiz_answers(
            id,
            answer_text,
            is_correct,
            order_index
          )
        )
      `
      )
      .eq('id', quizId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching quiz details:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Create quiz
 */
export const createQuiz = async (quizData) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error creating quiz:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Add question to quiz
 */
export const addQuizQuestion = async (questionData) => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert([questionData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error adding question:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Add answer options to question
 */
export const addQuizAnswers = async (answersData) => {
  try {
    const { data, error } = await supabase
      .from('quiz_answers')
      .insert(answersData)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error adding answers:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Submit quiz attempt and calculate score
 */
export const submitQuizAttempt = async (attemptData) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([attemptData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error submitting quiz attempt:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Record student answer
 */
export const recordStudentAnswer = async (answerData) => {
  try {
    const { data, error } = await supabase
      .from('student_answers')
      .insert([answerData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error recording student answer:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Fetch student's quiz attempts and scores
 */
export const fetchStudentQuizAttempts = async (studentId, quizId = null) => {
  try {
    let query = supabase
      .from('quiz_attempts')
      .select(
        `
        *,
        quizzes(title, passing_score),
        student_answers(id, is_correct)
      `
      )
      .eq('student_id', studentId)
      .order('attempted_at', { ascending: false });

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching quiz attempts:', err);
    return { data: [], error: err.message };
  }
};

/**
 * Calculate adaptive difficulty based on performance
 * If score < 60%, mark as weak area and return 'easy'
 * If score >= 85%, return 'hard'
 * Otherwise return 'medium'
 */
export const calculateAdaptiveDifficulty = (score) => {
  if (score < 60) return 'easy';
  if (score >= 85) return 'hard';
  return 'medium';
};

/**
 * Mark weak area when quiz score < 60%
 */
export const markWeakArea = async (studentId, moduleId, topicName, score) => {
  try {
    // Check if weak area already exists
    const { data: existing } = await supabase
      .from('weak_areas')
      .select('id')
      .eq('student_id', studentId)
      .eq('module_id', moduleId)
      .single();

    if (existing) {
      // Update existing weak area
      const { data, error } = await supabase
        .from('weak_areas')
        .update({
          score,
          last_attempt_at: new Date().toISOString(),
          revision_recommended: true,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Create new weak area
      const { data, error } = await supabase
        .from('weak_areas')
        .insert([
          {
            student_id,
            module_id,
            topic_name: topicName,
            score,
            revision_recommended: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (err) {
    console.error('Error marking weak area:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Fetch student's weak areas with recommendations
 */
export const fetchWeakAreas = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('weak_areas')
      .select(
        `
        *,
        modules(title, course_id),
        courses(title)
      `
      )
      .eq('student_id', studentId)
      .eq('revision_recommended', true)
      .order('score', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching weak areas:', err);
    return { data: [], error: err.message };
  }
};
