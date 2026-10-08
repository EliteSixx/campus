"use client";

import type { ReactNode } from "react";
import { CalendarClock, ClipboardList, Layers, Target, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SOON_WEEKS, type ProgramsTotals } from "@/lib/api/faculty-programs-meta";

// Four headline numbers. Same look as the My Students stat cards (whose parts
// are not exported, so this is a small local version). The last two are buttons
// that open a tab; everything inside them is a <span>.

const VALUE_CLASS = "mt-2 block text-2xl font-extrabold tracking-tight tabular text-ink";

function Body({
  label,
  icon: Icon,
  value,
  sub,
}: {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
  sub: string;
}) {
  return (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-ink-muted">{label}</span>
        <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </span>
      {value}
      <span className="mt-1 block text-xs font-medium text-ink-muted">{sub}</span>
    </>
  );
}

function Skeleton() {
  return (
    <span className="mt-2 block" aria-hidden="true">
      <span className="block h-8 w-10 animate-pulse rounded-md bg-surface-raised" />
    </span>
  );
}

export function ProgramsStatCards({
  totals,
  shortlisted,
  applied,
  onOpenSoonest,
  onOpenPlan,
}: {
  totals: ProgramsTotals;
  // null until saved choices have been read.
  shortlisted: number | null;
  applied: number | null;
  onOpenSoonest: () => void;
  onOpenPlan: () => void;
}) {
  const buttonClass =
    "block h-full w-full rounded-xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="h-full p-5">
        <Body
          label="Matched to your gaps"
          icon={Target}
          value={<span className={VALUE_CLASS}>{totals.matchedToGaps}</span>}
          sub={`of ${totals.open} open opportunities`}
        />
      </Card>

      <Card className="h-full p-5">
        <Body
          label="Gap skills covered"
          icon={Layers}
          value={<span className={VALUE_CLASS}>{totals.gapSkillsCovered}</span>}
          sub="missing syllabus skills they teach"
        />
      </Card>

      <Card className="h-full p-0 hover:border-accent/40">
        <button
          type="button"
          onClick={onOpenSoonest}
          aria-label={`Starting soon: ${totals.startingSoon} programmes. Open all programmes, soonest first`}
          className={buttonClass}
        >
          <Body
            label="Starting soon"
            icon={CalendarClock}
            value={<span className={VALUE_CLASS}>{totals.startingSoon}</span>}
            sub={`start or close within ${SOON_WEEKS} weeks`}
          />
        </button>
      </Card>

      <Card className="h-full p-0 hover:border-accent/40">
        <button
          type="button"
          onClick={onOpenPlan}
          aria-label={
            shortlisted === null
              ? "My shortlist: still loading. Open my plan"
              : `My shortlist: ${shortlisted} shortlisted, ${applied ?? 0} applied. Open my plan`
          }
          className={buttonClass}
        >
          <Body
            label="My shortlist"
            icon={ClipboardList}
            value={
              shortlisted === null ? (
                <Skeleton />
              ) : (
                <span className={VALUE_CLASS}>{shortlisted}</span>
              )
            }
            sub={
              applied === null ? "saved in this browser" : `${applied} applied · saved in this browser`
            }
          />
        </button>
      </Card>
    </div>
  );
}
