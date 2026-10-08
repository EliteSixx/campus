"use client";

import Link from "next/link";
import { ClipboardList, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { linkButtonClass } from "@/components/faculty/curriculum/utils";
import {
  distinctGaps,
  type ProgramRow,
  type ProgramStatus,
  type StoredPrograms,
} from "@/lib/api/faculty-programs-meta";
import { ProgramCard } from "./ProgramCard";
import { PLAN_HREF, plural } from "./utils";

// The shortlist and the applications, each in impact order, with the same
// card actions for changing or removing a status.

export function PlanTab({
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
  if (saved === null) {
    return (
      <div className="mt-6 space-y-4" aria-hidden="true">
        <div className="h-40 animate-pulse rounded-xl bg-surface-raised" />
        <div className="h-40 animate-pulse rounded-xl bg-surface-raised" />
      </div>
    );
  }

  const shortlisted = rows.filter((r) => saved[r.id]?.status === "shortlisted");
  const applied = rows.filter((r) => saved[r.id]?.status === "applied");
  const chosen = [...shortlisted, ...applied];

  if (chosen.length === 0) {
    return (
      <Card className="mt-6 flex flex-col items-center gap-2 p-8 text-center">
        <ClipboardList className="h-6 w-6 text-ink-muted" aria-hidden="true" />
        <p className="text-sm font-semibold text-ink">Your plan is empty</p>
        <p className="max-w-md text-xs text-ink-muted">
          Choose Shortlist or Mark as applied on any programme in Recommended or
          All programmes, and it will show up here. Your choices are saved in
          this browser.
        </p>
      </Card>
    );
  }

  const gaps = distinctGaps(chosen);
  const section = (title: string, list: ProgramRow[]) =>
    list.length > 0 && (
      <section className="mt-6">
        <h3 className="text-sm font-bold text-ink">
          {title}{" "}
          <span className="text-xs font-semibold text-ink-faint tabular">
            {list.length}
          </span>
        </h3>
        <div className="mt-3 space-y-4">
          {list.map((row) => (
            <ProgramCard
              key={row.id}
              row={row}
              status={saved[row.id]?.status ?? null}
              onStatus={onStatus}
              totalPostings={totalPostings}
            />
          ))}
        </div>
      </section>
    );

  return (
    <>
      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink tabular">
            {plural(chosen.length, "programme")}
          </span>{" "}
          in your plan, closing{" "}
          <span className="font-semibold text-ink tabular">
            {plural(gaps.length, "distinct syllabus gap")}
          </span>
          .
        </p>
        <Link href={PLAN_HREF} className={linkButtonClass("secondary")}>
          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
          Open printable plan
        </Link>
      </Card>

      {section("Shortlisted", shortlisted)}
      {section("Applied", applied)}
    </>
  );
}
