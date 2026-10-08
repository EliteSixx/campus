import { cn } from "@/lib/utils";

export interface ComparisonRow {
  label: string;
  a: number; // e.g. "your skill" or "student readiness"
  b: number; // e.g. "industry requirement" or "industry demand"
}

export function SkillComparison({
  rows,
  labelA = "Your skills",
  labelB = "Industry requirement",
}: {
  rows: ComparisonRow[];
  labelA?: string;
  labelB?: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> {labelA}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink-faint" /> {labelB}
        </span>
      </div>
      <div className="space-y-3.5">
        {rows.map((row) => {
          const gap = row.b - row.a;
          return (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-ink">{row.label}</span>
                {gap > 5 ? (
                  <span className="font-mono text-xs font-medium text-danger tabular">
                    gap −{gap}
                  </span>
                ) : (
                  <span className="font-mono text-xs font-medium text-success tabular">on track</span>
                )}
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-ink-faint/50"
                  style={{ width: `${row.b}%` }}
                />
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-accent transition-all",
                    gap > 5 && "bg-danger"
                  )}
                  style={{ width: `${row.a}%` }}
                />
                <div
                  className="absolute inset-y-0 w-px bg-ink"
                  style={{ left: `${row.b}%` }}
                />
              </div>
              <div className="mt-0.5 flex justify-between font-mono text-[11px] text-ink-faint tabular">
                <span>{row.a}%</span>
                <span>{row.b}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
