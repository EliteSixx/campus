import {
  BookOpen,
  Target,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { joinNames, plural, SCORE_TEXT, scoreTone, type Tone } from "./utils";

// Four headline numbers for the curriculum overview.
//
// Built here rather than with MetricCard because that component sets
// font-mono on the value, and these pages keep to one typeface.

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Card className="h-full p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-ink-muted">{label}</p>
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-extrabold tracking-tight tabular",
          tone ? SCORE_TEXT[tone] : "text-ink",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-ink-muted">{sub}</p>
    </Card>
  );
}

export function CurriculumStatCards({
  overallAlignment,
  subjectCount,
  semesters,
  enrolledStudents,
  trackedStudents,
  totalOutdatedTopics,
  totalOutdatedHours,
}: {
  overallAlignment: number;
  subjectCount: number;
  semesters: number[];
  enrolledStudents: number;
  trackedStudents: number;
  totalOutdatedTopics: number;
  totalOutdatedHours: number;
}) {
  const uniqueSemesters = [...new Set(semesters)].sort((a, b) => a - b);
  const semesterText =
    uniqueSemesters.length === 0
      ? "No semesters"
      : `${uniqueSemesters.length === 1 ? "Semester" : "Semesters"} ${joinNames(
          uniqueSemesters.map(String),
        )}`;

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Overall alignment"
        value={`${overallAlignment}%`}
        sub={`Across ${plural(subjectCount, "subject")}`}
        icon={Target}
        tone={scoreTone(overallAlignment)}
      />
      <StatCard
        label="Subjects taught"
        value={String(subjectCount)}
        sub={semesterText}
        icon={BookOpen}
      />
      <StatCard
        label="Students"
        value={`${enrolledStudents} enrolled`}
        sub={`${trackedStudents} tracked on The Plug`}
        icon={Users}
      />
      <StatCard
        label="Outdated topics"
        value={String(totalOutdatedTopics)}
        sub={`${plural(totalOutdatedHours, "hour")} no posting asks for`}
        icon={TriangleAlert}
        tone={totalOutdatedTopics > 0 ? "danger" : undefined}
      />
    </div>
  );
}
