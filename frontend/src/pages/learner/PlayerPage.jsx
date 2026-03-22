import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getCourseProgress, getMyEnrollments } from "../../api/enrollments";
import {
  getLessonForPlayer,
  markLessonProgress,
  startQuizAttempt,
  submitAnswer,
  completeAttempt,
} from "../../api/player";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  Video,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Download,
  ExternalLink,
  ChevronRight,
  Clock,
  Award,
  Play,
  Loader2,
  Star,
} from "lucide-react";

function LessonTypeIcon({ type, size = 16 }) {
  const icons = {
    VIDEO: <Video size={size} />,
    DOCUMENT: <FileText size={size} />,
    IMAGE: <ImageIcon size={size} />,
    QUIZ: <HelpCircle size={size} />,
  };
  return icons[type] || <FileText size={size} />;
}

/* ─── Quiz UI ────────────────────────────────────── */
function QuizPlayer({ quiz, enrollmentId }) {
  const [attempt, setAttempt] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [score, setScore] = useState(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [attemptError, setAttemptError] = useState(null);

  const questions = quiz?.questions || [];

  const handleStart = async () => {
    setStarting(true);
    setAttemptError(null);
    try {
      const res = await startQuizAttempt(quiz.id);
      setAttempt(res.data.data || res.data);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to start quiz";
      setAttemptError(msg);
    } finally {
      setStarting(false);
    }
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
    } catch {
    } finally {
      setCompleting(false);
    }
  };

  // Not started
  if (!attempt) {
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

  // Score screen
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
        {/* Show per-question results */}
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

  // Active quiz
  const q = questions[currentQ];
  if (!q) return null;

  const allAnswered = questions.every((qq) => answers[qq.id]);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {currentQ + 1} of {questions.length}
        </span>
        <span>{Object.keys(answers).length} answered</span>
      </div>

      {/* Question */}
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

      {/* Navigation */}
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
  );
}

/* ─── Lesson Viewer ──────────────────────────────── */
function LessonViewer({ lesson, enrollmentId }) {
  if (!lesson) return null;

  const { type, videoUrl, fileUrl, quizLesson } = lesson;

  if (type === "VIDEO") {
    // Check for embeddable URLs (YouTube, Drive)
    const getEmbedUrl = (url) => {
      if (!url) return null;
      // YouTube
      const ytMatch = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/
      );
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      // Google Drive
      const driveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
      if (driveMatch)
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      return null;
    };

    const embedUrl = getEmbedUrl(videoUrl);
    return embedUrl ? (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
        <iframe
          src={embedUrl}
          className="h-full w-full"
          allowFullScreen
          title="Video lesson"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    ) : (
      <div className="rounded-lg border border-border p-6 text-center space-y-3">
        <Video size={40} className="mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Video available at:</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          <ExternalLink size={14} />
          Open Video Link
        </a>
      </div>
    );
  }

  if (type === "IMAGE") {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-4">
        <img
          src={fileUrl}
          alt={lesson.title}
          className="max-h-[70vh] rounded-lg object-contain"
        />
      </div>
    );
  }

  if (type === "DOCUMENT") {
    return (
      <div className="h-[70vh] w-full overflow-hidden rounded-lg border border-border flex flex-col items-center justify-center gap-4 bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">Document Preview</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ExternalLink size={16} />
          Open Document
        </a>
      </div>
    );
  }

  if (type === "QUIZ") {
    const quiz = quizLesson?.quiz || quizLesson;
    return quiz ? (
      <QuizPlayer quiz={quiz} enrollmentId={enrollmentId} />
    ) : (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16">
        <HelpCircle size={40} className="text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          Quiz data not available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Unsupported lesson type: {type}
      </p>
    </div>
  );
}

/* ─── Main Player Page ─────────────────────────── */
export default function PlayerPage() {
  const { courseId } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const timerRef = useRef(0);
  const intervalRef = useRef(null);

  // Fetch enrollment + progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const enrollRes = await getMyEnrollments();
        const enrollments = enrollRes.data.data || [];
        const enr = enrollments.find(
          (e) => String(e.courseId) === String(courseId) || String(e.course?.id) === String(courseId)
        );
        if (!enr) {
          setLoading(false);
          return;
        }
        setEnrollment(enr);

        const progRes = await getCourseProgress(enr.id);
        const progData = progRes.data.data || progRes.data;
        setLessons(progData.course?.lessons || []);
        setLessonProgress(progData.lessonProgress || []);

        // Auto-select first lesson
        const firstLesson = progData.course?.lessons?.[0];
        if (firstLesson) {
          setActiveLesson(firstLesson.id);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [courseId]);

  // Load active lesson data
  useEffect(() => {
    if (!activeLesson || !courseId) return;
    setLessonLoading(true);
    getLessonForPlayer(courseId, activeLesson)
      .then((res) => setLessonData(res.data.data || res.data))
      .catch(() => setLessonData(null))
      .finally(() => setLessonLoading(false));
  }, [activeLesson, courseId]);

  // Time-tracking timer
  useEffect(() => {
    timerRef.current = 0;
    intervalRef.current = setInterval(() => {
      timerRef.current += 1;
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [activeLesson]);

  const getProgress = useCallback(
    (lessonId) => lessonProgress.find((p) => p.lessonId === lessonId),
    [lessonProgress]
  );

  const handleMarkComplete = async () => {
    if (!activeLesson || !enrollment) return;
    setMarking(true);
    try {
      await markLessonProgress(activeLesson, {
        isCompleted: true,
        timeSpentSeconds: timerRef.current,
        enrollmentId: enrollment.id,
      });
      // Refresh progress
      const progRes = await getCourseProgress(enrollment.id);
      const progData = progRes.data.data || progRes.data;
      setLessonProgress(progData.lessonProgress || []);
    } catch {
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        <div className="w-72 shrink-0 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="flex-1 rounded-lg" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">
          You are not enrolled in this course
        </p>
        <p className="text-sm text-muted-foreground">
          Please enroll first to access the player
        </p>
      </div>
    );
  }

  const activeLessonProgress = getProgress(activeLesson);
  const isCompleted = activeLessonProgress?.isCompleted;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-lg border border-border">
      {/* Left Sidebar - Lesson List */}
      <aside
        className={`shrink-0 overflow-y-auto border-r border-border bg-muted/30 transition-all ${
          sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        }`}
      >
        <div className="p-3">
          <h2 className="mb-3 text-sm font-semibold text-foreground px-2">
            Lessons
          </h2>
          <nav className="space-y-1">
            {lessons.map((lesson, idx) => {
              const prog = getProgress(lesson.id);
              const isActive = activeLesson === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {/* Completion indicator */}
                  {prog?.isCompleted ? (
                    <CheckCircle2
                      size={16}
                      className={`shrink-0 ${isActive ? "text-primary-foreground" : "text-foreground"}`}
                    />
                  ) : (
                    <Circle
                      size={16}
                      className={`shrink-0 ${isActive ? "text-primary-foreground/60" : "text-muted-foreground/40"}`}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium">
                      {idx + 1}. {lesson.title}
                    </p>
                    <div className={`flex items-center gap-2 text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      <LessonTypeIcon
                        type={lesson.type}
                        size={10}
                      />
                      <span>{lesson.type}</span>
                      {lesson.duration && (
                        <>
                          <span>•</span>
                          <span>{lesson.duration}m</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Right Main Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Toggle sidebar button */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen((p) => !p)}
          >
            {sidebarOpen ? "← Hide Lessons" : "→ Show Lessons"}
          </Button>
          {lessonData && (
            <Badge variant="outline" className="text-xs">
              {lessonData.type}
            </Badge>
          )}
        </div>

        {lessonLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        ) : lessonData ? (
          <div className="space-y-6">
            {/* Lesson Title */}
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {lessonData.title}
              </h1>
              {lessonData.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {lessonData.description}
                </p>
              )}
            </div>

            {/* Lesson Content */}
            <LessonViewer
              lesson={lessonData}
              enrollmentId={enrollment.id}
            />

            <Separator />

            {/* Mark Complete / Timer */}
            <div className="flex flex-wrap items-center gap-3">
              {isCompleted ? (
                <Badge variant="default" className="text-xs">
                  <CheckCircle2 size={12} className="mr-1" />
                  Completed
                </Badge>
              ) : (
                <Button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  size="sm"
                >
                  {marking ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {marking ? "Marking..." : "Mark as Complete"}
                </Button>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                Time tracking active
              </span>
            </div>

            {/* Attachments */}
            {lessonData.attachments?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Attachments
                  </h3>
                  <div className="space-y-2">
                    {lessonData.attachments.map((att, idx) => (
                      <a
                        key={att.id || idx}
                        href={att.fileUrl || att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {att.type === "LINK" ? (
                          <ExternalLink size={14} className="shrink-0" />
                        ) : (
                          <Download size={14} className="shrink-0" />
                        )}
                        <span className="truncate">
                          {att.title || att.fileName || `Attachment ${idx + 1}`}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Play size={40} className="text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Select a lesson to begin
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
