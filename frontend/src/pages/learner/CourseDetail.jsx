import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseDetail } from "../../api/courses";
import { enrollCourse } from "../../api/enrollments";
import { createOrder, verifyPayment } from "../../api/payment";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { ArrowLeft, Clock, BookOpen, Star, AlertCircle, CheckCircle2, Video, FileText, CheckSquare, ShieldCheck, Loader2 } from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const res = await getCourseDetail(id);
      const payload = res.data.data;
      if (payload.course) {
        setCourse({ ...payload.course, isEnrolled: !!payload.enrollment });
      } else {
        setCourse(payload);
      }
    } catch (err) {
      setError("Failed to load course details. It may be restricted or deleted.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setError("");

    try {
      if (course.accessRule === "ON_PAYMENT" && course.price > 0) {
        // Trigger payment flow
        const orderRes = await createOrder({ courseId: id });
        const { orderId } = orderRes.data;

        // Simulate Razorpay/Stripe checkout opening and resolving
        // Since we don't have the actual frontend SDK script in this snippet, 
        // we simulate a verification jump for demonstration of the flow.
        // In reality, you'd open the payment gateway modal here with the orderId.
        const verifyRes = await verifyPayment({ 
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_simulated123",
          razorpay_signature: "simulated_sig"
        });

        if (verifyRes.data.success) {
          navigate(`/my-courses`);
        } else {
          throw new Error("Payment verification failed");
        }
      } else {
        // Free enrollment
        await enrollCourse({ courseId: id });
        navigate(`/my-courses`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Enrollment failed.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Course Not Found</h2>
        <p className="text-muted-foreground mt-2">The course you are looking for does not exist or has been removed.</p>
        <Button className="mt-6" onClick={() => navigate('/browse')}>Back to Browse</Button>
      </div>
    );
  }

  const isEnrolled = course.isEnrolled;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm flex flex-col md:flex-row">
        {/* Mobile image representation */}
        <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative bg-muted order-1 md:order-2">
           {course.coverImageUrl ? (
            <img 
              src={course.coverImageUrl} 
              alt={course.title} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/50">
              <BookOpen className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
        
        {/* Hero Content */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2 md:order-1 bg-gradient-to-br from-background to-muted/20">
          <Button variant="ghost" size="sm" className="w-fit mb-6 -ml-3" onClick={() => navigate('/browse')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse
          </Button>
          
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
              Course
            </Badge>
            {course.accessRule === "ON_PAYMENT" && (
              <Badge variant="secondary"><ShieldCheck className="h-3 w-3 mr-1"/> Premium</Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-6 line-clamp-3">{course.shortDesc}</p>
          
          <div className="flex flex-wrap items-center gap-6 mt-auto">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{course.lessons?.length || 0} Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Self-paced</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>{course.averageRating ? course.averageRating.toFixed(1) : "New"}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20 text-center">
          {error}
        </div>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">About This Course</h2>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {course.description || "Detailed description coming soon."}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Course Curriculum</h2>
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {course.lessons?.length === 0 && course.quizzes?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Curriculum is currently being developed.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {course.lessons?.map((lesson, index) => (
                    <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            {lesson.type === 'VIDEO' ? <Video className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-emerald-500" />}
                            {lesson.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.isFreePreview && <Badge variant="outline" className="text-[10px] py-0">Preview</Badge>}
                      </div>
                    </div>
                  ))}
                  {course.quizzes?.map((quiz, index) => (
                    <div key={quiz.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors bg-muted/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-500/10 text-indigo-500 text-sm font-medium">
                          <CheckSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{quiz.title}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] py-0">Assessment</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Enrollment Card */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-border bg-card shadow-lg p-6 flex flex-col gap-6">
            <div className="text-center pb-6 border-b border-border">
              {course.price > 0 ? (
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold tracking-tighter">${course.price}</span>
                  <span className="text-sm text-muted-foreground mt-1">One-time payment</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold tracking-tighter text-emerald-500 dark:text-emerald-400">Free</span>
                  <span className="text-sm text-muted-foreground mt-1">Full Access</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Full lifetime access</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Access on mobile and desktop</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Certificate of completion</span>
              </div>
            </div>

            <div className="pt-2">
              {isEnrolled ? (
                <Button className="w-full text-base py-6" onClick={() => navigate('/my-courses')}>
                  Go to Course
                </Button>
              ) : (
                <Button 
                  className="w-full text-base py-6" 
                  size="lg" 
                  onClick={handleEnrollment}
                  disabled={enrolling || user?.role === "ADMIN" || user?.role === "INSTRUCTOR"}
                >
                  {enrolling && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {enrolling ? "Processing..." : course.price > 0 ? "Enroll Now" : "Enroll for Free"}
                </Button>
              )}
            </div>
            
            {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
              <p className="text-xs text-center text-muted-foreground">
                As an {user.role.toLowerCase()}, you cannot enroll. Use the management dashboard to view course content.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
