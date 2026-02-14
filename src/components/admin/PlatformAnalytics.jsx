// ============================================================================
// Platform Analytics Component
// ============================================================================
// Component for displaying platform analytics and insights

import React, { useState, useEffect } from 'react';
import { 
  fetchEnrollmentTrends, 
  fetchCoursesByCategory, 
  fetchTopCourses, 
  fetchTopInstructors 
} from '../../services/adminService';

const PlatformAnalytics = () => {
  const [enrollmentTrends, setEnrollmentTrends] = useState({});
  const [courseCategories, setCourseCategories] = useState({});
  const [topCourses, setTopCourses] = useState([]);
  const [topInstructors, setTopInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    
    const [trendsResult, categoriesResult, coursesResult, instructorsResult] = await Promise.all([
      fetchEnrollmentTrends(30),
      fetchCoursesByCategory(),
      fetchTopCourses(5),
      fetchTopInstructors(5)
    ]);

    setEnrollmentTrends(trendsResult.data || {});
    setCourseCategories(categoriesResult.data || {});
    setTopCourses(coursesResult.data || []);
    setTopInstructors(instructorsResult.data || []);
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'courses', label: 'Top Courses', icon: '📚' },
    { id: 'instructors', label: 'Top Instructors', icon: '👨‍🏫' }
  ];

  // Styles
  const containerStyle = {
    padding: '8px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const refreshButtonStyle = {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s'
  };

  const tabsContainerStyle = {
    display: 'flex',
    gap: '6px',
    background: 'rgba(30, 30, 60, 0.7)',
    padding: '8px',
    borderRadius: '14px',
    marginBottom: '28px',
    border: '1px solid rgba(255,255,255,0.08)'
  };

  const tabStyle = (isActive) => ({
    padding: '14px 24px',
    borderRadius: '10px',
    border: 'none',
    background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
    color: isActive ? '#a5b4fc' : '#94a3b8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  });

  const cardStyle = {
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '24px'
  };

  const cardTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const cardSubtitleStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 24px 0'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  };

  const chartContainerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    height: '220px',
    padding: '20px 0',
    borderBottom: '2px solid rgba(255,255,255,0.1)'
  };

  const barWrapperStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end'
  };

  const barStyle = (height) => ({
    width: '100%',
    maxWidth: '40px',
    height: `${height}%`,
    minHeight: '4px',
    background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
    borderRadius: '6px 6px 0 0',
    position: 'relative',
    transition: 'height 0.3s ease',
    cursor: 'pointer'
  });

  const barValueStyle = {
    position: 'absolute',
    top: '-28px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '12px',
    fontWeight: '700',
    color: '#a5b4fc',
    whiteSpace: 'nowrap'
  };

  const barLabelStyle = {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '10px',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  };

  const categoryItemStyle = {
    marginBottom: '18px'
  };

  const categoryHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const categoryNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0'
  };

  const categoryCountStyle = {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500'
  };

  const progressBarBgStyle = {
    height: '10px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    overflow: 'hidden'
  };

  const progressBarFillStyle = (width) => ({
    height: '100%',
    width: `${width}%`,
    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
    borderRadius: '10px',
    transition: 'width 0.5s ease'
  });

  const leaderboardItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.2s'
  };

  const rankBadgeStyle = (index) => ({
    fontSize: index < 3 ? '28px' : '16px',
    fontWeight: '700',
    color: index < 3 ? '#fff' : '#64748b',
    minWidth: '40px',
    textAlign: 'center'
  });

  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    overflow: 'hidden'
  };

  const leaderboardInfoStyle = {
    flex: 1
  };

  const leaderboardNameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 4px 0'
  };

  const leaderboardSubStyle = {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  };

  const statsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end'
  };

  const statBadgeStyle = (color) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    background: color === 'purple' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.2)',
    color: color === 'purple' ? '#c4b5fd' : '#a5b4fc'
  });

  const noDataStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '80px 20px'
  };

  const summaryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '28px'
  };

  const summaryCardStyle = (gradient) => ({
    background: gradient,
    borderRadius: '14px',
    padding: '22px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)'
  });

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>📊 Platform Analytics</h1>
        </div>
        <div style={loadingStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '18px', color: '#6366f1' }}>Loading analytics...</div>
        </div>
      </div>
    );
  }

  const totalEnrollments = Object.values(enrollmentTrends).reduce((a, b) => a + b, 0);
  const totalCategoryCount = Object.values(courseCategories).reduce((a, b) => a + b, 0);
  const enrollmentDates = Object.keys(enrollmentTrends);
  const maxEnrollment = Math.max(...Object.values(enrollmentTrends), 1);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <span>📊</span> Platform Analytics
        </h1>
        <button 
          style={refreshButtonStyle} 
          onClick={loadAnalytics}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div style={summaryGridStyle}>
        <div style={summaryCardStyle('linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))')}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#818cf8', marginBottom: '4px' }}>
            {totalEnrollments}
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Enrollments (30d)</div>
        </div>
        <div style={summaryCardStyle('linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))')}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#a78bfa', marginBottom: '4px' }}>
            {totalCategoryCount}
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Total Courses</div>
        </div>
        <div style={summaryCardStyle('linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1))')}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#c084fc', marginBottom: '4px' }}>
            {topCourses.length}
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Top Performers</div>
        </div>
        <div style={summaryCardStyle('linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.1))')}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#f472b6', marginBottom: '4px' }}>
            {topInstructors.length}
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Star Instructors</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabsContainerStyle}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={tabStyle(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={gridStyle}>
          {/* Enrollment Trends */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <span>📈</span> Enrollment Trends
            </h3>
            <p style={cardSubtitleStyle}>
              Daily enrollments over the last 14 days
            </p>
            
            {enrollmentDates.length > 0 ? (
              <div style={chartContainerStyle}>
                {enrollmentDates.slice(-14).map((date) => (
                  <div key={date} style={barWrapperStyle}>
                    <div 
                      style={barStyle((enrollmentTrends[date] / maxEnrollment) * 100)}
                      title={`${date}: ${enrollmentTrends[date]} enrollments`}
                    >
                      <span style={barValueStyle}>{enrollmentTrends[date]}</span>
                    </div>
                    <span style={barLabelStyle}>
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={noDataStyle}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <p>No enrollment data available</p>
              </div>
            )}
          </div>

          {/* Course Distribution */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <span>📚</span> Courses by Category
            </h3>
            <p style={cardSubtitleStyle}>
              Distribution of courses across categories
            </p>
            
            {Object.keys(courseCategories).length > 0 ? (
              <div>
                {Object.entries(courseCategories)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <div key={category} style={categoryItemStyle}>
                      <div style={categoryHeaderStyle}>
                        <span style={categoryNameStyle}>{category || 'Uncategorized'}</span>
                        <span style={categoryCountStyle}>{count} courses</span>
                      </div>
                      <div style={progressBarBgStyle}>
                        <div style={progressBarFillStyle((count / totalCategoryCount) * 100)} />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={noDataStyle}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Courses Tab */}
      {activeTab === 'courses' && (
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            <span>🏆</span> Top Performing Courses
          </h3>
          <p style={cardSubtitleStyle}>
            Courses ranked by total enrollment count
          </p>
          
          {topCourses.length > 0 ? (
            <div>
              {topCourses.map((course, index) => (
                <div 
                  key={course.id} 
                  style={leaderboardItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <div style={rankBadgeStyle(index)}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div style={avatarStyle}>
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      '📖'
                    )}
                  </div>
                  <div style={leaderboardInfoStyle}>
                    <h4 style={leaderboardNameStyle}>{course.title}</h4>
                    <p style={leaderboardSubStyle}>
                      by {course.users?.full_name || 'Unknown'} • {course.category || 'Uncategorized'}
                    </p>
                  </div>
                  <div style={statsContainerStyle}>
                    <span style={statBadgeStyle('blue')}>
                      👥 {course.enrollmentCount} students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={noDataStyle}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <p>No course data available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Top Instructors Tab */}
      {activeTab === 'instructors' && (
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            <span>⭐</span> Top Instructors
          </h3>
          <p style={cardSubtitleStyle}>
            Instructors ranked by total student count
          </p>
          
          {topInstructors.length > 0 ? (
            <div>
              {topInstructors.map((instructor, index) => (
                <div 
                  key={instructor.id} 
                  style={leaderboardItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <div style={rankBadgeStyle(index)}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div style={avatarStyle}>
                    {instructor.avatar_url ? (
                      <img src={instructor.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (instructor.full_name || instructor.email || '?')[0].toUpperCase()
                    )}
                  </div>
                  <div style={leaderboardInfoStyle}>
                    <h4 style={leaderboardNameStyle}>{instructor.full_name || 'Unknown'}</h4>
                    <p style={leaderboardSubStyle}>{instructor.email}</p>
                  </div>
                  <div style={statsContainerStyle}>
                    <span style={statBadgeStyle('blue')}>📚 {instructor.totalCourses} courses</span>
                    <span style={statBadgeStyle('purple')}>👥 {instructor.totalStudents} students</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={noDataStyle}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
              <p>No instructor data available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatformAnalytics;
