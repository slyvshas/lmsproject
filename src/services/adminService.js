// ============================================================================
// Admin Service
// ============================================================================
// Service functions for admin-related operations including platform statistics,
// user management, instructor approvals, and course moderation.

import supabase from '../config/supabase';

// ============================================================================
// PLATFORM STATISTICS
// ============================================================================

/**
 * Fetch comprehensive platform statistics
 */
export const fetchPlatformStats = async () => {
  try {
    // Fetch counts in parallel for efficiency
    const [
      usersResult,
      coursesResult,
      enrollmentsResult,
      instructorsResult,
      certificatesResult,
      pendingInstructorsResult
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'instructor').eq('instructor_approved', true),
      supabase.from('certificates').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'instructor').eq('instructor_approved', false)
    ]);

    return {
      data: {
        totalUsers: usersResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalEnrollments: enrollmentsResult.count || 0,
        totalInstructors: instructorsResult.count || 0,
        totalCertificates: certificatesResult.count || 0,
        pendingInstructors: pendingInstructorsResult.count || 0
      },
      error: null
    };
  } catch (err) {
    console.error('Error fetching platform stats:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Fetch enrollment statistics over time (last 30 days)
 */
export const fetchEnrollmentTrends = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('enrollments')
      .select('enrolled_at')
      .gte('enrolled_at', startDate.toISOString())
      .order('enrolled_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const grouped = data.reduce((acc, enrollment) => {
      const date = new Date(enrollment.enrolled_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return { data: grouped, error: null };
  } catch (err) {
    console.error('Error fetching enrollment trends:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Fetch course statistics by category
 */
export const fetchCoursesByCategory = async () => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('category')
      .eq('is_published', true);

    if (error) throw error;

    // Group by category
    const grouped = data.reduce((acc, course) => {
      const category = course.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return { data: grouped, error: null };
  } catch (err) {
    console.error('Error fetching courses by category:', err);
    return { data: null, error: err.message };
  }
};

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Fetch all users with filtering and pagination
 */
export const fetchAllUsers = async (options = {}) => {
  try {
    const { page = 0, limit = 20, role, search, sortBy = 'created_at', sortOrder = 'desc' } = options;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const offset = page * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count, error: null };
  } catch (err) {
    console.error('Error fetching users:', err);
    return { data: [], count: 0, error: err.message };
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error updating user role:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Delete a user (soft delete or hard delete based on requirements)
 */
export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.error('Error deleting user:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// INSTRUCTOR APPROVALS
// ============================================================================

/**
 * Fetch pending instructor applications
 */
export const fetchPendingInstructors = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'instructor')
      .eq('instructor_approved', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching pending instructors:', err);
    return { data: [], error: err.message };
  }
};

/**
 * Approve an instructor application
 */
export const approveInstructor = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ instructor_approved: true, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    // Create notification for the instructor
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Application Approved!',
      message: 'Congratulations! Your instructor application has been approved. You can now create courses.',
      type: 'success'
    });

    return { data, error: null };
  } catch (err) {
    console.error('Error approving instructor:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Reject an instructor application (set role back to student)
 */
export const rejectInstructor = async (userId, reason = '') => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'student', instructor_approved: false, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Create notification for the rejected user
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Application Update',
      message: reason || 'Your instructor application was not approved at this time. Feel free to apply again in the future.',
      type: 'info'
    });

    return { data, error: null };
  } catch (err) {
    console.error('Error rejecting instructor:', err);
    return { data: null, error: err.message };
  }
};

// ============================================================================
// COURSE MODERATION
// ============================================================================

/**
 * Fetch all courses for moderation
 */
export const fetchAllCourses = async (options = {}) => {
  try {
    const { page = 0, limit = 20, status, search, sortBy = 'created_at', sortOrder = 'desc' } = options;

    let query = supabase
      .from('courses')
      .select(`
        *,
        users!courses_instructor_id_fkey(id, full_name, email),
        enrollments(count),
        modules(count)
      `, { count: 'exact' });

    // Apply filters
    if (status === 'published') {
      query = query.eq('is_published', true);
    } else if (status === 'draft') {
      query = query.eq('is_published', false);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const offset = page * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count, error: null };
  } catch (err) {
    console.error('Error fetching courses:', err);
    return { data: [], count: 0, error: err.message };
  }
};

/**
 * Toggle course publish status
 */
export const toggleCoursePublish = async (courseId, isPublished) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error toggling course publish status:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Delete a course
 */
export const deleteCourse = async (courseId) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.error('Error deleting course:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

/**
 * Fetch recent platform activity
 */
export const fetchRecentActivity = async (limit = 20) => {
  try {
    // Fetch recent users, enrollments, and courses in parallel
    const [usersResult, enrollmentsResult, coursesResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          users!enrollments_student_id_fkey(full_name),
          courses!enrollments_course_id_fkey(title)
        `)
        .order('enrolled_at', { ascending: false })
        .limit(limit),
      supabase
        .from('courses')
        .select(`
          id,
          title,
          is_published,
          created_at,
          users!courses_instructor_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
    ]);

    // Combine and sort all activities
    const activities = [];

    // Process new users
    if (usersResult.data) {
      usersResult.data.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: user.role === 'instructor' ? 'instructor_application' : 'new_user',
          title: user.role === 'instructor' ? 'Instructor Application' : 'New User',
          description: `${user.full_name || user.email} registered as ${user.role}`,
          timestamp: user.created_at,
          data: user
        });
      });
    }

    // Process enrollments
    if (enrollmentsResult.data) {
      enrollmentsResult.data.forEach(enrollment => {
        activities.push({
          id: `enrollment-${enrollment.id}`,
          type: 'enrollment',
          title: 'New Enrollment',
          description: `${enrollment.users?.full_name || 'A student'} enrolled in "${enrollment.courses?.title || 'a course'}"`,
          timestamp: enrollment.enrolled_at,
          data: enrollment
        });
      });
    }

    // Process new courses
    if (coursesResult.data) {
      coursesResult.data.forEach(course => {
        activities.push({
          id: `course-${course.id}`,
          type: course.is_published ? 'course_published' : 'course_created',
          title: course.is_published ? 'Course Published' : 'Course Created',
          description: `"${course.title}" by ${course.users?.full_name || 'Unknown'}`,
          timestamp: course.created_at,
          data: course
        });
      });
    }

    // Sort by timestamp (newest first) and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    return { data: limitedActivities, error: null };
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    return { data: [], error: err.message };
  }
};

// ============================================================================
// REVENUE & ANALYTICS (placeholder for future payment integration)
// ============================================================================

/**
 * Fetch top performing courses by enrollment
 */
export const fetchTopCourses = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        category,
        difficulty_level,
        users!courses_instructor_id_fkey(full_name),
        enrollments(count)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Sort by enrollment count
    const sortedCourses = data
      .map(course => ({
        ...course,
        enrollmentCount: course.enrollments?.[0]?.count || 0
      }))
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, limit);

    return { data: sortedCourses, error: null };
  } catch (err) {
    console.error('Error fetching top courses:', err);
    return { data: [], error: err.message };
  }
};

/**
 * Fetch top instructors by student count
 */
export const fetchTopInstructors = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        courses(
          id,
          enrollments(count)
        )
      `)
      .eq('role', 'instructor')
      .eq('instructor_approved', true);

    if (error) throw error;

    // Calculate total students per instructor
    const instructorsWithStats = data.map(instructor => {
      const totalStudents = instructor.courses?.reduce((sum, course) => {
        return sum + (course.enrollments?.[0]?.count || 0);
      }, 0) || 0;
      const totalCourses = instructor.courses?.length || 0;

      return {
        ...instructor,
        totalStudents,
        totalCourses
      };
    });

    // Sort by total students and limit
    const topInstructors = instructorsWithStats
      .sort((a, b) => b.totalStudents - a.totalStudents)
      .slice(0, limit);

    return { data: topInstructors, error: null };
  } catch (err) {
    console.error('Error fetching top instructors:', err);
    return { data: [], error: err.message };
  }
};

/**
 * Send notification to user
 */
export const sendNotification = async (userId, title, message, type = 'info') => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error sending notification:', err);
    return { data: null, error: err.message };
  }
};

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (userIds, title, message, type = 'info') => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error sending bulk notifications:', err);
    return { data: null, error: err.message };
  }
};

export default {
  fetchPlatformStats,
  fetchEnrollmentTrends,
  fetchCoursesByCategory,
  fetchAllUsers,
  updateUserRole,
  deleteUser,
  fetchPendingInstructors,
  approveInstructor,
  rejectInstructor,
  fetchAllCourses,
  toggleCoursePublish,
  deleteCourse,
  fetchRecentActivity,
  fetchTopCourses,
  fetchTopInstructors,
  sendNotification,
  sendBulkNotifications
};
