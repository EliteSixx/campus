"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatPlanDate,
  isValidISODate,
  type PlannerCalendar,
  type PlannerSubjectWorkspace,
  type SubjectPlan,
  type Weekday,
} from "@/lib/api/lecture-planner-meta";
import {
  PLAN_WEEKDAYS,
  WEEKDAY_SHORT,
  labSlotsText,
  labelClass,
  lectureSlotsText,
  nativeDateClass,
} from "./utils";

// Subject picker, the timetable facts behind the plan, and — once a plan
// exists — its date range and lecture weekdays. Changes are held as a draft
// and only saved when valid.

function sameDays(a: Weekday[], b: Weekday[]): boolean {
  return a.length === b.length && a.every((d) => b.includes(d));
}

function validate(start: string, end: string, days: Weekday[]): string | null {
  if (!isValidISODate(start)) return "Enter a valid start date.";
  if (!isValidISODate(end)) return "Enter a valid end date.";
  if (start > end) return "The start date must be on or before the end date.";
  if (days.length === 0) return "Choose at least one lecture day.";
  return null;
}

function PlanDates({
  subject,
  plan,
  onSave,
}: {
  subject: PlannerSubjectWorkspace;
  plan: SubjectPlan;
  onSave: (startDate: string, endDate: string, weekdays: Weekday[]) => void;
}) {
  const [start, setStart] = useState(plan.startDate);
  const [end, setEnd] = useState(plan.endDate);
  const [days, setDays] = useState<Weekday[]>(plan.weekdays);

  // Re-sync the draft whenever the saved plan changes underneath it.
  const savedDays = plan.weekdays.join(",");
  useEffect(() => {
    setStart(plan.startDate);
    setEnd(plan.endDate);
    setDays(plan.weekdays);
    // plan.weekdays is compared through its joined string.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.subjectId, plan.startDate, plan.endDate, savedDays]);

  const error = validate(start, end, days);
  const dirty =
    start !== plan.startDate ||
    end !== plan.endDate ||
    !sameDays(days, plan.weekdays);

  function toggle(day: Weekday) {
    setDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : PLAN_WEEKDAYS.filter((d) => d === day || current.includes(d)),
    );
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="plan-start" className={labelClass}>
            Start date
          </label>
          <input
            id="plan-start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={nativeDateClass}
          />
        </div>
        <div>
          <label htmlFor="plan-end" className={labelClass}>
            End date
          </label>
          <input
            id="plan-end"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={nativeDateClass}
          />
        </div>
      </div>

      <div className="mt-3">
        <span className={labelClass}>Lecture days</span>
        <div className="flex flex-wrap items-center gap-2">
          {PLAN_WEEKDAYS.map((day) => {
            const on = days.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(day)}
                className={cn(
                  "h-8 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  on
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface text-ink-muted hover:text-ink",
                )}
              >
                {WEEKDAY_SHORT[day]}
              </button>
            );
          })}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDays([...subject.lectureWeekdays])}
            disabled={sameDays(days, subject.lectureWeekdays)}
          >
            Use timetable days
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          onClick={() => {
            if (error === null) onSave(start, end, days);
          }}
          disabled={!dirty || error !== null}
        >
          Save dates
        </Button>
        {dirty && error !== null && (
          <p role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        )}
        {dirty && error === null && (
          <p className="text-xs text-ink-muted">
            Lecture dates will be recalculated when you save.
          </p>
        )}
      </div>
    </div>
  );
}

export function PlanSetupCard({
  subjects,
  subject,
  calendar,
  plan,
  onSubjectChange,
  onSaveDates,
}: {
  subjects: PlannerSubjectWorkspace[];
  subject: PlannerSubjectWorkspace;
  calendar: PlannerCalendar;
  plan: SubjectPlan | null;
  onSubjectChange: (subjectId: string) => void;
  onSaveDates: (startDate: string, endDate: string, weekdays: Weekday[]) => void;
}) {
  const skipped = calendar.holidays.length + calendar.examPeriods.length;

  return (
    <Card className="mt-6 p-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="plan-subject" className={labelClass}>
            Subject
          </label>
          <Select
            id="plan-subject"
            value={subject.id}
            onChange={(e) => onSubjectChange(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </Select>

          <div className="mt-3 space-y-1 text-xs text-ink-muted">
            <p>
              <span className="font-semibold text-ink">Timetable lecture days: </span>
              {subject.lectureSlots.length > 0
                ? lectureSlotsText(subject.lectureSlots)
                : "none — this subject has no lecture slots in your timetable."}
            </p>
            {subject.labSlots.length > 0 && (
              <p>
                <span className="font-semibold text-ink">Lab: </span>
                {labSlotsText(subject.labSlots)}
              </p>
            )}
          </div>
        </div>

        <div className="text-xs text-ink-muted">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <CalendarDays className="h-4 w-4 text-accent" />
            {calendar.semesterName}
          </p>
          <p className="mt-1 tabular">
            {formatPlanDate(calendar.startDate)} – {formatPlanDate(calendar.endDate)}.
            Holidays and exam weeks are skipped automatically.
          </p>
          {skipped > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer rounded font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Show {skipped} skipped {skipped === 1 ? "period" : "periods"}
              </summary>
              <ul className="mt-2 space-y-1">
                {calendar.examPeriods.map((p) => (
                  <li key={p.id} className="tabular">
                    {formatPlanDate(p.start)} – {formatPlanDate(p.end)} · {p.name}
                  </li>
                ))}
                {calendar.holidays.map((h) => (
                  <li key={h.date} className="tabular">
                    {formatPlanDate(h.date)} · {h.name}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      {plan && (
        <PlanDates
          key={plan.subjectId}
          subject={subject}
          plan={plan}
          onSave={onSaveDates}
        />
      )}
    </Card>
  );
}
