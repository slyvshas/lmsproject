# 🎓 AI-Powered Learning Management System (LMS)

A modern, production-ready Learning Management System (LMS) built with **React**, **Vite**, and **Supabase**. Features role-based access, adaptive learning, progress tracking, and intelligent quiz recommendations.

## ✨ Key Features

### 🎯 Core Features

- ✅ **Multi-role Authentication** - Student, Instructor, Admin roles with role-based access control
- ✅ **Course Management** - Create, publish, and manage comprehensive courses with modules
- ✅ **Interactive Learning** - Structured lessons with materials and multi-media support
- ✅ **Progress Tracking** - Real-time tracking of student progress through courses
- ✅ **Adaptive Quizzes** - Smart difficulty adjustment based on performance
- ✅ **Weak Area Detection** - Automatic identification of struggling topics
- ✅ **Smart Recommendations** - Personalized learning path suggestions
- ✅ **Certificates** - Automatic certificate generation on course completion
- ✅ **Student Analytics** - Comprehensive dashboard with progress metrics

### 👥 Role-Specific Features

#### 👨‍🎓 Student Features
- Browse and discover published courses
- Enroll in courses
- Track course progress with visual indicators
- Complete lessons and mark them as done
- Take adaptive quizzes
- Receive revision recommendations for weak areas
- View achievements and earn certificates
- Access personalized dashboard

#### 👨‍🏫 Instructor Features
- Create and manage courses
- Organize content with modules and lessons
- Upload course materials (PDFs, files, etc.)
- Create comprehensive quizzes with multiple question types
- View student progress analytics
- Export student performance reports
- Manage course pricing and publishing
- Track enrollment metrics

#### 👨‍💼 Admin Features
- Manage all platform users
- Approve/reject instructor applications
- Monitor platform statistics
- View platform-wide analytics
- Manage course moderation
- Handle user support tickets
- Configure platform settings
- Generate admin reports

## 🏗️ Architecture Overview

### Frontend Architecture

```
React (Vite)
├── Functional Components with Hooks
├── Context API (Authentication)
├── Custom Hooks (Data fetching, Auth)
├── React Router (Navigation)
├── CSS Modules (Styling)
└── Service Layer (API calls)
```

### Backend Architecture

```
Supabase (PostgreSQL)
├── Authentication Service
├── Database (15+ normalized tables)
├── Row Level Security (RLS) Policies
├── Storage (for file uploads)
├── Real-time subscriptions
└── Edge Functions (optional)
```

## 📊 Database Schema

### User Management
- **users** - User profiles, roles, preferences
- **notifications** - User notifications and alerts

### Course Content
- **courses** - Course metadata, instructor reference
- **modules** - Course sections/chapters
- **lessons** - Learning units within modules
- **lesson_materials** - Attachments and resources

### Learning & Assessment
- **quizzes** - Quiz definitions
- **quiz_questions** - Individual questions
- **quiz_answers** - Multiple choice options
- **quiz_attempts** - Student quiz submissions
- **student_answers** - Individual student responses

### Progress & Achievements
- **enrollments** - Student-course relationships
- **progress_tracking** - Lesson completion records
- **weak_areas** - Areas needing revision
- **certificates** - Earned certifications

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Row Level Security (RLS)** - Database-level access control
- **Email Verification** - For new signups
- **Password Reset** - Secure password recovery
- **Session Management** - Automatic token refresh
- **Protected Routes** - Frontend route protection
- **Data Isolation** - Users can only access their data

## 🎯 Adaptive Learning Logic

### Intelligent Difficulty Adjustment

```javascript
Quiz Score < 60%  → Easy difficulty (needs review)
Quiz Score 60-85% → Medium difficulty (standard)
Quiz Score > 85%  → Hard difficulty (advanced)
```

### Weak Area Detection

When score < 60%:
1. Module marked as weak area
2. Topic added to revision list
3. Student notified
4. Module recommended for review
5. Progress tracked for improvement

### Advanced Content Unlock

When score > 85%:
1. Advanced lessons unlocked
2. Premium content accessibility
3. Certificate eligibility confirmed
4. Recommendation for next challenge

## 🎨 User Interface

### Modern Design System
- Clean, minimal aesthetic
- Gradient backgrounds (purple/blue theme)
- Smooth animations and transitions
- Responsive mobile design
- Accessible form inputs
- Loading and error states

### Key Components
- Navigation bar with role-based menus
- Responsive dashboards
- Course catalog with filters
- Progress indicators
- Quiz interface
- Student analytics dashboard
- Form validation and error handling

## 🚀 Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Chart.js** - Analytics visualizations
- **CSS Modules** - Scoped styling

### Backend & Services
- **Supabase** - Backend as a service
- **PostgreSQL** - Relational database
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage
- **Row Level Security** - Data protection

### Development Tools
- **Node.js** - Runtime
- **npm** - Package management
- **ESLint** - Code quality
- **Vitest** - Testing

## 📁 Project Structure

```
src/
├── App.jsx                    # Main app component with routing
├── App.css                    # Global styles
│
├── components/
│   ├── common/               # Shared components
│   │   ├── Navbar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ProtectedRoute.jsx
│   ├── auth/                 # Auth components
│   ├── student/              # Student components
│   ├── instructor/           # Instructor components
│   ├── admin/                # Admin components
│   └── styles/               # Component styles
│
├── pages/
│   ├── Home.jsx              # Landing page
│   ├── Unauthorized.jsx      # Error page
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── student/
│   │   └── StudentDashboard.jsx
│   ├── instructor/
│   │   └── InstructorDashboard.jsx
│   ├── admin/
│   │   └── AdminDashboard.jsx
│   └── styles/               # Page styles
│
├── context/
│   └── AuthContext.jsx       # Auth state management
│
├── hooks/
│   ├── useAuth.js            # Auth hook
│   └── useSupabaseQuery.js   # Query hook
│
├── services/
│   ├── courseService.js      # Course operations
│   ├── quizService.js        # Quiz operations
│   └── progressService.js    # Progress tracking
│
├── utils/
│   └── helpers.js            # Helper functions
│
├── config/
│   └── supabase.js           # Supabase client
│
├── styles/                   # Global styles
│
└── index.jsx                 # React entry point
```

## 🚦 Getting Started

### Quick Setup (5 minutes)

```bash
# 1. Clone and install
git clone <repo>
cd codespaces-react
npm install

# 2. Setup Supabase
# Create project at supabase.com
# Get URL and API key

# 3. Configure environment
cp .env.local.example .env.local
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Initialize database
# Run DATABASE_SCHEMA.sql in Supabase SQL editor
# Run RLS_POLICIES.sql in Supabase SQL editor

# 5. Start dev server
npm start
```

### Access the Platform

- **Home**: http://localhost:3000
- **Student Dashboard**: /student/dashboard
- **Instructor Dashboard**: /instructor/dashboard
- **Admin Dashboard**: /admin/dashboard

#### Test Accounts

Create accounts with different roles:
1. Student account: Email/password signup
2. Instructor account: Admin approves application
3. Admin account: Created manually in Supabase

## 📝 API Service Examples

### Fetch Published Courses

```javascript
import { fetchPublishedCourses } from '@/services/courseService';

const { data, count, error } = await fetchPublishedCourses({
  category: 'Programming',
  difficulty: 'beginner',
  search: 'React',
  page: 0,
  limit: 10
});
```

### Submit Quiz Answer

```javascript
import { recordStudentAnswer, submitQuizAttempt } from '@/services/quizService';

const { data: attempt } = await submitQuizAttempt({
  quiz_id: quizId,
  student_id: userId,
  score: calculatedScore,
  total_questions: totalQuestions,
  correct_answers: correctCount,
  duration_seconds: timeTaken,
  adaptive_difficulty: 'medium'
});
```

### Track Progress

```javascript
import { completeLesson } from '@/services/progressService';

const { data } = await completeLesson(
  enrollmentId,
  lessonId,
  timeSpentSeconds
);
```

## 🧪 Testing

The project includes testing setup with Vitest. Run tests:

```bash
npm test
```

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 🎓 Use Cases

### Educational Institutions
- Online course delivery
- Student progress tracking
- Automated assessment
- Certificate management

### Corporate Training
- Employee skill development
- Compliance training
- Performance tracking
- Certification programs

### Online Schools
- Course marketplace
- Instructor management
- Student engagement
- Analytics & reporting

## 📈 Metrics & Analytics

### Student Metrics
- Course completion rate
- Average quiz score
- Time spent learning
- Weak areas identified
- Certificates earned

### Instructor Metrics
- Active students
- Course popularity
- Student satisfaction
- Performance trends

### Platform Metrics
- Total users
- Active enrollments
- Course statistics
- User growth

## 🔄 Roadmap

### Phase 1 (MVP) ✅
- Core LMS functionality
- User authentication
- Course management
- Basic quizzes
- Progress tracking

### Phase 2 (Planned)
- Live classes/video conferencing
- Discussion forums
- Peer reviews
- Advanced reporting
- Mobile app

### Phase 3 (Future)
- AI-powered content generation
- Gamification
- Social learning
- Marketplace features
- Advanced analytics

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For support and questions:
- Create an issue on GitHub
- Check SETUP_GUIDE.md for detailed instructions
- Review code comments for implementation details

## 🙌 Acknowledgments

Built with modern React patterns and Supabase best practices.

---

**Made with ❤️ for educators and learners worldwide**

**Version**: 1.0.0  
**Last Updated**: February 2026
