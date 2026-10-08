import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}) {
  const toneColor = {
    neutral: "text-ink font-bold",
    success: "text-emerald-700 dark:text-emerald-400 font-bold",
    warning: "text-amber-800 dark:text-amber-400 font-bold",
    danger: "text-rose-700 dark:text-rose-400 font-bold",
    accent: "text-accent font-bold",
  }[tone];

  return (
    <Card className="p-5 border border-border bg-surface text-ink shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-ink-muted">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-accent" />}
      </div>
      <p className={cn("mt-2 font-mono text-2xl font-extrabold tabular tracking-tight", toneColor)}>
        {value}
      </p>
      {trend && <p className="mt-1 text-xs text-ink-muted font-medium">{trend}</p>}
    </Card>
  );
}
