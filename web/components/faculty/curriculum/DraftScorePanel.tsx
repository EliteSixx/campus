"use client";

import Link from "next/link";
import { FileText, RotateCcw, TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  CurriculumDraft,
  DraftAnalysis,
  InsightSkill,
  InsightSubject,
} from "@/lib/api/curriculum-insights-meta";
import {
  formatSavedAt,
  joinNames,
  linkButtonClass,
  proposalHref,
  SCORE_TEXT,
  scoreTone,
  skillNameOf,
  skillOf,
} from "./utils";

// What the draft does to the numbers: alignment, hours, outdated hours and the
// skills gained or lost. Only mounted once drafts have loaded, so the saved
// time is formatted from stored data and never differs from the server HTML.

export function DraftScorePanel({
  subject,
  draft,
  analysis,
  skills,
  savedAt,
  changed,
  onReset,
}: {
  subject: InsightSubject;
  draft: CurriculumDraft;
  analysis: DraftAnalysis;
  skills: Record<string, InsightSkill>;
  savedAt: string | null;
  changed: boolean;
  onReset: () => void;
}) {
  const { scoreBefore, scoreAfter, delta, hoursBefore, hoursAfter } = analysis;
  const hoursDiff = hoursAfter - hoursBefore;
  const hoursPct = hoursBefore > 0 ? Math.min(100, (hoursAfter / hoursBefore) * 100) : 0;
  const names = (ids: string[]) => joinNames(ids.map((id) => skillNameOf(skills, id)));

  // Added skills outside the expected list count toward the score (see
  // computeDraftAnalysis); say so, so a jump in the score is not a surprise.
  const addsOutsideList = draft.added.some((t) =>
    t.skillIds.some(
      (id) => skillOf(skills, id) !== null && !subject.industrySkillIds.includes(id),
    ),
  );
  const savedText = savedAt ? formatSavedAt(savedAt) : null;

  function confirmReset() {
    if (window.confirm(`Remove all your changes to ${subject.code}'s draft?`)) {
      onReset();
    }
  }

  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader>
        <CardTitle>Draft impact</CardTitle>
        {savedText && (
          <p className="text-xs text-ink-muted tabular" role="status">
            Saved {savedText}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alignment */}
        <div>
          <p className="text-xs font-bold text-ink-muted">Alignment</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-lg font-extrabold tracking-tight text-ink tabular">
              {scoreBefore}% →{" "}
              <span className={SCORE_TEXT[scoreTone(scoreAfter)]}>
                {scoreAfter}%
              </span>
            </p>
            <Badge tone={delta > 0 ? "success" : delta < 0 ? "danger" : "neutral"}>
              <span className="tabular">
                {delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : "±0"}
              </span>
              <span className="sr-only"> percentage points</span>
            </Badge>
          </div>
        </div>

        {/* Hours budget */}
        <div>
          <p className="text-xs font-bold text-ink-muted">Hours</p>
          <p className="mt-1 text-sm font-semibold text-ink tabular">
            {hoursBefore}h → {hoursAfter}h
          </p>
          <Progress
            value={hoursPct}
            className="mt-1.5"
            barClassName={hoursDiff > 0 ? "bg-warning" : undefined}
          />
          {hoursDiff > 0 && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-warning">
              <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {hoursDiff}h over the current syllabus. Reduce or remove a topic
                to stay within the hours.
              </span>
            </p>
          )}
          {hoursDiff < 0 && (
            <p className="mt-1.5 text-xs text-ink-muted tabular">
              {Math.abs(hoursDiff)}h freed
            </p>
          )}
        </div>

        {/* Outdated hours */}
        <div>
          <p className="text-xs font-bold text-ink-muted">Outdated hours</p>
          <p className="mt-1 text-sm font-semibold text-ink tabular">
            {analysis.outdatedHoursBefore}h → {analysis.outdatedHoursAfter}h
          </p>
        </div>

        {(analysis.newlyCovered.length > 0 || analysis.newlyMissing.length > 0) && (
          <div className="space-y-1 text-xs">
            {analysis.newlyCovered.length > 0 && (
              <p className="text-success">
                <span className="font-bold">Newly covered:</span>{" "}
                {names(analysis.newlyCovered)}
              </p>
            )}
            {analysis.newlyMissing.length > 0 && (
              <p className="text-danger">
                <span className="font-bold">No longer covered:</span>{" "}
                {names(analysis.newlyMissing)}
              </p>
            )}
          </div>
        )}

        {addsOutsideList && (
          <p className="text-xs text-ink-muted">
            Includes skills you added that were not on this subject&apos;s
            expected list, so they now count toward the score.
          </p>
        )}

        <div className="border-t border-border pt-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={confirmReset}
            disabled={!changed}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset draft
          </Button>
          {changed && (
            <div className="mt-2">
              <Link
                href={proposalHref(subject.id)}
                className={linkButtonClass("secondary")}
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Open proposal
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
