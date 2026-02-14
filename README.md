# 🎓 LMS Pro – AI-Powered Learning Management System

LMS Pro is a modern, full‑stack Learning Management System built with **React**, **Vite**, and **Supabase**. It provides role‑based access for **Students**, **Instructors**, and **Admins**, with adaptive quizzes, progress tracking, and analytics.

This README gives a complete overview so that someone new can understand, run, and evaluate your project.

---

## ✨ Features

- Multi‑role authentication (Student, Instructor, Admin)
- Email/password login and signup via Supabase
- Role‑based protected routes (only allowed roles can access certain pages)
- Course catalog with enrollment and progress tracking
- Instructor tools to create and manage courses, modules, and lessons
- Adaptive quiz engine that adjusts difficulty based on performance
- Weak‑area detection and personalized recommendations
- Student dashboard with progress, stats, and recommendations
- Instructor and admin dashboards with high‑level analytics
- Responsive UI with modern design and loading/error states

---

## 🧱 Tech Stack

- **Frontend:** React 18, Vite, React Router, CSS Modules
- **Backend as a Service:** Supabase (PostgreSQL, Auth, RLS)
- **Language:** JavaScript (ES2020+)
- **State Management:** React Context + custom hooks
- **Build/Test:** Vite, npm

---

## 📂 Main Project Structure

```bash
src/
├── App.jsx                 # Main app and routes
├── index.jsx               # React entry point
├── config/
│   └── supabase.js         # Supabase client
├── context/
│   └── AuthContext.jsx     # Auth provider and role logic
├── hooks/
│   ├── useAuth.js          # Access auth state and helpers
│   └── useSupabaseQuery.js # Generic Supabase query hook
├── services/
│   ├── courseService.js
│   ├── quizService.js
│   ├── progressService.js
│   └── ...                 # Other domain services
├── components/
│   ├── common/             # Navbar, ErrorBoundary, etc.
│   └── styles/             # Component styles (CSS modules)
├── pages/
│   ├── Home.jsx
│   ├── ProfilePage.jsx
│   ├── auth/               # Login, Signup
│   ├── student/            # StudentDashboard, Course views
│   ├── instructor/         # InstructorDashboard, CourseEditor, etc.
│   ├── admin/              # AdminDashboard
│   └── styles/             # Page‑level CSS modules
└── utils/
	└── helpers.js          # Reusable utilities
```

Database- and documentation‑specific files live at the project root:

- `DATABASE_SCHEMA.sql` – complete PostgreSQL schema (15+ tables)
- `RLS_POLICIES.sql` – Row Level Security policies
- `ADAPTIVE_LEARNING.md`, `IMPLEMENTATION_GUIDE.md`, `PROJECT_SUMMARY.md`, `QUICK_START.md`, `FULL_README.md` – detailed docs

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js **16+**
- npm
- Supabase account (free tier is enough)

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Supabase Project

1. Go to https://supabase.com and create a new project.
2. Wait for the database and API to be initialized.
3. Note your **Project URL** and **anon public key** from Project Settings → API.

### 4. Initialize the Database

In the Supabase Dashboard:

1. Open **SQL Editor** → **New Query**.
2. Paste the contents of `DATABASE_SCHEMA.sql` and **Run**.
3. Create another **New Query**.
4. Paste the contents of `RLS_POLICIES.sql` and **Run**.

You should see success messages and all tables/RLS policies applied.

### 5. Configure Environment Variables

Create an `.env.local` file in the project root (you can copy from the example if present):

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

> Do not commit `.env.local` to version control.

### 6. Run the App in Development

```bash
npm start
```

Open http://localhost:3000 in your browser. The app will reload when you save changes.

---

## 👥 User Roles & Flows

### Student

- Sign up / log in
- Browse published courses and enroll
- View **Student Dashboard** with progress cards
- Open a course, navigate lessons, and mark them complete
- Take quizzes; difficulty adapts based on performance
- See weak topics and recommendations

### Instructor

- Log in with an instructor role (role set via database or admin panel)
- Access **Instructor Dashboard**
- Create and manage courses, modules, and lessons
- View enrolled students and their progress
- Review quiz performance statistics

### Admin

- Log in with admin role
- Access **Admin Dashboard**
- View platform‑wide stats and recent activity
- Manage user roles and basic moderation tasks

---

## 🧠 Adaptive Learning (High Level)

- Quiz difficulty adapts from **easy → medium → hard** based on previous scores.
- Scores below a threshold (e.g., 60%) mark the related topic as a **weak area**.
- Weak areas are stored and surfaced in the student dashboard for revision.
- High scores can unlock harder content and contribute to certificate eligibility.

For a deeper technical explanation of the adaptive logic, see `ADAPTIVE_LEARNING.md`.

---

## 🧪 Scripts

- `npm start` – Run the development server (Vite)
- `npm run build` – Build for production
- `npm test` – Run tests (if configured)

---

## 📄 License

See [LICENSE](LICENSE) for licensing information.

---

## 🙋 Project Overview for Reports

If you are using **LMS Pro** for an academic or internship report, you can describe it as:

> “A web‑based Learning Management System that supports students, instructors, and administrators, with features for course management, adaptive quizzes, progress tracking, and analytics, built using React, Vite, and Supabase.”

For more detailed write‑ups (introduction, methodology, results, etc.), you can reuse and adapt content from this README plus the other markdown files in the repository.
