import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyEnrollments } from "../../api/enrollments";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { BookOpen, PlayCircle, Award } from "lucide-react";

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await getMyEnrollments();
      setEnrollments(res.data.data || []);
    } catch (err) {
      setError("Failed to load your enrolled courses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <p className="text-muted-foreground mt-1">Pick up right where you left off.</p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-5 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-card/50">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">You aren't enrolled in any courses</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Ready to start learning? Browse our catalog to find the perfect course for you.
          </p>
          <Link to="/browse">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enrollments.map(enroll => {
            const course = enroll.course;
            // The resume tracking usually relies on last accessed lesson.
            // Assuming we just route to player and it handles logic.
            const firstLessonId = course.lessons?.[0]?.id || "intro";
            const isCompleted = enroll.status === "COMPLETED";

            return (
              <div key={enroll.id} className="relative rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
                <div className="relative aspect-video w-full bg-muted border-b border-border">
                  {course.coverImageUrl ? (
                    <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                      <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="success" className="bg-green-500/90 text-white border-0 shadow-sm backdrop-blur-md">
                        <Award className="h-3 w-3 mr-1" /> Completed
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-4">
                    {course.title}
                  </h3>
                  
                  <div className="mt-auto space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>{enroll.completionPercentage || 0}% Complete</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                        <div 
                          className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} 
                          style={{ width: `${enroll.completionPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <Link to={`/player/${course.id}/${firstLessonId}`} className="block">
                      <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
                        {isCompleted ? "Review Course" : "Continue Learning"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
