// ============================================================================
// Course Service
// ============================================================================
// Service functions for course-related database operations with Supabase.

import supabase from '../config/supabase';

/**
 * Fetch all published courses with filtering and pagination
 */
export const fetchPublishedCourses = async (filters = {}) => {
  try {
    let query = supabase
      .from('courses')
      .select(
        `
        id,
        title,
        description,
        category,
        thumbnail_url,
        difficulty_level,
        instructor_id,
        users!courses_instructor_id_fkey(full_name),
        modules(count)
      `
      )
      .eq('is_published', true);

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Pagination
    const offset = (filters.page || 0) * (filters.limit || 10);
    query = query.range(offset, offset + (filters.limit || 10) - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count, error: null };
  } catch (err) {
    console.error('Error fetching courses:', err);
    return { data: [], count: 0, error: err.message };
  }
};

/**
 * Fetch instructor's courses
 */
export const fetchInstructorCourses = async (instructorId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(
        `
        id,
        title,
        description,
        category,
        difficulty_level,
        is_published,
        created_at,
        enrollments(count),
        modules(count)
      `
      )
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching instructor courses:', err);
    return { data: [], error: err.message };
  }
};

/**
 * Fetch course details with all related data
 */
export const fetchCourseDetails = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(
        `
        *,
        users!courses_instructor_id_fkey(id, full_name, avatar_url),
        modules(
          id,
          title,
          description,
          order_index,
          lessons(
            id,
            title,
            duration_minutes
          ),
          quizzes(id, title)
        ),
        enrollments(count)
      `
      )
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching course details:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Create new course
 */
export const createCourse = async (courseData, instructorId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          ...courseData,
          instructor_id: instructorId,
          is_published: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error creating course:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Update course
 */
export const updateCourse = async (courseId, updates) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error updating course:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (courseId) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error deleting course:', err);
    return { error: err.message };
  }
};

/**
 * Fetch student's enrolled courses
 */
export const fetchEnrolledCourses = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        status,
        enrolled_at,
        courses(
          id,
          title,
          description,
          category,
          thumbnail_url,
          difficulty_level,
          users!courses_instructor_id_fkey(full_name),
          modules(count),
          enrollments(*)
        ),
        progress_tracking(count)
      `
      )
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching enrolled courses:', err);
    return { data: [], error: err.message };
  }
};

/**
 * Enroll student in course
 */
export const enrollInCourse = async (courseId, studentId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([
        {
          course_id: courseId,
          student_id: studentId,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error enrolling in course:', err);
    return { data: null, error: err.message };
  }
};
