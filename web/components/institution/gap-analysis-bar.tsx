import type { SkillGapSummary } from "@/data/institution/types";
import { cn } from "@/lib/utils";

export function GapAnalysisBar({ data }: { data: SkillGapSummary[] }) {
  const maxDemand = Math.max(...data.map((d) => d.industryDemand), 100);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const demandWidth = (item.industryDemand / maxDemand) * 100;
        const avgWidth = (item.studentAvg / maxDemand) * 100;
        const gapSeverity = item.gap >= 30 ? "danger" : item.gap >= 15 ? "warning" : "accent";

        return (
          <div key={item.skillName}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-ink">{item.skillName}</span>
              <span className={cn(
                "text-xs font-bold font-mono tabular",
                gapSeverity === "danger" ? "text-danger" : gapSeverity === "warning" ? "text-warning" : "text-ink-muted"
              )}>
                {item.gap > 0 ? `-${item.gap}` : `+${Math.abs(item.gap)}`} gap
              </span>
            </div>
            <div className="relative h-5 w-full overflow-hidden rounded bg-surface-raised">
              {/* Industry demand (background bar) */}
              <div
                className="absolute inset-y-0 left-0 rounded bg-ink-faint/30"
                style={{ width: `${demandWidth}%` }}
              />
              {/* Student avg (foreground bar) */}
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded transition-all",
                  gapSeverity === "danger" ? "bg-danger/70" : gapSeverity === "warning" ? "bg-warning/70" : "bg-accent/70"
                )}
                style={{ width: `${avgWidth}%` }}
              />
              {/* Demand marker line */}
              <div
                className="absolute inset-y-0 w-0.5 bg-ink/60"
                style={{ left: `${demandWidth}%` }}
              />
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] text-ink-faint">
              <span>Student avg: {item.studentAvg}</span>
              <span>Demand: {item.industryDemand} · Worst: {item.worstDept}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
