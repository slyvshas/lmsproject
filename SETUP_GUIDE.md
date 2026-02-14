# AI-Powered LMS Platform - Setup Guide

## 📋 Project Overview

This is a modern, production-ready Learning Management System (LMS) built with:
- **Frontend**: React (Vite) with functional components and hooks
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Architecture**: Role-based access (Student, Instructor, Admin)
- **Features**: Course management, progress tracking, adaptive quizzes, certificates

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ and npm
- Supabase account (free tier available)
- Git

### 2. Installation

```bash
# Install dependencies
npm install

# Create environment config
cp .env.local.example .env.local
```

### 3. Supabase Setup

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Project Settings > API

#### Initialize Database

1. In Supabase SQL Editor, run:
   - Copy and paste the entire content of `DATABASE_SCHEMA.sql`
   - Copy and paste the entire content of `RLS_POLICIES.sql`

#### Configure Environment

Update `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_TIMEOUT=30000
VITE_NODE_ENV=development
```

### 4. Run Development Server

```bash
npm start
```

The app will start at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Navbar, LoadingSpinner, etc.)
│   ├── auth/            # Auth-specific components
│   ├── student/         # Student feature components
│   ├── instructor/      # Instructor feature components
│   ├── admin/           # Admin feature components
│   └── styles/          # CSS modules for components
│
├── pages/
│   ├── auth/            # Login, Signup pages
│   ├── student/         # Student dashboard, courses
│   ├── instructor/      # Instructor dashboard, course editor
│   ├── admin/           # Admin dashboard, user management
│   └── styles/          # CSS modules for pages
│
├── context/             # React Context (Auth, etc.)
├── hooks/               # Custom hooks (useAuth, useQuery, etc.)
├── services/            # Supabase service functions
├── utils/               # Helper functions and utilities
├── config/              # Configuration files (Supabase client)
├── styles/              # Global and shared styles
│
├── App.jsx              # Main app with routing
├── App.css              # Global styles
├── index.jsx            # React entry point
└── index.css            # Base styles
```

## 🔐 Authentication Flow

### User Registration

1. User enters email, password, full name
2. Supabase Auth creates user account
3. User profile created in `users` table
4. Default role: `student`
5. Redirect to student dashboard

### User Login

1. User enters email and password
2. Supabase Auth validates credentials
3. User context updated with user data
4. Dashboard based on user role

### Role-Based Access

- **Student**: Can view courses, track progress, take quizzes
- **Instructor**: Can create courses, manage content, see student progress
- **Admin**: Can manage all users, approve instructors, view platform stats

## 📚 Database Schema

### Core Tables

- **users**: User profiles (extends Supabase auth)
- **courses**: Course information with instructor reference
- **modules**: Course modules/sections
- **lessons**: Individual learning units
- **lesson_materials**: Files/resources for lessons
- **enrollments**: Student-course relationships

### Quiz Tables

- **quizzes**: Quiz definitions
- **quiz_questions**: Individual questions
- **quiz_answers**: Multiple choice options
- **quiz_attempts**: Student quiz submissions
- **student_answers**: Student responses to questions

### Tracking Tables

- **progress_tracking**: Lesson completion tracking
- **weak_areas**: Topics needing revision
- **certificates**: Earned certificates
- **notifications**: User notifications

## 🎯 Key Features

### For Students

1. **Browse & Enroll**: Discover and enroll in courses
2. **Track Progress**: Visual progress indicators
3. **Learn Lessons**: Access course materials
4. **Take Quizzes**: Adaptive difficulty quizzes
5. **Get Recommendations**: Weak area review suggestions
6. **Earn Certificates**: On course completion
7. **Dashboard**: Overview of learning progress

### For Instructors

1. **Create Courses**: Build comprehensive courses
2. **Manage Content**: Add modules and lessons
3. **Upload Files**: Course materials and resources
4. **Create Quizzes**: Build assessments
5. **View Analytics**: Student progress tracking
6. **Publish Courses**: Make courses available

### For Admins

1. **User Management**: CRUD operations on users
2. **Approve Instructors**: Review instructor applications
3. **Platform Stats**: Overall platform metrics
4. **Moderation**: Review course content

## 🧠 Adaptive Learning Logic

### Weak Area Detection

When a student's quiz score < 60%:
1. Topic marked as weak area
2. Student receives notification
3. Revision module recommended
4. Topic tracked for follow-up attempts

### Difficulty Adjustment

- Score < 60%: Next quiz set to "easy"
- Score 60-85%: Next quiz set to "medium"
- Score > 85%: Next quiz set to "hard"

### Unlock Advanced Content

When a student scores > 85% on a module:
- Advanced lessons unlocked
- Premium content accessible
- Certificate eligibility confirmed

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS policies enabling:
- Users see only their own data
- Instructors see student data for their courses
- Admins see all data
- Public access to published courses

### Authentication

- Email/password authentication via Supabase
- JWT tokens for API requests
- Automatic session refresh
- Secure cookie handling

## 📊 Services

### Course Service (`src/services/courseService.js`)

```javascript
fetchPublishedCourses()
fetchInstructorCourses(instructorId)
fetchCourseDetails(courseId)
createCourse(courseData, instructorId)
updateCourse(courseId, updates)
deleteCourse(courseId)
fetchEnrolledCourses(studentId)
enrollInCourse(courseId, studentId)
```

### Quiz Service (`src/services/quizService.js`)

```javascript
fetchQuizDetails(quizId)
createQuiz(quizData)
addQuizQuestion(questionData)
submitQuizAttempt(attemptData)
recordStudentAnswer(answerData)
fetchStudentQuizAttempts(studentId)
calculateAdaptiveDifficulty(score)
markWeakArea(studentId, moduleId, topicName, score)
fetchWeakAreas(studentId)
```

### Progress Service (`src/services/progressService.js`)

```javascript
completeLesson(enrollmentId, lessonId, timeSpent)
getCourseProgress(enrollmentId)
getModuleProgress(enrollmentId, moduleId)
getDashboardStats(studentId)
```

## 🪝 Custom Hooks

### useAuth()

Access authentication context:

```javascript
const { user, userProfile, isAuthenticated, login, logout, signup } = useAuth();
```

### useSupabaseQuery()

Execute Supabase queries with loading/error states:

```javascript
const { data, isLoading, error, refetch } = useSupabaseQuery(
  () => fetchCourses(),
  [dependencies]
);
```

## 🛣️ Available Routes

### Public Routes
- `/` - Home page
- `/login` - User login
- `/signup` - User registration

### Student Routes (Protected)
- `/student/dashboard` - Main dashboard

### Instructor Routes (Protected)
- `/instructor/dashboard` - Course management

### Admin Routes (Protected)
- `/admin/dashboard` - Platform management

## 💡 Development Tips

### Adding a New Feature

1. Create service function in `src/services/`
2. Create component in `src/components/`
3. Create page if needed in `src/pages/`
4. Add route in `App.jsx`
5. Add styling with CSS modules

### Best Practices

- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for logic reuse
- Create service functions for database operations
- Implement proper error handling
- Add loading states for async operations
- Use CSS modules for scoped styles

## 🐛 Troubleshooting

### Database Connection Issues

```
Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set
```

**Solution**: Check `.env.local` file and restart dev server

### RLS Permission Errors

**Solution**: Verify RLS policies are applied correctly in Supabase SQL editor

### Authentication Issues

**Solution**: Check that auth user is created before creating user profile

## 📈 Scaling Considerations

- Database indexes are created for frequently queried fields
- RLS policies prevent data leakage
- Edge functions can be added for complex operations
- Storage bucket for file uploads
- Real-time subscriptions for collaborations
- Analytics integration for tracking

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

Both services auto-detect Vite configuration.

Ensure environment variables are set in deployment platform.

## 📝 Notes

- This is an MVP implementation with essential features
- Additional features can be added (comments, messaging, video hosting)
- Performance optimization recommended for production
- Consider adding automated testing
- Implement analytics for user engagement

## 📚 Further Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 📧 Support & Feedback

For issues or suggestions, create an issue in the repository.

---

**Happy Learning! 🎓**
