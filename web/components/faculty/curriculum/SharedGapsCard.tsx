import Link from "next/link";
import { GitMerge } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QuickWin, SharedGap } from "@/lib/api/curriculum-insights-meta";
import { draftHref, textLinkClass } from "./utils";

// Skills missing from two or more subjects. Each subject gets a "Draft in"
// link, and the one where adding the skill raises the score most comes first
// as the best fit.

export interface GapSubject {
  id: string;
  code: string;
}

export function SharedGapsCard({
  sharedGaps,
  subjects,
  quickWins,
  totalPostings,
}: {
  sharedGaps: SharedGap[];
  subjects: GapSubject[];
  quickWins: QuickWin[];
  totalPostings: number;
}) {
  const codeOf = new Map(subjects.map((s) => [s.id, s.code]));
  const gainOf = new Map(
    quickWins.map((q) => [`${q.subjectId}:${q.skillId}`, q.gain]),
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-accent" aria-hidden="true" />
            Missing in more than one subject
          </CardTitle>
          <CardDescription>
            One gap, several syllabuses — worth planning once
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {sharedGaps.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No skill is missing from more than one subject.
          </p>
        ) : (
          <ul className="space-y-3">
            {sharedGaps.map((gap) => {
              // Biggest gain first; subjects without a quick win go last, and
              // equal gains keep subject order (Array.sort is stable).
              const options = gap.subjectIds
                .map((id) => ({
                  id,
                  code: codeOf.get(id) ?? id,
                  gain: gainOf.get(`${id}:${gap.skillId}`) ?? null,
                }))
                .sort((a, b) => (b.gain ?? -Infinity) - (a.gain ?? -Infinity));

              return (
                <li
                  key={gap.skillId}
                  className="rounded-lg border border-border p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{gap.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {gap.subjectIds.map((id) => (
                        <Badge key={id} tone="neutral">
                          {codeOf.get(id) ?? id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted tabular">
                    {gap.demandCount} of {totalPostings} postings
                  </p>
                  <p className="mt-2 text-xs text-ink-muted">
                    Teach it well in one subject, then reference it in the
                    other.
                  </p>
                  <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {options.map((option, i) => (
                      <li key={option.id} className="inline-flex items-center gap-1.5">
                        <Link
                          href={draftHref(option.id, gap.skillId)}
                          className={textLinkClass}
                        >
                          Draft in {option.code}
                          {option.gain !== null && (
                            <span className="tabular">
                              {" "}
                              (+{option.gain}%)
                            </span>
                          )}
                        </Link>
                        {i === 0 && option.gain !== null && (
                          <Badge tone="success">Best fit</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
