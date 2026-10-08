import type { ReactNode } from "react";
import {
  CircleAlert,
  Target,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  scoreTone,
  type WeakSkillRow,
} from "@/lib/api/faculty-students-meta";
import { SCORE_TEXT } from "@/components/faculty/curriculum/utils";
import type { StudentsTab } from "./utils";

// Four headline numbers for the My Students overview.
//
// Built here rather than with MetricCard because that component uses a
// monospace font for the value, and these pages keep to one typeface. Two of the
// cards are buttons that open a tab; everything inside them is a <span> so a
// button never holds block content.

const VALUE_CLASS = "mt-2 block text-2xl font-extrabold tracking-tight tabular";

function CardBody({
  label,
  icon: Icon,
  value,
  sub,
}: {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
  sub: string;
}) {
  return (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-ink-muted">{label}</span>
        <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </span>
      {value}
      <span className="mt-1 block text-xs font-medium text-ink-muted">{sub}</span>
    </>
  );
}

function StaticCard(props: {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
  sub: string;
}) {
  return (
    <Card className="h-full p-5">
      <CardBody {...props} />
    </Card>
  );
}

function ButtonCard({
  ariaLabel,
  onClick,
  ...props
}: {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
  sub: string;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <Card className="h-full p-0 hover:border-accent/40">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="block h-full w-full rounded-xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <CardBody {...props} />
      </button>
    </Card>
  );
}

export function StudentsStatCards({
  trackedStudents,
  enrolledStudents,
  averageReadiness,
  attentionCount,
  weakestSkill,
  onSelectTab,
}: {
  trackedStudents: number;
  enrolledStudents: number;
  averageReadiness: number;
  // null until the browser knows today's date.
  attentionCount: number | null;
  weakestSkill: WeakSkillRow | null;
  onSelectTab: (tab: StudentsTab) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StaticCard
        label="Students tracked"
        icon={Users}
        value={<span className={cn(VALUE_CLASS, "text-ink")}>{trackedStudents}</span>}
        sub={`of ${enrolledStudents} enrolled`}
      />

      <StaticCard
        label="Average readiness"
        icon={Target}
        value={
          <span
            className={cn(VALUE_CLASS, SCORE_TEXT[scoreTone(averageReadiness)])}
          >
            {averageReadiness}%
          </span>
        }
        sub="across tracked students"
      />

      <ButtonCard
        label="Need attention"
        icon={TriangleAlert}
        ariaLabel={
          attentionCount === null
            ? "Need attention: still checking. Open the Needs attention tab"
            : `Need attention: ${attentionCount} students. Open the Needs attention tab`
        }
        onClick={() => onSelectTab("attention")}
        value={
          attentionCount === null ? (
            <span className="mt-2 block" aria-hidden="true">
              <span className="block h-8 w-10 animate-pulse rounded-md bg-surface-raised" />
            </span>
          ) : (
            <span
              className={cn(
                VALUE_CLASS,
                attentionCount > 0 ? "text-danger" : "text-success",
              )}
            >
              {attentionCount}
            </span>
          )
        }
        sub="students with a warning"
      />

      <ButtonCard
        label="Weakest skill"
        icon={CircleAlert}
        ariaLabel={
          weakestSkill
            ? `Weakest skill: ${weakestSkill.name}, ${weakestSkill.cohortAverage}% cohort average. Open the Skill gaps tab`
            : "Weakest skill: none. Open the Skill gaps tab"
        }
        onClick={() => onSelectTab("gaps")}
        value={
          weakestSkill ? (
            <span className="mt-2 flex flex-wrap items-baseline gap-x-2">
              <span className="text-lg font-extrabold tracking-tight text-ink">
                {weakestSkill.name}
              </span>
              <span
                className={cn(
                  "text-2xl font-extrabold tracking-tight tabular",
                  SCORE_TEXT[scoreTone(weakestSkill.cohortAverage)],
                )}
              >
                {weakestSkill.cohortAverage}%
              </span>
            </span>
          ) : (
            <span className={cn(VALUE_CLASS, "text-ink")}>—</span>
          )
        }
        sub="cohort average"
      />
    </div>
  );
}
