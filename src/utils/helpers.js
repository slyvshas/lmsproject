// ============================================================================
// Utility Functions
// ============================================================================
// Common utility functions used throughout the application.

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time duration from seconds to readable format
 * e.g., 3661 seconds -> "1h 1m"
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Truncate text to certain length with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get user role badge color
 */
export const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return '#d32f2f';
    case 'instructor':
      return '#1976d2';
    case 'student':
      return '#388e3c';
    default:
      return '#666';
  }
};

/**
 * Get user role display name
 */
export const getRoleName = (role) => {
  const roleNames = {
    admin: 'Administrator',
    instructor: 'Instructor',
    student: 'Student',
  };
  return roleNames[role] || 'User';
};

/**
 * Get difficulty level color and badge
 */
export const getDifficultyInfo = (difficulty) => {
  const difficultyMap = {
    beginner: { color: '#4caf50', label: 'Beginner' },
    intermediate: { color: '#ff9800', label: 'Intermediate' },
    advanced: { color: '#f44336', label: 'Advanced' },
  };
  return difficultyMap[difficulty] || { color: '#999', label: 'Unknown' };
};

/**
 * Get score status and color
 */
export const getScoreStatus = (score, passingScore = 60) => {
  if (score >= 85) return { status: 'Excellent', color: '#4caf50', message: 'Great job!' };
  if (score >= passingScore) return { status: 'Passed', color: '#2196f3', message: 'Well done!' };
  return { status: 'Failed', color: '#f44336', message: 'Try again' };
};

/**
 * Sleep utility for delays
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Debounce function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Get initials from name
 */
export const getInitials = (fullName) => {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Generate random avatar color
 */
export const getAvatarColor = (name) => {
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#fa709a',
    '#fee140',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Format large numbers with abbreviation
 */
export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
