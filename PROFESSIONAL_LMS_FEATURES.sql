-- ============================================================================
-- Professional LMS Features - Additional Tables
-- ============================================================================
-- Run this AFTER DATABASE_SCHEMA.sql to add professional LMS features
-- Features: Reviews, Discussions, Assignments, Notes, Announcements

-- ============================================================================
-- COURSE REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student_id ON course_reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON course_reviews(rating);

-- ============================================================================
-- DISCUSSION FORUMS (Q&A per course)
-- ============================================================================

CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT TRUE,
  is_answered BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_answer BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discussions_course_id ON discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_lesson_id ON discussions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);

-- ============================================================================
-- ASSIGNMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score INTEGER DEFAULT 100,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  feedback TEXT,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'resubmitted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_module_id ON assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON assignment_submissions(student_id);

-- ============================================================================
-- STUDENT NOTES (for lessons)
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  timestamp_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_student_id ON student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_notes_lesson_id ON student_notes(lesson_id);

-- ============================================================================
-- COURSE ANNOUNCEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);

-- ============================================================================
-- COURSE PREREQUISITES
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, prerequisite_course_id)
);

-- ============================================================================
-- BOOKMARKS (Save lessons for later)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_student_id ON bookmarks(student_id);

-- ============================================================================
-- COURSE TAGS (for better discoverability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_course_tags_course_id ON course_tags(course_id);
CREATE INDEX IF NOT EXISTS idx_course_tags_tag_name ON course_tags(tag_name);

-- ============================================================================
-- Add average_rating column to courses (computed field)
-- ============================================================================

ALTER TABLE courses ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0;

-- ============================================================================
-- Function to update course ratings
-- ============================================================================

CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM course_reviews 
      WHERE course_id = NEW.course_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM course_reviews 
      WHERE course_id = NEW.course_id
    )
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_rating_after_review ON course_reviews;
CREATE TRIGGER update_rating_after_review
  AFTER INSERT OR UPDATE OR DELETE ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating();

-- ============================================================================
-- Function to update total students enrolled
-- ============================================================================

CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses
  SET total_students = (
    SELECT COUNT(*) 
    FROM enrollments 
    WHERE course_id = NEW.course_id AND status = 'active'
  )
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_enrollment_count ON enrollments;
CREATE TRIGGER update_enrollment_count
  AFTER INSERT OR UPDATE OF status ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_enrollment_count();

-- ============================================================================
-- RLS POLICIES for new tables
-- ============================================================================

-- Course Reviews
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON course_reviews
  FOR SELECT USING (true);

CREATE POLICY "Enrolled students can create reviews" ON course_reviews
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.student_id = auth.uid() AND enrollments.course_id = course_reviews.course_id)
  );

CREATE POLICY "Students can update own reviews" ON course_reviews
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can delete own reviews" ON course_reviews
  FOR DELETE USING (student_id = auth.uid());

-- Discussions
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view discussions" ON discussions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON discussions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own discussions" ON discussions
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own discussions" ON discussions
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view replies" ON discussion_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON discussion_replies
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own replies" ON discussion_replies
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view assignments in enrolled courses" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = assignments.module_id
      AND (courses.is_published = TRUE OR courses.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Instructors manage own assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = assignments.module_id AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students view own submissions" ON assignment_submissions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students create own submissions" ON assignment_submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students update own submissions" ON assignment_submissions
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors view submissions in their courses" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN modules ON modules.id = assignments.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE assignments.id = assignment_submissions.assignment_id AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors grade submissions" ON assignment_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN modules ON modules.id = assignments.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE assignments.id = assignment_submissions.assignment_id AND courses.instructor_id = auth.uid()
    )
  );

-- Student Notes
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own notes" ON student_notes
  FOR ALL USING (student_id = auth.uid());

-- Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students view announcements" ON announcements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = announcements.course_id AND enrollments.student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM courses WHERE courses.id = announcements.course_id AND courses.instructor_id = auth.uid())
  );

CREATE POLICY "Instructors manage own announcements" ON announcements
  FOR ALL USING (instructor_id = auth.uid());

-- Bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own bookmarks" ON bookmarks
  FOR ALL USING (student_id = auth.uid());

-- Course Tags
ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags" ON course_tags
  FOR SELECT USING (true);

CREATE POLICY "Instructors manage course tags" ON course_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = course_tags.course_id AND courses.instructor_id = auth.uid())
  );

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Professional LMS features added!
-- Your LMS now has reviews, discussions, assignments, notes, and more!
