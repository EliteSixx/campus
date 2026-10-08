import Link from "next/link";
import { CalendarPlus, FilePenLine, GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  scoreTone,
  type WeakSkillRow,
} from "@/lib/api/faculty-students-meta";
import {
  SCORE_TEXT,
  draftHref,
  linkButtonClass,
  plannerSkillHref,
} from "@/components/faculty/curriculum/utils";

// The weakest cohort skills, each with where it is taught (or expected) and the
// quickest place to fix it.

function Coverage({ skill }: { skill: WeakSkillRow }) {
  if (skill.taughtIn.length > 0) {
    return (
      <p className="text-xs text-ink-muted">
        Taught in{" "}
        {skill.taughtIn.map((ref, i) => (
          <span key={`${ref.subjectId}:${ref.topicId}`}>
            {i > 0 && ", "}
            <span className="font-semibold text-ink">{ref.code}</span> ·{" "}
            {ref.topicName}
          </span>
        ))}
      </p>
    );
  }
  if (skill.expectedIn.length > 0) {
    return (
      <p className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        <Badge tone="danger">Missing from your syllabus</Badge>
        <span>
          Expected in {skill.expectedIn.map((e) => e.code).join(", ")}
        </span>
      </p>
    );
  }
  return (
    <p>
      <Badge tone="neutral">Outside your subjects</Badge>
    </p>
  );
}

export function SkillGapsTab({ skills }: { skills: WeakSkillRow[] }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Where my students are weakest</CardTitle>
          <CardDescription>
            The {skills.length} lowest cohort skill averages, with the quickest
            place to fix each one.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-center text-xs text-ink-muted">
            No tracked student has skill scores yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {skills.map((skill) => {
              // Where to act: the best quick win, else a subject expected to
              // teach it, else one that already does.
              const target =
                skill.bestFit?.subjectId ??
                skill.expectedIn[0]?.subjectId ??
                skill.taughtIn[0]?.subjectId ??
                null;
              // Drafting only makes sense where the skill is missing: a best
              // fit is always a subject that lacks it, and an expected subject
              // only counts when no syllabus of mine already teaches it.
              const canDraft =
                skill.bestFit !== null ||
                (skill.expectedIn.length > 0 && skill.taughtIn.length === 0);

              return (
                <li
                  key={skill.skillId}
                  className="rounded-lg border border-border bg-surface-raised/40 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-ink">
                        {skill.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        <span className="tabular">
                          {skill.strugglingCount} of {skill.cohortSize}
                        </span>{" "}
                        students below 40 or not assessed
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        <span className="tabular">
                          {skill.demandCount} of {skill.totalPostings}
                        </span>{" "}
                        postings ask for it
                      </p>
                    </div>
                    <p
                      className={cn(
                        "text-lg font-extrabold tabular",
                        SCORE_TEXT[scoreTone(skill.cohortAverage)],
                      )}
                    >
                      {skill.cohortAverage}%
                      <span className="sr-only"> cohort average</span>
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Coverage skill={skill} />
                    {skill.bestFit && (
                      <p>
                        <Badge tone="success">
                          Best fit: {skill.bestFit.code} (
                          <span className="tabular">+{skill.bestFit.gain}%</span>{" "}
                          alignment)
                        </Badge>
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {target !== null ? (
                      <>
                        <Link
                          href={plannerSkillHref(target, skill.skillId)}
                          className={linkButtonClass("secondary")}
                        >
                          <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                          Plan a lecture
                          <span className="sr-only"> on {skill.name}</span>
                        </Link>
                        {canDraft && (
                          <Link
                            href={draftHref(target, skill.skillId)}
                            className={linkButtonClass("ghost")}
                          >
                            <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
                            Add to syllabus draft
                            <span className="sr-only"> for {skill.name}</span>
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <Link
                          href="/faculty/programs"
                          className={linkButtonClass("secondary")}
                        >
                          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                          Find a development program
                          <span className="sr-only"> for {skill.name}</span>
                        </Link>
                        <span className="text-xs text-ink-muted">
                          None of your subjects is expected to teach this.
                        </span>
                      </>
                    )}
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
