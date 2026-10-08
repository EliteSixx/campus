"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getPercent,
  LECTURE_TYPE_LABEL,
  type LectureType,
  type PlannerSubjectWorkspace,
  type PlanProgress,
  type SubjectPlan,
} from "@/lib/api/lecture-planner-meta";
import { unitLabel } from "./utils";

// Delivery broken down by unit, what kinds of lecture the plan holds, and how
// many were taught on a different day from the one planned.

// Plural forms for the breakdown line, e.g. "2 class tests".
const TYPE_PLURAL: Record<LectureType, string> = {
  lecture: "lectures",
  lab: "labs",
  tutorial: "tutorials",
  revision: "revision",
  "class-test": "class tests",
  guest: "guest lectures",
};

const TYPES = Object.keys(LECTURE_TYPE_LABEL) as LectureType[];

export function PlanProgressCard({
  plan,
  schedule,
  progress,
  subject,
}: {
  plan: SubjectPlan;
  schedule: Record<string, string | null>;
  progress: PlanProgress;
  subject: PlannerSubjectWorkspace;
}) {
  const active = plan.lectures.filter((l) => l.status !== "cancelled");

  // "38 lectures · 2 revision · 1 class test", active lectures only.
  const breakdown = TYPES.flatMap((type) => {
    const count = active.filter((l) => l.type === type).length;
    if (count === 0) return [];
    const word = count === 1 ? LECTURE_TYPE_LABEL[type].toLowerCase() : TYPE_PLURAL[type];
    return [`${count} ${word}`];
  }).join(" · ");

  const takenElsewhere = plan.lectures.filter((l) => {
    const planned = schedule[l.id] ?? null;
    return (
      l.status === "delivered" &&
      l.actualDate !== null &&
      planned !== null &&
      l.actualDate !== planned
    );
  }).length;

  const units = progress.perUnit.filter((u) => u.total > 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold tracking-tight text-ink">Progress by unit</h3>

      {plan.lectures.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">This plan has no lectures yet.</p>
      ) : units.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">Every lecture in this plan is cancelled.</p>
      ) : (
        <>
          <ul className="mt-3 space-y-3">
            {units.map((u) => {
              const pct = getPercent(u.delivered, u.total);
              return (
                <li key={u.unitId ?? "other"}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-ink">
                      {unitLabel(subject.units, u.unitId)}
                    </span>
                    <span className="shrink-0 text-xs text-ink-muted tabular">
                      {u.delivered} of {u.total}
                      <span className="ml-2 font-bold text-accent">{pct}%</span>
                    </span>
                  </div>
                  <Progress value={pct} className="mt-1.5" />
                </li>
              );
            })}
          </ul>

          <p className="mt-4 text-xs text-ink-muted tabular">{breakdown}</p>
          {takenElsewhere > 0 && (
            <p className="mt-1 text-xs text-ink-muted tabular">
              Taken on a different day: {takenElsewhere}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
