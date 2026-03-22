import { Star } from "lucide-react";

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function StarRating({ value = 0, onChange, size = "sm" }) {
  const iconSize = sizeMap[size] || sizeMap.sm;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(star)}
            className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform disabled:opacity-100`}
          >
            <Star
              className={`${iconSize} ${
                filled
                  ? "fill-foreground stroke-foreground"
                  : "fill-none stroke-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
