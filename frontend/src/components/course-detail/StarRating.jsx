import { Star } from "lucide-react";

export default function StarRating({ rating, size = 14, interactive = false, onRate }) {
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
