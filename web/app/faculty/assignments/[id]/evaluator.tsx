"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input, Textarea } from "@/components/ui/input";
import type { Submission, SubmissionStatus } from "@/data/assignments";
import type { AssignmentWithStats } from "@/lib/api/assignments";
import { isoDateInZone } from "@/components/faculty/dashboard/utils";

const EVALUATIONS_KEY = "theplug-evaluations";

const statusTone = {
  Submitted: "accent",
  Late: "warning",
  "Not Submitted": "danger",
  Evaluated: "cyan",
  Returned: "success",
} as const;

const FILTERS = [
  "All",
  "Awaiting evaluation",
  "Evaluated",
  "Not submitted",
] as const;
type Filter = (typeof FILTERS)[number];

interface Evaluation {
  rubricScores: Record<string, number>;
  comments: string;
  feedback: string;
  returned: boolean;
  lateDeduction: number;
  // The date "Return to student" was pressed, shown on the Returned badge.
  returnedOn: string | null;
  // Set by "Mark as late submission" on work the data lists as not submitted.
  markedLate: boolean;
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

// Today's calendar date in Asia/Kolkata, whatever zone the browser is in.
// Reads the clock, so it is only ever called from the "Return to student"
// click handler.
function todayISO(): string {
  return isoDateInZone(new Date());
}

// Where the data already recorded a late penalty, the final marks sit below
// the rubric scores by exactly that amount.
function recordedDeduction(submission: Submission): number {
  if (submission.marks === null) return 0;
  const awarded = submission.rubricScores.reduce((sum, r) => sum + r.awarded, 0);
  return Math.max(0, awarded - submission.marks);
}

function seedEvaluation(submission: Submission): Evaluation {
  const rubricScores: Record<string, number> = {};
  for (const score of submission.rubricScores) {
    rubricScores[score.label] = score.awarded;
  }
  const deduction = recordedDeduction(submission);

  return {
    rubricScores,
    comments: submission.comments ?? "",
    feedback: submission.feedback ?? "",
    returned: submission.status === "Returned",
    lateDeduction: deduction > 0 ? deduction : 2,
    returnedOn: submission.returnedOn,
    markedLate: false,
  };
}

function seedAll(submissions: Submission[]): Record<string, Evaluation> {
  const seeded: Record<string, Evaluation> = {};
  for (const s of submissions) seeded[s.id] = seedEvaluation(s);
  return seeded;
}

function readStored(): Record<string, Partial<Evaluation>> {
  const raw = localStorage.getItem(EVALUATIONS_KEY);
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, Partial<Evaluation>>)
    : {};
}

export function Evaluator({
  assignment,
  submissions,
}: {
  assignment: AssignmentWithStats;
  submissions: Submission[];
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>(
    () => seedAll(submissions),
  );

  // Read after mount only, so the server render and the first client render
  // match. Anything not stored falls back to what the data file has.
  useEffect(() => {
    try {
      const stored = readStored();
      setEvaluations((current) => {
        const merged: Record<string, Evaluation> = {};
        for (const [id, seed] of Object.entries(current)) {
          merged[id] = { ...seed, ...stored[id] };
        }
        return merged;
      });
    } catch (e) {
      console.error("Failed to read evaluations from localStorage", e);
    }
  }, []);

  function persist(next: Record<string, Evaluation>) {
    setEvaluations(next);
    try {
      // Merge so evaluations for other assignments under the same key survive.
      localStorage.setItem(
        EVALUATIONS_KEY,
        JSON.stringify({ ...readStored(), ...next }),
      );
    } catch (e) {
      console.error("Failed to save evaluations to localStorage", e);
    }
  }

  function update(id: string, patch: Partial<Evaluation>) {
    persist({ ...evaluations, [id]: { ...evaluations[id], ...patch } });
  }

  const isFullyScored = (ev: Evaluation) =>
    assignment.rubric.length > 0 &&
    assignment.rubric.every((c) => typeof ev.rubricScores[c.label] === "number");

  const wasLate = (s: Submission, ev: Evaluation) =>
    s.status === "Late" || ev.markedLate || recordedDeduction(s) > 0;

  function currentStatus(s: Submission, ev: Evaluation): SubmissionStatus {
    if (s.status === "Not Submitted" && !ev.markedLate) return "Not Submitted";
    if (ev.returned) return "Returned";
    if (isFullyScored(ev)) return "Evaluated";
    return wasLate(s, ev) ? "Late" : "Submitted";
  }

  const rows = submissions.map((submission) => {
    const ev = evaluations[submission.id] ?? seedEvaluation(submission);
    return { submission, ev, status: currentStatus(submission, ev) };
  });

  const submittedCount = rows.filter((r) => r.status !== "Not Submitted").length;
  const evaluatedCount = rows.filter(
    (r) => r.status === "Evaluated" || r.status === "Returned",
  ).length;
  const progress = submittedCount
    ? Math.round((evaluatedCount / submittedCount) * 100)
    : 0;

  const matchesFilter = (status: SubmissionStatus, f: Filter) => {
    if (f === "Awaiting evaluation")
      return status === "Submitted" || status === "Late";
    if (f === "Evaluated") return status === "Evaluated" || status === "Returned";
    if (f === "Not submitted") return status === "Not Submitted";
    return true;
  };

  const visible = rows.filter((r) => matchesFilter(r.status, filter));

  function setScore(id: string, label: string, max: number, raw: string) {
    const scores = { ...evaluations[id].rubricScores };
    if (raw === "") {
      delete scores[label];
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      scores[label] = Math.min(max, Math.max(0, n));
    }
    update(id, { rubricScores: scores });
  }

  function setDeduction(id: string, raw: string) {
    const n = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(n)) return;
    update(id, {
      lateDeduction: Math.min(assignment.maxMarks, Math.max(0, n)),
    });
  }

  return (
    <>
      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-extrabold tabular text-ink">
            {evaluatedCount} of {submittedCount}
          </span>
          <span className="text-xs text-ink-muted">submissions evaluated</span>
          <span className="ml-auto text-sm font-extrabold tabular text-accent">
            {progress}%
          </span>
        </div>
        <div className="mt-2">
          <Progress value={progress} />
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "primary" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="tabular opacity-70">
              {rows.filter((r) => matchesFilter(r.status, f)).length}
            </span>
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="mt-4 p-6 text-center">
          <p className="text-sm text-ink-muted">
            {submissions.length === 0
              ? "No students are enrolled on this assignment."
              : "No submissions in this view."}
          </p>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {visible.map(({ submission, ev, status }) => {
            const late = wasLate(submission, ev);
            const scoreSum = Object.values(ev.rubricScores).reduce(
              (sum, n) => sum + n,
              0,
            );
            const awarded = Math.max(
              0,
              scoreSum - (late ? ev.lateDeduction : 0),
            );
            const percent = assignment.maxMarks
              ? (awarded / assignment.maxMarks) * 100
              : 0;
            const totalColour =
              percent >= 70
                ? "text-emerald-700 dark:text-emerald-400"
                : percent >= 40
                  ? "text-amber-800 dark:text-amber-400"
                  : "text-rose-700 dark:text-rose-400";

            return (
              <Card key={submission.id} className="p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="text-sm font-bold text-ink">
                    {submission.studentName}
                  </h3>
                  <Badge tone={statusTone[status]}>{status}</Badge>
                  {submission.submittedOn && (
                    <span className="text-xs text-ink-muted">
                      Submitted {formatDate(submission.submittedOn)}
                    </span>
                  )}
                  {submission.fileName && (
                    <span className="text-xs text-ink-muted">
                      {submission.fileName}
                    </span>
                  )}
                </div>

                {status === "Not Submitted" ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-ink-muted">
                      Nothing submitted for this assignment.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => update(submission.id, { markedLate: true })}
                    >
                      Mark as late submission
                    </Button>
                  </div>
                ) : (
                  <details className="mt-3 rounded-lg border border-border bg-surface-raised/40">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 [&::-webkit-details-marker]:hidden">
                      <span className="text-xs font-bold text-ink">
                        Evaluation
                      </span>
                      <span
                        className={`text-sm font-extrabold tabular ${totalColour}`}
                      >
                        {awarded} / {assignment.maxMarks}
                      </span>
                    </summary>

                    <div className="space-y-4 border-t border-border px-4 py-4">
                      <div className="space-y-3">
                        {assignment.rubric.map((criterion) => (
                          <div
                            key={criterion.label}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                          >
                            {/* basis-40 makes the row wrap before the label
                                is squeezed below 10rem on narrow screens. */}
                            <div className="min-w-0 flex-1 basis-40">
                              <p className="text-sm text-ink">{criterion.label}</p>
                              <p className="text-xs text-ink-muted">
                                out of {criterion.maxMarks}
                              </p>
                            </div>
                            {/* Width lives on a wrapper: cn() is plain clsx, so
                                a width class on Input would lose to its w-full. */}
                            <div className="w-20 shrink-0">
                              <Input
                                type="number"
                                min={0}
                                max={criterion.maxMarks}
                                aria-label={`${criterion.label} marks`}
                                className="text-right"
                                value={ev.rubricScores[criterion.label] ?? ""}
                                onChange={(e) =>
                                  setScore(
                                    submission.id,
                                    criterion.label,
                                    criterion.maxMarks,
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {late && (
                        <div className="flex items-center justify-between gap-3">
                          <label
                            htmlFor={`${submission.id}-deduction`}
                            className="text-sm text-ink"
                          >
                            Late deduction
                          </label>
                          <Input
                            id={`${submission.id}-deduction`}
                            type="number"
                            min={0}
                            max={assignment.maxMarks}
                            className="w-24 shrink-0"
                            value={ev.lateDeduction}
                            onChange={(e) =>
                              setDeduction(submission.id, e.target.value)
                            }
                          />
                        </div>
                      )}

                      <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
                        <span className="text-xs font-bold text-ink">Total</span>
                        <span
                          className={`text-lg font-extrabold tabular ${totalColour}`}
                        >
                          {awarded} / {assignment.maxMarks}
                        </span>
                      </div>

                      <div>
                        <label
                          htmlFor={`${submission.id}-comments`}
                          className="mb-1 block text-xs font-bold text-ink"
                        >
                          Comments (not shown to the student)
                        </label>
                        <Textarea
                          id={`${submission.id}-comments`}
                          rows={2}
                          value={ev.comments}
                          onChange={(e) =>
                            update(submission.id, { comments: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`${submission.id}-feedback`}
                          className="mb-1 block text-xs font-bold text-ink"
                        >
                          Feedback for the student
                        </label>
                        <Textarea
                          id={`${submission.id}-feedback`}
                          rows={3}
                          value={ev.feedback}
                          onChange={(e) =>
                            update(submission.id, { feedback: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {ev.returned ? (
                          <>
                            <Badge tone="success">
                              Returned
                              {ev.returnedOn ? ` ${formatDate(ev.returnedOn)}` : ""}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                update(submission.id, {
                                  returned: false,
                                  returnedOn: null,
                                })
                              }
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reopen
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              update(submission.id, {
                                returned: true,
                                returnedOn: todayISO(),
                              })
                            }
                          >
                            <Send className="h-3.5 w-3.5" />
                            Return to student
                          </Button>
                        )}
                      </div>
                    </div>
                  </details>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
