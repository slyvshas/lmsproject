-- ============================================================================
-- Row Level Security (RLS) Policies for Supabase
-- ============================================================================
-- These policies control who can view, insert, update, or delete each table's data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weak_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (
    auth.uid() = id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public signup (insert for authenticated users during registration)
CREATE POLICY "Authenticated users can create profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (is_published = TRUE);

-- Authors/Instructors can view their own courses
CREATE POLICY "Instructors can view own courses" ON courses
  FOR SELECT USING (instructor_id = auth.uid());

-- Admins can view all courses
CREATE POLICY "Admins can view all courses" ON courses
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Instructors can create courses
CREATE POLICY "Instructors can create courses" ON courses
  FOR INSERT WITH CHECK (
    instructor_id = auth.uid() AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'instructor'
  );

-- Instructors can update their own courses
CREATE POLICY "Instructors can update own courses" ON courses
  FOR UPDATE USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- Instructors can delete their own courses
CREATE POLICY "Instructors can delete own courses" ON courses
  FOR DELETE USING (instructor_id = auth.uid());

-- ============================================================================
-- MODULES POLICIES
-- ============================================================================

-- Anyone can view modules of published courses
CREATE POLICY "Anyone can view modules of published courses" ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.is_published = TRUE
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin' OR
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can create modules in their courses
CREATE POLICY "Instructors can create modules" ON modules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can update modules in their courses
CREATE POLICY "Instructors can update modules" ON modules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- LESSONS POLICIES
-- ============================================================================

-- Anyone can view lessons of published courses
CREATE POLICY "Anyone can view lessons of published courses" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id AND courses.is_published = TRUE
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin' OR
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can create lessons
CREATE POLICY "Instructors can create lessons" ON lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can update lessons
CREATE POLICY "Instructors can update lessons" ON lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- LESSON MATERIALS POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view materials of published courses" ON lesson_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_materials.lesson_id AND courses.is_published = TRUE
    )
  );

-- ============================================================================
-- ENROLLMENTS POLICIES
-- ============================================================================

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT USING (student_id = auth.uid());

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.instructor_id = auth.uid()
    )
  );

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments" ON enrollments
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Students can enroll in published courses
CREATE POLICY "Students can enroll in courses" ON enrollments
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.is_published = TRUE
    )
  );

-- Students can update their enrollment status
CREATE POLICY "Students can update own enrollment" ON enrollments
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ============================================================================
-- PROGRESS TRACKING POLICIES
-- ============================================================================

-- Students can view their own progress
CREATE POLICY "Students can view own progress" ON progress_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments WHERE enrollments.id = progress_tracking.enrollment_id AND enrollments.student_id = auth.uid()
    )
  );

-- Instructors can view student progress in their courses
CREATE POLICY "Instructors can view course progress" ON progress_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = progress_tracking.enrollment_id AND courses.instructor_id = auth.uid()
    )
  );

-- Students can update their own progress
CREATE POLICY "Students can update own progress" ON progress_tracking
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments WHERE enrollments.id = progress_tracking.enrollment_id AND enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own progress data" ON progress_tracking
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM enrollments WHERE enrollments.id = progress_tracking.enrollment_id AND enrollments.student_id = auth.uid()
    )
  );

-- ============================================================================
-- QUIZZES POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view quizzes of published courses" ON quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = quizzes.module_id AND courses.is_published = TRUE
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Instructors can create quizzes
CREATE POLICY "Instructors can create quizzes" ON quizzes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = quizzes.module_id AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- QUIZ QUESTIONS & ANSWERS POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view quiz questions of published courses" ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN modules ON modules.id = quizzes.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE quizzes.id = quiz_questions.quiz_id AND courses.is_published = TRUE
    )
  );

CREATE POLICY "Anyone can view quiz answers of published courses" ON quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN modules ON modules.id = quizzes.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE quiz_questions.id = quiz_answers.question_id AND courses.is_published = TRUE
    )
  );

-- ============================================================================
-- QUIZ ATTEMPTS POLICIES
-- ============================================================================

-- Students can view their own attempts
CREATE POLICY "Students can view own quiz attempts" ON quiz_attempts
  FOR SELECT USING (student_id = auth.uid());

-- Instructors can view student attempts for their quizzes
CREATE POLICY "Instructors can view quiz attempts" ON quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN modules ON modules.id = quizzes.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE quizzes.id = quiz_attempts.quiz_id AND courses.instructor_id = auth.uid()
    )
  );

-- Students can create quiz attempts
CREATE POLICY "Students can attempt quizzes" ON quiz_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- ============================================================================
-- STUDENT ANSWERS POLICIES
-- ============================================================================

-- Students can view their own answers
CREATE POLICY "Students can view own answers" ON student_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts WHERE quiz_attempts.id = student_answers.quiz_attempt_id AND quiz_attempts.student_id = auth.uid()
    )
  );

-- Students can create answers
CREATE POLICY "Students can create answers" ON student_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts WHERE quiz_attempts.id = student_answers.quiz_attempt_id AND quiz_attempts.student_id = auth.uid()
    )
  );

-- ============================================================================
-- WEAK AREAS POLICIES
-- ============================================================================

-- Students can view their own weak areas
CREATE POLICY "Students can view own weak areas" ON weak_areas
  FOR SELECT USING (student_id = auth.uid());

-- Instructors can view student weak areas for their courses
CREATE POLICY "Instructors can view weak areas" ON weak_areas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'instructor'
    )
  );

-- System can insert/update weak areas
CREATE POLICY "System can manage weak areas" ON weak_areas
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "System can update weak areas" ON weak_areas
  FOR UPDATE USING (TRUE);

-- ============================================================================
-- CERTIFICATES POLICIES
-- ============================================================================

-- Students can view their own certificates
CREATE POLICY "Students can view own certificates" ON certificates
  FOR SELECT USING (student_id = auth.uid());

-- Instructors can view certificates for their courses
CREATE POLICY "Instructors can view course certificates" ON certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = certificates.course_id AND courses.instructor_id = auth.uid()
    )
  );

-- System can create certificates
CREATE POLICY "System can create certificates" ON certificates
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (TRUE);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
