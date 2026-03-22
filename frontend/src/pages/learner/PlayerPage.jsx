import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getCourseProgress, getMyEnrollments } from "../../api/enrollments";
import { getLessonForPlayer, markLessonProgress } from "../../api/player";
import LessonTypeIcon from "../../components/player/LessonTypeIcon";
import LessonViewer from "../../components/player/LessonViewer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
} from "lucide-react";

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

  useEffect(() => {
    if (!activeLesson || !courseId) return;
    setLessonLoading(true);
    getLessonForPlayer(courseId, activeLesson)
      .then((res) => setLessonData(res.data.data || res.data))
      .catch(() => setLessonData(null))
      .finally(() => setLessonLoading(false));
  }, [activeLesson, courseId]);

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

      <main className="flex-1 overflow-y-auto p-6">
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

            <LessonViewer
              lesson={lessonData}
              enrollmentId={enrollment.id}
            />

            <Separator />

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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted-foreground">Select a lesson to begin</p>
          </div>
        )}
      </main>
    </div>
  );
}
