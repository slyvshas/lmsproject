-- ============================================================================
-- Demo Data for AI-Powered LMS
-- ============================================================================
-- Sample data to populate the database for testing
-- Run this AFTER running DATABASE_SCHEMA.sql and RLS_POLICIES.sql

-- Note: Replace the UUIDs below with actual user IDs from your auth.users table
-- You can get user IDs by running: SELECT id, email FROM auth.users;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
-- 1. Create at least 2 users through the signup form (one student, one instructor)
-- 2. Go to Supabase Dashboard > Table Editor > users table
-- 3. Copy the instructor's user ID
-- 4. Replace 'YOUR_INSTRUCTOR_ID' below with the actual UUID
-- 5. Replace 'YOUR_STUDENT_ID' with your student's UUID
-- 6. Run this SQL file in Supabase SQL Editor

-- ============================================================================
-- DEMO COURSES
-- ============================================================================

-- Course 1: Web Development Fundamentals
INSERT INTO courses (id, title, description, instructor_id, category, difficulty_level, is_published, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Web Development Fundamentals',
  'Learn the basics of HTML, CSS, and JavaScript to build modern websites from scratch.',
  'YOUR_INSTRUCTOR_ID', -- Replace with actual instructor UUID
  'Web Development',
  'beginner',
  true,
  NOW()
);

-- Course 2: Advanced JavaScript
INSERT INTO courses (id, title, description, instructor_id, category, difficulty_level, is_published, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Advanced JavaScript Programming',
  'Master ES6+, async programming, design patterns, and build scalable JavaScript applications.',
  'YOUR_INSTRUCTOR_ID',
  'Programming',
  'advanced',
  true,
  NOW()
);

-- Course 3: Data Science with Python
INSERT INTO courses (id, title, description, instructor_id, category, difficulty_level, is_published, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Data Science with Python',
  'Learn data analysis, visualization, and machine learning with Python, pandas, and scikit-learn.',
  'YOUR_INSTRUCTOR_ID',
  'Data Science',
  'intermediate',
  true,
  NOW()
);

-- Course 4: UI/UX Design Principles
INSERT INTO courses (id, title, description, instructor_id, category, difficulty_level, is_published, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'UI/UX Design Principles',
  'Master user interface and user experience design with real-world projects and case studies.',
  'YOUR_INSTRUCTOR_ID',
  'Design',
  'intermediate',
  true,
  NOW()
);

-- ============================================================================
-- MODULES for Course 1 (Web Development Fundamentals)
-- ============================================================================

INSERT INTO modules (id, course_id, title, description, order_index, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111111', 'Introduction to HTML', 'Learn HTML structure and semantic tags', 1, NOW()),
  ('11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111111', 'CSS Styling Basics', 'Style your web pages with CSS', 2, NOW()),
  ('11111111-1111-1111-1111-111111111103', '11111111-1111-1111-1111-111111111111', 'JavaScript Essentials', 'Add interactivity with JavaScript', 3, NOW());

-- ============================================================================
-- LESSONS for Module 1 (Introduction to HTML)
-- ============================================================================

INSERT INTO lessons (id, module_id, title, content, order_index, duration_minutes, created_at)
VALUES 
  (
    '11111111-1111-1111-1111-111111111201',
    '11111111-1111-1111-1111-111111111101',
    'What is HTML?',
    'HTML (HyperText Markup Language) is the standard language for creating web pages. In this lesson, you will learn about HTML structure, tags, and elements.',
    1,
    15,
    NOW()
  ),
  (
    '11111111-1111-1111-1111-111111111202',
    '11111111-1111-1111-1111-111111111101',
    'HTML Document Structure',
    'Every HTML document has a basic structure including DOCTYPE, html, head, and body tags. Learn how to structure your HTML documents properly.',
    2,
    20,
    NOW()
  ),
  (
    '11111111-1111-1111-1111-111111111203',
    '11111111-1111-1111-1111-111111111101',
    'Semantic HTML Tags',
    'Learn about semantic tags like header, nav, main, article, section, and footer that give meaning to your content.',
    3,
    25,
    NOW()
  );

-- ============================================================================
-- LESSONS for Module 2 (CSS Styling Basics)
-- ============================================================================

INSERT INTO lessons (id, module_id, title, content, order_index, duration_minutes, created_at)
VALUES 
  (
    '11111111-1111-1111-1111-111111111204',
    '11111111-1111-1111-1111-111111111102',
    'Introduction to CSS',
    'CSS (Cascading Style Sheets) is used to style HTML elements. Learn about selectors, properties, and values.',
    1,
    20,
    NOW()
  ),
  (
    '11111111-1111-1111-1111-111111111205',
    '11111111-1111-1111-1111-111111111102',
    'CSS Box Model',
    'Understand the CSS box model: content, padding, border, and margin. This is fundamental to layout design.',
    2,
    30,
    NOW()
  ),
  (
    '11111111-1111-1111-1111-111111111206',
    '11111111-1111-1111-1111-111111111102',
    'Flexbox Layout',
    'Master Flexbox to create responsive and flexible layouts easily.',
    3,
    35,
    NOW()
  );

-- ============================================================================
-- LESSONS for Module 3 (JavaScript Essentials)
-- ============================================================================

INSERT INTO lessons (id, module_id, title, content, order_index, duration_minutes, created_at)
VALUES 
  (
    '11111111-1111-1111-1111-111111111207',
    '11111111-1111-1111-1111-111111111103',
    'JavaScript Basics',
    'Learn JavaScript syntax, variables, data types, and basic operations.',
    1,
    25,
    NOW()
  ),
  (
    '11111111-1111-1111-1111-111111111208',
    '11111111-1111-1111-1111-111111111103',
    'DOM Manipulation',
    'Learn how to select and manipulate HTML elements using JavaScript.',
    2,
    30,
    NOW()
  ),
  (
    '11111111-1111-1111-1111-111111111209',
    '11111111-1111-1111-1111-111111111103',
    'Event Handling',
    'Add interactivity to your web pages by handling user events like clicks, hovers, and form submissions.',
    3,
    30,
    NOW()
  );

-- ============================================================================
-- MODULES for Course 2 (Advanced JavaScript)
-- ============================================================================

INSERT INTO modules (id, course_id, title, description, order_index, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222222', 'ES6+ Features', 'Modern JavaScript features', 1, NOW()),
  ('22222222-2222-2222-2222-222222222202', '22222222-2222-2222-2222-222222222222', 'Async JavaScript', 'Promises, async/await, and fetch API', 2, NOW());

-- ============================================================================
-- QUIZZES for Module 1
-- ============================================================================

INSERT INTO quizzes (id, module_id, title, description, passing_score, adaptive, order_index, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111301',
  '11111111-1111-1111-1111-111111111101',
  'HTML Basics Quiz',
  'Test your knowledge of HTML fundamentals',
  70.0,
  true,
  1,
  NOW()
);

-- ============================================================================
-- QUIZ QUESTIONS
-- ============================================================================

-- Question 1 (Easy)
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, difficulty, order_index, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111401',
  '11111111-1111-1111-1111-111111111301',
  'What does HTML stand for?',
  'multiple_choice',
  'easy',
  1,
  NOW()
);

INSERT INTO quiz_answers (id, question_id, answer_text, is_correct, order_index)
VALUES 
  ('11111111-1111-1111-1111-111111111501', '11111111-1111-1111-1111-111111111401', 'Hyper Text Markup Language', true, 1),
  ('11111111-1111-1111-1111-111111111502', '11111111-1111-1111-1111-111111111401', 'High Tech Modern Language', false, 2),
  ('11111111-1111-1111-1111-111111111503', '11111111-1111-1111-1111-111111111401', 'Home Tool Markup Language', false, 3),
  ('11111111-1111-1111-1111-111111111504', '11111111-1111-1111-1111-111111111401', 'Hyperlinks and Text Markup Language', false, 4);

-- Question 2 (Medium)
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, difficulty, order_index, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111402',
  '11111111-1111-1111-1111-111111111301',
  'Which HTML tag is used for the largest heading?',
  'multiple_choice',
  'medium',
  2,
  NOW()
);

INSERT INTO quiz_answers (id, question_id, answer_text, is_correct, order_index)
VALUES 
  ('11111111-1111-1111-1111-111111111505', '11111111-1111-1111-1111-111111111402', '<h1>', true, 1),
  ('11111111-1111-1111-1111-111111111506', '11111111-1111-1111-1111-111111111402', '<h6>', false, 2),
  ('11111111-1111-1111-1111-111111111507', '11111111-1111-1111-1111-111111111402', '<heading>', false, 3),
  ('11111111-1111-1111-1111-111111111508', '11111111-1111-1111-1111-111111111402', '<head>', false, 4);

-- Question 3 (Hard)
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, difficulty, order_index, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111403',
  '11111111-1111-1111-1111-111111111301',
  'Which attribute is used to provide alternative text for an image?',
  'multiple_choice',
  'hard',
  3,
  NOW()
);

INSERT INTO quiz_answers (id, question_id, answer_text, is_correct, order_index)
VALUES 
  ('11111111-1111-1111-1111-111111111509', '11111111-1111-1111-1111-111111111403', 'alt', true, 1),
  ('11111111-1111-1111-1111-111111111510', '11111111-1111-1111-1111-111111111403', 'title', false, 2),
  ('11111111-1111-1111-1111-111111111511', '11111111-1111-1111-1111-111111111403', 'src', false, 3),
  ('11111111-1111-1111-1111-111111111512', '11111111-1111-1111-1111-111111111403', 'description', false, 4);

-- ============================================================================
-- SAMPLE ENROLLMENT (for testing student features)
-- ============================================================================
-- Uncomment and replace YOUR_STUDENT_ID with actual student UUID

-- INSERT INTO enrollments (id, course_id, student_id, status, enrolled_at)
-- VALUES (
--   '11111111-1111-1111-1111-111111111601',
--   '11111111-1111-1111-1111-111111111111',
--   'YOUR_STUDENT_ID',
--   'active',
--   NOW()
-- );

-- ============================================================================
-- SAMPLE PROGRESS TRACKING (for testing progress features)
-- ============================================================================
-- Uncomment after creating enrollment

-- INSERT INTO progress_tracking (enrollment_id, lesson_id, completed, completed_at, time_spent_seconds)
-- VALUES 
--   ('11111111-1111-1111-1111-111111111601', '11111111-1111-1111-1111-111111111201', true, NOW(), 900),
--   ('11111111-1111-1111-1111-111111111601', '11111111-1111-1111-1111-111111111202', true, NOW(), 1200);

-- ============================================================================
-- SAMPLE NOTIFICATIONS
-- ============================================================================
-- Uncomment and replace YOUR_STUDENT_ID

-- INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
-- VALUES 
--   ('YOUR_STUDENT_ID', 'enrollment', 'Welcome to Web Development Fundamentals!', 'You have successfully enrolled in Web Development Fundamentals. Start learning now!', false, NOW()),
--   ('YOUR_STUDENT_ID', 'achievement', 'First Lesson Complete!', 'Congratulations! You completed your first lesson. Keep up the great work!', false, NOW() - INTERVAL '1 day'),
--   ('YOUR_STUDENT_ID', 'reminder', 'Continue Your Learning', 'You have 3 lessons in progress. Take 15 minutes today to continue your journey!', false, NOW() - INTERVAL '2 days');

-- ============================================================================
-- Verify Inserted Data
-- ============================================================================

-- Check courses
-- SELECT id, title, category, difficulty_level, is_published FROM courses;

-- Check modules
-- SELECT m.id, c.title as course, m.title as module, m.order_index 
-- FROM modules m 
-- JOIN courses c ON c.id = m.course_id 
-- ORDER BY c.title, m.order_index;

-- Check lessons
-- SELECT l.id, m.title as module, l.title as lesson, l.duration_minutes, l.order_index
-- FROM lessons l
-- JOIN modules m ON m.id = l.module_id
-- ORDER BY m.id, l.order_index;

-- Check quizzes
-- SELECT q.id, m.title as module, q.title as quiz, q.passing_score
-- FROM quizzes q
-- JOIN modules m ON m.id = q.module_id;

-- Check quiz questions and answers
-- SELECT qq.id, qq.question_text, qa.answer_text, qa.is_correct
-- FROM quiz_questions qq
-- JOIN quiz_answers qa ON qa.question_id = qq.id
-- ORDER BY qq.id, qa.order_index;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- If no errors, your demo data is ready!
-- Now you can:
-- 1. Browse courses as a student
-- 2. Enroll in courses
-- 3. Track progress through lessons
-- 4. Take quizzes
-- 5. View notifications
