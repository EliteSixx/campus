"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuickWin } from "@/lib/api/curriculum-insights-meta";
import {
  draftHref,
  plural,
  SCORE_TEXT,
  scoreTone,
  textLinkClass,
} from "./utils";

// Every "add one missing skill to one subject" change, biggest score rise
// first. A client component only for the show-all toggle.

const DEFAULT_VISIBLE = 5;

export function QuickWinsCard({
  quickWins,
  totalPostings,
}: {
  quickWins: QuickWin[];
  totalPostings: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const listId = useId();

  const visible = showAll ? quickWins : quickWins.slice(0, DEFAULT_VISIBLE);
  const canToggle = quickWins.length > DEFAULT_VISIBLE;

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
            Quick wins
          </CardTitle>
          <CardDescription>
            One skill added to one subject, ranked by how much the score would
            rise
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {quickWins.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Every expected skill is already taught, so there is nothing quick
            to add.
          </p>
        ) : (
          <>
            <ol id={listId} className="space-y-2">
              {visible.map((win) => (
                <li
                  key={`${win.subjectId}:${win.skillId}`}
                  className="rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {win.subjectCode} + {win.skillName}
                    </p>
                    <Badge tone="success">
                      <span className="tabular">+{win.gain}%</span>
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <p
                      className="text-xs text-ink-muted tabular"
                      title={`${win.demandCount} of ${totalPostings} postings ask for ${win.skillName}`}
                    >
                      {plural(win.demandCount, "posting")} ·{" "}
                      <span>{win.scoreBefore}%</span>
                      <ArrowRight
                        className="mx-1 inline h-3 w-3 align-[-2px]"
                        aria-hidden="true"
                      />
                      <span className="sr-only">to </span>
                      <span
                        className={cn(
                          "font-semibold",
                          SCORE_TEXT[scoreTone(win.scoreAfter)],
                        )}
                      >
                        {win.scoreAfter}%
                      </span>
                    </p>
                    <Link
                      href={draftHref(win.subjectId, win.skillId)}
                      className={textLinkClass}
                      aria-label={`Draft it: add ${win.skillName} to ${win.subjectCode}`}
                    >
                      Draft it
                    </Link>
                  </div>
                </li>
              ))}
            </ol>

            {canToggle && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                aria-expanded={showAll}
                aria-controls={listId}
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "Show fewer" : `Show all ${quickWins.length}`}
              </Button>
            )}

            <p className="mt-3 text-xs text-ink-muted">
              Estimates use the same formula as the score. Adding a skill to
              two subjects counts for both.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
