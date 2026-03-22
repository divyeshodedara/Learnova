import { useState, useCallback } from "react";
import {
  startQuizAttempt,
  submitAnswer,
  completeAttempt,
} from "../../api/player";
import QuizGuard from "../../components/quiz/QuizGuard";
import { Button } from "../../components/ui/button";
import {
  HelpCircle,
  ChevronRight,
  Award,
  Play,
  Loader2,
  Star,
} from "lucide-react";

export default function QuizPlayer({ quiz, enrollmentId }) {
  const [attempt, setAttempt] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [score, setScore] = useState(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [attemptError, setAttemptError] = useState(null);
  const [violated, setViolated] = useState(false);
  const [guardActive, setGuardActive] = useState(false);

  const questions = quiz?.questions || [];

  const handleViolation = useCallback(async () => {
    setViolated(true);
    setGuardActive(false);
    try {
      if (attempt) {
        await completeAttempt(attempt.id).catch(() => {});
      }
      for (let i = 0; i < 3; i++) {
        try {
          const res = await startQuizAttempt(quiz.id);
          const a = res.data.data || res.data;
          await completeAttempt(a.id).catch(() => {});
        } catch {
          break;
        }
      }
    } catch {}
    setAttemptError("Quiz terminated: Anti-cheat violation detected. All attempts have been used.");
    setAttempt(null);
    setScore(null);
  }, [attempt, quiz?.id]);

  const handleGuardReady = useCallback(async () => {
    setStarting(true);
    setAttemptError(null);
    try {
      const res = await startQuizAttempt(quiz.id);
      setAttempt(res.data.data || res.data);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to start quiz";
      setAttemptError(msg);
      setGuardActive(false);
    } finally {
      setStarting(false);
    }
  }, [quiz?.id]);

  const handleStart = () => {
    setGuardActive(true);
  };

  const handleAnswer = async (questionId, optionId) => {
    if (!attempt) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setSubmitting(true);
    try {
      const res = await submitAnswer(attempt.id, {
        questionId,
        selectedOptionId: optionId,
      });
      setResults((prev) => ({
        ...prev,
        [questionId]: res.data.data?.isCorrect ?? res.data.isCorrect,
      }));
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!attempt) return;
    setCompleting(true);
    try {
      const res = await completeAttempt(attempt.id);
      setScore(res.data.data || res.data);
      setGuardActive(false);
    } catch {
    } finally {
      setCompleting(false);
    }
  };

  if (!attempt) {
    if (guardActive) {
      return (
        <QuizGuard active={true} onViolation={handleViolation} onReady={handleGuardReady}>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Starting quiz...</p>
          </div>
        </QuizGuard>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 space-y-4">
        <HelpCircle size={48} className="text-muted-foreground/40" />
        <p className="text-lg font-medium text-foreground">
          {quiz?.title || "Quiz"}
        </p>
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>
        {attemptError ? (
          <p className="text-sm text-destructive font-medium">{attemptError}</p>
        ) : (
          <Button onClick={handleStart} disabled={starting}>
            {starting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            {starting ? "Starting..." : "Start Quiz"}
          </Button>
        )}
      </div>
    );
  }

  if (score) {
    const correct = Object.values(results).filter(Boolean).length;
    const scorePercent = score.score != null ? Math.round(score.score) : null;
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 space-y-4">
        <Award size={48} className="text-foreground" />
        <p className="text-2xl font-bold text-foreground">Quiz Complete!</p>
        <p className="text-lg text-muted-foreground">
          Score:{" "}
          <span className="font-semibold text-foreground">
            {correct}/{questions.length}
          </span>
          {scorePercent !== null && (
            <span className="ml-2 text-sm">({scorePercent}%)</span>
          )}
        </p>
        {score.pointsEarned > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2">
              <Star size={18} className="text-yellow-500" />
              <span className="font-semibold text-yellow-700 dark:text-yellow-400">+{score.pointsEarned} Points Earned!</span>
            </div>
            {scorePercent !== null && (
              <p className="text-xs text-muted-foreground">Points based on your {scorePercent}% score</p>
            )}
          </div>
        )}
        {score.pointsEarned === 0 && scorePercent != null && (
          <p className="text-xs text-muted-foreground">Score higher to earn points!</p>
        )}
        <div className="w-full max-w-lg space-y-3 pt-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={`rounded-lg border p-3 text-sm ${
                results[q.id]
                  ? "border-foreground/20 bg-muted/50"
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <span className="font-medium text-foreground">
                Q{idx + 1}: {q.text}
              </span>
              <span className="ml-2 text-xs">
                {results[q.id] ? "✓ Correct" : "✗ Incorrect"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  const allAnswered = questions.every((qq) => answers[qq.id]);

  return (
    <QuizGuard active={guardActive} onViolation={handleViolation} onReady={handleGuardReady}>
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {currentQ + 1} of {questions.length}
        </span>
        <span>{Object.keys(answers).length} answered</span>
      </div>

      <div className="rounded-lg border border-border p-6 space-y-4">
        <p className="text-base font-medium text-foreground">{q.text}</p>
        <div className="space-y-2">
          {(q.options || []).map((opt) => {
            const isSelected = answers[q.id] === opt.id;
            const hasResult = results[q.id] !== undefined;
            return (
              <button
                key={opt.id}
                onClick={() => !hasResult && handleAnswer(q.id, opt.id)}
                disabled={hasResult || submitting}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${
                  isSelected
                    ? hasResult
                      ? results[q.id]
                        ? "border-foreground bg-muted"
                        : "border-destructive/50 bg-destructive/5"
                      : "border-foreground bg-muted"
                    : "border-border hover:bg-muted/50"
                } disabled:cursor-not-allowed`}
              >
                {opt.text}
                {isSelected && hasResult && (
                  <span className="ml-2 text-xs font-medium">
                    {results[q.id] ? "✓" : "✗"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
          disabled={currentQ === 0}
        >
          Previous
        </Button>
        {currentQ < questions.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setCurrentQ((p) => p + 1)}
          >
            Next
            <ChevronRight size={14} />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleComplete}
            disabled={!allAnswered || completing}
          >
            {completing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Award size={14} />
            )}
            {completing ? "Submitting..." : "Complete Quiz"}
          </Button>
        )}
      </div>
    </div>
    </QuizGuard>
  );
}
