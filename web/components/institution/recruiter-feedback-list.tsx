import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feedback {
  company: string;
  rating: number;
  comment: string;
  date: string;
}

export function RecruiterFeedbackList({ feedback }: { feedback: Feedback[] }) {
  return (
    <div className="space-y-3">
      {feedback.map((fb, i) => (
        <div key={i} className="rounded-lg border border-border/60 bg-surface-raised/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">{fb.company}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star
                  key={si}
                  className={cn(
                    "h-3.5 w-3.5",
                    si < Math.floor(fb.rating)
                      ? "fill-amber-400 text-amber-400"
                      : si < fb.rating
                        ? "fill-amber-400/50 text-amber-400/50"
                        : "text-ink-faint/30"
                  )}
                />
              ))}
              <span className="ml-1 font-mono text-xs font-semibold text-ink-muted tabular">{fb.rating}</span>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{fb.comment}</p>
          <p className="mt-1.5 text-[10px] text-ink-faint">{fb.date}</p>
        </div>
      ))}
    </div>
  );
}
