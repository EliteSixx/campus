import Link from "next/link";
import { CircleCheck, CircleX, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  STRUGGLING_BELOW,
  type SubjectStudentImpact,
} from "@/lib/api/curriculum-insights-meta";
import { SCORE_BAR, SCORE_TEXT, textLinkClass, type Tone } from "./utils";

// How the tracked cohort scores on each skill this subject is expected to
// teach. Bands follow the roster: below 40 struggling, 40–69 developing.

function studentTone(score: number): Tone {
  if (score < STRUGGLING_BELOW) return "danger";
  if (score < 70) return "warning";
  return "success";
}

export function StudentImpactTab({
  impact,
  subjectCode,
}: {
  impact: SubjectStudentImpact | null;
  subjectCode: string;
}) {
  if (impact === null || impact.skills.length === 0) {
    return (
      <Card className="mt-6 p-5">
        <p className="text-sm text-ink-muted">
          No student data is available for {subjectCode} yet.
        </p>
      </Card>
    );
  }

  const { cohortSize } = impact;

  // The weakest skill the syllabus does not teach, among those with data.
  const weakestMissing =
    impact.skills
      .flatMap((s) =>
        !s.taught && s.averageScore !== null
          ? [{ name: s.name, average: s.averageScore }]
          : [],
      )
      .sort((a, b) => a.average - b.average || a.name.localeCompare(b.name, "en"))[0] ??
    null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>How your students score</CardTitle>
          <CardDescription className="tabular">
            {cohortSize} students tracked on The Plug · below {STRUGGLING_BELOW}{" "}
            counts as struggling
          </CardDescription>
        </div>
        <Link href="/faculty/students" className={textLinkClass}>
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          View my students
        </Link>
      </CardHeader>

      <CardContent>
        {weakestMissing && (
          <p className="mb-3 rounded-lg border border-border bg-surface-raised/60 px-3 py-2.5 text-xs text-ink-muted">
            Students average{" "}
            <span className="font-semibold text-ink tabular">
              {weakestMissing.average}
            </span>{" "}
            in <span className="font-semibold text-ink">{weakestMissing.name}</span>,
            which this subject does not teach yet.
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[32rem] border-collapse text-left text-xs">
            <caption className="sr-only">
              Cohort scores for each skill {subjectCode} is expected to teach
            </caption>
            <thead>
              <tr className="border-b border-border bg-surface-raised/60 text-ink-muted">
                <th scope="col" className="px-3 py-2.5 font-bold">Skill</th>
                <th scope="col" className="px-3 py-2.5 font-bold">In syllabus</th>
                <th scope="col" className="px-3 py-2.5 font-bold">Average score</th>
                <th scope="col" className="px-3 py-2.5 font-bold">Struggling</th>
              </tr>
            </thead>
            <tbody>
              {impact.skills.map((row) => (
                <tr key={row.skillId} className="border-b border-border last:border-b-0">
                  <th scope="row" className="px-3 py-2.5 text-sm font-semibold text-ink">
                    {row.name}
                  </th>
                  <td className="px-3 py-2.5">
                    {row.taught ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-success">
                        <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Taught
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-danger">
                        <CircleX className="h-3.5 w-3.5" aria-hidden="true" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {row.averageScore === null ? (
                      <span className="text-ink-faint">No student data</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-7 font-semibold tabular",
                            SCORE_TEXT[studentTone(row.averageScore)],
                          )}
                        >
                          {row.averageScore}
                        </span>
                        <Progress
                          value={row.averageScore}
                          className="w-24"
                          barClassName={SCORE_BAR[studentTone(row.averageScore)]}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 tabular text-ink">
                    {row.averageScore === null ? (
                      <span className="text-ink-faint">
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">No student data</span>
                      </span>
                    ) : (
                      `${row.strugglingCount} of ${cohortSize}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
