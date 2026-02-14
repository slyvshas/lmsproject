// ============================================================================
// Main App Component
// ============================================================================
// Root component with routing setup and global providers.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseDetails from './pages/student/CourseDetails';
import LessonViewer from './pages/student/LessonViewer';
import QuizPage from './pages/student/QuizPage';
import CertificatePage from './pages/student/CertificatePage';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import CourseEditor from './pages/instructor/CourseEditor';
import CourseAnalytics from './pages/instructor/CourseAnalytics';

// Admin Pages (Placeholder)
import AdminDashboard from './pages/admin/AdminDashboard';

// Shared Pages
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';

// Error Pages
import Unauthorized from './pages/Unauthorized';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Public Course Routes */}
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:courseId" element={<CourseDetails />} />

              {/* Public Article Routes */}
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />

              {/* Protected Student Routes */}
              <Route
                path="/student/dashboard"
                element={<ProtectedRoute Component={StudentDashboard} requiredRole="student" />}
              />
              <Route
                path="/student/courses/:courseId/lessons/:lessonId"
                element={<ProtectedRoute Component={LessonViewer} requiredRole="student" />}
              />
              <Route
                path="/student/quizzes/:quizId"
                element={<ProtectedRoute Component={QuizPage} requiredRole="student" />}
              />
              <Route
                path="/student/courses/:courseId/certificate"
                element={<ProtectedRoute Component={CertificatePage} requiredRole="student" />}
              />

              {/* Protected Instructor Routes */}
              <Route
                path="/instructor/dashboard"
                element={<ProtectedRoute Component={InstructorDashboard} requiredRole="instructor" />}
              />
              <Route
                path="/instructor/create-course"
                element={<ProtectedRoute Component={CreateCourse} requiredRole="instructor" />}
              />
              <Route
                path="/instructor/course/:courseId/edit"
                element={<ProtectedRoute Component={CourseEditor} requiredRole="instructor" />}
              />
              <Route
                path="/instructor/course/:courseId/analytics"
                element={<ProtectedRoute Component={CourseAnalytics} requiredRole="instructor" />}
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />

              {/* Shared Protected Routes */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Error Pages */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
