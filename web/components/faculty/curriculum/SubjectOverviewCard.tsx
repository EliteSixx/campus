"use client";

import Link from "next/link";
import { ArrowRight, CalendarRange, FilePenLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type {
  InsightSkill,
  InsightSubject,
} from "@/lib/api/curriculum-insights-meta";
import {
  draftHref,
  linkButtonClass,
  plannerHref,
  SCORE_BAR,
  SCORE_TEXT,
  scoreTone,
  skillOf,
  subjectHref,
} from "./utils";

// One subject on the overview. Receives its saved-draft summary as a prop and
// never reads storage itself. The card is not a link: its actions are.

export interface DraftSummary {
  scoreBefore: number;
  scoreAfter: number;
}

export function SubjectOverviewCard({
  subject,
  skills,
  totalPostings,
  draft,
}: {
  subject: InsightSubject;
  skills: Record<string, InsightSkill>;
  totalPostings: number;
  // null until drafts have loaded, or when there is no changed draft.
  draft: DraftSummary | null;
}) {
  const tone = scoreTone(subject.alignmentScore);
  const count = (status: InsightSubject["topics"][number]["status"]) =>
    subject.topics.filter((t) => t.status === status).length;
  const withMaterials = subject.topics.filter((t) => t.materialsCount > 0)
    .length;

  const topMissingId = subject.missingSkillIds[0];
  const topMissing =
    topMissingId === undefined
      ? null
      : {
          name: skillOf(skills, topMissingId)?.name ?? topMissingId,
          demand: skillOf(skills, topMissingId)?.demandCount ?? 0,
        };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h4 className="text-base font-bold text-ink">{subject.name}</h4>
            <Badge tone="neutral">{subject.code}</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Semester {subject.semester} · {subject.credits} credits ·{" "}
            {subject.enrolled} enrolled
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-2xl font-extrabold tracking-tight tabular",
              SCORE_TEXT[tone],
            )}
          >
            {subject.alignmentScore}%
          </p>
          <p className="text-xs text-ink-muted">industry aligned</p>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={subject.alignmentScore} barClassName={SCORE_BAR[tone]} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="cyan">{count("Foundational")} foundational</Badge>
        <Badge tone="success">{count("Industry-current")} industry-current</Badge>
        <Badge tone="danger">{count("Outdated")} outdated</Badge>
        <Badge tone="warning">
          {subject.missingSkillIds.length} skills missing
        </Badge>
      </div>

      <div className="mt-3 space-y-1 text-xs text-ink-muted tabular">
        <p>
          {subject.totalHours}h syllabus
          {subject.outdatedHours > 0 &&
            ` · ${subject.outdatedHours}h on outdated topics`}
        </p>
        <p>
          Materials on {withMaterials} of {subject.topics.length} topics
        </p>
      </div>

      {topMissing && (
        <div className="mt-4 rounded-lg border border-border bg-surface-raised/60 px-3 py-2.5">
          <p className="text-xs text-ink-muted">
            <span className="font-semibold text-ink">{topMissing.name}</span> is
            asked for in{" "}
            <span className="tabular text-ink">
              {topMissing.demand} of {totalPostings}
            </span>{" "}
            postings, but no topic teaches it.
          </p>
        </div>
      )}

      {draft && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="accent">Draft saved</Badge>
          <p className="text-xs text-ink-muted tabular">
            {draft.scoreBefore}% →{" "}
            <span
              className={cn(
                "font-semibold",
                SCORE_TEXT[scoreTone(draft.scoreAfter)],
              )}
            >
              {draft.scoreAfter}%
            </span>{" "}
            in your draft
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={subjectHref(subject.id)}
          className={linkButtonClass("secondary")}
        >
          View analysis
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <Link href={draftHref(subject.id)} className={linkButtonClass("primary")}>
          <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
          {draft ? "Continue draft" : "Draft revision"}
        </Link>
        <Link href={plannerHref(subject.id)} className={linkButtonClass("ghost")}>
          <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
          Open in planner
        </Link>
      </div>
    </Card>
  );
}
