"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InternshipStatus } from "@/data/faculty-student-records";
import {
  scoreTone,
  type CohortStudentRow,
} from "@/lib/api/faculty-students-meta";
import { SCORE_BAR, SCORE_TEXT } from "@/components/faculty/curriculum/utils";
import {
  INTERNSHIP_STATUSES,
  INTERNSHIP_STATUS_TONE,
  READINESS_TONE,
  lowestAttendance,
  studentHref,
} from "./utils";

// The filterable, sortable list of tracked students. Each card is a link to the
// student page with nothing interactive inside it.

type ShowFilter = "all" | "attention";
type SortKey = "name" | "readiness" | "attendance" | "cgpa";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name A–Z" },
  { value: "readiness", label: "Readiness low → high" },
  { value: "attendance", label: "Attendance low → high" },
  { value: "cgpa", label: "CGPA high → low" },
];

// Missing values always sort last, whichever way the list runs.
function compareNullable(a: number | null, b: number | null, dir: 1 | -1) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

function sortRows(rows: CohortStudentRow[], key: SortKey): CohortStudentRow[] {
  const byName = (a: CohortStudentRow, b: CohortStudentRow) =>
    a.name.localeCompare(b.name, "en");
  return [...rows].sort((a, b) => {
    switch (key) {
      case "name":
        return byName(a, b);
      case "readiness":
        return a.skillReadiness - b.skillReadiness || byName(a, b);
      case "attendance":
        return (
          compareNullable(lowestAttendance(a), lowestAttendance(b), 1) ||
          byName(a, b)
        );
      case "cgpa":
        return compareNullable(a.cgpa, b.cgpa, -1) || byName(a, b);
    }
  });
}

export function RosterTab({
  students,
  attentionIds,
}: {
  students: CohortStudentRow[];
  // Students with a warning; null until the browser knows today's date.
  attentionIds: Set<string> | null;
}) {
  const ids = useId();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("All");
  const [status, setStatus] = useState<"All" | InternshipStatus>("All");
  const [show, setShow] = useState<ShowFilter>("all");
  const [sort, setSort] = useState<SortKey>("name");

  const presentYears = useMemo(
    () => [...new Set(students.map((s) => s.yearLabel))].sort(),
    [students],
  );

  const needle = query.trim().toLowerCase();
  const filtered = sortRows(
    students.filter((row) => {
      if (year !== "All" && row.yearLabel !== year) return false;
      if (status !== "All" && row.latestInternship?.status !== status) {
        return false;
      }
      if (show === "attention" && !(attentionIds?.has(row.id) ?? false)) {
        return false;
      }
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        (row.rollNumber?.toLowerCase().includes(needle) ?? false) ||
        row.careerGoal.toLowerCase().includes(needle)
      );
    }),
    sort,
  );

  function clearFilters() {
    setQuery("");
    setYear("All");
    setStatus("All");
    setShow("all");
  }

  const labelClass = "sr-only";

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Student roster</CardTitle>
          <CardDescription>
            Filter by name, year, internship status or warnings, and sort the
            list
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full min-w-0 sm:w-auto sm:flex-1">
            <label htmlFor={`${ids}-search`} className={labelClass}>
              Search students
            </label>
            <Search
              className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted"
              aria-hidden="true"
            />
            <Input
              id={`${ids}-search`}
              type="search"
              placeholder="Search by name, roll number, or career goal..."
              className="pl-9 text-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-36">
            <label htmlFor={`${ids}-year`} className={labelClass}>
              Year
            </label>
            <Select
              id={`${ids}-year`}
              className="text-xs"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="All">All years</option>
              {presentYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <label htmlFor={`${ids}-status`} className={labelClass}>
              Latest internship status
            </label>
            <Select
              id={`${ids}-status`}
              className="text-xs"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "All" | InternshipStatus)
              }
            >
              <option value="All">All internship statuses</option>
              {INTERNSHIP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor={`${ids}-show`} className={labelClass}>
              Show
            </label>
            <Select
              id={`${ids}-show`}
              className="text-xs"
              value={show}
              onChange={(e) => setShow(e.target.value as ShowFilter)}
            >
              <option value="all">All students</option>
              <option value="attention" disabled={attentionIds === null}>
                {attentionIds === null
                  ? "Needs attention (…)"
                  : `Needs attention (${attentionIds.size})`}
              </option>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <label htmlFor={`${ids}-sort`} className={labelClass}>
              Sort by
            </label>
            <Select
              id={`${ids}-sort`}
              className="text-xs"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <p className="sr-only" role="status">
          {filtered.length} of {students.length} students shown
        </p>

        {filtered.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-center">
            <p className="text-xs text-ink-muted">
              No students match these filters.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {filtered.map((row) => {
              const flagged = attentionIds?.has(row.id) ?? false;
              const s = row.skillSummary;
              return (
                <li key={row.id}>
                  <Link
                    href={studentHref(row.id)}
                    className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    <Card className="p-4 hover:border-accent/40">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-ink">
                              {row.name}
                            </span>
                            {row.rollNumber && (
                              <Badge tone="neutral" className="text-[11px] tabular">
                                {row.rollNumber}
                              </Badge>
                            )}
                            {attentionIds === null ? (
                              <span
                                className="inline-block h-3.5 w-3.5 animate-pulse rounded-full bg-surface-raised"
                                aria-hidden="true"
                              />
                            ) : (
                              flagged && (
                                <span className="inline-flex items-center text-danger">
                                  <TriangleAlert
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                  <span className="sr-only">Needs attention</span>
                                </span>
                              )
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {row.yearLabel} · {row.careerGoal} · CGPA{" "}
                            <span className="tabular">{row.cgpa ?? "—"}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          {row.latestInternship && (
                            <Badge
                              tone={INTERNSHIP_STATUS_TONE[row.latestInternship.status]}
                            >
                              {row.latestInternship.status}
                            </Badge>
                          )}
                          <Badge tone={READINESS_TONE[row.readiness]}>
                            {row.readiness}
                          </Badge>
                          <span
                            className={cn(
                              "text-sm font-extrabold tabular",
                              SCORE_TEXT[scoreTone(row.skillReadiness)],
                            )}
                          >
                            {row.skillReadiness}%
                            <span className="sr-only"> readiness</span>
                          </span>
                          <ArrowRight
                            className="h-3.5 w-3.5 text-ink-muted"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <Progress
                        className="mt-3"
                        value={row.skillReadiness}
                        barClassName={SCORE_BAR[scoreTone(row.skillReadiness)]}
                      />

                      <p className="mt-2 text-xs text-ink-muted tabular">
                        {s.learnt} learnt · {s.developing} developing ·{" "}
                        {s.toLearn} to learn · {s.notAssessed} not assessed
                      </p>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
