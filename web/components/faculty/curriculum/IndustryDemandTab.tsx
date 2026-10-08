"use client";

import { useId, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  taughtSkillIdsOf,
  type InsightSkill,
  type InsightSubject,
} from "@/lib/api/curriculum-insights-meta";
import { skillNameOf, type RelatedPosting } from "./utils";

// Postings that ask for at least one skill this subject is expected to teach,
// with each overlapping skill marked taught or missing in today's syllabus.

const VISIBLE = 8;

export function IndustryDemandTab({
  subject,
  skills,
  related,
  totalPostings,
}: {
  subject: InsightSubject;
  skills: Record<string, InsightSkill>;
  // relatedPostingsFor(subject.industrySkillIds, postings)
  related: RelatedPosting[];
  totalPostings: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const listId = useId();
  const taught = new Set(taughtSkillIdsOf(subject.topics));
  const visible = showAll ? related : related.slice(0, VISIBLE);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Industry demand</CardTitle>
          <CardDescription className="tabular">
            {related.length} of {totalPostings} postings ask for at least one
            skill this subject is expected to teach.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {related.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No posting asks for any skill this subject is expected to teach.
          </p>
        ) : (
          <>
            <ul id={listId} className="space-y-2.5">
              {visible.map(({ posting, overlapSkillIds }) => {
                const covered = overlapSkillIds.filter((id) => taught.has(id));
                return (
                  <li key={posting.id} className="rounded-lg border border-border p-3.5">
                    <p className="text-sm font-semibold text-ink">{posting.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {posting.company} · {posting.type} · {posting.location}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills from this subject">
                      {overlapSkillIds.map((id) => {
                        const isTaught = taught.has(id);
                        const name = skillNameOf(skills, id);
                        return (
                          <li
                            key={id}
                            className={
                              isTaught
                                ? "inline-flex items-center gap-1 rounded border border-success/30 bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success"
                                : "inline-flex items-center gap-1 rounded border border-danger/30 bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger"
                            }
                          >
                            {isTaught ? (
                              <CircleCheck className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <CircleX className="h-3 w-3" aria-hidden="true" />
                            )}
                            {name} · {isTaught ? "Taught" : "Missing"}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-2 text-xs text-ink-muted tabular">
                      Covers {covered.length} of {overlapSkillIds.length} of the
                      skills this posting needs from {subject.code}
                    </p>
                  </li>
                );
              })}
            </ul>
            {related.length > VISIBLE && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                aria-expanded={showAll}
                aria-controls={listId}
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "Show fewer" : `Show all ${related.length}`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
