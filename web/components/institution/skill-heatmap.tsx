"use client";

import type { SkillMatrixRow } from "@/data/institution/types";
import { cn } from "@/lib/utils";

function scoreColorLight(score: number | null): string {
  if (score === null) return "text-ink-faint/50 bg-surface-raised/40";
  if (score >= 70) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/80 dark:text-white";
  if (score >= 55) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/40 dark:text-emerald-100";
  if (score >= 40) return "bg-amber-50 text-amber-700 dark:bg-amber-500/50 dark:text-amber-100";
  if (score >= 25) return "bg-orange-50 text-orange-700 dark:bg-orange-500/50 dark:text-orange-100";
  return "bg-rose-50 text-rose-700 dark:bg-rose-500/60 dark:text-rose-100";
}

export function SkillHeatmap({
  data,
  highlightGaps = false,
}: {
  data: SkillMatrixRow[];
  highlightGaps?: boolean;
}) {
  if (data.length === 0) return null;

  const deptHeaders = data[0].departments.map((d) => d.deptShortName);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-surface-raised/50">
            <th className="sticky left-0 z-10 bg-surface-raised/90 backdrop-blur px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted min-w-[170px]">
              Skill & Domain
            </th>
            {deptHeaders.map((dept) => (
              <th key={dept} className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted min-w-[64px]">
                {dept}
              </th>
            ))}
            <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted min-w-[72px]">
              Demand
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted min-w-[56px]">
              Gap
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={row.skillId} className={cn("border-b border-border/40", ri % 2 === 0 ? "bg-transparent" : "bg-surface-raised/20")}>
              <td className="sticky left-0 z-10 bg-surface/95 backdrop-blur px-3 py-2 font-medium text-ink border-r border-border/30">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-ink">{row.skillName}</span>
                    {row.isCommonSkill && (
                      <span className="rounded bg-accent/10 px-1 py-0.2 text-[9px] font-bold text-accent">
                        Common
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-faint">{row.category}</span>
                </div>
              </td>
              {row.departments.map((cell) => (
                <td key={cell.deptId} className="px-1 py-1.5 text-center">
                  {cell.avgScore !== null ? (
                    <div
                      className={cn(
                        "mx-auto flex h-8 w-12 items-center justify-center rounded font-mono font-semibold tabular shadow-2xs",
                        scoreColorLight(cell.avgScore)
                      )}
                      title={`${cell.deptShortName} avg: ${cell.avgScore} (${cell.studentsAssessed} assessed)`}
                    >
                      {cell.avgScore}
                    </div>
                  ) : (
                    <div
                      className="mx-auto flex h-8 w-12 items-center justify-center rounded text-ink-faint/40 font-mono text-xs select-none bg-surface-raised/40 border border-dashed border-border/40"
                      title={`Not in ${cell.deptShortName} curriculum`}
                    >
                      —
                    </div>
                  )}
                </td>
              ))}
              <td className="px-3 py-2 text-center font-mono font-semibold text-ink tabular">
                {row.industryDemand}
              </td>
              <td className="px-3 py-2 text-center">
                {row.gap > 0 ? (
                  <span
                    className={cn(
                      "font-mono font-bold tabular",
                      row.gap >= 25 ? "text-danger" : row.gap >= 12 ? "text-warning" : "text-ink-muted"
                    )}
                  >
                    -{row.gap}
                  </span>
                ) : (
                  <span className="font-mono font-semibold text-success tabular">+{Math.abs(row.gap)}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
