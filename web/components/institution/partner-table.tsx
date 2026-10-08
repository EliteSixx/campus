"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { SortableHeader, type SortDirection } from "./sortable-header";
import { Mail, Calendar, ExternalLink } from "lucide-react";
import type { CorporatePartner, MoUStatus, EngagementLevel } from "@/data/institution/types";
import { cn } from "@/lib/utils";

const statusTone: Record<MoUStatus, "success" | "warning" | "neutral" | "danger" | "accent" | "cyan"> = {
  active: "success",
  "expiring-soon": "warning",
  expired: "neutral",
  pending: "accent",
};

const engagementTone: Record<EngagementLevel, "success" | "warning" | "neutral" | "danger" | "accent" | "cyan"> = {
  high: "success",
  moderate: "warning",
  low: "neutral",
};

export function PartnerTable({ partners }: { partners: CorporatePartner[] }) {
  const [sortKey, setSortKey] = useState<string | null>("engagementScore");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return partners;
    return [...partners].sort((a, b) => {
      let aVal: any = (a as any)[sortKey];
      let bVal: any = (b as any)[sortKey];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [partners, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-raised/50">
            <SortableHeader label="Partner" sortKey="name" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[180px]" />
            <SortableHeader label="Industry" sortKey="industry" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[130px]" />
            <SortableHeader label="MoU Status" sortKey="mouStatus" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} />
            <SortableHeader label="MoU Validity" sortKey="mouEnd" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[130px]" />
            <SortableHeader label="Hired" sortKey="studentsHired" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
            <SortableHeader label="Engagement" sortKey="engagementScore" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted min-w-[180px]">
              TPO Liaison
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id} className="border-b border-border/40 transition-colors hover:bg-surface-raised/30">
              <td className="px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-bold text-accent">
                    {p.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{p.name}</p>
                    <p className="text-[10px] text-ink-faint">{p.hq}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-xs text-ink-muted">{p.industry}</td>
              <td className="px-3 py-3">
                <Badge tone={statusTone[p.mouStatus]} className="capitalize text-[10px]">
                  {p.mouStatus.replace("-", " ")}
                </Badge>
              </td>
              <td className="px-3 py-3 font-mono text-xs text-ink-muted tabular">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-ink-faint" />
                  {p.mouEnd}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <span className="font-mono text-xs font-bold text-ink tabular">{p.studentsHired}</span>
                <span className="text-[10px] text-ink-faint block">{p.programs.length} programs</span>
              </td>
              <td className="px-3 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Badge tone={engagementTone[p.engagementLevel]} className="text-[10px] capitalize">
                    {p.engagementLevel}
                  </Badge>
                  <span className="font-mono text-xs font-bold tabular text-accent">{p.engagementScore}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-xs">
                <p className="font-medium text-ink">{p.contactPerson}</p>
                <a
                  href={`mailto:${p.contactEmail}`}
                  className="text-[10px] text-accent hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Mail className="h-3 w-3" />
                  {p.contactEmail}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
