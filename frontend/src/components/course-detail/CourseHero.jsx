import { BookOpen, Users, Clock, Lock } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import StarRating from "./StarRating";
import LessonTypeIcon from "../player/LessonTypeIcon";

export default function CourseHero({ course, avgRating }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-muted">
      <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex flex-wrap gap-2">
            {course.tags?.map((t, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {t.tag?.name || t.name || t}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {course.title}
          </h1>
          <p className="text-base text-muted-foreground">
            {course.shortDesc}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users size={15} />
              {course._count?.enrollments || 0} enrolled
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={15} />
              {course._count?.lessons || 0} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <StarRating rating={avgRating} size={14} />
              <span className="ml-0.5">
                {avgRating ? Number(avgRating).toFixed(1) : "No ratings"}
              </span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            by{" "}
            <span className="font-medium text-foreground">
              {course.createdBy?.firstName} {course.createdBy?.lastName}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-center">
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="max-h-64 w-full rounded-lg object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-lg border border-border bg-background">
              <BookOpen size={56} className="text-muted-foreground/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LessonList({ lessons, enrollment }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        Lessons ({lessons?.length || 0})
      </h2>
      <div className="space-y-2">
        {(lessons || []).map((lesson, idx) => (
          <div
            key={lesson.id || idx}
            className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {idx + 1}
            </span>
            <LessonTypeIcon type={lesson.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {lesson.title}
              </p>
              {lesson.duration && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={11} />
                  {lesson.duration} min
                </p>
              )}
            </div>
            {!enrollment && (
              <Lock size={14} className="text-muted-foreground/50 shrink-0" />
            )}
          </div>
        ))}
        {(!lessons || lessons.length === 0) && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Lesson details available after enrollment
          </p>
        )}
      </div>
    </section>
  );
}
