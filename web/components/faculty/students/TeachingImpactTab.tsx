import Link from "next/link";
import { BookOpen, FilePenLine } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  VERDICT_TEXT,
  scoreTone,
  type SubjectImpactRow,
} from "@/lib/api/faculty-students-meta";
import {
  SCORE_BAR,
  SCORE_TEXT,
  draftHref,
  joinNames,
  linkButtonClass,
  subjectHref,
} from "@/components/faculty/curriculum/utils";
import { cn } from "@/lib/utils";
import { VERDICT_LABEL, VERDICT_TONE } from "./utils";

// Each subject's industry alignment next to how tracked students score on the
// skills it teaches, with the verdict worked out in the meta file.

function Bar({
  label,
  value,
  emptyText,
}: {
  label: string;
  value: number | null;
  emptyText: string;
}) {
  if (value === null) {
    return (
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="mt-1.5 text-xs text-ink-muted">{emptyText}</p>
      </div>
    );
  }
  const tone = scoreTone(value);
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className={cn("font-bold tabular", SCORE_TEXT[tone])}>
          {value}%
        </span>
      </div>
      <Progress className="mt-1.5" value={value} barClassName={SCORE_BAR[tone]} />
    </div>
  );
}

export function TeachingImpactTab({ rows }: { rows: SubjectImpactRow[] }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Is my teaching landing?</CardTitle>
          <CardDescription>
            Industry alignment of each syllabus next to how your tracked
            students score on the skills it teaches.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-center text-xs text-ink-muted">
            No subjects are assigned to you yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => {
              const facts = [
                row.classInternalAverage !== null
                  ? `Class internal average ${row.classInternalAverage}/100`
                  : null,
                row.classAttendanceAverage !== null
                  ? `attendance ${row.classAttendanceAverage}%`
                  : null,
              ].filter((f): f is string => f !== null);

              return (
                <li
                  key={row.subjectId}
                  className="rounded-lg border border-border bg-surface-raised/40 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-ink">
                          {row.name}
                        </h4>
                        <Badge tone="neutral">{row.code}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Semester <span className="tabular">{row.semester}</span> ·{" "}
                        <span className="tabular">{row.studentsTaking}</span>{" "}
                        tracked {row.studentsTaking === 1 ? "student" : "students"}{" "}
                        taking it now
                      </p>
                    </div>
                    <Badge tone={VERDICT_TONE[row.verdict]}>
                      {VERDICT_LABEL[row.verdict]}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Bar
                      label="Industry alignment"
                      value={row.alignmentScore}
                      emptyText="No alignment score"
                    />
                    <Bar
                      label="Student skill score"
                      value={row.skillAverage}
                      emptyText="No student skill data"
                    />
                  </div>

                  {facts.length > 0 && (
                    <p className="mt-3 text-xs text-ink-muted tabular">
                      {facts.join(" · ")}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-ink">{VERDICT_TEXT[row.verdict]}</p>

                  {row.unmeasuredSkillNames.length > 0 && (
                    <p className="mt-1 text-xs text-ink-muted">
                      {row.measuredSkillNames.length > 0
                        ? `Skill score is based on ${joinNames(row.measuredSkillNames)}. `
                        : ""}
                      No student data yet for{" "}
                      {joinNames(row.unmeasuredSkillNames)}.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={subjectHref(row.subjectId)}
                      className={linkButtonClass("secondary")}
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      View subject
                      <span className="sr-only"> {row.code}</span>
                    </Link>
                    <Link
                      href={draftHref(row.subjectId)}
                      className={linkButtonClass("ghost")}
                    >
                      <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
                      Open syllabus draft
                      <span className="sr-only"> for {row.code}</span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
