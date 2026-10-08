import type { PipelineSummary } from "@/data/institution/types";
import { cn } from "@/lib/utils";

const stages: { key: keyof Omit<PipelineSummary, "total">; label: string; color: string }[] = [
  { key: "applied", label: "Applied", color: "bg-slate-400 dark:bg-slate-500" },
  { key: "shortlisted", label: "Shortlisted", color: "bg-amber-400 dark:bg-amber-500" },
  { key: "ongoing", label: "Ongoing", color: "bg-sky-400 dark:bg-sky-500" },
  { key: "completed", label: "Completed", color: "bg-emerald-400 dark:bg-emerald-500" },
  { key: "rejected", label: "Rejected", color: "bg-rose-400 dark:bg-rose-500" },
];

export function PipelineFunnel({ data }: { data: PipelineSummary }) {
  const total = data.applied + data.shortlisted + data.ongoing + data.completed + data.rejected;

  return (
    <div>
      {/* Visual bar */}
      <div className="flex h-8 overflow-hidden rounded-lg">
        {stages.map((stage) => {
          const count = data[stage.key];
          const percent = total > 0 ? (count / total) * 100 : 0;
          if (percent <= 0) return null;
          return (
            <div
              key={stage.key}
              className={cn("flex items-center justify-center text-xs font-bold text-white transition-all", stage.color)}
              style={{ width: `${percent}%` }}
              title={`${stage.label}: ${count}`}
            >
              {percent > 8 && count}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {stages.map((stage) => {
          const count = data[stage.key];
          return (
            <div key={stage.key} className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                <span className="text-xs text-ink-muted">{stage.label}</span>
              </div>
              <p className="mt-0.5 font-mono text-sm font-bold text-ink tabular">{count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
