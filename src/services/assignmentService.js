// ============================================================================
// Assignment Service
// ============================================================================
// Handles assignments and submissions

import supabase from '../config/supabase';

/**
 * Fetch assignments for a module
 */
export const fetchModuleAssignments = async (moduleId) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Fetch student's submission for an assignment
 */
export const fetchStudentSubmission = async (assignmentId, studentId) => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching submission:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Submit assignment
 */
export const submitAssignment = async (assignmentId, submissionText, fileUrl = null) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('You must be logged in');

    const { data, error } = await supabase
      .from('assignment_submissions')
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: user.id,
          submission_text: submissionText,
          file_url: fileUrl,
          submitted_at: new Date().toISOString(),
          status: 'submitted',
        },
        { onConflict: 'assignment_id,student_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Grade assignment submission
 */
export const gradeAssignment = async (submissionId, score, feedback) => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({
        score,
        feedback,
        graded_at: new Date().toISOString(),
        status: 'graded',
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error grading assignment:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Fetch all submissions for an assignment (instructor view)
 */
export const fetchAssignmentSubmissions = async (assignmentId) => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        users:student_id (
          id,
          full_name,
          email
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Create assignment (instructor)
 */
export const createAssignment = async (moduleId, title, description, dueDate, maxScore = 100) => {
  try {
    // Get max order_index
    const { data: maxOrder } = await supabase
      .from('assignments')
      .select('order_index')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const orderIndex = (maxOrder?.order_index || 0) + 1;

    const { data, error } = await supabase
      .from('assignments')
      .insert({
        module_id: moduleId,
        title,
        description,
        due_date: dueDate,
        max_score: maxScore,
        order_index: orderIndex,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { data: null, error: error.message };
  }
};
