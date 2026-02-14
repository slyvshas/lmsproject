// ============================================================================
// Content Service
// ============================================================================
// CRUD operations for modules and lessons (used by instructor course editor).

import supabase from '../config/supabase';

// ---- MODULES ----

export const createModule = async (moduleData) => {
  try {
    const { data, error } = await supabase
      .from('modules')
      .insert([moduleData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error creating module:', err);
    return { data: null, error: err.message };
  }
};

export const updateModule = async (moduleId, updates) => {
  try {
    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', moduleId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error updating module:', err);
    return { data: null, error: err.message };
  }
};

export const deleteModule = async (moduleId) => {
  try {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error deleting module:', err);
    return { error: err.message };
  }
};

// ---- LESSONS ----

export const createLesson = async (lessonData) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error creating lesson:', err);
    return { data: null, error: err.message };
  }
};

export const updateLesson = async (lessonId, updates) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error updating lesson:', err);
    return { data: null, error: err.message };
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error deleting lesson:', err);
    return { error: err.message };
  }
};

/**
 * Fetch a single lesson with its full content
 */
export const fetchLesson = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        modules!inner(
          id,
          title,
          order_index,
          course_id,
          courses!inner(
            id,
            title,
            instructor_id,
            users!courses_instructor_id_fkey(full_name)
          )
        )
      `)
      .eq('id', lessonId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching lesson:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Fetch all lessons for a course (ordered by module → lesson order_index)
 */
export const fetchCourseLessons = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select(`
        id,
        title,
        order_index,
        lessons(
          id,
          title,
          content,
          order_index,
          duration_minutes
        )
      `)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    // Sort lessons within each module
    if (data) {
      data.forEach((m) => {
        if (m.lessons) m.lessons.sort((a, b) => a.order_index - b.order_index);
      });
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error fetching course lessons:', err);
    return { data: [], error: err.message };
  }
};
