# Adaptive Learning Logic - Technical Deep Dive

## 🧠 Overview

The LMS implements intelligent, adaptive learning that adjusts to each student's performance level. This document explains how the system works.

## 📊 Core Concepts

### 1. Smart Difficulty Adjustment

The system automatically adjusts quiz difficulty based on student performance:

```
Score < 60%   → Set difficulty to "easy"
Score 60-85%  → Set difficulty to "medium"
Score > 85%   → Set difficulty to "hard"
```

**Implementation:**

```javascript
// services/quizService.js
export const calculateAdaptiveDifficulty = (score) => {
  if (score < 60) return 'easy';      // Struggling - needs simpler questions
  if (score >= 85) return 'hard';     // Excelling - needs challenges
  return 'medium';                     // Adequate - continue current level
};

// When submitting quiz:
const difficulty = calculateAdaptiveDifficulty(score);
await submitQuizAttempt({
  // ... other data
  adaptive_difficulty: difficulty
});
```

### 2. Weak Area Detection

When a student scores below 60% on a quiz:
1. The topic is identified as weak
2. Module is added to revision list
3. Student receives revision recommendation
4. System tracks improvements

**Implementation:**

```javascript
// services/quizService.js
export const markWeakArea = async (studentId, moduleId, topicName, score) => {
  // Check if already marked as weak
  const { data: existing } = await supabase
    .from('weak_areas')
    .select('id')
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
    .single();

  if (existing) {
    // Update with new score
    return await supabase
      .from('weak_areas')
      .update({
        score,
        last_attempt_at: new Date().toISOString(),
        revision_recommended: true,  // Flag for recommendation
      })
      .eq('id', existing.id);
  } else {
    // Create new weak area entry
    return await supabase
      .from('weak_areas')
      .insert([{
        student_id,
        module_id,
        topic_name: topicName,
        score,
        revision_recommended: true
      }]);
  }
};

// Usage in quiz submission:
if (score < 60) {
  await markWeakArea(
    studentId,
    moduleId,
    'JavaScript Functions',
    score
  );
}
```

### 3. Advanced Content Unlock

When a student scores > 85%, they unlock advanced content:

```javascript
export const checkUnlockAdvancedContent = async (studentId, moduleId, score) => {
  if (score >= 85) {
    // Mark advanced content as unlocked
    await supabase
      .from('preferences')
      .update({
        advanced_content_unlocked: true
      })
      .eq('student_id', studentId)
      .eq('module_id', moduleId);

    return true; // Content unlocked
  }
  return false;
};
```

## 📈 Learning Path Algorithm

### Algorithm Flow

```
1. Student takes quiz
   ↓
2. System calculates score
   ↓
3. Check score thresholds:
   ├─ If < 60%: Mark weak area, recommend revision
   ├─ If 60-85%: Continue with medium difficulty
   └─ If > 85%: Unlock advanced content, increase difficulty
   ↓
4. Update student profile with new level
   ↓
5. Generate next quiz with appropriate difficulty
   ↓
6. Send recommendations to student
```

### Difficulty Question Selection

```javascript
// When fetching next quiz, filter by difficulty:

export const fetchAdaptiveQuiz = async (moduleId, studentId) => {
  // Get student's last attempt
  const { data: lastAttempt } = await supabase
    .from('quiz_attempts')
    .select('adaptive_difficulty')
    .eq('student_id', studentId)
    .order('attempted_at', { ascending: false })
    .limit(1)
    .single();

  const difficulty = lastAttempt?.adaptive_difficulty || 'medium';

  // Fetch quiz questions at this difficulty
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('difficulty', difficulty)
    .order('order_index');

  return questions;
};
```

## 🎯 Recommendation Engine

### Weak Area Recommendations

The system recommends specific topics for review:

```javascript
export const getRecommendations = async (studentId) => {
  // Get weak areas
  const { data: weakAreas } = await supabase
    .from('weak_areas')
    .select(`
      *,
      modules (title, course_id),
      courses (title)
    `)
    .eq('student_id', studentId)
    .eq('revision_recommended', true)
    .order('score', { ascending: true })  // Lowest scores first
    .limit(5);

  // Build recommendations
  return weakAreas.map(area => ({
    id: area.id,
    priority: 'high' if area.score < 40 else 'medium',
    action: `Review ${area.topic_name} in ${area.modules.title}`,
    estimatedTime: 30, // minutes
    course: area.courses.title,
    module: area.modules.title
  }));
};
```

### Next Steps Recommendation

Based on performance, suggest next course:

```javascript
export const getNextCourseRecommendation = async (studentId, completedCourseId) => {
  // Get completed course info
  const { data: completedCourse } = await supabase
    .from('courses')
    .select('category, difficulty_level')
    .eq('id', completedCourseId)
    .single();

  // Find next level courses in same category
  const nextDifficulty = {
    beginner: 'intermediate',
    intermediate: 'advanced',
    advanced: 'advanced'
  }[completedCourse.difficulty_level];

  // Fetch recommended course
  const { data: nextCourse } = await supabase
    .from('courses')
    .select('*')
    .eq('category', completedCourse.category)
    .eq('difficulty_level', nextDifficulty)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    courseId: nextCourse.id,
    courseName: nextCourse.title,
    reason: `You've mastered ${completedCourse.title}. Try this next!`
  };
};
```

## 📊 Performance Tracking

### Student Performance Metrics

```javascript
export const getStudentPerformanceMetrics = async (studentId) => {
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('score, attempted_at, difficulty')
    .eq('student_id', studentId)
    .order('attempted_at');

  // Calculate metrics
  const metrics = {
    averageScore: avg(attempts.map(a => a.score)),
    bestScore: max(attempts.map(a => a.score)),
    worstScore: min(attempts.map(a => a.score)),
    improvementTrend: calculateTrend(attempts),
    totalAttempts: attempts.length,
    difficultyProgression: {
      easy: attempts.filter(a => a.difficulty === 'easy').length,
      medium: attempts.filter(a => a.difficulty === 'medium').length,
      hard: attempts.filter(a => a.difficulty === 'hard').length
    }
  };

  return metrics;
};
```

### Improvement Tracking

```javascript
export const calculateImprovement = async (studentId, moduleId) => {
  // Get all attempts for this module
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('score, attempted_at')
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
    .order('attempted_at');

  if (attempts.length < 2) return null;

  // Calculate improvement percentage
  const firstScore = attempts[0].score;
  const lastScore = attempts[attempts.length - 1].score;
  const improvement = ((lastScore - firstScore) / firstScore) * 100;

  return {
    initialScore: firstScore,
    currentScore: lastScore,
    improvementPercent: improvement,
    attemptCount: attempts.length,
    status: improvement > 0 ? '📈 Improving' : improvement < 0 ? '📉 Needs Review' : '✓ Stable'
  };
};
```

## 🎓 Integration in Dashboard

### Dashboard Analytics

```jsx
// pages/student/StudentDashboard.jsx
import { getStudentPerformanceMetrics, calculateImprovement } from '@/services/adaptiveService';

export default function StudentDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [improvements, setImprovements] = useState({});

  useEffect(() => {
    const loadAdaptiveData = async () => {
      // Get performance metrics
      const perf = await getStudentPerformanceMetrics(userId);
      setMetrics(perf);

      // Get improvements by module
      for (let moduleId of enrolledModules) {
        const imp = await calculateImprovement(userId, moduleId);
        setImprovements(prev => ({
          ...prev,
          [moduleId]: imp
        }));
      }
    };

    loadAdaptiveData();
  }, [userId]);

  return (
    <div className="dashboard">
      <section className="performance-overview">
        <h2>Your Performance</h2>
        <div className="metrics">
          <MetricCard
            label="Average Score"
            value={`${metrics?.averageScore}%`}
            icon="📊"
          />
          <MetricCard
            label="Improvement Trend"
            value={metrics?.improvementTrend > 0 ? '📈 Up' : '📉 Down'}
            icon="📈"
          />
          <MetricCard
            label="Difficulty Level"
            value={metrics?.currentDifficulty}
            icon="🎯"
          />
        </div>
      </section>

      <section className="module-progress">
        <h2>Module Progress</h2>
        {Object.entries(improvements).map(([moduleId, imp]) => (
          <div key={moduleId} className="improvement-card">
            <h3>{moduleName}</h3>
            <p>{imp.status} ({imp.improvementPercent. toFixed(1)}%)</p>
            <div className="score-progression">
              {imp.initialScore} → {imp.currentScore}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
```

## 🔄 Continuous Improvement Loop

### Algorithm Cycle

```
Week 1:
├─ Student takes quizzes (difficulty: medium)
├─ System analyzes performance
└─ Difficulty adjusted for Week 2

Week 2:
├─ New quiz set at adjusted difficulty
├─ Weak areas identified
├─ Recommendations generated
└─ System ready for Week 3

...Loop continues
```

## 📈 Analytics & Reporting

### Generate Performance Report

```javascript
export const generatePerformanceReport = async (studentId) => {
  const metrics = await getStudentPerformanceMetrics(studentId);
  const weakAreas = await fetchWeakAreas(studentId);
  const recommendations = await getRecommendations(studentId);

  return {
    student: studentId,
    generatedAt: new Date(),
    summary: {
      averageScore: metrics.averageScore,
      totalAttempts: metrics.totalAttempts,
      currentLevel: metrics.currentDifficulty,
      improvementTrend: metrics.improvementTrend
    },
    weakAreas: weakAreas.map(area => ({
      topic: area.topic_name,
      score: area.score,
      lastAttempt: area.last_attempt_at
    })),
    recommendations: recommendations.map(rec => ({
      action: rec.action,
      priority: rec.priority,
      estimatedTime: rec.estimatedTime
    }))
  };
};
```

## 🚀 Advanced Features (Future)

- Machine learning for personalized learning paths
- Predictive difficulty adjustment
- Peer comparison and collaborative learning
- AI-powered content recommendations
- Natural language processing for essay grading
- Spaced repetition algorithm
- Gamification based on performance

---

This adaptive learning system helps students learn at their own pace while maintaining engagement and motivation. The system continuously learns from student performance to provide optimal learning experiences.
