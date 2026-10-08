import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SemesterAcademics } from "@/lib/api/academics";
import { scoreTone } from "@/lib/api/faculty-students-meta";
import { SCORE_BAR, SCORE_TEXT } from "@/components/faculty/curriculum/utils";
import { SEMESTER_TONE } from "./detail-utils";

// The full programme transcript, newest semester first, with the semester the
// student is sitting now open and the rest folded.

function Tile({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Mark({
  label,
  value,
  suffix,
  pendingText,
}: {
  label: string;
  value: number | null;
  suffix: string;
  pendingText?: string;
}) {
  const tone = value === null ? null : scoreTone(value);
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-muted">{label}</span>
        {value !== null && tone !== null && (
          <span className={cn("font-bold tabular", SCORE_TEXT[tone])}>
            {value}
            {suffix}
          </span>
        )}
      </div>
      {value !== null && tone !== null ? (
        <Progress className="mt-1.5" value={value} barClassName={SCORE_BAR[tone]} />
      ) : (
        <p className="mt-1.5 text-xs text-ink-muted">{pendingText}</p>
      )}
    </div>
  );
}

export function StudentAcademicsTab({
  transcript,
  cgpa,
  mySubjectIds,
}: {
  transcript: SemesterAcademics;
  cgpa: number | null;
  // My subjects in the student's in-progress semester.
  mySubjectIds: string[];
}) {
  const mine = new Set(mySubjectIds);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Academic performance</CardTitle>
          <CardDescription>
            Semester-wise marks and attendance across the programme
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Tile label="CGPA">
            <p className="text-2xl font-extrabold text-ink tabular">
              {cgpa !== null ? `${cgpa} / 10` : "—"}
            </p>
          </Tile>
          <Tile label="Overall attendance">
            <p
              className={cn(
                "text-2xl font-extrabold tabular",
                SCORE_TEXT[scoreTone(transcript.overallAttendance)],
              )}
            >
              {transcript.overallAttendance}%
            </p>
          </Tile>
          <Tile label="Semesters completed">
            <p className="text-2xl font-extrabold text-ink tabular">
              {transcript.completedSemesters}
              {transcript.currentSemester !== null && (
                <span className="ml-2 text-xs font-medium text-ink-muted">
                  now in semester {transcript.currentSemester}
                </span>
              )}
            </p>
          </Tile>
        </div>

        {transcript.semesters.length === 0 ? (
          <p className="mt-4 rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-center text-xs text-ink-muted">
            No semester record for this student yet.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {transcript.semesters.map((sem, i) => {
              const inProgress = sem.status === "In Progress";
              return (
                <details
                  key={sem.semester}
                  open={i === 0}
                  className="group rounded-lg border border-border bg-surface-raised/40"
                >
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
                    <span className="flex flex-wrap items-center gap-2.5">
                      <ChevronDown
                        className="h-3.5 w-3.5 text-ink-muted transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-ink">
                        Semester {sem.semester}
                      </span>
                      <Badge tone={SEMESTER_TONE[sem.status]}>{sem.status}</Badge>
                    </span>
                    {sem.sgpa !== null && (
                      <span className="text-sm font-extrabold text-ink tabular">
                        SGPA {sem.sgpa}
                      </span>
                    )}
                  </summary>

                  <div className="space-y-2 border-t border-border px-4 py-3">
                    {sem.rows.map((row) => {
                      // Either mark below the pass line is worth a faculty look.
                      const flagged = row.internalMarks < 60 || row.attendance < 75;
                      const teach = inProgress && mine.has(row.subjectId);

                      return (
                        <div
                          key={row.subjectId}
                          className="rounded-lg border border-border bg-surface/60 px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-sm font-semibold text-ink">
                                {row.name}
                              </span>
                              <Badge tone="neutral">{row.code}</Badge>
                              {row.credits !== null && (
                                <span className="text-xs text-ink-muted tabular">
                                  {row.credits} credits
                                </span>
                              )}
                              {teach && <Badge tone="accent">You teach this</Badge>}
                            </div>
                            {flagged && <Badge tone="danger">Needs attention</Badge>}
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Mark
                              label="Internal marks"
                              value={row.internalMarks}
                              suffix=" / 100"
                            />
                            <Mark
                              label="Semester marks"
                              value={row.semesterMarks}
                              suffix=" / 100"
                              pendingText="Exam pending"
                            />
                            <Mark
                              label="Attendance"
                              value={row.attendance}
                              suffix="%"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
