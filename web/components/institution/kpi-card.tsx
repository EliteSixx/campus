import Link from "next/link";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KPICard({
  label,
  value,
  icon: Icon,
  trend,
  suffix,
  href,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { changePercent: number; direction: "up" | "down" | "flat" };
  suffix?: string;
  href?: string;
}) {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  const trendColor = trend?.direction === "up" ? "text-emerald-500" : trend?.direction === "down" ? "text-rose-500" : "text-ink-faint";

  const content = (
    <Card className={cn("relative overflow-hidden p-5", href && "cursor-pointer transition-all hover:border-accent/40 hover:shadow-md")}>
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-0.5 text-xs font-semibold", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {trend.changePercent}%
          </div>
        )}
      </div>
      <p className="mt-3 font-mono text-2xl font-bold tracking-tight text-ink tabular">
        {value}{suffix && <span className="ml-0.5 text-sm font-medium text-ink-muted">{suffix}</span>}
      </p>
      <p className="mt-0.5 text-xs font-medium text-ink-muted">{label}</p>
      {/* Subtle accent gradient on the bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/60 via-accent/20 to-transparent" />
      {href && (
        <p className="mt-2 text-[10px] font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">View details →</p>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="group">
        {content}
      </Link>
    );
  }

  return content;
}
