import { Star } from "lucide-react";
import { toman } from "@/lib/format";

export default function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${toman(value)} از ۵`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(value) ? "currentColor" : "none"}
          className={n <= Math.round(value) ? "text-gold" : "text-blush-300"}
        />
      ))}
    </span>
  );
}
