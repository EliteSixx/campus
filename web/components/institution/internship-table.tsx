"use client";

import { useState } from "react";
import { SortableHeader, type SortDirection } from "./sortable-header";
import { SearchFilterBar } from "./search-filter-bar";
import { Badge } from "@/components/ui/badge";
import type { InternshipRecord, InternshipStatus } from "@/data/institution/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<InternshipStatus, { tone: "neutral" | "success" | "warning" | "danger" | "accent" | "cyan"; label: string }> = {
  applied: { tone: "neutral", label: "Applied" },
  shortlisted: { tone: "warning", label: "Shortlisted" },
  ongoing: { tone: "cyan", label: "Ongoing" },
  completed: { tone: "success", label: "Completed" },
  rejected: { tone: "danger", label: "Rejected" },
};

export function InternshipTable({ data }: { data: InternshipRecord[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string | null>("status");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const departments = [...new Set(data.map((r) => r.department))].sort();

  const filtered = data.filter((r) => {
    const matchesSearch = search === "" ||
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesDept = deptFilter === "all" || r.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const accessor = (row: InternshipRecord, key: string): number | string => {
    switch (key) {
      case "studentName": return row.studentName;
      case "company": return row.company;
      case "department": return row.department;
      case "status": return ["applied", "shortlisted", "ongoing", "completed", "rejected"].indexOf(row.status);
      case "startDate": return row.startDate;
      default: return 0;
    }
  };

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = accessor(a, sortKey);
        const bVal = accessor(b, sortKey);
        const cmp = typeof aVal === "number" && typeof bVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student, company, role…"
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </SearchFilterBar>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised/50">
              <SortableHeader label="Student" sortKey="studentName" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[140px]" />
              <SortableHeader label="Dept" sortKey="department" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} />
              <SortableHeader label="Company" sortKey="company" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[120px]" />
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted min-w-[140px]">Role</th>
              <SortableHeader label="Status" sortKey="status" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} />
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Type</th>
              <SortableHeader label="Start" sortKey="startDate" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} />
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Stipend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-sm text-ink-muted">
                  No records match your filters.
                </td>
              </tr>
            ) : (
              sorted.map((rec) => {
                const cfg = statusConfig[rec.status];
                return (
                  <tr key={rec.id} className="border-b border-border/40 transition-colors hover:bg-surface-raised/30">
                    <td className="px-3 py-2.5 font-medium text-ink">{rec.studentName}</td>
                    <td className="px-3 py-2.5 text-ink-muted">{rec.department}</td>
                    <td className="px-3 py-2.5 text-ink">{rec.company}</td>
                    <td className="px-3 py-2.5 text-ink-muted">{rec.role}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={cfg.tone}>{cfg.label}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-ink-muted">{rec.type}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ink-muted tabular">{rec.startDate}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ink tabular">{rec.stipend}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-faint">
        Showing {sorted.length} of {data.length} records
      </p>
    </div>
  );
}
