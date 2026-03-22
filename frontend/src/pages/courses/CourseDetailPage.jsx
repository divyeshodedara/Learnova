import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { getCourseById } from "../../api/courses";
import LessonsTab from "../../components/courses/LessonsTab";
import QuizzesTab from "../../components/courses/QuizzesTab";
import InvitationsTab from "../../components/courses/InvitationsTab";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCourseById(id);
      setCourse(res.data.data || res.data);
    } catch {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!course) return <p className="text-muted-foreground">Course not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/courses")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground text-sm">
            {course.description?.slice(0, 120)}
          </p>
        </div>
        <Badge variant={course.isPublished ? "default" : "outline"}>
          {course.isPublished ? "Published" : "Draft"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>Visibility: <strong className="text-foreground">{course.visibility}</strong></span>
        <span>Access: <strong className="text-foreground">{course.accessRule?.replace(/_/g, " ")}</strong></span>
        {course.price != null && <span>Price: <strong className="text-foreground">${course.price}</strong></span>}
      </div>

      <Separator />

      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          {course.accessRule === "ON_INVITATION" && (
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="lessons" className="mt-4">
          <LessonsTab courseId={id} />
        </TabsContent>

        <TabsContent value="quizzes" className="mt-4">
          <QuizzesTab courseId={id} />
        </TabsContent>

        {course.accessRule === "ON_INVITATION" && (
          <TabsContent value="invitations" className="mt-4">
            <InvitationsTab courseId={id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
