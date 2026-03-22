import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourseDetail,
  getCourseReviews,
  addCourseReview,
  enrollInCourse,
  getCourseProgress,
} from "../../api/enrollments";
import { createOrder, verifyPayment, getPaymentStatus, cancelPayment } from "../../api/payments";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Progress } from "../../components/ui/progress";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  BookOpen,
  Users,
  Star,
  Lock,
  Play,
  Clock,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Video,
  Send,
} from "lucide-react";

function StarRating({ rating, size = 14, interactive = false, onRate }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={`${
            i <= Math.round(rating)
              ? "fill-foreground text-foreground"
              : "text-muted-foreground/40"
          } ${interactive ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );
}

function LessonTypeIcon({ type }) {
  const icons = {
    VIDEO: <Video size={16} className="text-muted-foreground" />,
    DOCUMENT: <FileText size={16} className="text-muted-foreground" />,
    IMAGE: <ImageIcon size={16} className="text-muted-foreground" />,
    QUIZ: <HelpCircle size={16} className="text-muted-foreground" />,
  };
  return icons[type] || <FileText size={16} className="text-muted-foreground" />;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [progress, setProgress] = useState(null);

  // PayPal payment
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [paidAlready, setPaidAlready] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailRes, reviewRes] = await Promise.all([
          getCourseDetail(id),
          getCourseReviews(id),
        ]);
        const courseData = detailRes.data.data?.course || detailRes.data.data;
        setCourse(courseData);
        const enr = detailRes.data.data?.enrollment || null;
        setEnrollment(enr);
        setReviews(reviewRes.data.data || []);
        setAvgRating(reviewRes.data.avgRating || 0);

        if (enr) {
          try {
            const progRes = await getCourseProgress(enr.id);
            setProgress(progRes.data.data || progRes.data);
          } catch {}
        }

        // Check payment status for paid courses (when not enrolled)
        if (!enr && courseData?.accessRule === "ON_PAYMENT") {
          try {
            const payRes = await getPaymentStatus(courseData.id);
            const pay = payRes.data.data;
            if (pay?.status === "SUCCESS") {
              setPaidAlready(true);
            } else if (pay?.status === "PENDING") {
              setPendingPayment(pay);
            }
          } catch {}
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setEnrollError("");
    try {
      await enrollInCourse(course.id);
      setEnrollSuccess(true);
      // Refetch detail
      const detailRes = await getCourseDetail(id);
      setEnrollment(detailRes.data.data?.enrollment || null);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.response?.data?.error || "Enrollment failed";
      setEnrollError(msg);
    } finally {
      setEnrolling(false);
    }
  };

  // PayPal handlers ─ called by <PayPalButtons>
  const handlePaypalCreateOrder = async () => {
    setPaymentError("");
    try {
      const res = await createOrder(course.id);
      return res.data.orderId; // Return the PayPal orderId to the PayPal SDK
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to create payment order";
      setPaymentError(msg);
      throw err; // Abort the PayPal flow
    }
  };

  const handlePaypalApprove = async (data) => {
    // data.orderID is the PayPal order ID returned after buyer approval
    setPaymentProcessing(true);
    try {
      await verifyPayment({ paypal_order_id: data.orderID, courseId: course.id });
      setPaymentSuccess(true);
      setPaymentProcessing(false);
      // Refresh enrollment
      const detailRes = await getCourseDetail(id);
      setCourse(detailRes.data.data?.course || detailRes.data.data);
      setEnrollment(detailRes.data.data?.enrollment || null);
    } catch (err) {
      const msg = err.response?.data?.error || "Payment verification failed";
      setPaymentError(msg);
      setPaymentProcessing(false);
    }
  };

  const handlePaypalError = (err) => {
    console.error("PayPal error:", err);
    setPaymentError("Payment failed. Please try again.");
    setPaymentProcessing(false);
  };

  const handlePaypalCancel = () => {
    setPaymentError("Payment cancelled.");
    setPaymentProcessing(false);
  };

  const handleCancelPending = async () => {
    if (!pendingPayment) return;
    setCancelling(true);
    setPaymentError("");
    try {
      await cancelPayment(pendingPayment.id);
      setPendingPayment(null);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to cancel payment";
      setPaymentError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) return;
    setSubmittingReview(true);
    try {
      await addCourseReview(id, { rating: reviewRating, comment: reviewComment });
      const reviewRes = await getCourseReviews(id);
      setReviews(reviewRes.data.data || []);
      setAvgRating(reviewRes.data.avgRating || 0);
      setReviewRating(0);
      setReviewComment("");
    } catch {
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">Course not found</p>
      </div>
    );
  }

  const completionPercent = progress?.completionPercent ?? enrollment?.completionPercent ?? 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
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

      {/* Main Content + Sidebar */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Main */}
        <div className="space-y-8 lg:col-span-2">
          {/* Description */}
          {course.description && (
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                About this Course
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>
            </section>
          )}

          <Separator />

          {/* Lesson List */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Lessons ({course.lessons?.length || course._count?.lessons || 0})
            </h2>
            <div className="space-y-2">
              {(course.lessons || []).map((lesson, idx) => (
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
              {(!course.lessons || course.lessons.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Lesson details available after enrollment
                </p>
              )}
            </div>
          </section>

          <Separator />

          {/* Reviews Section */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Reviews ({reviews.length})
            </h2>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <Card key={review.id || idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {review.user?.firstName} {review.user?.lastName}
                          </p>
                          <StarRating rating={review.rating} size={12} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No reviews yet. Be the first to review!
              </p>
            )}

            {/* Add Review Form (only if enrolled) */}
            {enrollment && (
              <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4 rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Write a Review
                </h3>
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">Your Rating</p>
                  <StarRating
                    rating={reviewRating}
                    size={20}
                    interactive
                    onRate={setReviewRating}
                  />
                </div>
                <Textarea
                  placeholder="Share your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  type="submit"
                  disabled={!reviewRating || submittingReview}
                  size="sm"
                >
                  <Send size={14} />
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            )}
          </section>
        </div>

        {/* Right Sidebar: Sticky CTA */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {enrollment ? "Your Progress" : "Get Started"}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Enrolled State */}
              {enrollment ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium text-foreground">
                        {Math.round(completionPercent)}%
                      </span>
                    </div>
                    <Progress value={completionPercent} className="h-2" />
                  </div>
                  <Badge
                    variant={
                      enrollment.status === "COMPLETED"
                        ? "default"
                        : enrollment.status === "IN_PROGRESS"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {enrollment.status === "COMPLETED" && (
                      <CheckCircle2 size={12} className="mr-1" />
                    )}
                    {enrollment.status?.replace(/_/g, " ")}
                  </Badge>
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/player/${course.id}`)}
                  >
                    <Play size={14} />
                    Continue Learning
                  </Button>
                  {enrollSuccess && (
                    <p className="text-xs text-center text-foreground font-medium">
                      🎉 Successfully enrolled!
                    </p>
                  )}
                </>
              ) : course.accessRule === "OPEN" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    This course is free. Enroll now to start learning.
                  </p>
                  <Button
                    className="w-full"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? "Enrolling..." : "Enroll for Free"}
                  </Button>
                </>
              ) : course.accessRule === "ON_PAYMENT" ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-foreground">
                      ${Number(course.price).toFixed(2)}
                    </p>
                    <span className="text-sm text-muted-foreground">USD</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    One-time purchase · Lifetime access
                  </p>

                  {paidAlready ? (
                    <p className="text-xs text-center text-green-600 font-medium">
                      Payment completed. Your enrollment is being processed.
                    </p>
                  ) : paymentSuccess ? (
                    <p className="text-xs text-center text-green-600 font-medium">
                      🎉 Payment successful! Enrolling you now...
                    </p>
                  ) : pendingPayment ? (
                    <div className="space-y-2">
                      <p className="text-xs text-center text-yellow-600 font-medium">
                        You have a pending payment for this course.
                      </p>
                      <Button
                        className="w-full"
                        variant="destructive"
                        size="sm"
                        onClick={handleCancelPending}
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling..." : "Cancel Pending Payment"}
                      </Button>
                    </div>
                  ) : paymentProcessing ? (
                    <p className="text-xs text-center text-muted-foreground">
                      Processing payment...
                    </p>
                  ) : (
                    <PayPalButtons
                      style={{ layout: "vertical", shape: "rect", label: "pay" }}
                      createOrder={handlePaypalCreateOrder}
                      onApprove={handlePaypalApprove}
                      onError={handlePaypalError}
                      onCancel={handlePaypalCancel}
                      disabled={paymentProcessing}
                    />
                  )}

                  {paymentError && (
                    <p className="text-xs text-center text-destructive">
                      {paymentError}
                    </p>
                  )}
                </>
              ) : course.accessRule === "ON_INVITATION" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    This course requires an invitation to enroll.
                  </p>
                  <Button className="w-full" variant="outline" disabled>
                    <Lock size={14} />
                    Invitation Required
                  </Button>
                </>
              ) : null}

              {enrollError && (
                <p className="text-xs text-center text-destructive">
                  {enrollError}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
