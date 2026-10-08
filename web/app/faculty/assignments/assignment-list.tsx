"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Assignment, AssignmentStatus } from "@/data/assignments";
import type {
  AssignmentSubject,
  AssignmentWithStats,
} from "@/lib/api/assignments";
import { isAssignmentOverdue } from "./overdue";
import { useTodayIST } from "./overdue-badge";

const LOCAL_KEY = "theplug-assignments";

const STATUS_ORDER: Record<AssignmentStatus, number> = {
  Published: 0,
  Draft: 1,
  Closed: 2,
};

const statusTone = {
  Published: "accent",
  Draft: "neutral",
  Closed: "success",
} as const;

interface ListItem extends AssignmentWithStats {
  isLocal: boolean;
}

interface RubricRow {
  key: number;
  label: string;
  marks: string;
}

// Parsed as a local date on purpose: `new Date("2026-09-15")` is UTC midnight,
// which lands on the previous day west of Greenwich.
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return iso;
  // Explicit locale so the server render and the client render agree.
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function AssignmentList({
  assignments,
  subjects,
}: {
  assignments: AssignmentWithStats[];
  subjects: AssignmentSubject[];
}) {
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | AssignmentStatus>(
    "All",
  );
  const [localAssignments, setLocalAssignments] = useState<Assignment[]>([]);
  // Overdue badges wait for today's date; none show before it is known.
  const today = useTodayIST();

  // Create form
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [submissionFormat, setSubmissionFormat] = useState("");
  const [attachments, setAttachments] = useState("");
  const rowKey = useRef(1);
  const [rubric, setRubric] = useState<RubricRow[]>([
    { key: 0, label: "", marks: "" },
  ]);

  // Read after mount only, so the server render and the first client render
  // match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) setLocalAssignments(parsed as Assignment[]);
    } catch (e) {
      console.error("Failed to read assignments from localStorage", e);
    }
  }, []);

  const items = useMemo<ListItem[]>(() => {
    const local: ListItem[] = localAssignments.map((a) => {
      const subject = subjects.find((s) => s.id === a.subjectId);
      return {
        ...a,
        subjectName: subject?.name ?? a.subjectId,
        subjectCode: subject?.code ?? a.subjectId,
        // Created here, so nobody has submitted anything yet.
        totalStudents: 0,
        submittedCount: 0,
        notSubmittedCount: 0,
        lateCount: 0,
        evaluatedCount: 0,
        averageMarks: null,
        isLocal: true,
      };
    });

    return [
      ...assignments.map((a) => ({ ...a, isLocal: false })),
      ...local,
    ].sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        a.dueDate.localeCompare(b.dueDate),
    );
  }, [assignments, localAssignments, subjects]);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      item.title.toLowerCase().includes(q) ||
      item.subjectName.toLowerCase().includes(q) ||
      item.subjectCode.toLowerCase().includes(q);
    const matchesSubject =
      subjectFilter === "All" || item.subjectCode === subjectFilter;
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;
    return matchesQuery && matchesSubject && matchesStatus;
  });

  const rubricTotal = rubric.reduce((sum, row) => sum + toNumber(row.marks), 0);
  const maxMarksValue = toNumber(maxMarks);
  const rubricMismatch = maxMarks !== "" && rubricTotal !== maxMarksValue;

  function updateRow(key: number, patch: Partial<Omit<RubricRow, "key">>) {
    setRubric((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    const key = rowKey.current++;
    setRubric((rows) => [...rows, { key, label: "", marks: "" }]);
  }

  function removeRow(key: number) {
    setRubric((rows) => rows.filter((row) => row.key !== key));
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setSubjectId(subjects[0]?.id ?? "");
    setDueDate("");
    setMaxMarks("");
    setSubmissionFormat("");
    setAttachments("");
    setRubric([{ key: rowKey.current++, label: "", marks: "" }]);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const assignment: Assignment = {
      id: `local-${Date.now()}`,
      subjectId,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      maxMarks: maxMarksValue,
      submissionFormat: submissionFormat.trim(),
      // Not published to anyone yet — it only exists in this browser.
      status: "Draft",
      attachments: attachments
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name !== ""),
      rubric: rubric
        .filter((row) => row.label.trim() !== "")
        .map((row) => ({
          label: row.label.trim(),
          maxMarks: toNumber(row.marks),
        })),
    };

    const next = [...localAssignments, assignment];
    setLocalAssignments(next);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } catch (err) {
      console.error("Failed to save assignment to localStorage", err);
    }

    resetForm();
    setFormOpen(false);
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold tracking-tight text-ink">
          All assignments
        </h3>
        {!formOpen && (
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            New assignment
          </Button>
        )}
      </div>

      {/* Create form */}
      {formOpen && (
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <h3 className="text-sm font-bold tracking-tight text-ink">
              New assignment
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label="Close form"
              className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Description
              </label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">
                  Course *
                </label>
                <Select
                  className="text-xs"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-ink">
                  Deadline *
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-ink">
                  Maximum marks *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-ink-muted">
                  Rubric total:{" "}
                  <span className="tabular text-ink">
                    {rubricTotal}
                  </span>
                  {maxMarks !== "" && (
                    <>
                      {" "}
                      of{" "}
                      <span className="tabular text-ink">
                        {maxMarksValue}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">
                  Submission format
                </label>
                <Input
                  placeholder="e.g. PDF report + source code"
                  value={submissionFormat}
                  onChange={(e) => setSubmissionFormat(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-ink">
                  Attachments
                </label>
                <Input
                  placeholder="Comma-separated file names"
                  value={attachments}
                  onChange={(e) => setAttachments(e.target.value)}
                />
              </div>
            </div>

            {/* Rubric builder */}
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Rubric
              </label>
              <div className="space-y-2">
                {rubric.map((row) => (
                  <div key={row.key} className="flex items-center gap-2">
                    <Input
                      placeholder="Criterion"
                      value={row.label}
                      onChange={(e) =>
                        updateRow(row.key, { label: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Marks"
                      className="w-24 shrink-0"
                      value={row.marks}
                      onChange={(e) =>
                        updateRow(row.key, { marks: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(row.key)}
                      aria-label="Remove criterion"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addRow}
              >
                <Plus className="h-3.5 w-3.5" />
                Add criterion
              </Button>

              {rubricMismatch && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Rubric marks add up to {rubricTotal}, but maximum marks is{" "}
                  {maxMarksValue}. You can still save.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save assignment
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search bar & filters */}
      <Card className="mt-4 p-4">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <Input
              placeholder="Search by title or subject..."
              className="pl-9 text-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              className="text-xs"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="All">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code} — {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select
              className="text-xs"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | AssignmentStatus)
              }
            >
              <option value="All">All statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Closed">Closed</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Assignment cards */}
      {filtered.length === 0 ? (
        <Card className="mt-4 p-6 text-center">
          <p className="text-sm font-semibold text-ink">
            No assignments match these filters
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Try a different search, subject or status.
          </p>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/faculty/assignments/${item.id}`}
              className="block"
            >
              <Card className="p-5 hover:border-accent/40">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-ink">{item.title}</h3>
                  <Badge tone="neutral">
                    {item.subjectCode}
                  </Badge>
                  <Badge tone={statusTone[item.status]}>{item.status}</Badge>
                  {today !== null &&
                    isAssignmentOverdue(item.status, item.dueDate, today) && (
                      <Badge tone="danger">Overdue</Badge>
                    )}
                  {item.isLocal && <Badge tone="neutral">Local</Badge>}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span>
                    Due{" "}
                    <span className="text-ink">{formatDate(item.dueDate)}</span>
                  </span>
                  <span>
                    <span className="tabular text-ink">
                      {item.maxMarks}
                    </span>{" "}
                    marks
                  </span>
                  {item.submissionFormat && <span>{item.submissionFormat}</span>}
                </div>

                <p className="mt-3 border-t border-border pt-3 text-xs text-ink-muted">
                  <span className="tabular text-ink">
                    {item.submittedCount} of {item.totalStudents}
                  </span>{" "}
                  submitted ·{" "}
                  <span className="tabular text-ink">
                    {item.lateCount}
                  </span>{" "}
                  late ·{" "}
                  <span className="tabular text-ink">
                    {item.evaluatedCount}
                  </span>{" "}
                  evaluated
                  {item.averageMarks !== null && (
                    <>
                      {" "}
                      · average{" "}
                      <span className="tabular text-ink">
                        {item.averageMarks} / {item.maxMarks}
                      </span>
                    </>
                  )}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
