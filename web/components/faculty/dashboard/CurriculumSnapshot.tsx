import Link from "next/link";
import { ArrowRight, Target, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { linkButtonClass } from "@/components/faculty/curriculum/utils";
import { cn } from "@/lib/utils";
import type {
  DashboardMissingSkill,
  DashboardSubjectAlignment,
} from "@/lib/api/faculty-dashboard-meta";
import { plural, scoreTone, toneBar, toneText } from "./utils";

// Row 6 (server-rendered): each subject's alignment score and the skills the
// syllabus most often misses. The same figures as /faculty/subjects.

export function CurriculumSnapshot({
  subjects,
  topMissingSkills,
  totalPostings,
  topicsWithoutDemand,
}: {
  subjects: DashboardSubjectAlignment[];
  topMissingSkills: DashboardMissingSkill[];
  totalPostings: number;
  topicsWithoutDemand: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-ink-faint" />
          <div>
            <CardTitle>Curriculum vs industry demand</CardTitle>
            <CardDescription>
              Scored against {plural(totalPostings, "live posting")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Subject scores */}
          <div className="lg:col-span-2">
            {subjects.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-ink-muted">
                No subjects to score yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {subjects.map((s) => {
                  const tone = scoreTone(s.scorePct);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/faculty/subjects/${s.id}`}
                        className="block rounded-lg border border-border p-3 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-sm text-ink">{s.name}</span>
                            <Badge tone="neutral" className="shrink-0">
                              {s.code}
                            </Badge>
                          </div>
                          <span className={cn("shrink-0 text-sm font-bold tabular", toneText[tone])}>
                            {s.scorePct}%
                          </span>
                        </div>
                        <Progress value={s.scorePct} className="mt-2" barClassName={toneBar[tone]} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Missing skills */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <TriangleAlert className="h-3.5 w-3.5 text-warning" />
              Top missing skills
            </h4>
            {topMissingSkills.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Your syllabi cover every skill we track for them.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {topMissingSkills.map((s) => (
                  <li key={s.skill} className="rounded-lg border border-border p-3">
                    <p className="text-sm text-ink">{s.skill}</p>
                    <p className="mt-0.5 text-xs text-ink-muted tabular">
                      asked for in {s.postingsCount} of {s.totalPostings} postings
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-muted tabular">
            Topics with no job demand: {topicsWithoutDemand}
          </p>
          <Link href="/faculty/subjects" className={linkButtonClass("secondary")}>
            Open curriculum analysis
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
