import type { RefObject } from "react";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
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
import {
  ATTENDANCE_MIN,
  INTERNAL_LOW,
  getAttentionReasons,
  pickNextSteps,
  scoreTone,
  type CohortStudentRow,
} from "@/lib/api/faculty-students-meta";
import type { StudentDetail } from "@/lib/api/faculty-roster";
import {
  SCORE_BAR,
  SCORE_TEXT,
  textLinkClass,
} from "@/components/faculty/curriculum/utils";
import { ATTENTION_MIN_TEXT } from "./attention";
import {
  PLAN_TONE,
  assignmentBadge,
  formatShortISODate,
} from "./detail-utils";
import { StudentNotesCard } from "./StudentNotesCard";
import { TaughtInLine } from "./TaughtInLine";

// The first tab of a student's page: warnings, how they are doing in my
// subjects, a skill summary with next steps, and private notes.

function WarningsCard({
  row,
  todayISO,
}: {
  row: CohortStudentRow;
  todayISO: string | null;
}) {
  const reasons = todayISO === null ? null : getAttentionReasons(row, todayISO);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Warnings</CardTitle>
          <CardDescription>{ATTENTION_MIN_TEXT}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {reasons === null ? (
          <>
            <div className="space-y-2" aria-hidden="true">
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-raised" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-raised" />
            </div>
            <p className="sr-only" role="status">
              Checking warnings…
            </p>
          </>
        ) : reasons.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <CircleCheck className="h-4 w-4 text-success" aria-hidden="true" />
            No warnings for this student.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {reasons.map((reason, i) => {
              const high = reason.severity === "high";
              const Icon = high ? TriangleAlert : CircleAlert;
              return (
                <li
                  key={`${reason.kind}-${reason.subjectId ?? ""}-${reason.assignmentId ?? ""}-${i}`}
                  className={cn(
                    "flex items-start gap-2 text-sm",
                    high ? "text-danger" : "text-warning",
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="sr-only">{high ? "Urgent: " : "Warning: "}</span>
                    {reason.text}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MarkBar({
  label,
  value,
  suffix,
  low,
}: {
  label: string;
  value: number;
  suffix: string;
  low: number;
}) {
  const below = value < low;
  const tone = below ? "danger" : scoreTone(value);
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className={cn("font-bold tabular", below ? "text-danger" : "text-ink")}>
          {value}
          {suffix}
        </span>
      </div>
      <Progress className="mt-1.5" value={value} barClassName={SCORE_BAR[tone]} />
    </div>
  );
}

function MySubjectsCard({
  row,
  todayISO,
}: {
  row: CohortStudentRow;
  todayISO: string | null;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>In my subjects</CardTitle>
          <CardDescription>
            {row.currentSemester !== null
              ? `Your subjects in semester ${row.currentSemester}`
              : "Your subjects this semester"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {row.subjects.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-center text-xs text-ink-muted">
            This student is not taking any of your subjects this semester.
          </p>
        ) : (
          <ul className="space-y-3">
            {row.subjects.map((subject) => {
              const work = row.assignments.filter(
                (a) => a.subjectId === subject.subjectId,
              );
              return (
                <li
                  key={subject.subjectId}
                  className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {subject.name}
                    </span>
                    <Badge tone="neutral">{subject.code}</Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <MarkBar
                      label="Internal marks"
                      value={subject.internalMarks}
                      suffix="/100"
                      low={INTERNAL_LOW}
                    />
                    <MarkBar
                      label="Attendance"
                      value={subject.attendance}
                      suffix="%"
                      low={ATTENDANCE_MIN}
                    />
                  </div>

                  {work.length > 0 && (
                    <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                      {work.map((a) => {
                        const badge = assignmentBadge(a, todayISO);
                        return (
                          <li
                            key={a.assignmentId}
                            className="flex flex-wrap items-center justify-between gap-2 text-xs"
                          >
                            <span className="min-w-0">
                              <span className="font-semibold text-ink">{a.title}</span>
                              <span className="text-ink-muted">
                                {" "}
                                · Due{" "}
                                <span className="tabular">
                                  {formatShortISODate(a.dueDate)}
                                </span>
                              </span>
                            </span>
                            <span className="flex items-center gap-2">
                              {a.marks !== null && (
                                <span className="font-bold text-ink tabular">
                                  {a.marks}/{a.maxMarks}
                                </span>
                              )}
                              {badge === null ? (
                                <span
                                  className="inline-block h-5 w-24 animate-pulse rounded-full bg-surface-raised"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Badge tone={badge.tone}>{badge.label}</Badge>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SkillSummaryCard({
  row,
  totalSkills,
  onSeeAllSkills,
}: {
  row: CohortStudentRow;
  totalSkills: number;
  onSeeAllSkills: () => void;
}) {
  const tiles = [
    { label: "Learnt", value: row.skillSummary.learnt, tone: "text-success" },
    { label: "Developing", value: row.skillSummary.developing, tone: "text-warning" },
    { label: "To learn", value: row.skillSummary.toLearn, tone: "text-danger" },
    { label: "Not assessed", value: row.skillSummary.notAssessed, tone: "text-ink-muted" },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Skill summary</CardTitle>
          <CardDescription>
            Based on the <span className="tabular">{totalSkills}</span> skills
            that postings for {row.careerGoal} ask for.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-lg border border-border bg-surface-raised/40 px-3 py-2"
            >
              <p className={cn("text-xl font-extrabold tabular", tile.tone)}>
                {tile.value}
              </p>
              <p className="text-[11px] text-ink-muted">{tile.label}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onSeeAllSkills}
          className={cn("mt-3", textLinkClass)}
        >
          See all skills
        </button>
      </CardContent>
    </Card>
  );
}

function NextStepsCard({ detail }: { detail: StudentDetail }) {
  const steps = pickNextSteps(detail.skillPlan);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>
            The skills to work on first, most asked for by postings
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <p className="text-xs text-ink-muted">
            No skill gaps to work on right now.
          </p>
        ) : (
          <ul className="space-y-2">
            {steps.map((step) => (
              <li
                key={step.skillId}
                className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{step.name}</span>
                    <Badge tone={PLAN_TONE[step.status]}>{step.status}</Badge>
                  </div>
                  {step.score !== null && (
                    <span
                      className={cn(
                        "text-sm font-extrabold tabular",
                        SCORE_TEXT[scoreTone(step.score)],
                      )}
                    >
                      {step.score}%
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  <span className="tabular">
                    {step.demandCount} of {detail.totalPostings}
                  </span>{" "}
                  postings
                </p>
                <div className="mt-1">
                  <TaughtInLine refs={step.taughtIn} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function StudentOverviewTab({
  row,
  detail,
  todayISO,
  noteRef,
  onSeeAllSkills,
}: {
  row: CohortStudentRow;
  detail: StudentDetail;
  todayISO: string | null;
  noteRef: RefObject<HTMLTextAreaElement>;
  onSeeAllSkills: () => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      <WarningsCard row={row} todayISO={todayISO} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MySubjectsCard row={row} todayISO={todayISO} />
        <div className="space-y-4">
          <SkillSummaryCard
            row={row}
            totalSkills={detail.skillPlan.length}
            onSeeAllSkills={onSeeAllSkills}
          />
          <NextStepsCard detail={detail} />
        </div>
      </div>

      <StudentNotesCard
        studentId={row.id}
        studentName={row.name}
        textareaRef={noteRef}
      />
    </div>
  );
}
