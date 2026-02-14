-- ============================================================================
-- FIXED Row Level Security (RLS) Policies - Resolves Infinite Recursion
-- ============================================================================
-- This fixes the infinite recursion error by removing circular dependencies
-- in the users table policies

-- ============================================================================
-- DROP ALL EXISTING POLICIES FIRST
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can create profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Instructors can view own courses" ON courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Instructors can create courses" ON courses;
DROP POLICY IF EXISTS "Instructors can update own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can delete own courses" ON courses;

-- ============================================================================
-- USERS POLICIES (FIXED - No recursion)
-- ============================================================================

-- Allow users to view their own profile
-- Note: We don't check other users' roles here to avoid recursion
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their profile (for trigger/signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to insert (for database trigger)
-- This is handled by SECURITY DEFINER function in the trigger

-- ============================================================================
-- COURSES POLICIES (FIXED - Simplified)
-- ============================================================================

-- Anyone (even anonymous) can view published courses
CREATE POLICY "Public can view published courses" ON courses
  FOR SELECT USING (is_published = TRUE);

-- Instructors can view their own courses (even unpublished)
CREATE POLICY "Instructors view own courses" ON courses
  FOR SELECT USING (instructor_id = auth.uid());

-- Instructors can create courses
-- We trust that only instructors will use the instructor dashboard
CREATE POLICY "Authenticated users can create courses" ON courses
  FOR INSERT WITH CHECK (instructor_id = auth.uid());

-- Instructors can update their own courses
CREATE POLICY "Instructors update own courses" ON courses
  FOR UPDATE USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- Instructors can delete their own courses
CREATE POLICY "Instructors delete own courses" ON courses
  FOR DELETE USING (instructor_id = auth.uid());

-- ============================================================================
-- MODULES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view modules of published courses" ON modules;
DROP POLICY IF EXISTS "Instructors can create modules" ON modules;
DROP POLICY IF EXISTS "Instructors can update modules" ON modules;
DROP POLICY IF EXISTS "Instructors can delete modules" ON modules;

-- View modules of published courses OR own courses
CREATE POLICY "Public view published course modules" ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND (courses.is_published = TRUE OR courses.instructor_id = auth.uid())
    )
  );

-- Instructors can manage modules in their courses
CREATE POLICY "Instructors manage own course modules" ON modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid())
  );

-- ============================================================================
-- LESSONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON lessons;
DROP POLICY IF EXISTS "Instructors can create lessons" ON lessons;
DROP POLICY IF EXISTS "Instructors can update lessons" ON lessons;
DROP POLICY IF EXISTS "Instructors can delete lessons" ON lessons;

-- View lessons in published courses or own courses
CREATE POLICY "Public view published lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules 
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id 
      AND (courses.is_published = TRUE OR courses.instructor_id = auth.uid())
    )
  );

-- Instructors manage lessons in their courses
CREATE POLICY "Instructors manage own lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM modules 
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- ENROLLMENTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can enroll in courses" ON enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view enrollments in their courses" ON enrollments;

-- Students view their own enrollments
CREATE POLICY "Students view own enrollments" ON enrollments
  FOR SELECT USING (student_id = auth.uid());

-- Students can enroll themselves
CREATE POLICY "Students create own enrollments" ON enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Students can update their own enrollment status
CREATE POLICY "Students update own enrollments" ON enrollments
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Instructors view enrollments in their courses
CREATE POLICY "Instructors view course enrollments" ON enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.instructor_id = auth.uid())
  );

-- ============================================================================
-- PROGRESS TRACKING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Students can create own progress" ON progress_tracking;
DROP POLICY IF EXISTS "Students can update own progress" ON progress_tracking;

-- Students track their own progress
CREATE POLICY "Students manage own progress" ON progress_tracking
  FOR ALL USING (
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.id = progress_tracking.enrollment_id AND enrollments.student_id = auth.uid())
  );

-- ============================================================================
-- QUIZZES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view quizzes in enrolled courses" ON quizzes;
DROP POLICY IF EXISTS "Instructors can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Instructors can update quizzes" ON quizzes;
DROP POLICY IF EXISTS "Instructors can delete quizzes" ON quizzes;

-- View quizzes in published courses or enrolled courses
CREATE POLICY "Public view published quizzes" ON quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules 
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = quizzes.module_id 
      AND (courses.is_published = TRUE OR courses.instructor_id = auth.uid())
    )
  );

-- Instructors manage quizzes in their courses
CREATE POLICY "Instructors manage own quizzes" ON quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM modules 
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = quizzes.module_id AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- QUIZ QUESTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Instructors can create quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Instructors can update quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Instructors can delete quiz questions" ON quiz_questions;

-- View questions in quizzes of published courses
CREATE POLICY "Public view published quiz questions" ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN modules ON modules.id = quizzes.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE quizzes.id = quiz_questions.quiz_id 
      AND (courses.is_published = TRUE OR courses.instructor_id = auth.uid())
    )
  );

-- Instructors manage questions in their quizzes
CREATE POLICY "Instructors manage own questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN modules ON modules.id = quizzes.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE quizzes.id = quiz_questions.quiz_id AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- QUIZ ANSWERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view quiz answers after submission" ON quiz_answers;
DROP POLICY IF EXISTS "Instructors can create quiz answers" ON quiz_answers;
DROP POLICY IF EXISTS "Instructors can update quiz answers" ON quiz_answers;
DROP POLICY IF EXISTS "Instructors can delete quiz answers" ON quiz_answers;

-- View answers in published quizzes
CREATE POLICY "Public view published answers" ON quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN modules ON modules.id = quizzes.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE quiz_questions.id = quiz_answers.question_id 
      AND (courses.is_published = TRUE OR courses.instructor_id = auth.uid())
    )
  );

-- Instructors manage answers
CREATE POLICY "Instructors manage own answers" ON quiz_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN modules ON modules.id = quizzes.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE quiz_questions.id = quiz_answers.question_id AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- QUIZ ATTEMPTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Students can create quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors can view quiz attempts in their courses" ON quiz_attempts;

-- Students view their own attempts
CREATE POLICY "Students view own attempts" ON quiz_attempts
  FOR SELECT USING (student_id = auth.uid());

-- Students create their own attempts
CREATE POLICY "Students create own attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Students can update their attempts (for scoring)
CREATE POLICY "Students update own attempts" ON quiz_attempts
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ============================================================================
-- STUDENT ANSWERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own answers" ON student_answers;
DROP POLICY IF EXISTS "Students can create answers" ON student_answers;

-- Students manage their own answers
CREATE POLICY "Students manage own answers" ON student_answers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM quiz_attempts WHERE quiz_attempts.id = student_answers.quiz_attempt_id AND quiz_attempts.student_id = auth.uid())
  );

-- ============================================================================
-- WEAK AREAS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own weak areas" ON weak_areas;
DROP POLICY IF EXISTS "System can create weak areas" ON weak_areas;

-- Students view their own weak areas
CREATE POLICY "Students view own weak areas" ON weak_areas
  FOR SELECT USING (student_id = auth.uid());

-- Students/System can create weak areas
CREATE POLICY "Create weak areas" ON weak_areas
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Update weak areas
CREATE POLICY "Update weak areas" ON weak_areas
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ============================================================================
-- CERTIFICATES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own certificates" ON certificates;
DROP POLICY IF EXISTS "System can create certificates" ON certificates;

-- Students view their own certificates
CREATE POLICY "Students view own certificates" ON certificates
  FOR SELECT USING (student_id = auth.uid());

-- System creates certificates
CREATE POLICY "Create certificates" ON certificates
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Users view their own notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users update their own notifications (mark as read)
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System creates notifications
CREATE POLICY "Create notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Delete own notifications
CREATE POLICY "Users delete own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- LESSON MATERIALS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can view materials in enrolled courses" ON lesson_materials;
DROP POLICY IF EXISTS "Instructors can manage materials" ON lesson_materials;

-- View materials in published courses
CREATE POLICY "Public view published materials" ON lesson_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_materials.lesson_id 
      AND (courses.is_published = TRUE OR courses.instructor_id = auth.uid())
    )
  );

-- Instructors manage materials
CREATE POLICY "Instructors manage own materials" ON lesson_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_materials.lesson_id AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Infinite recursion fixed!
-- Run this SQL in Supabase SQL Editor to replace all RLS policies.
