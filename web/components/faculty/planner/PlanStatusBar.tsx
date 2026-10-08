"use client";

import { CheckCheck, Plus, RotateCcw, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  formatPlanDate,
  type PlanProgress,
} from "@/lib/api/lecture-planner-meta";

// Where the plan stands: delivery, pace against the calendar, projected finish
// and whether everything fits. Also holds the plan-wide actions.

// Behind by this many lectures or more reads as serious rather than a warning.
const SERIOUSLY_BEHIND = 5;

function PaceBadge({ progress }: { progress: PlanProgress }) {
  const { behindBy, aheadBy } = progress;
  if (behindBy === null || aheadBy === null) return null;
  if (behindBy > 0) {
    return (
      <Badge tone={behindBy >= SERIOUSLY_BEHIND ? "danger" : "warning"}>
        {behindBy} {behindBy === 1 ? "lecture" : "lectures"} behind
      </Badge>
    );
  }
  if (aheadBy > 0) {
    return (
      <Badge tone="success">
        {aheadBy} {aheadBy === 1 ? "lecture" : "lectures"} ahead
      </Badge>
    );
  }
  return <Badge tone="success">On track</Badge>;
}

export function PlanStatusBar({
  code,
  progress,
  todayKnown,
  pastPlannedCount,
  onMarkPast,
  onAddLecture,
  onReset,
}: {
  code: string;
  progress: PlanProgress;
  todayKnown: boolean;
  // Planned lectures whose date is before today.
  pastPlannedCount: number;
  onMarkPast: () => void;
  onAddLecture: () => void;
  onReset: () => void;
}) {
  return (
    <Card className="mt-4 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-ink tabular">
              {progress.delivered} of {progress.totalActive} lectures delivered
            </p>
            {todayKnown && <PaceBadge progress={progress} />}
            {progress.cancelled > 0 && (
              <span className="text-xs text-ink-muted tabular">
                {progress.cancelled} cancelled
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <Progress value={progress.hoursPct} className="flex-1" />
            <span className="shrink-0 text-sm font-bold text-accent tabular">
              {progress.hoursPct}%
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-muted tabular">
            {progress.deliveredHours} of {progress.totalHours} hours
          </p>

          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted tabular">
            <span>
              Projected finish{" "}
              <span className="font-semibold text-ink">
                {progress.projectedFinish
                  ? formatPlanDate(progress.projectedFinish)
                  : "—"}
              </span>
            </span>
            <span>
              Semester ends{" "}
              <span className="font-semibold text-ink">
                {formatPlanDate(progress.semesterEnd)}
              </span>
            </span>
            {progress.bufferDays !== null && progress.bufferDays >= 0 && (
              <span>
                {progress.bufferDays} {progress.bufferDays === 1 ? "day" : "days"} to spare
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={onMarkPast}
            disabled={!todayKnown || pastPlannedCount === 0}
            title={
              pastPlannedCount === 0
                ? "No planned lectures before today"
                : `${pastPlannedCount} planned lectures are dated before today`
            }
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark past lectures as delivered
          </Button>
          <Button size="sm" onClick={onAddLecture}>
            <Plus className="h-3.5 w-3.5" />
            Add lecture
          </Button>
          <Button size="sm" variant="ghost" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to syllabus
          </Button>
        </div>
      </div>

      {progress.overflowCount > 0 && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-medium text-danger"
        >
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {progress.overflowCount}{" "}
          {progress.overflowCount === 1 ? "lecture doesn't" : "lectures don't"} fit
          before the semester ends. Cancel a lecture, or add a lecture day.
        </p>
      )}
    </Card>
  );
}
