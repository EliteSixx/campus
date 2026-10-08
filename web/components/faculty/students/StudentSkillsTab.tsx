import { Check, ChevronDown, Circle, Target } from "lucide-react";
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
import { scoreTone } from "@/lib/api/faculty-students-meta";
import type { StudentDetail } from "@/lib/api/faculty-roster";
import { SCORE_BAR, SCORE_TEXT } from "@/components/faculty/curriculum/utils";
import { PLAN_GROUPS, PLAN_TONE } from "./detail-utils";
import { TaughtInLine } from "./TaughtInLine";

// What postings for the student's career goal ask for, grouped as a worklist,
// with where each skill is taught in my syllabus.

export function StudentSkillsTab({ detail }: { detail: StudentDetail }) {
  const { skillPlan, student, totalPostings } = detail;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Skill plan for {student.careerGoal}</CardTitle>
          <CardDescription>
            Skills asked for by live postings matching this career goal, grouped
            by how far along this student is
          </CardDescription>
        </div>
        <Target className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {skillPlan.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-center text-xs text-ink-muted">
            No live posting currently matches this career goal.
          </p>
        ) : (
          <div className="space-y-5">
            {PLAN_GROUPS.map((group) => {
              const rows = skillPlan.filter((s) => s.status === group.status);
              if (rows.length === 0) return null;

              return (
                <section key={group.status}>
                  <h4 className="text-xs font-bold tracking-tight text-ink">
                    {group.heading}
                  </h4>

                  <div className="mt-2 space-y-2">
                    {rows.map((skill) => {
                      const nextTopic = skill.topics.find((t) => !t.covered);
                      const tone = skill.score === null ? null : scoreTone(skill.score);

                      return (
                        <details
                          key={skill.skillId}
                          className="group rounded-lg border border-border bg-surface-raised/40"
                        >
                          <summary className="cursor-pointer list-none rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
                            <span className="flex flex-wrap items-center justify-between gap-3">
                              <span className="flex flex-wrap items-center gap-2.5">
                                <ChevronDown
                                  className="h-3.5 w-3.5 text-ink-muted transition-transform group-open:rotate-180"
                                  aria-hidden="true"
                                />
                                <span className="text-sm font-semibold text-ink">
                                  {skill.name}
                                </span>
                                <Badge tone={PLAN_TONE[skill.status]}>
                                  {skill.status}
                                </Badge>
                              </span>
                              {skill.score !== null && tone !== null && (
                                <span
                                  className={cn(
                                    "text-sm font-extrabold tabular",
                                    SCORE_TEXT[tone],
                                  )}
                                >
                                  {skill.score}%
                                </span>
                              )}
                            </span>

                            {skill.score !== null && tone !== null && (
                              <span className="mt-3 block">
                                <Progress
                                  value={skill.score}
                                  barClassName={SCORE_BAR[tone]}
                                />
                              </span>
                            )}

                            <span className="mt-2 block text-xs text-ink-muted">
                              <span className="text-ink tabular">
                                {skill.demandCount} of {totalPostings}
                              </span>{" "}
                              postings ask for this
                            </span>

                            {skill.score === null ? (
                              <span className="mt-1 block text-xs text-ink-muted">
                                No assessment yet
                              </span>
                            ) : (
                              skill.topicsTotal > 0 && (
                                <span className="mt-1 block text-xs text-ink-muted">
                                  <span className="text-ink tabular">
                                    {skill.topicsCovered} of {skill.topicsTotal}
                                  </span>{" "}
                                  learning topics done
                                </span>
                              )
                            )}
                          </summary>

                          <div className="border-t border-border px-4 py-3">
                            <TaughtInLine refs={skill.taughtIn} />

                            {skill.topicsTotal > 0 && (
                              <>
                                <ul className="mt-3 space-y-1.5">
                                  {skill.topics.map((topic) => (
                                    <li
                                      key={topic.name}
                                      className="flex items-start gap-2 text-xs"
                                    >
                                      {topic.covered ? (
                                        <Check
                                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success"
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <Circle
                                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted"
                                          aria-hidden="true"
                                        />
                                      )}
                                      <span
                                        className={
                                          topic.covered ? "text-ink" : "text-ink-muted"
                                        }
                                      >
                                        <span className="sr-only">
                                          {topic.covered ? "Done: " : "Not done: "}
                                        </span>
                                        {topic.name}
                                      </span>
                                    </li>
                                  ))}
                                </ul>

                                <p className="mt-3 text-xs text-ink-muted">
                                  {skill.status === "Learnt"
                                    ? "All core topics covered."
                                    : skill.status === "Developing"
                                      ? `Next up: ${nextTopic?.name ?? skill.topics[0]?.name ?? ""}.`
                                      : `Start with: ${skill.topics[0]?.name ?? ""}.`}
                                </p>
                              </>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
