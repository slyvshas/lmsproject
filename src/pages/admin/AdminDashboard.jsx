// ============================================================================
// Admin Dashboard
// ============================================================================
// Comprehensive admin dashboard with real-time statistics, user management,
// instructor approvals, course moderation, and platform analytics.

import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { fetchPlatformStats, fetchRecentActivity, fetchPendingInstructors } from '../../services/adminService';
import { 
  UserManagement, 
  InstructorApprovals, 
  CourseModeration, 
  PlatformAnalytics 
} from '../../components/admin';
import ArticleManager from '../../components/admin/ArticleManager';
import styles from '../styles/AdminDashboard.module.css';

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResult, activityResult, pendingResult] = await Promise.all([
        fetchPlatformStats(),
        fetchRecentActivity(10),
        fetchPendingInstructors()
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (activityResult.data) setRecentActivity(activityResult.data);
      if (pendingResult.data) setPendingCount(pendingResult.data.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'instructors', label: 'Instructors', icon: '✅', badge: pendingCount },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'articles', label: 'Articles', icon: '📰' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_user': return '👤';
      case 'instructor_application': return '✋';
      case 'enrollment': return '📝';
      case 'course_published': return '🎉';
      case 'course_created': return '📖';
      default: return '📌';
    }
  };

  const getActivityBadgeClass = (type) => {
    switch (type) {
      case 'new_user': return styles.badgeUser;
      case 'instructor_application': return styles.badgeInstructor;
      case 'enrollment': return styles.badgeEnrollment;
      case 'course_published': return styles.badgeCourse;
      case 'course_created': return styles.badgeDraft;
      default: return '';
    }
  };

  return (
    <div className={styles.adminDashboard} style={{ minHeight: '100vh', padding: '20px 40px 40px 40px' }}>
      {/* Header Section */}
      <header className={styles.dashboardHeader} style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '16px', padding: '30px', marginBottom: '24px' }}>
        <div className={styles.headerContent} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div className={styles.headerText}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#f1f5f9' }}>Admin Dashboard</h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#94a3b8' }}>Welcome back, {userProfile?.full_name || 'Admin'}! Here's what's happening on your platform.</p>
          </div>
          <div className={styles.headerActions} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className={styles.refreshBtn} onClick={handleRefresh} disabled={loading} style={{ padding: '10px 20px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#f1f5f9', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? '⏳' : '🔄'} Refresh
            </button>
            <span className={styles.lastUpdated} style={{ fontSize: '13px', color: '#64748b' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabNavigation} style={{ display: 'flex', flexDirection: 'row', gap: '4px', background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '8px', marginBottom: '24px', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', padding: '12px 20px', background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? '#818cf8' : '#94a3b8', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.badge > 0 && (
              <span className={styles.tabBadge} style={{ background: '#f43f5e', color: 'white', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className={styles.dashboardContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overviewTab} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Cards */}
            <section className={styles.statsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className={`${styles.statCard} ${styles.statUsers}`} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div className={styles.statIcon} style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                <div className={styles.statInfo}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: 700, color: '#f1f5f9' }}>{loading ? '...' : formatNumber(stats?.totalUsers)}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Total Users</p>
                </div>
                <div className={styles.statTrend} style={{ marginTop: '8px' }}>
                  <span className={styles.trendUp} style={{ fontSize: '12px', color: '#34d399' }}>↗ Active platform</span>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statCourses}`} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div className={styles.statIcon} style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
                <div className={styles.statInfo}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: 700, color: '#f1f5f9' }}>{loading ? '...' : formatNumber(stats?.totalCourses)}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Published Courses</p>
                </div>
                <div className={styles.statTrend} style={{ marginTop: '8px' }}>
                  <span className={styles.trendUp} style={{ fontSize: '12px', color: '#34d399' }}>Quality content</span>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statEnrollments}`} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div className={styles.statIcon} style={{ fontSize: '32px', marginBottom: '8px' }}>🎓</div>
                <div className={styles.statInfo}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: 700, color: '#f1f5f9' }}>{loading ? '...' : formatNumber(stats?.totalEnrollments)}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Total Enrollments</p>
                </div>
                <div className={styles.statTrend} style={{ marginTop: '8px' }}>
                  <span className={styles.trendUp} style={{ fontSize: '12px', color: '#34d399' }}>Growing fast</span>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statInstructors}`} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div className={styles.statIcon} style={{ fontSize: '32px', marginBottom: '8px' }}>👨‍🏫</div>
                <div className={styles.statInfo}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: 700, color: '#f1f5f9' }}>{loading ? '...' : formatNumber(stats?.totalInstructors)}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Active Instructors</p>
                </div>
                <div className={styles.statTrend} style={{ marginTop: '8px' }}>
                  <span className={styles.trendUp} style={{ fontSize: '12px', color: '#34d399' }}>Expert educators</span>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statCertificates}`} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div className={styles.statIcon} style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
                <div className={styles.statInfo}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: 700, color: '#f1f5f9' }}>{loading ? '...' : formatNumber(stats?.totalCertificates)}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Certificates Issued</p>
                </div>
                <div className={styles.statTrend} style={{ marginTop: '8px' }}>
                  <span className={styles.trendUp} style={{ fontSize: '12px', color: '#34d399' }}>Achievements</span>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statPending}`} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div className={styles.statIcon} style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                <div className={styles.statInfo}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: 700, color: '#f1f5f9' }}>{loading ? '...' : formatNumber(stats?.pendingInstructors)}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Pending Approvals</p>
                </div>
                {stats?.pendingInstructors > 0 && (
                  <button 
                    className={styles.actionLink}
                    onClick={() => setActiveTab('instructors')}
                  >
                    Review →
                  </button>
                )}
              </div>
            </section>

            {/* Quick Actions & Recent Activity */}
            <div className={styles.overviewGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              {/* Quick Actions */}
              <section className={styles.quickActions} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>Quick Actions</h2>
                <div className={styles.actionsList} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    className={styles.actionCard}
                    onClick={() => setActiveTab('users')}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span className={styles.actionIcon} style={{ fontSize: '24px', width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👥</span>
                    <div className={styles.actionText} style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Manage Users</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>View, edit, and manage all platform users</p>
                    </div>
                    <span className={styles.actionArrow} style={{ color: '#64748b', fontSize: '18px' }}>→</span>
                  </button>

                  <button 
                    className={styles.actionCard}
                    onClick={() => setActiveTab('instructors')}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span className={styles.actionIcon} style={{ fontSize: '24px', width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✅</span>
                    <div className={styles.actionText} style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Instructor Approvals</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Review pending instructor applications</p>
                    </div>
                    {pendingCount > 0 && (
                      <span className={styles.pendingBadge} style={{ background: '#f43f5e', color: 'white', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>{pendingCount}</span>
                    )}
                    <span className={styles.actionArrow} style={{ color: '#64748b', fontSize: '18px' }}>→</span>
                  </button>

                  <button 
                    className={styles.actionCard}
                    onClick={() => setActiveTab('courses')}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span className={styles.actionIcon} style={{ fontSize: '24px', width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📚</span>
                    <div className={styles.actionText} style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Course Moderation</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Moderate and manage course content</p>
                    </div>
                    <span className={styles.actionArrow} style={{ color: '#64748b', fontSize: '18px' }}>→</span>
                  </button>

                  <button 
                    className={styles.actionCard}
                    onClick={() => setActiveTab('analytics')}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span className={styles.actionIcon} style={{ fontSize: '24px', width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈</span>
                    <div className={styles.actionText} style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>View Analytics</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Detailed platform insights and trends</p>
                    </div>
                    <span className={styles.actionArrow} style={{ color: '#64748b', fontSize: '18px' }}>→</span>
                  </button>
                </div>
              </section>

              {/* Recent Activity */}
              <section className={styles.recentActivity} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px' }}>
                <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>Recent Activity</h2>
                  <button className={styles.viewAllBtn} onClick={handleRefresh} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                    View All
                  </button>
                </div>
                
                {loading ? (
                  <div className={styles.loadingActivity}>
                    <div className={styles.spinner}></div>
                    <p>Loading activity...</p>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className={styles.emptyActivity}>
                    <span>📭</span>
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className={styles.activityList}>
                    {recentActivity.map(activity => (
                      <div key={activity.id} className={styles.activityItem}>
                        <div className={`${styles.activityIcon} ${getActivityBadgeClass(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className={styles.activityContent}>
                          <span className={styles.activityTitle}>{activity.title}</span>
                          <p className={styles.activityDesc}>{activity.description}</p>
                        </div>
                        <time className={styles.activityTime}>
                          {getTimeAgo(activity.timestamp)}
                        </time>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Platform Health */}
            <section className={styles.platformHealth} style={{ background: 'rgba(30, 30, 60, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>Platform Health</h2>
              <div className={styles.healthGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div className={styles.healthCard} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
                  <div className={styles.healthIcon} style={{ fontSize: '24px' }}>🟢</div>
                  <div className={styles.healthInfo}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>System Status</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>All systems operational</p>
                  </div>
                </div>
                <div className={styles.healthCard} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
                  <div className={styles.healthIcon} style={{ fontSize: '24px' }}>⚡</div>
                  <div className={styles.healthInfo}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Performance</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Optimal response time</p>
                  </div>
                </div>
                <div className={styles.healthCard} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
                  <div className={styles.healthIcon} style={{ fontSize: '24px' }}>🔐</div>
                  <div className={styles.healthInfo}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Security</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>All security checks passed</p>
                  </div>
                </div>
                <div className={styles.healthCard} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
                  <div className={styles.healthIcon} style={{ fontSize: '24px' }}>💾</div>
                  <div className={styles.healthInfo}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Storage</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Sufficient capacity</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UserManagement />
        )}

        {/* Instructors Tab */}
        {activeTab === 'instructors' && (
          <InstructorApprovals onUpdate={loadDashboardData} />
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <CourseModeration onUpdate={loadDashboardData} />
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <ArticleManager onBack={() => setActiveTab('overview')} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <PlatformAnalytics />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
