import Link from "next/link";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { linkButtonClass } from "@/components/faculty/curriculum/utils";
import {
  getPercent,
  type DashboardRecommendation,
  type DashboardStudentSkillGap,
} from "@/lib/api/faculty-dashboard-meta";
import { headerLinkClass, plural } from "./utils";

// Row 7 (server-rendered): where the cohort scores lowest, next to the one
// development programme that closes the most syllabus gaps.

function SkillGaps({
  gaps,
  cohortSize,
}: {
  gaps: DashboardStudentSkillGap[];
  cohortSize: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-ink-faint" />
          <div>
            <CardTitle>Where your students struggle</CardTitle>
            <CardDescription>
              Skills scored below 40 by your {plural(cohortSize, "student")}
            </CardDescription>
          </div>
        </div>
        <Link href="/faculty/students?tab=gaps" className={headerLinkClass}>
          See all skill gaps
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent>
        {gaps.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-ink-muted">
            No skill is scored below 40 by your students.
          </p>
        ) : (
          <ul className="space-y-3">
            {gaps.map((g) => {
              const pct = getPercent(g.studentsStruggling, g.cohortSize);
              return (
                <li key={g.skill}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-ink">{g.skill}</span>
                    <span className="shrink-0 text-xs text-ink-muted tabular">
                      {g.studentsStruggling} of {g.cohortSize} students
                    </span>
                  </div>
                  <Progress value={pct} className="mt-1.5" barClassName="bg-danger" />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Recommendation({
  recommendation,
}: {
  recommendation: DashboardRecommendation | null;
}) {
  if (recommendation === null) {
    return (
      <Card className="flex flex-col justify-center p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Recommended for you
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          No programme currently closes a gap in your syllabus.
        </p>
        <Link href="/faculty/programs" className={`${headerLinkClass} mt-3 self-start`}>
          Browse programmes
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col border-accent/30 bg-accent-soft/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-accent">
          Recommended for you
        </p>
      </div>
      <p className="text-base font-semibold text-ink">{recommendation.title}</p>
      <p className="mt-1 text-xs text-ink-muted">{recommendation.duration}</p>
      {recommendation.outcome && (
        <p className="mt-3 text-sm text-ink">{recommendation.outcome}</p>
      )}
      <div className="mt-auto pt-5">
        <Link href={recommendation.href} className={linkButtonClass("primary")}>
          View program
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

export function SkillGapsAndRecommendation({
  gaps,
  cohortSize,
  recommendation,
}: {
  gaps: DashboardStudentSkillGap[];
  cohortSize: number;
  recommendation: DashboardRecommendation | null;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SkillGaps gaps={gaps} cohortSize={cohortSize} />
      <Recommendation recommendation={recommendation} />
    </div>
  );
}
