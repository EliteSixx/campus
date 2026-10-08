import Link from "next/link";
import { CircleCheck, CircleX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  InsightSkill,
  MatrixCell,
  SkillMatrix,
} from "@/lib/api/curriculum-insights-meta";
import {
  draftHref,
  plural,
  SCORE_TEXT,
  scoreTone,
  skillOf,
  subjectHref,
} from "./utils";

// The most-demanded skills × the faculty member's subjects. Every cell carries
// an icon and a word as well as a colour, plus a screen-reader sentence. A
// missing cell links straight into that subject's draft with the skill ready
// to add.

export interface MatrixSubject {
  id: string;
  code: string;
  alignmentScore: number;
}

const cellLinkClass =
  "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold text-danger hover:bg-danger-soft hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function Cell({
  cell,
  skillId,
  skillName,
  subject,
}: {
  cell: MatrixCell;
  skillId: string;
  skillName: string;
  subject: MatrixSubject;
}) {
  if (cell === "taught") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
        <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Taught
        <span className="sr-only">
          : {skillName} is taught in {subject.code}
        </span>
      </span>
    );
  }

  if (cell === "missing") {
    const action = `add ${skillName} to ${subject.code} draft`;
    return (
      <Link
        href={draftHref(subject.id, skillId)}
        className={cellLinkClass}
        title={`Add ${skillName} to ${subject.code} draft`}
        aria-label={`Missing: ${action}`}
      >
        <CircleX className="h-3.5 w-3.5" aria-hidden="true" />
        Missing
      </Link>
    );
  }

  return (
    <span className="text-xs text-ink-faint">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Not expected in {subject.code}</span>
    </span>
  );
}

export function SkillCoverageMatrix({
  matrix,
  subjects,
  skills,
}: {
  matrix: SkillMatrix;
  // In matrix.subjectIds order.
  subjects: MatrixSubject[];
  skills: Record<string, InsightSkill>;
}) {
  const byId = new Map(subjects.map((s) => [s.id, s]));
  const columns = matrix.subjectIds.flatMap((id) => {
    const subject = byId.get(id);
    return subject ? [subject] : [];
  });

  const missingCount = matrix.skillIds.reduce(
    (sum, skillId) =>
      sum +
      columns.filter((s) => matrix.cells[skillId]?.[s.id] === "missing").length,
    0,
  );

  const n = matrix.skillIds.length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Skill coverage</CardTitle>
          <CardDescription>
            The {n} skills postings ask for most, across your subjects
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {n === 0 || columns.length === 0 ? (
          <p className="text-sm text-ink-muted">
            None of your subjects lists any expected skills yet.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <caption className="sr-only">
                  Skill coverage: for each of the {n} most-demanded skills,
                  whether each subject teaches it, is missing it, or does not
                  expect it.
                </caption>
                <thead>
                  <tr className="border-b border-border bg-surface-raised/60">
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-surface px-3 py-2.5 text-xs font-bold text-ink-muted"
                    >
                      Skill
                    </th>
                    {columns.map((s) => (
                      <th
                        key={s.id}
                        scope="col"
                        className="px-3 py-2.5 text-xs font-bold"
                      >
                        <Link
                          href={subjectHref(s.id)}
                          className="inline-flex flex-col rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <span className="text-ink">{s.code}</span>
                          <span
                            className={cn(
                              "tabular",
                              SCORE_TEXT[scoreTone(s.alignmentScore)],
                            )}
                          >
                            {s.alignmentScore}%
                            <span className="sr-only"> aligned</span>
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.skillIds.map((skillId) => {
                    const skill = skillOf(skills, skillId);
                    const name = skill?.name ?? skillId;
                    return (
                      <tr
                        key={skillId}
                        className="border-b border-border last:border-b-0"
                      >
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-surface px-3 py-2.5 align-top"
                        >
                          <span className="block text-sm font-semibold text-ink">
                            {name}
                          </span>
                          <span className="block text-xs font-normal text-ink-muted tabular">
                            {plural(skill?.demandCount ?? 0, "posting")}
                          </span>
                        </th>
                        {columns.map((s) => (
                          <td key={s.id} className="px-3 py-2.5 align-top">
                            <Cell
                              cell={
                                matrix.cells[skillId]?.[s.id] ?? "out-of-scope"
                              }
                              skillId={skillId}
                              skillName={name}
                              subject={s}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
              <li className="inline-flex items-center gap-1">
                <CircleCheck
                  className="h-3.5 w-3.5 text-success"
                  aria-hidden="true"
                />
                Taught
              </li>
              <li className="inline-flex items-center gap-1">
                <CircleX className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
                Missing (click to draft)
              </li>
              <li className="inline-flex items-center gap-1">
                <span aria-hidden="true" className="text-ink-faint">
                  —
                </span>
                not expected for that subject
              </li>
            </ul>

            <p className="mt-2 text-xs font-semibold text-ink">
              <span className="tabular">
                {plural(missingCount, "missing cell")}
              </span>{" "}
              across your subjects
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
