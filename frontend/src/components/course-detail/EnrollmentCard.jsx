import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { CheckCircle2, Play, Lock } from "lucide-react";

export default function EnrollmentCard({
  course,
  enrollment,
  user,
  completionPercent,
  enrolling,
  enrollError,
  enrollSuccess,
  onEnroll,
  hasPaid,
  paidAlready,
  paymentSuccess,
  paymentProcessing,
  paymentError,
  pendingPayment,
  cancelling,
  onPaypalCreateOrder,
  onPaypalApprove,
  onPaypalError,
  onPaypalCancel,
  onCancelPending,
  hasInvitation,
}) {
  const navigate = useNavigate();

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 pb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {enrollment ? "Your Progress" : "Get Started"}
          </h3>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
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
              {enrollment.status === "COMPLETED" ? (
                <Button className="w-full" variant="outline" disabled>
                  <CheckCircle2 size={14} />
                  Completed
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => navigate(`/player/${course.id}`)}
                >
                  <Play size={14} />
                  {enrollment.status === "IN_PROGRESS"
                    ? "Continue Learning"
                    : "Start Learning"}
                </Button>
              )}
              {enrollSuccess && (
                <p className="text-xs text-center text-foreground font-medium">
                  🎉 Successfully enrolled!
                </p>
              )}
            </>
          ) : !user ? (
            <>
              <p className="text-sm text-muted-foreground">
                Sign in to enroll in this course.
              </p>
              <Button
                className="w-full"
                onClick={() => navigate("/auth/login")}
              >
                Join Course
              </Button>
            </>
          ) : course.accessRule === "OPEN" ? (
            <>
              <p className="text-sm text-muted-foreground">
                This course is free. Enroll now to start learning.
              </p>
              <Button
                className="w-full"
                onClick={onEnroll}
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

              {paidAlready || hasPaid ? (
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
                    onClick={onCancelPending}
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
                  createOrder={onPaypalCreateOrder}
                  onApprove={onPaypalApprove}
                  onError={onPaypalError}
                  onCancel={onPaypalCancel}
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
            hasInvitation ? (
              <>
                <p className="text-sm text-muted-foreground">
                  You have been invited to this course. Enroll now!
                </p>
                <Button
                  className="w-full"
                  onClick={onEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? "Enrolling..." : "Start Course"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  This course requires an invitation to enroll.
                </p>
                <Button className="w-full" variant="outline" disabled>
                  <Lock size={14} />
                  By Invitation Only
                </Button>
              </>
            )
          ) : null}

          {enrollError && (
            <p className="text-xs text-center text-destructive">
              {enrollError}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
