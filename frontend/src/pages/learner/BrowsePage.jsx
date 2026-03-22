import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedCourses } from "../../api/enrollments";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  BookOpen,
  Users,
  Star,
  GraduationCap,
} from "lucide-react";

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "fill-foreground text-foreground"
              : "text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

function AccessBadge({ accessRule, price }) {
  if (accessRule === "OPEN")
    return (
      <Badge variant="secondary" className="text-xs font-semibold">
        FREE
      </Badge>
    );
  if (accessRule === "ON_INVITATION")
    return (
      <Badge variant="outline" className="text-xs font-semibold">
        INVITE ONLY
      </Badge>
    );
  if (accessRule === "ON_PAYMENT")
    return (
      <Badge variant="default" className="text-xs font-semibold">
        ${price != null ? Number(price).toFixed(2) : "PAID"}
      </Badge>
    );
  return null;
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
      </CardHeader>
      <CardContent className="pb-2">
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/3" />
      </CardFooter>
    </Card>
  );
}

export default function BrowsePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPublishedCourses()
      .then((res) => setCourses(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Browse Courses
        </h1>
        <p className="mt-1 text-muted-foreground">
          Discover and enroll in published courses
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))
          : courses.map((course) => (
              <Card
                key={course.id}
                className="group cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={() => navigate(`/courses/${course.id}/detail`)}
              >
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  {course.coverImageUrl ? (
                    <img
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <GraduationCap
                        size={48}
                        className="text-muted-foreground/30"
                      />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <AccessBadge
                      accessRule={course.accessRule}
                      price={course.price}
                    />
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <h3 className="line-clamp-1 text-base font-semibold leading-tight text-foreground">
                    {course.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {course.shortDesc || "No description available"}
                  </p>
                </CardHeader>

                <CardContent className="pb-2">
                  <p className="text-xs text-muted-foreground">
                    by{" "}
                    <span className="font-medium text-foreground">
                      {course.createdBy?.firstName}{" "}
                      {course.createdBy?.lastName}
                    </span>
                  </p>
                </CardContent>

                <CardFooter className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} />
                    {course._count?.lessons || 0} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    {course._count?.enrollments || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <StarRating
                      rating={course._count?.reviews || 0}
                      size={12}
                    />
                  </span>
                </CardFooter>
              </Card>
            ))}
      </div>

      {!loading && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <GraduationCap size={48} className="text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium text-foreground">
            No courses available
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later for new courses
          </p>
        </div>
      )}
    </div>
  );
}
