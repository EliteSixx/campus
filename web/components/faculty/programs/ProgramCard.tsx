"use client";

import Link from "next/link";
import {
  Check,
  CircleCheck,
  EyeOff,
  Landmark,
  RotateCcw,
  Star,
  Target,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  draftHref,
  joinNames,
  linkButtonClass,
  textLinkClass,
} from "@/components/faculty/curriculum/utils";
import {
  bestDraftTarget,
  isFunding,
  timingText,
  urgencyOf,
  type ProgramRow,
  type ProgramStatus,
} from "@/lib/api/faculty-programs-meta";
import { SKILL_GAPS_HREF, STATUS_LABEL, TYPE_TONE, plural } from "./utils";

// One programme. Training programmes say which syllabus gaps they close, with
// each subject code linking to a syllabus draft for that skill; research grants
// say what they fund and when applications close instead. The action buttons
// sit outside every link.
//
// `status` is undefined while saved choices are still being read, and the
// buttons are disabled until then.

function UrgencyChip({ row }: { row: ProgramRow }) {
  const urgency = urgencyOf(row);
  if (urgency.level === "none") return null;
  return (
    <Badge tone={urgency.level === "high" ? "danger" : "warning"}>
      <TriangleAlert className="h-3 w-3" aria-hidden="true" />
      {urgency.text}
    </Badge>
  );
}

// "Docker (CS302, CS303), Kubernetes (CS303)", each code a draft link.
function GapList({ row }: { row: ProgramRow }) {
  return (
    <>
      {row.gaps.map((gap, i) => (
        <span key={gap.skillId}>
          {i > 0 && (i === row.gaps.length - 1 ? " and " : ", ")}
          <span className="font-semibold text-ink">{gap.name}</span>
          {gap.subjects.length > 0 && (
            <>
              {" ("}
              {gap.subjects.map((subject, j) => (
                <span key={subject.id}>
                  {j > 0 && ", "}
                  <Link
                    href={draftHref(subject.id, gap.skillId)}
                    className="font-semibold text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {subject.code}
                    <span className="sr-only">: draft {gap.name} into the syllabus</span>
                  </Link>
                </span>
              ))}
              {")"}
            </>
          )}
        </span>
      ))}
    </>
  );
}

function Actions({
  row,
  status,
  onStatus,
}: {
  row: ProgramRow;
  status: ProgramStatus | null | undefined;
  onStatus: (id: string, status: ProgramStatus | null) => void;
}) {
  const loading = status === undefined;
  const set = (s: ProgramStatus | null) => onStatus(row.id, s);
  const sr = <span className="sr-only">: {row.title}</span>;

  if (status === "hidden") {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => set(null)}>
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Show again{sr}
      </Button>
    );
  }

  if (status === "shortlisted") {
    return (
      <>
        <Button type="button" size="sm" onClick={() => set("applied")}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Mark as applied{sr}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => set(null)}>
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Remove from shortlist{sr}
        </Button>
      </>
    );
  }

  if (status === "applied") {
    return (
      <>
        <Button type="button" size="sm" variant="outline" onClick={() => set("shortlisted")}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Not applied yet{sr}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => set(null)}>
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Remove from plan{sr}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={loading}
        onClick={() => set("shortlisted")}
      >
        <Star className="h-3.5 w-3.5" aria-hidden="true" />
        Shortlist{sr}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={() => set("applied")}
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Mark as applied{sr}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={loading}
        onClick={() => set("hidden")}
      >
        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
        Not relevant{sr}
      </Button>
    </>
  );
}

export function ProgramCard({
  row,
  status,
  onStatus,
  totalPostings,
  featured = false,
}: {
  row: ProgramRow;
  status: ProgramStatus | null | undefined;
  onStatus: (id: string, status: ProgramStatus | null) => void;
  totalPostings: number;
  // The large "Best next move" version, with the draft and skill-gap links.
  featured?: boolean;
}) {
  const funding = isFunding(row.type);
  const draft = featured ? bestDraftTarget(row) : null;
  const TitleTag = featured ? "h3" : "h4";

  return (
    <Card
      className={cn(
        "p-5",
        featured && "border-accent/40 p-6",
        status === "hidden" && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <TitleTag
            className={cn(
              "font-extrabold text-ink",
              featured ? "text-lg" : "text-base",
            )}
          >
            {row.title}
          </TitleTag>
          <Badge tone={TYPE_TONE[row.type]}>{row.type}</Badge>
          <UrgencyChip row={row} />
        </div>
        {status && (
          <Badge tone={status === "hidden" ? "neutral" : "success"}>
            {status !== "hidden" && (
              <CircleCheck className="h-3 w-3" aria-hidden="true" />
            )}
            {STATUS_LABEL[status]}
          </Badge>
        )}
      </div>

      <p className="mt-1.5 text-xs text-ink-muted tabular">
        {row.provider} · {row.mode} · {plural(row.durationWeeks, "week")} ·{" "}
        {row.costText}
      </p>

      {featured && !funding && row.gaps.length > 0 && (
        <p className="mt-3 text-sm text-ink">
          Closes {plural(row.gaps.length, "gap")} (
          {joinNames(row.gaps.map((g) => g.name))}) in{" "}
          {joinNames(row.gapSubjectCodes)}.{" "}
          <span className="tabular">
            These appear in {row.postingsCount} live postings.
          </span>
          {row.studentImpact && (
            <>
              {" "}
              Your students average{" "}
              <span className="tabular">{row.studentImpact.cohortAverage}%</span>{" "}
              in {row.studentImpact.skillName}.
            </>
          )}
        </p>
      )}

      <p className="mt-3 text-sm text-ink-muted">{row.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {row.skillNames.map((name) => (
          <Badge key={name} tone="neutral">
            {name}
          </Badge>
        ))}
      </div>

      {funding ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface-raised/40 px-3.5 py-3">
          <Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-xs text-ink-muted tabular">
            Funds research:{" "}
            <span className="font-semibold text-ink">{row.costText}</span> for{" "}
            {plural(row.durationWeeks, "week")} ·{" "}
            <span className="font-semibold text-ink">{timingText(row)}</span> ·{" "}
            {plural(row.seatsLeft, "place")} left
          </p>
        </div>
      ) : row.gaps.length > 0 ? (
        <div className="mt-4 rounded-lg border border-accent/40 bg-accent-soft/60 px-3.5 py-3">
          <div className="flex items-start gap-2">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            <div className="space-y-1 text-xs text-ink-muted">
              <p>
                Closes{" "}
                <span className="font-semibold text-ink">
                  {plural(row.gaps.length, "gap")}
                </span>{" "}
                in your syllabus: <GapList row={row} />.
              </p>
              <p className="tabular">
                These skills are asked for in{" "}
                <span className="font-semibold text-ink">
                  {row.postingsCount} of {totalPostings}
                </span>{" "}
                live postings. {timingText(row)}.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-ink-muted">
          Does not close a gap in your syllabus. {timingText(row)}.
        </p>
      )}

      {row.studentImpact && !featured && (
        <p className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
          <Users className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
          <span>
            Your students average{" "}
            <span className="font-semibold text-ink tabular">
              {row.studentImpact.cohortAverage}%
            </span>{" "}
            in {row.studentImpact.skillName}, which this programme teaches.
          </span>
        </p>
      )}

      <p className="mt-3 text-xs text-ink-muted">Eligibility: {row.eligibility}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Actions row={row} status={status} onStatus={onStatus} />
        {featured && (
          <span className="flex flex-wrap items-center gap-3 sm:ml-auto">
            {draft && (
              <Link
                href={draftHref(draft.subject.id, draft.skillId)}
                className={linkButtonClass("secondary")}
              >
                Draft in {draft.subject.code}
              </Link>
            )}
            <Link href={SKILL_GAPS_HREF} className={textLinkClass}>
              See skill gaps
            </Link>
          </span>
        )}
      </div>
    </Card>
  );
}
