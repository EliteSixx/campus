"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatPlanDate,
  getExamPeriod,
  getHolidayName,
  weekdayOfISO,
  type PlannedLecture,
  type PlannerCalendar,
  type SubjectPlan,
} from "@/lib/api/lecture-planner-meta";
import {
  addMonths,
  buildMonthGrid,
  formatMonthLabel,
  lectureLabel,
  monthOfISO,
} from "./utils";

// The plan laid out on a month calendar: every active lecture on its
// scheduled date, with holidays, exam weeks and weekends marked. A seven-column
// grid from sm up; on a phone, an agenda of just the days that matter.
//
// The list filters do not apply here — the calendar always shows every active
// lecture, so the dates can be read in full.

const WEEK_HEADINGS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_CHIPS = 2;

type ChipTone = "planned" | "delivered" | "overdue";

const CHIP_CLASS: Record<ChipTone, string> = {
  planned: "bg-accent-soft text-accent",
  delivered: "bg-success-soft text-success",
  overdue: "bg-warning-soft text-warning",
};

const CHIP_LABEL: Record<ChipTone, string> = {
  planned: "planned",
  delivered: "delivered",
  overdue: "overdue",
};

function clampMonth(month: string, min: string, max: string): string {
  if (month < min) return min;
  if (month > max) return max;
  return month;
}

function Chip({
  lecture,
  label,
  tone,
  onOpen,
}: {
  lecture: PlannedLecture;
  label: string | null;
  tone: ChipTone;
  onOpen: (id: string) => void;
}) {
  const text = `${label ?? ""}${label ? " · " : ""}${lecture.title}`;
  return (
    <button
      type="button"
      onClick={() => onOpen(lecture.id)}
      title={text}
      aria-label={`${text} (${CHIP_LABEL[tone]})`}
      className={cn(
        "block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        CHIP_CLASS[tone],
      )}
    >
      {text}
    </button>
  );
}

export function PlanCalendarView({
  plan,
  schedule,
  calendar,
  todayISO,
  numbers,
  overflowCount,
  onOpenLecture,
}: {
  plan: SubjectPlan;
  schedule: Record<string, string | null>;
  calendar: PlannerCalendar;
  todayISO: string | null;
  // The same numbering LectureList uses.
  numbers: Record<string, number>;
  overflowCount: number;
  onOpenLecture: (lectureId: string) => void;
}) {
  const minMonth = monthOfISO(plan.startDate) ?? plan.startDate.slice(0, 7);
  const maxMonth = monthOfISO(plan.endDate) ?? minMonth;
  const inPlan = (iso: string) => plan.startDate <= iso && iso <= plan.endDate;

  // Opens on today's month when today falls inside the plan, else its first
  // month. The ref makes that jump happen once, never over user navigation.
  const jumpedToToday = useRef(todayISO !== null);
  const [month, setMonth] = useState(() =>
    todayISO !== null && inPlan(todayISO) ? (monthOfISO(todayISO) ?? minMonth) : minMonth,
  );

  useEffect(() => {
    if (jumpedToToday.current || todayISO === null) return;
    jumpedToToday.current = true;
    if (plan.startDate <= todayISO && todayISO <= plan.endDate) {
      const m = monthOfISO(todayISO);
      if (m) setMonth(m);
    }
  }, [todayISO, plan.startDate, plan.endDate]);

  // A saved change to the plan's dates can leave the month out of range.
  const shown = clampMonth(month, minMonth, maxMonth);

  // Active lectures by date, in plan order.
  const byDate = useMemo(() => {
    const map = new Map<string, PlannedLecture[]>();
    for (const lecture of plan.lectures) {
      if (lecture.status === "cancelled") continue;
      const date = schedule[lecture.id] ?? null;
      if (date === null) continue;
      const list = map.get(date) ?? [];
      list.push(lecture);
      map.set(date, list);
    }
    return map;
  }, [plan.lectures, schedule]);

  const cells = buildMonthGrid(shown);

  const toneOf = (lecture: PlannedLecture, date: string): ChipTone => {
    if (lecture.status === "delivered") return "delivered";
    return todayISO !== null && date < todayISO ? "overdue" : "planned";
  };

  const chipsFor = (date: string, limit: number | null) => {
    const lectures = byDate.get(date) ?? [];
    const visible = limit === null ? lectures : lectures.slice(0, limit);
    const hidden = lectures.slice(visible.length);
    return (
      <div className="mt-1 space-y-0.5">
        {visible.map((l) => (
          <Chip
            key={l.id}
            lecture={l}
            label={lectureLabel(numbers, l.id)}
            tone={toneOf(l, date)}
            onOpen={onOpenLecture}
          />
        ))}
        {hidden.length > 0 && (
          <button
            type="button"
            onClick={() => onOpenLecture(hidden[0].id)}
            className="rounded px-1.5 text-[11px] font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            +{hidden.length} more
          </button>
        )}
      </div>
    );
  };

  // Days worth listing in the phone agenda.
  const agendaDays = cells.filter(
    (d): d is string =>
      d !== null &&
      (byDate.has(d) ||
        getHolidayName(d, calendar) !== null ||
        getExamPeriod(d, calendar) !== null),
  );

  return (
    <Card className="mt-4 p-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setMonth(addMonths(shown, -1))}
          disabled={shown <= minMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>
        <h3 className="text-sm font-bold text-ink tabular" aria-live="polite">
          {formatMonthLabel(shown)}
        </h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setMonth(addMonths(shown, 1))}
          disabled={shown >= maxMonth}
          aria-label="Next month"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="mt-1 text-center text-[11px] text-ink-faint">
        Filters apply to the list view only
      </p>

      {/* Grid, sm and up */}
      <div className="mt-4 hidden grid-cols-7 gap-1 sm:grid">
        {WEEK_HEADINGS.map((d) => (
          <div key={d} className="pb-1 text-center text-[11px] font-bold uppercase text-ink-muted">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (date === null) return <div key={`blank-${i}`} aria-hidden />;
          const weekday = weekdayOfISO(date);
          const weekend = weekday === "Saturday" || weekday === "Sunday";
          const holiday = getHolidayName(date, calendar);
          const exam = getExamPeriod(date, calendar);
          const outside = !inPlan(date);
          return (
            <div
              key={date}
              className={cn(
                "min-h-[96px] min-w-0 rounded-md border border-border p-1.5",
                holiday
                  ? "bg-surface-raised"
                  : weekend
                    ? "bg-surface-raised/40"
                    : "bg-surface",
                outside && "opacity-50",
                date === todayISO && "ring-2 ring-accent",
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={cn(
                    "text-xs font-semibold tabular",
                    outside || weekend ? "text-ink-faint" : "text-ink",
                  )}
                >
                  {Number(date.slice(8))}
                </span>
                {exam && (
                  <Badge tone="warning" className="px-1.5 py-0 text-[10px]">
                    Exam week
                  </Badge>
                )}
              </div>
              {holiday && (
                <p className="truncate text-[11px] text-ink-muted" title={holiday}>
                  {holiday}
                </p>
              )}
              {chipsFor(date, MAX_CHIPS)}
            </div>
          );
        })}
      </div>

      {/* Agenda, phones */}
      <div className="mt-4 sm:hidden">
        {agendaDays.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing scheduled this month.</p>
        ) : (
          <ul className="space-y-2">
            {agendaDays.map((date) => {
              const holiday = getHolidayName(date, calendar);
              const exam = getExamPeriod(date, calendar);
              return (
                <li
                  key={date}
                  className={cn(
                    "rounded-lg border border-border p-2.5",
                    holiday ? "bg-surface-raised" : "bg-surface",
                    date === todayISO && "ring-2 ring-accent",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-ink tabular">
                      {formatPlanDate(date)}
                    </span>
                    {exam && (
                      <Badge tone="warning" className="px-1.5 py-0 text-[10px]">
                        Exam week
                      </Badge>
                    )}
                    {holiday && <span className="text-xs text-ink-muted">{holiday}</span>}
                  </div>
                  {chipsFor(date, null)}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Legend */}
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-muted">
        <li className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded", CHIP_CLASS.planned)} aria-hidden /> Planned
        </li>
        <li className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded", CHIP_CLASS.delivered)} aria-hidden /> Delivered
        </li>
        <li className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded", CHIP_CLASS.overdue)} aria-hidden /> Overdue
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-border bg-surface-raised" aria-hidden />{" "}
          Holiday
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-warning-soft ring-1 ring-warning/40" aria-hidden />{" "}
          Exam week
        </li>
      </ul>

      {overflowCount > 0 && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 text-xs font-medium text-danger"
        >
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Not scheduled: {overflowCount}{" "}
          {overflowCount === 1 ? "lecture doesn't" : "lectures don't"} fit before the semester
          ends
        </p>
      )}
    </Card>
  );
}
