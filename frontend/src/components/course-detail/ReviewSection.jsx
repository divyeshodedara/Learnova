import { Send } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import StarRating from "./StarRating";

export default function ReviewSection({
  reviews,
  enrollment,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  submittingReview,
  onSubmit,
}) {
  return (
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

      {enrollment && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-lg border border-border p-4">
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
  );
}
