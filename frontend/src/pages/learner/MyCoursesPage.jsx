import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyEnrollments } from "../../api/enrollments";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Skeleton } from "../../components/ui/skeleton";
import { BookOpen, GraduationCap, Play } from "lucide-react";

const statusConfig = {
  YET_TO_START: { label: "Yet to Start", variant: "outline" },
  IN_PROGRESS: { label: "In Progress", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "default" },
};

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyEnrollments()
      .then((res) => setEnrollments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Courses
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track your learning progress
        </p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const course = enrollment.course || {};
            const percent = enrollment.completionPercent || 0;
            const status = statusConfig[enrollment.status] || statusConfig.YET_TO_START;

            return (
              <Card
                key={enrollment.id}
                className="group overflow-hidden transition-all hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  {course.coverImageUrl ? (
                    <img
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <GraduationCap
                        size={40}
                        className="text-muted-foreground/30"
                      />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen size={12} />
                    {course._count?.lessons || 0} lessons
                  </p>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {Math.round(percent)}%
                      </span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => navigate(`/player/${course.id}`)}
                  >
                    <Play size={13} />
                    {enrollment.status === "YET_TO_START"
                      ? "Start Learning"
                      : enrollment.status === "COMPLETED"
                        ? "Review Course"
                        : "Continue"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <GraduationCap size={48} className="text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium text-foreground">
            No enrolled courses yet
          </p>
          <p className="text-sm text-muted-foreground">
            Browse courses and start your learning journey
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => navigate("/browse")}
          >
            <BookOpen size={14} />
            Browse Courses
          </Button>
        </div>
      )}
    </div>
  );
}
