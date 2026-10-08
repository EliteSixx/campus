"use client";

import { useState } from "react";
import { Landmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isFunding,
  rankPrograms,
  type ProgramRow,
  type ProgramStatus,
  type StoredPrograms,
} from "@/lib/api/faculty-programs-meta";
import { ProgramCard } from "./ProgramCard";
import { plural } from "./utils";

// Best next move, then the other training programmes by gap impact, then
// research funding on its own. Programmes marked "Not relevant" are left out
// unless shown. Which one is "best" depends on what is hidden or applied for,
// so until saved choices are read the tab is a skeleton.

function Skeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden="true">
      <div className="h-64 animate-pulse rounded-xl bg-surface-raised" />
      <div className="h-40 animate-pulse rounded-xl bg-surface-raised" />
      <div className="h-40 animate-pulse rounded-xl bg-surface-raised" />
    </div>
  );
}

export function RecommendedTab({
  rows,
  saved,
  onStatus,
  totalPostings,
}: {
  rows: ProgramRow[];
  saved: StoredPrograms | null;
  onStatus: (id: string, status: ProgramStatus | null) => void;
  totalPostings: number;
}) {
  const [showHidden, setShowHidden] = useState(false);

  if (saved === null) {
    return (
      <>
        <Skeleton />
        <p className="sr-only" role="status">
          Loading your saved choices…
        </p>
      </>
    );
  }

  const statusOf = (id: string) => saved[id]?.status ?? null;
  const hiddenCount = rows.filter((r) => statusOf(r.id) === "hidden").length;
  const visible = rows.filter((r) => showHidden || statusOf(r.id) !== "hidden");

  const ranked = rankPrograms(visible, "impact");
  const training = ranked.filter((r) => !isFunding(r.type));
  const funding = ranked.filter((r) => isFunding(r.type));

  // The top training programme that closes a gap and is not already applied for
  // or hidden.
  const best =
    training.find(
      (r) =>
        r.gaps.length > 0 &&
        statusOf(r.id) !== "applied" &&
        statusOf(r.id) !== "hidden",
    ) ?? null;
  const rest = training.filter((r) => r !== best);

  const card = (row: ProgramRow, featured = false) => (
    <ProgramCard
      key={row.id}
      row={row}
      status={statusOf(row.id)}
      onStatus={onStatus}
      totalPostings={totalPostings}
      featured={featured}
    />
  );

  return (
    <>
      {hiddenCount > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span className="tabular">{hiddenCount} hidden</span>·
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-pressed={showHidden}
            onClick={() => setShowHidden((v) => !v)}
          >
            {showHidden ? "Hide them again" : "Show them"}
          </Button>
        </div>
      )}

      {best && (
        <section className="mt-6" aria-labelledby="best-next-move">
          <h3
            id="best-next-move"
            className="mb-3 flex items-center gap-2 text-sm font-bold text-ink"
          >
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            Best next move
          </h3>
          {card(best, true)}
        </section>
      )}

      <section className="mt-8" aria-labelledby="training-programmes">
        <h3 id="training-programmes" className="text-sm font-bold text-ink">
          {best ? "Other training programmes" : "Training programmes"}
        </h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Ranked by gap impact: the live demand for the syllabus gaps each one closes.
        </p>
        {rest.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Nothing else to show.</p>
        ) : (
          <div className="mt-3 space-y-4">{rest.map((row) => card(row))}</div>
        )}
      </section>

      {funding.length > 0 && (
        <section className="mt-8" aria-labelledby="research-funding">
          <h3
            id="research-funding"
            className="flex items-center gap-2 text-sm font-bold text-ink"
          >
            <Landmark className="h-4 w-4 text-accent" aria-hidden="true" />
            Research funding
            <span className="text-xs font-semibold text-ink-faint tabular">
              {plural(funding.length, "grant")}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            These fund research work rather than close a teaching gap.
          </p>
          <div className="mt-3 space-y-4">{funding.map((row) => card(row))}</div>
        </section>
      )}
    </>
  );
}
