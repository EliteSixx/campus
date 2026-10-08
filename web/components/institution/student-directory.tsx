"use client";

import { useState, useMemo, Fragment } from "react";
import { SearchFilterBar } from "./search-filter-bar";
import { Badge } from "@/components/ui/badge";
import { SortableHeader, type SortDirection } from "./sortable-header";
import { Download, Eye, User, FileText } from "lucide-react";
import { StudentProfileDrawer } from "./student-profile-drawer";
import type { InstitutionStudent, PlacementStatus } from "@/data/institution/types";
import { cn } from "@/lib/utils";
import { ExportDropdown } from "@/components/shared/export-dropdown";

const statusConfig: Record<PlacementStatus, { tone: "success" | "warning" | "neutral" | "danger" | "accent" | "cyan"; label: string }> = {
  placed: { tone: "success", label: "Placed" },
  interning: { tone: "cyan", label: "Interning" },
  seeking: { tone: "warning", label: "Seeking" },
  "not-assessed": { tone: "neutral", label: "Not Assessed" },
};

function exportToCSV(students: InstitutionStudent[], filename: string) {
  const headers = [
    "Reg ID", "Name", "Department", "Year", "Email", "Career Goal",
    "Skill Readiness", "Employability Score", "Placement Status",
    "Top Skills", "Assessed Date",
  ];
  const rows = students.map((s) => [
    s.regId,
    s.name,
    s.department,
    s.year,
    s.email,
    s.careerGoal,
    s.skillReadiness,
    s.employabilityScore,
    statusConfig[s.placementStatus].label,
    s.topSkills.map((sk) => `${sk.name}(${sk.score})`).join("; "),
    s.assessedDate ?? "N/A",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.map((val) => `"${val}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function StudentDirectory({
  students,
  departmentName,
  showDeptColumn = false,
  pageSize = 15,
}: {
  students: InstitutionStudent[];
  departmentName?: string;
  showDeptColumn?: boolean;
  pageSize?: number;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string | null>("skillReadiness");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [expandedRegId, setExpandedRegId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<InstitutionStudent | null>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.regId.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.placementStatus === statusFilter;
      const matchesYear = yearFilter === "all" || s.year === yearFilter;
      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [students, search, statusFilter, yearFilter]);

  const accessor = (row: InstitutionStudent, key: string): number | string => {
    switch (key) {
      case "regId": return row.regId;
      case "name": return row.name;
      case "department": return row.department;
      case "year": return row.year;
      case "skillReadiness": return row.skillReadiness;
      case "employabilityScore": return row.employabilityScore;
      case "placementStatus": return ["placed", "interning", "seeking", "not-assessed"].indexOf(row.placementStatus);
      default: return 0;
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = accessor(a, sortKey);
      const bVal = accessor(b, sortKey);
      const cmp = typeof aVal === "number" && typeof bVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when filters change
  useMemo(() => { setPage(0); }, [search, statusFilter, yearFilter]);

  const readinessColor = (val: number) =>
    val >= 70 ? "text-emerald-500" : val >= 45 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="space-y-4">
      {/* Search + Filters + Export */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or registration ID…"
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="placed">Placed</option>
          <option value="interning">Interning</option>
          <option value="seeking">Seeking</option>
          <option value="not-assessed">Not Assessed</option>
        </select>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
        >
          <option value="all">All Years</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>
        <ExportDropdown
          filename={departmentName ? `${departmentName}_students` : "institution_students"}
          title={departmentName ? `${departmentName} Students Directory` : "Institution Student Directory"}
          headers={[
            "Reg ID", "Name", "Department", "Year", "Email", "Career Goal",
            "Skill Readiness", "Employability Score", "Placement Status",
            "Top Skills", "Assessed Date",
          ]}
          rows={filtered.map((s) => [
            s.regId,
            s.name,
            s.department,
            s.year,
            s.email,
            s.careerGoal,
            s.skillReadiness,
            s.employabilityScore,
            statusConfig[s.placementStatus]?.label ?? s.placementStatus,
            s.topSkills.map((sk) => `${sk.name}(${sk.score})`).join("; "),
            s.assessedDate ?? "N/A",
          ])}
          label="Export"
        />
      </SearchFilterBar>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised/50">
              <SortableHeader label="Reg ID" sortKey="regId" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[110px]" />
              <SortableHeader label="Name" sortKey="name" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[140px]" />
              {showDeptColumn && (
                <SortableHeader label="Department" sortKey="department" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[120px]" />
              )}
              <SortableHeader label="Year" sortKey="year" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} />
              <SortableHeader label="Readiness" sortKey="skillReadiness" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
              <SortableHeader label="Employability" sortKey="employabilityScore" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
              <SortableHeader label="Status" sortKey="placementStatus" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} />
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted min-w-[60px]">Details</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={showDeptColumn ? 8 : 7} className="px-3 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 text-ink-faint/50" />
                    <p className="text-sm font-medium text-ink">No students found</p>
                    <p className="max-w-xs text-xs text-ink-muted">
                      Try adjusting your search term or filters. You can search by student name or registration ID.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((s) => {
                const cfg = statusConfig[s.placementStatus];
                const isExpanded = expandedRegId === s.regId;
                return (
                  <Fragment key={s.regId}>
                    <tr
                      className={cn(
                        "border-b border-border/40 transition-colors hover:bg-surface-raised/30",
                        isExpanded && "bg-accent-soft/20"
                      )}
                    >
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold text-accent tabular">{s.regId}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="text-left group/name focus:outline-none"
                        >
                          <span className="font-medium text-ink group-hover/name:text-accent group-hover/name:underline transition-colors flex items-center gap-1">
                            {s.name}
                            <FileText className="h-3 w-3 opacity-0 group-hover/name:opacity-100 transition-opacity text-accent" />
                          </span>
                          <p className="text-[10px] text-ink-faint">{s.email}</p>
                        </button>
                      </td>
                      {showDeptColumn && (
                        <td className="px-3 py-2.5 text-xs text-ink-muted">{s.department}</td>
                      )}
                      <td className="px-3 py-2.5 text-xs text-ink-muted">{s.year}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="hidden sm:block h-1.5 w-12 overflow-hidden rounded-full bg-surface-raised">
                            <div
                              className={cn("h-full rounded-full", s.skillReadiness >= 70 ? "bg-emerald-500" : s.skillReadiness >= 45 ? "bg-amber-500" : "bg-rose-500")}
                              style={{ width: `${s.skillReadiness}%` }}
                            />
                          </div>
                          <span className={cn("font-mono text-xs font-bold tabular", readinessColor(s.skillReadiness))}>{s.skillReadiness}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={cn("font-mono text-xs font-bold tabular", readinessColor(s.employabilityScore))}>{s.employabilityScore}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={cfg.tone}>{cfg.label}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedRegId(isExpanded ? null : s.regId)}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                              isExpanded ? "bg-accent text-white" : "bg-surface-raised/60 text-ink-muted hover:bg-accent-soft hover:text-accent"
                            )}
                            title="Quick preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-raised/60 text-ink-muted hover:bg-accent-soft hover:text-accent transition-colors"
                            title="Full Dossier & Actions"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${s.regId}-detail`} className="border-b border-border/40 bg-accent-soft/10">
                        <td colSpan={showDeptColumn ? 8 : 7} className="px-4 py-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Career Goal</p>
                              <p className="mt-0.5 text-sm font-medium text-ink">{s.careerGoal}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Last Assessed</p>
                              <p className="mt-0.5 text-sm font-medium text-ink">{s.assessedDate ?? "Not assessed"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint mb-1">Top Skills</p>
                              <div className="flex flex-wrap gap-1.5">
                                {s.topSkills.map((sk) => (
                                  <span
                                    key={sk.name}
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                      sk.score >= 70 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                        : sk.score >= 45 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                        : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                                    )}
                                  >
                                    {sk.name}
                                    <span className="font-mono">{sk.score}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end border-t border-border/40 pt-2.5">
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Open Full Dossier & Actions
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-faint">
          Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length} students
          {sorted.length !== students.length && ` (filtered from ${students.length})`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-raised transition-colors"
            >
              Previous
            </button>
            <span className="px-2 text-xs font-medium text-ink-muted">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-raised transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Student Profile Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
