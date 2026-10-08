import { cn } from "@/lib/utils";

export function MatchScore({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: 36, md: 48, lg: 88 }[size];
  const stroke = { sm: 3.5, md: 4, lg: 6 }[size];
  const radius = (dims - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color = value >= 70 ? "text-success" : value >= 45 ? "text-warning" : "text-danger";

  return (
    <div className="relative shrink-0" style={{ width: dims, height: dims }}>
      <svg width={dims} height={dims} className="-rotate-90">
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-border"
        />
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("fill-none transition-all", color)}
          stroke="currentColor"
        />
      </svg>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center font-mono font-semibold tabular",
          color,
          size === "lg" ? "text-xl" : "text-xs"
        )}
      >
        {value}%
      </div>
    </div>
  );
}
