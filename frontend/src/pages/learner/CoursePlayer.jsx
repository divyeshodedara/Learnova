import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseDetail } from "../../api/courses";
import { getPlayerLesson, markLessonProgress } from "../../api/player";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { ArrowLeft, PlayCircle, CheckCircle2, Circle, FileText, Video, Menu, Loader2, Award } from "lucide-react";

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loadingCode, setLoadingCode] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchCourseAndLesson();
  }, [courseId, lessonId]);

  const fetchCourseAndLesson = async () => {
    try {
      if (!course) {
        setLoadingCode(true);
        const courseRes = await getCourseDetail(courseId);
        setCourse(courseRes.data.data);
      }
      
      setLoadingLesson(true);
      // Determine if we are viewing a lesson or quiz.
      // Usually lessonId is passed as "slug" or UUID. For quizzes, handle similarly or create a subroute.
      // Here, the backend uses `/players/player/:courseId/:lessonId`. Let's assume it works for both, or just lessons for now.
      const lessonRes = await getPlayerLesson(courseId, lessonId);
      setCurrentLesson(lessonRes.data.data || lessonRes.data);
    } catch (err) {
      console.error("Failed to load player", err);
    } finally {
      setLoadingCode(false);
      setLoadingLesson(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setCompleting(true);
      await markLessonProgress(lessonId, { isCompleted: true });
      
      // Update local state to reflect completion
      if (currentLesson) {
         setCurrentLesson({ ...currentLesson, isCompleted: true });
      }
      
      // Auto advance to next lesson if available
      if (course && course.lessons) {
         const currentIndex = course.lessons.findIndex(l => l.id === lessonId);
         if (currentIndex !== -1 && currentIndex < course.lessons.length - 1) {
            const nextLesson = course.lessons[currentIndex + 1];
            navigate(`/player/${courseId}/${nextLesson.id}`);
         } else {
            // Course Complete logic or Navigate to Dashboard
            navigate(`/my-courses`);
         }
      }
    } catch (err) {
      console.error("Error marking complete", err);
    } finally {
      setCompleting(false);
    }
  };

  if (loadingCode && !course) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allItems = [...(course?.lessons || []), ...(course?.quizzes || [])];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      {/* Sidebar Curriculum */}
      <div className={`
        ${sidebarOpen ? 'w-80 border-r border-border' : 'w-0 border-r-0 overflow-hidden'} 
        flex-shrink-0 bg-card transition-all duration-300 flex flex-col absolute md:relative z-10 h-full
      `}>
        <div className="p-4 border-b border-border flex flex-col gap-4">
          <Link to={`/my-courses`} className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div>
            <h2 className="font-semibold text-foreground line-clamp-2">{course?.title}</h2>
            <div className="mt-2 w-full bg-muted h-1.5 rounded-full overflow-hidden">
               <div className="bg-primary h-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <div className="space-y-1">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Content</p>
            
            {course?.lessons?.map((lesson, idx) => (
              <Link 
                key={lesson.id}
                to={`/player/${courseId}/${lesson.id}`}
                className={`
                  flex items-start gap-3 p-3 rounded-lg transition-colors
                  ${lessonId === lesson.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted font-normal hover:text-foreground'}
                `}
              >
                <div className="mt-0.5">
                  {lessonId === lesson.id ? (
                    <PlayCircle className="h-4 w-4 text-primary" />
                  ) : lesson.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 opacity-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight line-clamp-2">
                    {idx + 1}. {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 opacity-70">
                    {lesson.type === 'VIDEO' ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    <span className="text-[10px] uppercase tracking-wider">{lesson.type}</span>
                  </div>
                </div>
              </Link>
            ))}

            {course?.quizzes?.length > 0 && (
              <>
                <div className="my-4 border-t border-border"></div>
                <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessments</p>
                {course.quizzes.map((quiz, idx) => (
                  <button 
                    key={quiz.id}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted font-normal hover:text-foreground"
                    onClick={() => navigate(`/player/${courseId}/quiz/${quiz.id}`)}
                  >
                    <div className="mt-0.5"><Award className="h-4 w-4 text-indigo-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-tight line-clamp-2">{quiz.title}</p>
                      <span className="text-[10px] uppercase tracking-wider opacity-70 mt-1 block">Quiz</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* Topbar inside player */}
        <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:flex hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-medium text-sm md:text-base truncate max-w-[300px] md:max-w-xl">
              {currentLesson?.lesson?.title || currentLesson?.title || "Loading..."}
            </h1>
          </div>
          <div>
             <Button 
                onClick={handleMarkComplete} 
                disabled={completing || currentLesson?.isCompleted || loadingLesson}
                variant={currentLesson?.isCompleted ? "outline" : "default"}
              >
                {completing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentLesson?.isCompleted ? "Completed" : "Mark as Complete"}
              </Button>
          </div>
        </div>

        {/* Lesson View Area */}
        <div className="flex-1 overflow-y-auto bg-card">
          {loadingLesson ? (
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-pulse">
              <div className="aspect-video bg-muted rounded-xl w-full"></div>
              <div className="h-8 bg-muted w-3/4 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted w-full rounded"></div>
                <div className="h-4 bg-muted w-5/6 rounded"></div>
              </div>
            </div>
          ) : currentLesson ? (
            <div className="max-w-4xl mx-auto pb-24">
              
              {/* Media Area */}
              {currentLesson.lesson?.type === 'VIDEO' ? (
                <div className="bg-black w-full aspect-video flex items-center justify-center">
                  <div className="text-center text-white/50 p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                    <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Video Player Placeholder</p>
                    <p className="text-xs mt-1">{currentLesson.lesson?.content || "No video URL provided"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted w-full h-32 md:h-48 flex items-center justify-center border-b border-border">
                  <FileText className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}

              {/* Content Box */}
              <div className="p-6 md:p-10">
                <h2 className="text-2xl font-bold tracking-tight mb-6">
                  {currentLesson.lesson?.title}
                </h2>
                
                {currentLesson.lesson?.type === 'TEXT' && (
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {currentLesson.lesson?.content}
                  </div>
                )}
                
                {/* Attachments Section */}
                {currentLesson.attachments?.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Resources</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentLesson.attachments.map(att => (
                        <a 
                          key={att.id} 
                          href={att.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center p-4 rounded-xl border border-border bg-background hover:border-primary/50 transition-colors group"
                        >
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{att.title || "Download File"}</p>
                            <p className="text-xs text-muted-foreground uppercase">{att.fileType}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground p-4 text-center">
              Lesson not found or you don't have access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
