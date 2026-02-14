// ============================================================================
// Course Catalog Page
// ============================================================================
// Browse all available courses with search and filters

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchPublishedCourses, enrollInCourse } from '../../services/courseService';
import { getCourseRatingStats } from '../../services/reviewService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../styles/CourseCatalog.module.css';

const CourseCatalog = () => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [courseRatings, setCourseRatings] = useState({});
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, courses]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const result = await fetchPublishedCourses();
      const coursesData = result?.data || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);

      // Load ratings for all courses
      const ratings = {};
      for (const c of coursesData) {
        try {
          const ratingRes = await getCourseRatingStats(c.id);
          if (ratingRes.data) ratings[c.id] = ratingRes.data;
        } catch { /* ignore */ }
      }
      setCourseRatings(ratings);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(err.message);
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    if (!Array.isArray(courses)) {
      setFilteredCourses([]);
      return;
    }

    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((course) => course.difficulty_level === selectedDifficulty);
    }

    // Sort
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered.sort((a, b) => (courseRatings[b.id]?.average || 0) - (courseRatings[a.id]?.average || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.modules?.[0]?.count || 0) - (a.modules?.[0]?.count || 0));
        break;
      case 'newest':
      default:
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId) => {
    if (!userProfile || userProfile.role !== 'student') {
      alert('Only students can enroll in courses');
      return;
    }

    try {
      setEnrolling(courseId);
      await enrollInCourse(courseId, userProfile.id);
      alert('Successfully enrolled! Check your dashboard.');
    } catch (err) {
      alert('Failed to enroll: ' + err.message);
    } finally {
      setEnrolling(null);
    }
  };

  const categories = ['all', 'Web Development', 'Programming', 'Data Science', 'Design', 'Business', 'Marketing'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="course-catalog-page">
      <div className="catalog-header">
        <h1>📚 Course Catalog</h1>
        <p>Discover courses to boost your skills</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="filter-select"
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest</option>
            <option value="title">Title A-Z</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <p>No courses found matching your criteria</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-catalog-card">
              <div className="course-thumbnail">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} />
                ) : (
                  <div className="placeholder-thumbnail">📘</div>
                )}
              </div>

              <div className="course-catalog-content">
                <div className="course-badges">
                  <span className={`difficulty-badge ${course.difficulty_level}`}>
                    {course.difficulty_level || 'beginner'}
                  </span>
                  {course.category && <span className="category-badge">{course.category}</span>}
                </div>

                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>

                <div className="course-meta">
                  <span>👨‍🏫 {course.users?.full_name || 'Instructor'}</span>
                  {courseRatings[course.id] && courseRatings[course.id].count > 0 && (
                    <span className="course-rating">
                      ⭐ {courseRatings[course.id].average?.toFixed(1)} ({courseRatings[course.id].count})
                    </span>
                  )}
                </div>

                <div className="course-actions">
                  <Link to={`/courses/${course.id}`} className="btn-view-course">
                    View Details
                  </Link>
                  {userProfile?.role === 'student' && (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                      className="btn-enroll"
                    >
                      {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      <div className="results-info">
        Showing {filteredCourses.length} of {courses.length} courses
      </div>
    </div>
  );
};

export default CourseCatalog;
