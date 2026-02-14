// ============================================================================
// Quiz Page — Student Quiz Taking Experience
// ============================================================================
// Full quiz experience with question navigation, timer, score breakdown,
// adaptive difficulty feedback, and review mode.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchQuizDetails, submitQuizAttempt, recordStudentAnswer, calculateAdaptiveDifficulty, markWeakArea } from '../../services/quizService';
import '../styles/QuizPage.module.css';

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

  // ── Loading & Error ──
  if (isLoading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner" />
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  // ── Results View ──
  if (submitted && results) {
    return (
      <div className="quiz-page">
        <div className="quiz-results">
          {/* Score Circle */}
          <div className={`score-circle ${results.passed ? 'passed' : 'failed'}`}>
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle cx="60" cy="60" r="54" className="score-track" />
              <circle
                cx="60" cy="60" r="54"
                className="score-progress"
                strokeDasharray={`${(results.score / 100) * 339.292} 339.292`}
              />
            </svg>
            <div className="score-value">
              <span className="score-number">{results.score}%</span>
              <span className="score-label">{results.passed ? 'Passed!' : 'Try Again'}</span>
            </div>
          </div>

          <h1>{results.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}</h1>
          <p className="results-subtitle">
            You answered {results.correctCount} out of {results.totalQuestions} questions correctly.
            {!results.passed && ` You need ${results.passingScore}% to pass.`}
          </p>

          {/* Stats */}
          <div className="results-stats">
            <div className="result-stat">
              <span className="stat-num">{results.correctCount}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="result-stat">
              <span className="stat-num">{results.totalQuestions - results.correctCount}</span>
              <span className="stat-label">Wrong</span>
            </div>
            <div className="result-stat">
              <span className="stat-num">{formatTime(results.timeElapsed)}</span>
              <span className="stat-label">Time</span>
            </div>
            <div className="result-stat">
              <span className="stat-num">{results.passingScore}%</span>
              <span className="stat-label">Passing</span>
            </div>
          </div>

          {/* Actions */}
          <div className="results-actions">
            <button className="btn-review" onClick={() => setReviewMode(true)}>
              📝 Review Answers
            </button>
            <button className="btn-retry" onClick={() => window.location.reload()}>
              🔄 Try Again
            </button>
            <button className="btn-back-course" onClick={() => navigate(-1)}>
              ← Back to Course
            </button>
          </div>
        </div>

        {/* Review Mode */}
        {reviewMode && (
          <div className="quiz-review">
            <h2>Answer Review</h2>
            {results.questions.map((qr, qi) => (
              <div key={qr.questionId} className={`review-question ${qr.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="review-header">
                  <span className="review-num">Q{qi + 1}</span>
                  <span className={`review-badge ${qr.isCorrect ? 'correct' : 'incorrect'}`}>
                    {qr.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                <p className="review-text">{qr.questionText}</p>
                <div className="review-answers">
                  {qr.answers.map((a) => (
                    <div
                      key={a.id}
                      className={`review-answer
                        ${a.id === qr.correctAnswerId ? 'is-correct' : ''}
                        ${a.id === qr.selectedAnswerId && !qr.isCorrect ? 'is-wrong' : ''}
                        ${a.id === qr.selectedAnswerId ? 'is-selected' : ''}
                      `}
                    >
                      <span className="review-indicator">
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
    <div className="quiz-page">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-header-left">
          <button className="btn-exit-quiz" onClick={() => navigate(-1)}>← Exit</button>
          <h1>{quiz.title}</h1>
        </div>
        <div className="quiz-header-right">
          <span className="quiz-timer">⏱ {formatTime(timeElapsed)}</span>
          <span className="quiz-progress-text">{answeredCount}/{totalQuestions} answered</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} />
      </div>

      {/* Question Area */}
      <div className="quiz-body">
        {/* Question Navigation Dots */}
        <div className="question-dots">
          {questions.map((q, i) => (
            <button
              key={q.id}
              className={`question-dot 
                ${i === currentQuestion ? 'active' : ''} 
                ${answers[q.id] ? 'answered' : ''}
              `}
              onClick={() => goToQuestion(i)}
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current Question */}
        {question && (
          <div className="question-card">
            <div className="question-meta">
              <span className="question-number">Question {currentQuestion + 1} of {totalQuestions}</span>
              {question.difficulty && (
                <span className={`question-difficulty ${question.difficulty}`}>
                  {question.difficulty}
                </span>
              )}
            </div>

            <h2 className="question-text">{question.question_text}</h2>

            <div className="answer-options">
              {(question.quiz_answers || []).map((answer, ai) => {
                const isSelected = answers[question.id] === answer.id;
                const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                return (
                  <button
                    key={answer.id}
                    className={`answer-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectAnswer(question.id, answer.id)}
                  >
                    <span className="answer-letter">{letters[ai] || ai + 1}</span>
                    <span className="answer-text">{answer.answer_text}</span>
                    {isSelected && <span className="answer-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="question-nav">
          <button className="btn-q-prev" onClick={goPrev} disabled={currentQuestion === 0}>
            ← Previous
          </button>
          {currentQuestion < totalQuestions - 1 ? (
            <button className="btn-q-next" onClick={goNext}>
              Next →
            </button>
          ) : (
            <button
              className="btn-submit-quiz"
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
