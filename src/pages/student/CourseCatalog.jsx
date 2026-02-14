// ============================================================================
// Course Catalog Page
// ============================================================================
// Browse all available courses with search and filters

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchPublishedCourses, enrollInCourse } from '../../services/courseService';
import { getCourseRatingStats } from '../../services/reviewService';

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
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((course) => course.difficulty_level === selectedDifficulty);
    }
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

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '32px 40px',
    color: '#fff'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const h1Style = {
    fontSize: '36px',
    fontWeight: '800',
    margin: '0 0 12px 0'
  };

  const headerPStyle = {
    fontSize: '18px',
    color: '#94a3b8',
    margin: 0
  };

  const filtersStyle = {
    display: 'flex',
    gap: '20px',
    marginBottom: '32px',
    flexWrap: 'wrap',
    alignItems: 'center',
    background: 'rgba(30, 30, 60, 0.6)',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  };

  const searchInputStyle = {
    flex: '1',
    minWidth: '250px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(15, 15, 35, 0.8)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none'
  };

  const filterGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const filterLabelStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '500'
  };

  const selectStyle = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(15, 15, 35, 0.8)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  };

  const cardStyle = {
    background: 'rgba(30, 30, 60, 0.6)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const thumbnailStyle = {
    height: '180px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px'
  };

  const contentStyle = {
    padding: '20px'
  };

  const badgesStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px'
  };

  const difficultyBadgeStyle = (level) => ({
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    background: level === 'beginner' ? 'rgba(34, 197, 94, 0.2)' :
                level === 'intermediate' ? 'rgba(234, 179, 8, 0.2)' :
                'rgba(239, 68, 68, 0.2)',
    color: level === 'beginner' ? '#22c55e' :
           level === 'intermediate' ? '#eab308' :
           '#ef4444'
  });

  const categoryBadgeStyle = {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc'
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#fff'
  };

  const descStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 16px 0',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const metaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '16px'
  };

  const actionsStyle = {
    display: 'flex',
    gap: '12px'
  };

  const viewBtnStyle = {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
    fontSize: '14px'
  };

  const enrollBtnStyle = {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const resultsInfoStyle = {
    textAlign: 'center',
    marginTop: '32px',
    color: '#94a3b8',
    fontSize: '14px'
  };

  const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#94a3b8',
    fontSize: '18px'
  };

  const emptyStyle = {
    textAlign: 'center',
    padding: '60px',
    color: '#94a3b8',
    gridColumn: '1 / -1'
  };

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={{ ...loadingStyle, color: '#f87171' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={h1Style}>📚 Course Catalog</h1>
        <p style={headerPStyle}>Discover courses to boost your skills</p>
      </div>

      <div style={filtersStyle}>
        <input
          type="text"
          placeholder="🔍 Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={selectStyle}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>Difficulty:</label>
          <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} style={selectStyle}>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>{diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
            ))}
          </select>
        </div>
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
            <option value="newest">Newest</option>
            <option value="title">Title A-Z</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <div style={gridStyle}>
        {filteredCourses.length === 0 ? (
          <div style={emptyStyle}>
            <p>No courses found matching your criteria</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} style={cardStyle}>
              <div style={thumbnailStyle}>
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '📘'
                )}
              </div>
              <div style={contentStyle}>
                <div style={badgesStyle}>
                  <span style={difficultyBadgeStyle(course.difficulty_level)}>{course.difficulty_level || 'beginner'}</span>
                  {course.category && <span style={categoryBadgeStyle}>{course.category}</span>}
                </div>
                <h3 style={titleStyle}>{course.title}</h3>
                <p style={descStyle}>{course.description}</p>
                <div style={metaStyle}>
                  <span>👨‍🏫 {course.users?.full_name || 'Instructor'}</span>
                  {courseRatings[course.id] && courseRatings[course.id].count > 0 && (
                    <span>⭐ {courseRatings[course.id].average?.toFixed(1)} ({courseRatings[course.id].count})</span>
                  )}
                </div>
                <div style={actionsStyle}>
                  <Link to={`/courses/${course.id}`} style={viewBtnStyle}>View Details</Link>
                  {userProfile?.role === 'student' && (
                    <button onClick={() => handleEnroll(course.id)} disabled={enrolling === course.id} style={enrollBtnStyle}>
                      {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={resultsInfoStyle}>
        Showing {filteredCourses.length} of {courses.length} courses
      </div>
    </div>
  );
};

export default CourseCatalog;
