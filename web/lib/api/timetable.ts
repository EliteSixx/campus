import {
  DAY_END,
  DAY_START,
  LUNCH_END,
  LUNCH_START,
  slotsForDay,
  timetable,
  weekdays,
  type TimetableSlot,
  type Weekday,
} from "@/data/timetable";
import { getSubjectById } from "@/data/curriculum";

// The weekly timetable, flattened so the client week view works from plain
// data and never pulls the data modules into the browser bundle.
//
// No new data: slots come from data/timetable.ts and subject names and codes
// from data/curriculum.ts. Free periods are simply the gaps nothing covers.

export interface ResolvedSlot extends TimetableSlot {
  // null for Office Hours and Meeting slots, which have no subject.
  subjectName: string | null;
  subjectCode: string | null;
  // Whether data/curriculum.ts actually has this subject. Office Hours and
  // Meeting slots are false, and so is any subjectId the syllabus dropped.
  // The detail panel uses this to decide whether a link to the subject
  // analysis page would resolve, so it never renders a broken link.
  subjectInCurriculum: boolean;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface TimetableDay {
  day: Weekday;
  // In time order.
  slots: ResolvedSlot[];
  // Gaps between DAY_START and DAY_END no slot covers, lunch excluded.
  freePeriods: TimeRange[];
  // Lecture and Lab hours only.
  teachingHours: number;
}

export interface SubjectHours {
  id: string;
  code: string;
  name: string;
  hours: number;
}

export interface Timetable {
  days: TimetableDay[];
  weeklyTeachingHours: number;
  // Highest first.
  perSubjectHours: SubjectHours[];
  labCount: number;
  lectureCount: number;
  officeHourSlots: ResolvedSlot[];
  lunch: TimeRange;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(total: number): string {
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  const minutes = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function slotHours(slot: TimetableSlot): number {
  return (toMinutes(slot.end) - toMinutes(slot.start)) / 60;
}

const isTeaching = (slot: TimetableSlot) =>
  slot.type === "Lecture" || slot.type === "Lab";

// Lecture and lab hours totalled per subject, highest first. Shared by
// getTimetable() and getTimetableView() so both report the same figures.
function subjectHoursOf(teaching: ResolvedSlot[]): SubjectHours[] {
  const bySubject = new Map<string, SubjectHours>();
  for (const slot of teaching) {
    if (!slot.subjectId) continue;
    const entry = bySubject.get(slot.subjectId) ?? {
      id: slot.subjectId,
      code: slot.subjectCode ?? slot.subjectId,
      name: slot.subjectName ?? slot.subjectId,
      hours: 0,
    };
    entry.hours += slotHours(slot);
    bySubject.set(slot.subjectId, entry);
  }
  return [...bySubject.values()].sort(
    (a, b) => b.hours - a.hours || a.code.localeCompare(b.code),
  );
}

function resolveSlot(slot: TimetableSlot): ResolvedSlot {
  const subject = slot.subjectId ? getSubjectById(slot.subjectId) : undefined;
  return {
    ...slot,
    subjectName: subject?.name ?? null,
    subjectCode: subject?.code ?? null,
    subjectInCurriculum: subject !== undefined,
  };
}

// Walks the day from DAY_START to DAY_END and records every stretch that no
// slot covers. Lunch is treated as occupied so it never counts as free.
function freePeriods(slots: TimetableSlot[]): TimeRange[] {
  const dayStart = toMinutes(DAY_START);
  const dayEnd = toMinutes(DAY_END);

  const busy = [
    ...slots.map((s) => [toMinutes(s.start), toMinutes(s.end)]),
    [toMinutes(LUNCH_START), toMinutes(LUNCH_END)],
  ]
    .map(([start, end]) => [Math.max(start, dayStart), Math.min(end, dayEnd)])
    .filter(([start, end]) => start < end)
    .sort((a, b) => a[0] - b[0]);

  const gaps: TimeRange[] = [];
  let cursor = dayStart;
  for (const [start, end] of busy) {
    if (start > cursor) {
      gaps.push({ start: fromMinutes(cursor), end: fromMinutes(start) });
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < dayEnd) {
    gaps.push({ start: fromMinutes(cursor), end: fromMinutes(dayEnd) });
  }
  return gaps;
}

// ---------------------------------------------------------------------------
// Week grid
//
// getTimetable() above answers "what does each day look like". The view below
// answers "what does the week grid look like": one shared set of period rows
// that every day column lines up against, plus the filter options, the summary
// figures and the clash check. Same rule as above — everything is derived from
// data/timetable.ts and data/curriculum.ts, nothing is invented here.

export interface Period extends TimeRange {
  // A stretch of the day nothing is ever scheduled over, drawn as a thin
  // full-width row rather than a column of empty cells.
  isBreak: boolean;
}

export interface SubjectRef {
  id: string;
  code: string;
  name: string;
}

export interface TimetableSummary {
  teachingHours: number;
  // "Theory" here is the Lecture slot type; the data has no separate Tutorial.
  theoryHours: number;
  labHours: number;
  subjectCount: number;
  sectionCount: number;
  // Distinct subject-and-section pairings, i.e. how many class groups.
  classCount: number;
  // Period cells across the week with nothing scheduled, breaks excluded.
  freePeriods: number;
}

export interface Clash {
  id: string;
  // "room" — one room booked twice over. "faculty" — two rooms at once.
  kind: "faculty" | "room";
  day: Weekday;
  start: string;
  end: string;
  a: ResolvedSlot;
  b: ResolvedSlot;
}

export interface TimetableView {
  days: Weekday[];
  periods: Period[];
  slots: ResolvedSlot[];
  subjects: SubjectRef[];
  sections: string[];
  summary: TimetableSummary;
  clashes: Clash[];
  // Highest first, for the hours-by-subject bars.
  perSubjectHours: SubjectHours[];
}

// Rows are cut at every time any slot starts or ends, so a period never
// straddles the edge of a class and a two-hour lab simply covers two rows.
function buildPeriods(slots: TimetableSlot[]): Period[] {
  const dayStart = toMinutes(DAY_START);
  const dayEnd = toMinutes(DAY_END);
  const lunchStart = toMinutes(LUNCH_START);
  const lunchEnd = toMinutes(LUNCH_END);

  const edges = new Set([dayStart, dayEnd, lunchStart, lunchEnd]);
  for (const slot of slots) {
    for (const edge of [toMinutes(slot.start), toMinutes(slot.end)]) {
      if (edge > dayStart && edge < dayEnd) edges.add(edge);
    }
  }

  const sorted = [...edges]
    .filter((m) => m >= dayStart && m <= dayEnd)
    .sort((a, b) => a - b);

  const periods: Period[] = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const scheduled = slots.some(
      (s) => toMinutes(s.start) < end && toMinutes(s.end) > start,
    );
    periods.push({
      start: fromMinutes(start),
      end: fromMinutes(end),
      // Only a stretch no slot touches on any day becomes a break row, which
      // guarantees a full-width break row can never hide a class.
      isBreak: !scheduled && start >= lunchStart && end <= lunchEnd,
    });
  }
  return periods;
}

// Times are zero-padded "HH:MM", so plain string comparison is time order.
const overlaps = (
  a: { start: string; end: string },
  b: { start: string; end: string },
) => a.start < b.end && a.end > b.start;

function countFreePeriods(periods: Period[], slots: TimetableSlot[]): number {
  let free = 0;
  for (const day of weekdays) {
    const daySlots = slots.filter((s) => s.day === day);
    for (const period of periods) {
      if (period.isBreak) continue;
      if (!daySlots.some((s) => overlaps(s, period))) free += 1;
    }
  }
  return free;
}

function findClashes(slots: ResolvedSlot[]): Clash[] {
  const clashes: Clash[] = [];
  for (const day of weekdays) {
    const daySlots = slots.filter((s) => s.day === day);
    for (let i = 0; i < daySlots.length; i += 1) {
      for (let j = i + 1; j < daySlots.length; j += 1) {
        const a = daySlots[i];
        const b = daySlots[j];
        if (!overlaps(a, b)) continue;
        clashes.push({
          id: `${a.id}-${b.id}`,
          kind: a.room === b.room ? "room" : "faculty",
          day,
          start: a.start > b.start ? a.start : b.start,
          end: a.end < b.end ? a.end : b.end,
          a,
          b,
        });
      }
    }
  }
  return clashes;
}

export async function getTimetableView(): Promise<TimetableView> {
  const slots = timetable
    .map(resolveSlot)
    .sort((a, b) => a.start.localeCompare(b.start));
  const periods = buildPeriods(timetable);
  const teaching = slots.filter(isTeaching);

  const hoursOf = (list: TimetableSlot[]) =>
    list.reduce((sum, s) => sum + slotHours(s), 0);

  const subjects = new Map<string, SubjectRef>();
  for (const slot of teaching) {
    if (!slot.subjectId || subjects.has(slot.subjectId)) continue;
    subjects.set(slot.subjectId, {
      id: slot.subjectId,
      code: slot.subjectCode ?? slot.subjectId,
      name: slot.subjectName ?? slot.subjectId,
    });
  }

  const sections = [
    ...new Set(slots.flatMap((s) => (s.section ? [s.section] : []))),
  ].sort();

  const classGroups = new Set(
    teaching.flatMap((s) =>
      s.subjectId && s.section ? [`${s.subjectId}|${s.section}`] : [],
    ),
  );

  return {
    days: weekdays,
    periods,
    slots,
    subjects: [...subjects.values()].sort((a, b) => a.code.localeCompare(b.code)),
    sections,
    summary: {
      teachingHours: hoursOf(teaching),
      theoryHours: hoursOf(slots.filter((s) => s.type === "Lecture")),
      labHours: hoursOf(slots.filter((s) => s.type === "Lab")),
      subjectCount: subjects.size,
      sectionCount: sections.length,
      classCount: classGroups.size,
      freePeriods: countFreePeriods(periods, timetable),
    },
    clashes: findClashes(slots),
    perSubjectHours: subjectHoursOf(teaching),
  };
}

export async function getTimetable(): Promise<Timetable> {
  const days = weekdays.map((day) => {
    const slots = slotsForDay(day).map(resolveSlot);
    return {
      day,
      slots,
      freePeriods: freePeriods(slots),
      teachingHours: slots
        .filter(isTeaching)
        .reduce((sum, s) => sum + slotHours(s), 0),
    };
  });

  const teaching = timetable.filter(isTeaching).map(resolveSlot);

  return {
    days,
    weeklyTeachingHours: teaching.reduce((sum, s) => sum + slotHours(s), 0),
    perSubjectHours: subjectHoursOf(teaching),
    labCount: timetable.filter((s) => s.type === "Lab").length,
    lectureCount: timetable.filter((s) => s.type === "Lecture").length,
    officeHourSlots: timetable
      .filter((s) => s.type === "Office Hours")
      .map(resolveSlot),
    lunch: { start: LUNCH_START, end: LUNCH_END },
  };
}
