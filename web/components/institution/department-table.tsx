"use client";

import Link from "next/link";
import { useState } from "react";
import { SortableHeader, type SortDirection } from "./sortable-header";
import { Badge } from "@/components/ui/badge";
import type { DepartmentSummaryRow } from "@/data/institution/types";
import { cn } from "@/lib/utils";

export function DepartmentTable({ data }: { data: DepartmentSummaryRow[] }) {
  const [sortKey, setSortKey] = useState<string | null>("avgSkillScore");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const accessor = (row: DepartmentSummaryRow, key: string): number | string => {
    switch (key) {
      case "name": return row.name;
      case "totalStudents": return row.totalStudents;
      case "assessedPercent": return row.assessedPercent;
      case "placementReadyPercent": return row.placementReadyPercent;
      case "avgSkillScore": return row.avgSkillScore;
      case "criticalGapCount": return row.criticalGapCount;
      default: return 0;
    }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const aVal = accessor(a, sortKey);
        const bVal = accessor(b, sortKey);
        const cmp = typeof aVal === "number" && typeof bVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-raised/50">
            <SortableHeader label="Department" sortKey="name" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[180px]" />
            <SortableHeader label="Students" sortKey="totalStudents" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
            <SortableHeader label="Assessed" sortKey="assessedPercent" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
            <SortableHeader label="Ready %" sortKey="placementReadyPercent" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
            <SortableHeader label="Avg Skill" sortKey="avgSkillScore" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
            <SortableHeader label="Critical" sortKey="criticalGapCount" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((dept) => {
            const readyTone = dept.placementReadyPercent >= 60 ? "success" : dept.placementReadyPercent >= 40 ? "warning" : "danger";
            return (
              <tr key={dept.id} className="border-b border-border/50 transition-colors hover:bg-surface-raised/30">
                <td className="px-3 py-3">
                  <Link href={`/dashboard/institution/departments/${dept.id}`} className="group flex items-center gap-2">
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                      "bg-accent-soft text-accent"
                    )}>
                      {dept.shortName}
                    </span>
                    <span className="font-medium text-ink group-hover:text-accent transition-colors">{dept.name}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-right font-mono text-ink tabular">{dept.totalStudents}</td>
                <td className="px-3 py-3 text-right font-mono text-ink tabular">{dept.assessedPercent}%</td>
                <td className="px-3 py-3 text-right">
                  <Badge tone={readyTone} className="font-mono tabular">{dept.placementReadyPercent}%</Badge>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden sm:block h-1.5 w-16 overflow-hidden rounded-full bg-surface-raised">
                      <div
                        className={cn("h-full rounded-full", dept.avgSkillScore >= 65 ? "bg-emerald-500" : dept.avgSkillScore >= 45 ? "bg-amber-500" : "bg-rose-500")}
                        style={{ width: `${dept.avgSkillScore}%` }}
                      />
                    </div>
                    <span className="font-mono text-ink tabular">{dept.avgSkillScore}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  {dept.criticalGapCount > 20 ? (
                    <span className="font-mono font-semibold text-danger tabular">{dept.criticalGapCount}</span>
                  ) : (
                    <span className="font-mono text-ink tabular">{dept.criticalGapCount}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
