// ============================================================================
// Progress Tracking Service
// ============================================================================
// Service functions for tracking student progress and completion.

import supabase from '../config/supabase';

/**
 * Update lesson progress (time tracking, partial progress)
 */
export const updateLessonProgress = async (enrollmentId, lessonId, updates) => {
  try {
    const { data: existing } = await supabase
      .from('progress_tracking')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .eq('lesson_id', lessonId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('progress_tracking')
        .update({ ...updates, last_accessed_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } else {
      const { data, error } = await supabase
        .from('progress_tracking')
        .insert([{ enrollment_id: enrollmentId, lesson_id: lessonId, ...updates, last_accessed_at: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    }
  } catch (err) {
    console.error('Error updating lesson progress:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Mark lesson as completed
 */
export const completeLesson = async (enrollmentId, lessonId, timeSpentSeconds = 0) => {
  try {
    // Check if progress record exists
    const { data: existing } = await supabase
      .from('progress_tracking')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .eq('lesson_id', lessonId)
      .single();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('progress_tracking')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpentSeconds,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('progress_tracking')
        .insert([
          {
            enrollment_id: enrollmentId,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
            time_spent_seconds: timeSpentSeconds,
            last_accessed_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (err) {
    console.error('Error completing lesson:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Get student's progress in a course
 */
export const getCourseProgress = async (enrollmentId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        courses(
          id,
          title,
          modules(
            id,
            title,
            lessons(id)
          )
        ),
        progress_tracking(
          id,
          lesson_id,
          completed,
          time_spent_seconds,
          completed_at
        )
      `
      )
      .eq('id', enrollmentId)
      .single();

    if (error) throw error;

    // Calculate progress percentage
    const course = data.courses;
    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );
    const completedLessons = data.progress_tracking.filter(
      (p) => p.completed
    ).length;
    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    return {
      data: {
        ...data,
        progressPercentage,
        completedLessons,
        totalLessons,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error getting course progress:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Get module progress
 */
export const getModuleProgress = async (enrollmentId, moduleId) => {
  try {
    const { data: lessonData, error: lessonError } = await supabase
      .from('modules')
      .select(
        `
        id,
        title,
        lessons(id, title)
      `
      )
      .eq('id', moduleId)
      .single();

    if (lessonError) throw lessonError;

    const { data: progressData, error: progressError } = await supabase
      .from('progress_tracking')
      .select('lesson_id, completed')
      .eq('enrollment_id', enrollmentId)
      .in(
        'lesson_id',
        lessonData.lessons.map((l) => l.id)
      );

    if (progressError) throw progressError;

    const totalLessons = lessonData.lessons.length;
    const completedLessons = progressData.filter((p) => p.completed).length;
    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    return {
      data: {
        module: lessonData,
        completedLessons,
        totalLessons,
        progressPercentage,
        lessonsProgress: progressData,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error getting module progress:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Get student's overall dashboard statistics
 */
export const getDashboardStats = async (studentId) => {
  try {
    // Enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('student_id', studentId);

    // Quiz attempts and scores
    const { data: quizAttempts } = await supabase
      .from('quiz_attempts')
      .select('score, correct_answers, total_questions')
      .eq('student_id', studentId);

    // Completed lessons
    const { data: completedLessons } = await supabase
      .from('progress_tracking')
      .select('id, lesson_id, completed')
      .in(
        'enrollment_id',
        enrollments.map((e) => e.id)
      )
      .eq('completed', true);

    // Weak areas
    const { data: weakAreas } = await supabase
      .from('weak_areas')
      .select('id')
      .eq('student_id', studentId)
      .eq('revision_recommended', true);

    // Calculate averages
    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length
        )
      : 0;

    return {
      data: {
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter((e) => e.status === 'active').length,
        completedCourses: enrollments.filter((e) => e.status === 'completed').length,
        totalLessonsCompleted: completedLessons.length,
        totalQuizAttempts: quizAttempts.length,
        averageQuizScore: avgQuizScore,
        weakAreasCount: weakAreas.length,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    return {
      data: {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedCourses: 0,
        totalLessonsCompleted: 0,
        totalQuizAttempts: 0,
        averageQuizScore: 0,
        weakAreasCount: 0,
      },
      error: err.message,
    };
  }
};
