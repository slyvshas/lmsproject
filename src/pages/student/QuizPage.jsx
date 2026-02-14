// ============================================================================
// Quiz Page — Student Quiz Taking Experience
// ============================================================================
// Full quiz experience with question navigation, timer, score breakdown,
// adaptive difficulty feedback, and review mode.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchQuizDetails, submitQuizAttempt, recordStudentAnswer, calculateAdaptiveDifficulty, markWeakArea } from '../../services/quizService';

// ============================================================================
// Inline Styles
// ============================================================================
const styles = {
  // Page container
  quizPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    padding: '2rem',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Loading state
  quizLoading: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    gap: '1rem',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(99, 102, 241, 0.2)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // Error state
  quizError: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    gap: '1rem',
    padding: '2rem',
    textAlign: 'center',
  },
  errorButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },

  // Header
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  quizHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  quizHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  btnExitQuiz: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#fff',
  },
  quizTimer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'monospace',
    fontSize: '1rem',
  },
  quizProgressText: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },

  // Progress bar
  quizProgressBar: {
    width: '100%',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    marginBottom: '2rem',
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },

  // Quiz body
  quizBody: {
    maxWidth: '800px',
    margin: '0 auto',
  },

  // Question dots
  questionDots: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  questionDot: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(30, 30, 60, 0.8)',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionDotActive: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #6366f1',
    background: 'rgba(99, 102, 241, 0.3)',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
  },
  questionDotAnswered: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #22c55e',
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Question card
  questionCard: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '1.5rem',
  },
  questionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  questionNumber: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  questionDifficulty: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  difficultyEasy: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
  },
  difficultyMedium: {
    background: 'rgba(234, 179, 8, 0.2)',
    color: '#eab308',
  },
  difficultyHard: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
  },
  questionText: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#fff',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },

  // Answer options
  answerOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  answerOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    color: '#fff',
    fontSize: '1rem',
    width: '100%',
  },
  answerOptionSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '2px solid #6366f1',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    color: '#fff',
    fontSize: '1rem',
    width: '100%',
    boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
  },
  answerLetter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    fontWeight: '600',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  answerLetterSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    fontWeight: '600',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  answerText: {
    flex: 1,
    lineHeight: '1.4',
  },
  answerCheck: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: '1.2rem',
  },

  // Navigation
  questionNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  btnQPrev: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  btnQPrevDisabled: {
    background: 'rgba(30, 30, 60, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(148, 163, 184, 0.4)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontSize: '1rem',
  },
  btnQNext: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  btnSubmitQuiz: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  btnSubmitQuizDisabled: {
    background: 'rgba(34, 197, 94, 0.4)',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontSize: '1rem',
    fontWeight: '600',
  },

  // Results page
  quizResults: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '2rem 0',
  },
  scoreCircle: {
    position: 'relative',
    width: '180px',
    height: '180px',
    margin: '0 auto 2rem',
  },
  scoreSvg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  scoreTrack: {
    fill: 'none',
    stroke: 'rgba(255, 255, 255, 0.1)',
    strokeWidth: '8',
  },
  scoreProgressPassed: {
    fill: 'none',
    stroke: 'url(#passedGradient)',
    strokeWidth: '8',
    strokeLinecap: 'round',
    transition: 'stroke-dasharray 1s ease',
  },
  scoreProgressFailed: {
    fill: 'none',
    stroke: '#ef4444',
    strokeWidth: '8',
    strokeLinecap: 'round',
    transition: 'stroke-dasharray 1s ease',
  },
  scoreValue: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  scoreLabelPassed: {
    fontSize: '0.9rem',
    color: '#22c55e',
    fontWeight: '500',
  },
  scoreLabelFailed: {
    fontSize: '0.9rem',
    color: '#ef4444',
    fontWeight: '500',
  },
  resultsTitle: {
    fontSize: '2rem',
    margin: '0 0 0.5rem',
    color: '#fff',
  },
  resultsSubtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },

  // Result stats
  resultsStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  resultStat: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statNum: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Results actions
  resultsActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnReview: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  btnRetry: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  btnBackCourse: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#94a3b8',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  },

  // Review mode
  quizReview: {
    maxWidth: '800px',
    margin: '3rem auto 0',
    textAlign: 'left',
  },
  reviewTitle: {
    fontSize: '1.5rem',
    color: '#fff',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  reviewQuestion: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  reviewQuestionCorrect: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    borderLeft: '4px solid #22c55e',
  },
  reviewQuestionIncorrect: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    borderLeft: '4px solid #ef4444',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  reviewNum: {
    fontWeight: '600',
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  reviewBadgeCorrect: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  reviewBadgeIncorrect: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  reviewText: {
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  reviewAnswers: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  reviewAnswer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '0.95rem',
  },
  reviewAnswerCorrect: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'rgba(34, 197, 94, 0.15)',
    borderRadius: '8px',
    color: '#22c55e',
    fontSize: '0.95rem',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  reviewAnswerWrong: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'rgba(239, 68, 68, 0.15)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.95rem',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  reviewIndicator: {
    fontWeight: '600',
    width: '20px',
    textAlign: 'center',
  },
};

// Keyframe animation for spinner (added via style tag)
const spinnerKeyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz-taking state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});      // { questionId: answerId }
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results state
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);

  const timerRef = useRef(null);

  // Load quiz
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetchQuizDetails(quizId);
        if (res.error || !res.data) {
          setError('Quiz not found');
          return;
        }
        // Sort questions by order_index
        const data = res.data;
        if (data.quiz_questions) {
          data.quiz_questions.sort((a, b) => a.order_index - b.order_index);
          data.quiz_questions.forEach((q) => {
            if (q.quiz_answers) q.quiz_answers.sort((a, b) => a.order_index - b.order_index);
          });
        }
        setQuiz(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (!submitted && quiz) {
      timerRef.current = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quiz, submitted]);

  const questions = quiz?.quiz_questions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const question = questions[currentQuestion];

  // Select answer
  const selectAnswer = useCallback((questionId, answerId) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  }, [submitted]);

  // Navigate questions
  const goToQuestion = (index) => setCurrentQuestion(index);
  const goNext = () => currentQuestion < totalQuestions - 1 && setCurrentQuestion((i) => i + 1);
  const goPrev = () => currentQuestion > 0 && setCurrentQuestion((i) => i - 1);

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (answeredCount < totalQuestions) {
      const unanswered = totalQuestions - answeredCount;
      if (!window.confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) return;
    }

    try {
      setIsSubmitting(true);
      clearInterval(timerRef.current);

      // Calculate score
      let correctCount = 0;
      const questionResults = questions.map((q) => {
        const selectedId = answers[q.id];
        const correctAnswer = q.quiz_answers.find((a) => a.is_correct);
        const isCorrect = selectedId === correctAnswer?.id;
        if (isCorrect) correctCount++;
        return {
          questionId: q.id,
          questionText: q.question_text,
          selectedAnswerId: selectedId,
          correctAnswerId: correctAnswer?.id,
          isCorrect,
          answers: q.quiz_answers,
        };
      });

      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = score >= (quiz.passing_score || 70);

      // Submit attempt to DB
      const attemptData = {
        quiz_id: quizId,
        student_id: userProfile.id,
        score,
        correct_answers: correctCount,
        total_questions: totalQuestions,
        time_taken_seconds: timeElapsed,
        passed,
      };

      const attemptRes = await submitQuizAttempt(attemptData);

      // Record individual answers
      if (attemptRes.data) {
        for (const qr of questionResults) {
          if (qr.selectedAnswerId) {
            await recordStudentAnswer({
              attempt_id: attemptRes.data.id,
              question_id: qr.questionId,
              selected_answer_id: qr.selectedAnswerId,
              is_correct: qr.isCorrect,
            });
          }
        }
      }

      // If failed, mark weak area
      if (!passed && quiz.module_id) {
        const difficulty = calculateAdaptiveDifficulty(score);
        await markWeakArea(userProfile.id, quiz.module_id, quiz.title, score);
      }

      setResults({
        score,
        correctCount,
        totalQuestions,
        passed,
        passingScore: quiz.passing_score || 70,
        questions: questionResults,
        timeElapsed,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, answeredCount, totalQuestions, questions, answers, quiz, quizId, userProfile, timeElapsed]);

  // Format time
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Get difficulty style
  const getDifficultyStyle = (difficulty) => {
    const base = styles.questionDifficulty;
    switch (difficulty?.toLowerCase()) {
      case 'easy': return { ...base, ...styles.difficultyEasy };
      case 'medium': return { ...base, ...styles.difficultyMedium };
      case 'hard': return { ...base, ...styles.difficultyHard };
      default: return base;
    }
  };

  // Get question dot style
  const getQuestionDotStyle = (index, questionId) => {
    if (index === currentQuestion) return styles.questionDotActive;
    if (answers[questionId]) return styles.questionDotAnswered;
    return styles.questionDot;
  };

  // Get review answer style
  const getReviewAnswerStyle = (answerId, correctAnswerId, selectedAnswerId, isCorrect) => {
    if (answerId === correctAnswerId) return styles.reviewAnswerCorrect;
    if (answerId === selectedAnswerId && !isCorrect) return styles.reviewAnswerWrong;
    return styles.reviewAnswer;
  };

  // ── Loading & Error ──
  if (isLoading) {
    return (
      <div style={styles.quizLoading}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.loadingSpinner} />
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.quizError}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button style={styles.errorButton} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  // ── Results View ──
  if (submitted && results) {
    return (
      <div style={styles.quizPage}>
        <div style={styles.quizResults}>
          {/* Score Circle */}
          <div style={styles.scoreCircle}>
            <svg viewBox="0 0 120 120" style={styles.scoreSvg}>
              <defs>
                <linearGradient id="passedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="54" style={styles.scoreTrack} />
              <circle
                cx="60" cy="60" r="54"
                style={results.passed ? styles.scoreProgressPassed : styles.scoreProgressFailed}
                strokeDasharray={`${(results.score / 100) * 339.292} 339.292`}
              />
            </svg>
            <div style={styles.scoreValue}>
              <span style={styles.scoreNumber}>{results.score}%</span>
              <span style={results.passed ? styles.scoreLabelPassed : styles.scoreLabelFailed}>
                {results.passed ? 'Passed!' : 'Try Again'}
              </span>
            </div>
          </div>

          <h1 style={styles.resultsTitle}>{results.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}</h1>
          <p style={styles.resultsSubtitle}>
            You answered {results.correctCount} out of {results.totalQuestions} questions correctly.
            {!results.passed && ` You need ${results.passingScore}% to pass.`}
          </p>

          {/* Stats */}
          <div style={styles.resultsStats}>
            <div style={styles.resultStat}>
              <span style={styles.statNum}>{results.correctCount}</span>
              <span style={styles.statLabel}>Correct</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.statNum}>{results.totalQuestions - results.correctCount}</span>
              <span style={styles.statLabel}>Wrong</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.statNum}>{formatTime(results.timeElapsed)}</span>
              <span style={styles.statLabel}>Time</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.statNum}>{results.passingScore}%</span>
              <span style={styles.statLabel}>Passing</span>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.resultsActions}>
            <button style={styles.btnReview} onClick={() => setReviewMode(true)}>
              📝 Review Answers
            </button>
            <button style={styles.btnRetry} onClick={() => window.location.reload()}>
              🔄 Try Again
            </button>
            <button style={styles.btnBackCourse} onClick={() => navigate(-1)}>
              ← Back to Course
            </button>
          </div>
        </div>

        {/* Review Mode */}
        {reviewMode && (
          <div style={styles.quizReview}>
            <h2 style={styles.reviewTitle}>Answer Review</h2>
            {results.questions.map((qr, qi) => (
              <div key={qr.questionId} style={qr.isCorrect ? styles.reviewQuestionCorrect : styles.reviewQuestionIncorrect}>
                <div style={styles.reviewHeader}>
                  <span style={styles.reviewNum}>Q{qi + 1}</span>
                  <span style={qr.isCorrect ? styles.reviewBadgeCorrect : styles.reviewBadgeIncorrect}>
                    {qr.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                <p style={styles.reviewText}>{qr.questionText}</p>
                <div style={styles.reviewAnswers}>
                  {qr.answers.map((a) => (
                    <div
                      key={a.id}
                      style={getReviewAnswerStyle(a.id, qr.correctAnswerId, qr.selectedAnswerId, qr.isCorrect)}
                    >
                      <span style={styles.reviewIndicator}>
                        {a.id === qr.correctAnswerId ? '✓' : a.id === qr.selectedAnswerId ? '✗' : '○'}
                      </span>
                      {a.answer_text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Quiz Taking View ──
  return (
    <div style={styles.quizPage}>
      {/* Header */}
      <div style={styles.quizHeader}>
        <div style={styles.quizHeaderLeft}>
          <button style={styles.btnExitQuiz} onClick={() => navigate(-1)}>← Exit</button>
          <h1 style={styles.headerTitle}>{quiz.title}</h1>
        </div>
        <div style={styles.quizHeaderRight}>
          <span style={styles.quizTimer}>⏱ {formatTime(timeElapsed)}</span>
          <span style={styles.quizProgressText}>{answeredCount}/{totalQuestions} answered</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.quizProgressBar}>
        <div style={{ ...styles.quizProgressFill, width: `${(answeredCount / totalQuestions) * 100}%` }} />
      </div>

      {/* Question Area */}
      <div style={styles.quizBody}>
        {/* Question Navigation Dots */}
        <div style={styles.questionDots}>
          {questions.map((q, i) => (
            <button
              key={q.id}
              style={getQuestionDotStyle(i, q.id)}
              onClick={() => goToQuestion(i)}
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current Question */}
        {question && (
          <div style={styles.questionCard}>
            <div style={styles.questionMeta}>
              <span style={styles.questionNumber}>Question {currentQuestion + 1} of {totalQuestions}</span>
              {question.difficulty && (
                <span style={getDifficultyStyle(question.difficulty)}>
                  {question.difficulty}
                </span>
              )}
            </div>

            <h2 style={styles.questionText}>{question.question_text}</h2>

            <div style={styles.answerOptions}>
              {(question.quiz_answers || []).map((answer, ai) => {
                const isSelected = answers[question.id] === answer.id;
                const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                return (
                  <button
                    key={answer.id}
                    style={isSelected ? styles.answerOptionSelected : styles.answerOption}
                    onClick={() => selectAnswer(question.id, answer.id)}
                  >
                    <span style={isSelected ? styles.answerLetterSelected : styles.answerLetter}>
                      {letters[ai] || ai + 1}
                    </span>
                    <span style={styles.answerText}>{answer.answer_text}</span>
                    {isSelected && <span style={styles.answerCheck}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={styles.questionNav}>
          <button 
            style={currentQuestion === 0 ? styles.btnQPrevDisabled : styles.btnQPrev} 
            onClick={goPrev} 
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>
          {currentQuestion < totalQuestions - 1 ? (
            <button style={styles.btnQNext} onClick={goNext}>
              Next →
            </button>
          ) : (
            <button
              style={isSubmitting ? styles.btnSubmitQuizDisabled : styles.btnSubmitQuiz}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : '✓ Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
