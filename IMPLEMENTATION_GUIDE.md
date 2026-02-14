# Implementation Guide - Common Scenarios

This guide shows how to implement common features in the LMS platform.

## 📚 Scenario 1: Adding a New Course (Instructor)

### Steps:

```jsx
// pages/instructor/CreateCourse.jsx
import { useState } from 'react';
import { createCourse } from '@/services/courseService';
import useAuth from '@/hooks/useAuth';

export default function CreateCourse() {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    difficulty_level: 'beginner',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await createCourse(
      formData,
      userProfile.id
    );

    if (!error) {
      // Redirect to course editor
      navigate(`/instructor/course/${data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) =>
          setFormData({
            ...formData,
            title: e.target.value,
          })
        }
        placeholder="Course Title"
      />
      {/* ... other form fields ... */}
      <button type="submit">Create Course</button>
    </form>
  );
}
```

## 🎓 Scenario 2: Student Enrolling in Course

### Steps:

```jsx
// components/student/CourseEnrollButton.jsx
import { enrollInCourse } from '@/services/courseService';
import useAuth from '@/hooks/useAuth';

export default function CourseEnrollButton({ courseId }) {
  const { userProfile } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);

    const { data, error } = await enrollInCourse(
      courseId,
      userProfile.id
    );

    if (!error) {
      setIsEnrolled(true);
      // Redirect to course
      navigate(`/student/course/${courseId}`);
    }

    setIsEnrolling(false);
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isEnrolling || isEnrolled}
    >
      {isEnrolled ? 'Already Enrolled' : 'Enroll Now'}
    </button>
  );
}
```

## ✅ Scenario 3: Mark Lesson as Completed

### Steps:

```jsx
// components/student/LessonViewer.jsx
import { completeLesson } from '@/services/progressService';
import { useEffect, useState } from 'react';

export default function LessonViewer({ lessonId, enrollmentId }) {
  const [timeSpent, setTimeSpent] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(
        Math.floor((Date.now() - startTime.current) / 1000)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLessonComplete = async () => {
    const { data, error } = await completeLesson(
      enrollmentId,
      lessonId,
      timeSpent
    );

    if (!error) {
      alert('Lesson completed!');
    }
  };

  return (
    <div>
      {/* Lesson content */}
      <button onClick={handleLessonComplete}>
        Mark as Complete
      </button>
    </div>
  );
}
```

## 🧪 Scenario 4: Create and Submit a Quiz

### Quiz Creation (Instructor)

```jsx
// components/instructor/QuizBuilder.jsx
import { createQuiz, addQuizQuestion, addQuizAnswers } from '@/services/quizService';

async function createQuizWithQuestions(moduleId) {
  // Create quiz
  const { data: quiz, error: quizError } = await createQuiz({
    module_id: moduleId,
    title: 'JavaScript Basics',
    passing_score: 60,
    adaptive: true,
    order_index: 1,
  });

  // Add question
  const { data: question } = await addQuizQuestion({
    quiz_id: quiz.id,
    question_text: 'What is a closure?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    order_index: 1,
  });

  // Add answer options
  await addQuizAnswers([
    {
      question_id: question.id,
      answer_text: 'A function with private variables',
      is_correct: true,
      order_index: 1,
    },
    {
      question_id: question.id,
      answer_text: 'A type of loop',
      is_correct: false,
      order_index: 2,
    },
    // ... more options
  ]);

  return quiz;
}
```

### Quiz Submission (Student)

```jsx
// components/student/QuizTaker.jsx
import { submitQuizAttempt, recordStudentAnswer, markWeakArea } from '@/services/quizService';
import { calculateAdaptiveDifficulty } from '@/services/quizService';

async function submitQuiz(quizId, studentAnswers) {
  // Calculate score
  const correctCount = studentAnswers.filter(
    (ans) => ans.is_correct
  ).length;
  const totalQuestions = studentAnswers.length;
  const score = (correctCount / totalQuestions) * 100;

  // Submit attempt
  const { data: attempt } = await submitQuizAttempt({
    quiz_id: quizId,
    student_id: userId,
    score,
    correct_answers: correctCount,
    total_questions: totalQuestions,
    duration_seconds: timeTaken,
    adaptive_difficulty: calculateAdaptiveDifficulty(score),
  });

  // Record individual answers
  for (const answer of studentAnswers) {
    await recordStudentAnswer({
      quiz_attempt_id: attempt.id,
      question_id: answer.questionId,
      selected_answer_id: answer.selectedAnswerId,
      is_correct: answer.isCorrect,
    });
  }

  // Mark weak area if score is low
  if (score < 60) {
    await markWeakArea(
      userId,
      moduleId,
      'JavaScript Basics',
      score
    );
  }

  return attempt;
}
```

## 📊 Scenario 5: Implementing Dashboard with Charts

### Install Required Package

```bash
npm install chart.js react-chartjs-2
```

### Dashboard with Charts

```jsx
// pages/student/StudentDashboard.jsx
import { Chart as ChartJS, ... } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { getDashboardStats } from '@/services/progressService';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const result = await getDashboardStats(userProfile.id);
      setStats(result.data);
    };
    loadStats();
  }, []);

  if (!stats) return <LoadingSpinner />;

  const quizScoreData = {
    labels: ['Excellent', 'Good', 'Fair', 'Needs Work'],
    datasets: [
      {
        label: 'Quiz Performance',
        data: [stats.excellentCount, stats.goodCount, ...],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336'],
      },
    ],
  };

  return (
    <div className="dashboard">
      <h1>Your Learning Dashboard</h1>
      <div className="stats-overview">
        <Pie data={quizScoreData} />
      </div>
    </div>
  );
}
```

## 🔍 Scenario 6: Fetch and Display Student Progress

```jsx
// components/student/ProgressTracker.jsx
import { getCourseProgress } from '@/services/progressService';
import { useEffect, useState } from 'react';

export default function ProgressTracker({ enrollmentId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data, error } = await getCourseProgress(
        enrollmentId
      );
      if (!error) {
        setProgress(data);
      }
      setLoading(false);
    };
    fetchProgress();
  }, [enrollmentId]);

  if (loading) return <LoadingSpinner />;
  if (!progress) return <div>No progress data</div>;

  return (
    <div className="progress-tracker">
      <h2>{progress.courses.title}</h2>
      <div className="progress-stats">
        <p>Progress: {progress.progressPercentage}%</p>
        <p>
          {progress.completedLessons} of {progress.totalLessons}
          lessons completed
        </p>
      </div>
      <div className="progress-bar">
        <div
          style={{
            width: `${progress.progressPercentage}%`,
          }}
        />
      </div>
    </div>
  );
}
```

## 👥 Scenario 7: Admin User Management

```jsx
// pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import supabase from '@/config/supabase';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setUsers(data);
    setLoading(false);
  };

  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      fetchUsers(); // Refresh list
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-management">
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) =>
                    updateUserRole(user.id, e.target.value)
                  }
                >
                  <option>student</option>
                  <option>instructor</option>
                  <option>admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 🎁 Scenario 8: Issue Certificate on Course Completion

```jsx
// services/certificateService.js
import supabase from '@/config/supabase';

export async function generateCertificate(enrollmentId, studentId, courseId) {
  // Create certificate record
  const { data, error } = await supabase
    .from('certificates')
    .insert([
      {
        enrollment_id: enrollmentId,
        student_id: studentId,
        course_id: courseId,
        certificate_url: `/certificates/${enrollmentId}`,
        issued_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ])
    .select()
    .single();

  if (!error) {
    // Could generate PDF here with service like jsPDF
    return data;
  }

  return null;
}

// Usage in course completion check:
async function checkAndIssueCertificate(enrollmentId, courseId, studentId) {
  const { data: progress } = await getCourseProgress(enrollmentId);

  if (progress.progressPercentage === 100) {
    const certificate = await generateCertificate(
      enrollmentId,
      studentId,
      courseId
    );

    if (certificate) {
      // Send notification to student
      await createNotification(studentId, {
        title: 'Congratulations!',
        message: 'You have earned a certificate',
        type: 'success',
      });
    }
  }
}
```

## 🔔 Scenario 9: Create Notification for User

```jsx
// services/notificationService.js
export async function createNotification(userId, notification) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        is_read: false,
      },
    ]);

  return { data, error };
}

export async function fetchUserNotifications(userId, limit = 10) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

export async function markNotificationAsRead(notificationId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  return { data, error };
}
```

## 📝 Best Practices

1. **Always handle errors**: Check for errors in Supabase responses
2. **Use loading states**: Show UI feedback during async operations
3. **Validate input**: Validate form data before sending to database
4. **Use custom hooks**: Extract data fetching logic into custom hooks
5. **Cache data**: Minimize database queries with proper caching
6. **Error boundaries**: Wrap components with error boundaries
7. **Secure routes**: Always check user role before showing content
8. **Optimize queries**: Use select statements to fetch only needed fields

## 🚀 Testing Scenarios

### Test User Roles

```javascript
// Create test accounts with different roles
const testAccounts = {
  student: { email: 'student@test.com', password: 'test123' },
  instructor: { email: 'instructor@test.com', password: 'test123' },
  admin: { email: 'admin@test.com', password: 'test123' },
};

// Login and verify dashboard
```

---

These scenarios cover the most common use cases. Modify and extend them based on your specific requirements.
