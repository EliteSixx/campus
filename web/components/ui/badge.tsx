import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "danger" | "accent" | "cyan";
}

const tones = {
  neutral: "bg-surface-raised text-ink border border-border font-medium",
  success: "bg-success-soft text-success border border-success/30 font-semibold",
  warning: "bg-warning-soft text-warning border border-warning/30 font-semibold",
  danger: "bg-danger-soft text-danger border border-danger/30 font-semibold",
  accent: "bg-accent-soft text-accent border border-accent/30 font-semibold",
  cyan: "bg-cyan-500/15 text-cyan-900 dark:text-cyan-300 border border-cyan-500/30 font-semibold",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs backdrop-blur-md",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
