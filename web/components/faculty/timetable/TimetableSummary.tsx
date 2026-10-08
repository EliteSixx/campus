import { Clock, Coffee, FlaskConical, Layers } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import type { TimetableSummary as Summary } from "@/lib/api/timetable";
import { formatHours } from "./utils";

// Every figure here is counted from the slots in data/timetable.ts by
// lib/api/timetable.ts — nothing on this row is written down by hand.

export function TimetableSummary({ summary }: { summary: Summary }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
      <MetricCard
        label="Teaching hours per week"
        value={formatHours(summary.teachingHours)}
        icon={Clock}
        tone="accent"
        trend="Lectures and labs combined"
      />
      <MetricCard
        label="Theory vs lab"
        value={`${formatHours(summary.theoryHours)} / ${formatHours(summary.labHours)}`}
        icon={FlaskConical}
        trend="Lecture hours vs lab hours"
      />
      <MetricCard
        label="Subjects taught"
        value={String(summary.subjectCount)}
        icon={Layers}
        trend={`${summary.classCount} class groups across ${summary.sectionCount} sections`}
      />
      <MetricCard
        label="Free periods per week"
        value={String(summary.freePeriods)}
        icon={Coffee}
        trend="Breaks not counted"
      />
    </div>
  );
}
