-- ============================================================================
-- AI-Powered LMS Database Schema for Supabase PostgreSQL
-- ============================================================================
-- This schema is designed for a modern, scalable Learning Management System
-- with support for students, instructors, admins, and adaptive learning logic.

-- ============================================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  instructor_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. COURSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100),
  thumbnail_url TEXT,
  difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. MODULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. LESSONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. LESSON MATERIALS (for file uploads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. ENROLLMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(course_id, student_id)
);

-- ============================================================================
-- 7. PROGRESS TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(enrollment_id, lesson_id)
);

-- ============================================================================
-- 8. QUIZZES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score FLOAT DEFAULT 60.0,
  adaptive BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. QUIZ QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'short_answer', 'true_false')),
  difficulty VARCHAR(50) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. QUIZ ANSWERS (Options for MCQ)
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL
);

-- ============================================================================
-- 11. QUIZ ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score FLOAT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  duration_seconds INTEGER,
  adaptive_difficulty VARCHAR(50) DEFAULT 'medium',
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. STUDENT ANSWERS (to track which answer student selected)
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_answer_id UUID REFERENCES quiz_answers(id) ON DELETE SET NULL,
  student_answer_text TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. WEAK AREAS TRACKING (for adaptive learning)
-- ============================================================================
CREATE TABLE IF NOT EXISTS weak_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  topic_name VARCHAR(255),
  score FLOAT,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  revision_recommended BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, module_id)
);

-- ============================================================================
-- 14. CERTIFICATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 15. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_id ON lesson_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_enrollment_id ON progress_tracking(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_lesson_id ON progress_tracking(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_completed ON progress_tracking(completed);
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt_id ON student_answers(quiz_attempt_id);
CREATE INDEX IF NOT EXISTS idx_weak_areas_student_id ON weak_areas(student_id);
CREATE INDEX IF NOT EXISTS idx_weak_areas_module_id ON weak_areas(module_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- TRIGGERS for updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weak_areas_updated_at BEFORE UPDATE ON weak_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS (Update these based on your actual Supabase setup)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
