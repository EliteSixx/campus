"use client";

import { useMemo } from "react";
import { Sparkles, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  generatePlanFromSyllabus,
  getTeachingDates,
  type PlannerCalendar,
  type PlannerSubjectWorkspace,
} from "@/lib/api/lecture-planner-meta";

// Shown once storage has been read and this subject has no saved plan. The
// figures are worked out with the same helpers the plan will use, so what is
// promised here is what "Generate" produces.

export function GeneratePlanEmpty({
  subject,
  calendar,
  hasOldProgress,
  onGenerate,
}: {
  subject: PlannerSubjectWorkspace;
  calendar: PlannerCalendar;
  // Whether the old planner board ticked any topic of this subject.
  hasOldProgress: boolean;
  onGenerate: () => void;
}) {
  const lectureCount = useMemo(
    () => generatePlanFromSyllabus(subject, calendar).lectures.length,
    [subject, calendar],
  );
  const dayCount = useMemo(
    () =>
      getTeachingDates(
        calendar.startDate,
        calendar.endDate,
        subject.lectureWeekdays,
        calendar,
      ).length,
    [subject, calendar],
  );
  const shortBy = lectureCount - dayCount;

  return (
    <Card className="mt-4 p-6">
      <h3 className="text-base font-bold text-ink">No plan for {subject.code} yet</h3>

      <ul className="mt-3 space-y-1 text-sm text-ink-muted tabular">
        <li>
          {subject.totalHours} syllabus hours → {lectureCount}{" "}
          {lectureCount === 1 ? "lecture" : "lectures"}
        </li>
        <li>
          {dayCount} lecture {dayCount === 1 ? "day" : "days"} available in{" "}
          {calendar.semesterName}
        </li>
      </ul>

      {shortBy > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          The syllabus needs {shortBy} more {shortBy === 1 ? "lecture" : "lectures"} than
          the semester has. You can fix this after generating.
        </p>
      )}

      <Button className="mt-4" onClick={onGenerate}>
        <Sparkles className="h-4 w-4" />
        Generate plan from syllabus
      </Button>

      {hasOldProgress && (
        <p className="mt-3 text-xs text-ink-muted">
          Topics you already ticked in the old planner will be kept.
        </p>
      )}
    </Card>
  );
}
