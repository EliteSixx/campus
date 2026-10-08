import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
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
  SCORE_BAR,
  SCORE_TEXT,
  scoreTone,
  subjectHref,
  textLinkClass,
} from "@/components/faculty/curriculum/utils";
import { formatHours } from "@/components/faculty/timetable/utils";
import type { FacultyProfileDetail } from "@/data/faculty-profile";
import type { DevelopmentFocus, TeachingSubject, WeeklyHours } from "./utils";

// What this faculty member teaches, how the week is spent, where their depth
// is and what to learn next. Expertise and the development programme sit here
// rather than on Overview because they are read against the subjects and hours
// above them, not on their own.

const rowClass =
  "block rounded-lg border border-border bg-surface-raised/40 px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-raised/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

function SubjectRow({ subject }: { subject: TeachingSubject }) {
  const meta = [
    `Semester ${subject.semester}`,
    `${subject.credits} credits`,
    subject.enrolled !== null ? `${subject.enrolled} students` : null,
    subject.weeklyHours !== null
      ? `${formatHours(subject.weeklyHours)} a week`
      : null,
  ].filter((part): part is string => part !== null);

  const score = subject.alignmentScore;
  const tone = score !== null ? scoreTone(score) : null;

  return (
    <Link href={subjectHref(subject.id)} className={rowClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink">
              {subject.name}
            </span>
            <Badge tone="neutral" className="tabular">
              {subject.code}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-ink-muted tabular">
            {meta.join(" · ")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {score !== null && tone !== null && (
            <div className="w-32">
              <p className="flex items-baseline justify-between text-[11px] text-ink-muted">
                Alignment
                <span
                  className={cn("text-sm font-extrabold tabular", SCORE_TEXT[tone])}
                >
                  {score}%
                </span>
              </p>
              <Progress className="mt-1" value={score} barClassName={SCORE_BAR[tone]} />
            </div>
          )}
          <ArrowRight className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export function TeachingTab({
  record,
  subjects,
  hours,
  weeklyTeachingHours,
  focus,
}: {
  record: FacultyProfileDetail;
  subjects: TeachingSubject[];
  hours: WeeklyHours;
  weeklyTeachingHours: number;
  focus: DevelopmentFocus;
}) {
  const maxHours = Math.max(1, ...hours.perSubject.map((s) => s.hours));

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Subjects you teach</CardTitle>
            <CardDescription>
              Alignment is how much of the industry demand for each subject
              the syllabus covers
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No subjects on your teaching record.
            </p>
          ) : (
            <ul className="space-y-2">
              {subjects.map((subject) => (
                <li key={subject.id}>
                  <SubjectRow subject={subject} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Your week</CardTitle>
              <CardDescription className="tabular">
                {formatHours(weeklyTeachingHours)} of teaching ·{" "}
                {formatHours(hours.theoryHours)} lectures,{" "}
                {formatHours(hours.labHours)} labs
              </CardDescription>
            </div>
            <Link href="/faculty/timetable" className={textLinkClass}>
              Timetable
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent>
            {hours.perSubject.length === 0 ? (
              <p className="text-sm text-ink-muted">
                Nothing on the timetable yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {hours.perSubject.map((s) => (
                  <li key={s.id}>
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate text-ink">
                        <span className="font-semibold tabular">{s.code}</span>{" "}
                        <span className="text-ink-muted">{s.name}</span>
                      </span>
                      <span className="shrink-0 font-bold text-ink tabular">
                        {formatHours(s.hours)}
                      </span>
                    </div>
                    <Progress
                      className="mt-1.5"
                      value={(s.hours / maxHours) * 100}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Areas of expertise</CardTitle>
              <CardDescription>Depth in each area, from your faculty record</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {record.expertiseAreas.map((area) => {
                const tone = scoreTone(area.level);
                return (
                  <li key={area.area}>
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="font-semibold text-ink">{area.area}</span>
                      <span
                        className={cn("font-extrabold tabular", SCORE_TEXT[tone])}
                      >
                        {area.level}%
                      </span>
                    </div>
                    <Progress
                      className="mt-1.5"
                      value={area.level}
                      barClassName={SCORE_BAR[tone]}
                    />
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Recommended development</CardTitle>
            <CardDescription>
              What to learn next, from the skill gaps in your department
            </CardDescription>
          </div>
          <GraduationCap className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3">
              <p className="text-sm font-semibold text-ink">
                {focus.developmentProgram.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted tabular">
                {focus.developmentProgram.durationWeeks} weeks · faculty track
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                {focus.developmentProgram.outcome}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3">
              <p className="text-sm font-semibold text-ink">
                {focus.recommendedProgram.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted tabular">
                {focus.recommendedProgram.durationWeeks} weeks · industry
                immersion
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                Skill alignment{" "}
                <span className="font-bold text-ink tabular">
                  {focus.recommendedProgram.skillAlignment}%
                </span>
              </p>
            </div>
          </div>
          <Link href="/faculty/programs" className={cn(textLinkClass, "mt-3")}>
            See all development and research programmes
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
