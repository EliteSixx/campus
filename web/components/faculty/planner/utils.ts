import {
  addDaysISO,
  isValidISODate,
  parseStoredPlans,
  PLANS_KEY,
  weekdayOfISO,
  type PlannerClassSlot,
  type PlannerUnitInfo,
  type StoredPlans,
  type SubjectPlan,
  type Weekday,
} from "@/lib/api/lecture-planner-meta";

// Shared bits for the lecture planner views.
//
// Only lib/api/lecture-planner-meta.ts is imported, and it carries no data at
// runtime, so nothing here pulls a data module into the browser. No clock is
// read: anything that needs "now" takes it as an argument.

// Notes written in the old planner board, keyed `${subjectId}:${topicId}`.
// Read only, to carry them into a newly generated plan.
export const OLD_NOTES_KEY = "theplug-planner-notes";

export const MAX_TITLE = 120;
export const MAX_SUBTOPIC = 160;
export const MAX_TEXT = 1000;

// Monday to Friday, the only days the timetable uses.
export const PLAN_WEEKDAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
};

// Unit filter value for lectures that belong to no unit.
export const OTHER_UNIT = "__other";

// "2026-09-16" for the calendar day `date` falls on in India.
export function todayISOInKolkata(date: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

// The date to record when a lecture is marked delivered: its scheduled date if
// that has already come, otherwise today. Falls back to whichever is known.
export function deliveredDateFor(
  scheduled: string | null,
  todayISO: string | null,
): string | null {
  if (scheduled !== null && (todayISO === null || scheduled <= todayISO)) {
    return scheduled;
  }
  return todayISO ?? scheduled;
}

// L1, L2… for lectures that are not cancelled, in plan order.
export function numberLectures(plan: SubjectPlan): Record<string, number> {
  const numbers: Record<string, number> = {};
  let n = 0;
  for (const lecture of plan.lectures) {
    if (lecture.status === "cancelled") continue;
    n += 1;
    numbers[lecture.id] = n;
  }
  return numbers;
}

// "Unit 2 · Relational Query Languages", or "Other lectures" for no unit.
export function unitLabel(units: PlannerUnitInfo[], unitId: string | null): string {
  const unit = unitId === null ? undefined : units.find((u) => u.id === unitId);
  return unit ? `Unit ${unit.number} · ${unit.title}` : "Other lectures";
}

export interface UnitHeadingRow {
  // The group this row is shown under: a unit id, or null for "Other lectures".
  group: string | null;
  // True when a unit heading goes above this row.
  showHeading: boolean;
}

// Where unit headings go in a list of lectures, given each lecture's unit (null
// for no unit or an unknown one). Used by LectureList and PrintablePlan so the
// screen and the printout always group the same way.
//
// A heading appears only when the unit actually changes. A run of no-unit
// lectures sitting between two lectures of the SAME unit is shown inside that
// unit, so the heading is not repeated after it. A no-unit run at the start or
// end, or between two different units, still gets its own "Other lectures"
// heading. Numbering is untouched: this only decides headings.
export function unitHeadingRows(groups: (string | null)[]): UnitHeadingRow[] {
  // The nearest unit before and after each position, skipping no-unit rows.
  const before: (string | null)[] = [];
  let last: string | null = null;
  for (const g of groups) {
    before.push(last);
    if (g !== null) last = g;
  }
  const after: (string | null)[] = new Array<string | null>(groups.length).fill(null);
  let next: string | null = null;
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    after[i] = next;
    const g = groups[i];
    if (g !== null) next = g;
  }

  const effective = groups.map((g, i) => {
    if (g !== null) return g;
    const prev = before[i] ?? null;
    return prev !== null && prev === (after[i] ?? null) ? prev : null;
  });

  return effective.map((group, i) => ({
    group,
    showHeading: i === 0 || effective[i - 1] !== group,
  }));
}

// "Mon 10:00, Thu 09:00, Fri 11:00 (LT-3, CSE-A)"
export function lectureSlotsText(slots: PlannerClassSlot[]): string {
  if (slots.length === 0) return "";
  const times = slots.map((s) => `${WEEKDAY_SHORT[s.weekday]} ${s.start}`);
  const where = [
    ...new Set(slots.map((s) => s.room)),
    ...new Set(slots.flatMap((s) => (s.section ? [s.section] : []))),
  ];
  return `${times.join(", ")}${where.length ? ` (${where.join(", ")})` : ""}`;
}

// "Tue 09:00–11:00, Lab-2; Fri 09:00–11:00, Lab-3"
export function labSlotsText(slots: PlannerClassSlot[]): string {
  return slots
    .map((s) => `${WEEKDAY_SHORT[s.weekday]} ${s.start}–${s.end}, ${s.room}`)
    .join("; ");
}

// "L12" for an active lecture, from the same numbering the list shows; null
// for a cancelled one.
export function lectureLabel(
  numbers: Record<string, number>,
  lectureId: string,
): string | null {
  const n = numbers[lectureId];
  return n === undefined ? null : `L${n}`;
}

// ---------------------------------------------------------------------------
// Months, as "YYYY-MM". Pure string and Date.UTC arithmetic, so no time zone
// can move a day and the server and every browser agree.

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Monday-first column of each weekday in a month grid.
const WEEK_COLUMN: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function parseMonth(month: string): { y: number; m: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  return m >= 1 && m <= 12 ? { y, m } : null;
}

// "2026-09" for "2026-09-16"; null for an invalid date.
export function monthOfISO(iso: string): string | null {
  return isValidISODate(iso) ? iso.slice(0, 7) : null;
}

export function firstDayOfMonthISO(month: string): string {
  return `${month}-01`;
}

// 0 for an invalid month.
export function daysInMonth(month: string): number {
  const parts = parseMonth(month);
  if (!parts) return 0;
  // Day 0 of the next month is the last day of this one.
  return new Date(Date.UTC(parts.y, parts.m, 0)).getUTCDate();
}

// addMonths("2026-12", 1) === "2027-01". Unchanged input when invalid.
export function addMonths(month: string, n: number): string {
  const parts = parseMonth(month);
  if (!parts || !Number.isFinite(n)) return month;
  const total = parts.y * 12 + (parts.m - 1) + Math.trunc(n);
  const y = Math.floor(total / 12);
  const m = total - y * 12 + 1;
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}`;
}

// "September 2026", from a fixed name table rather than toLocaleDateString.
export function formatMonthLabel(month: string): string {
  const parts = parseMonth(month);
  return parts ? `${MONTH_NAMES[parts.m - 1]} ${parts.y}` : month;
}

// The month laid out Monday to Sunday: blank cells (null) before the 1st and
// after the last day, padded to whole weeks.
export function buildMonthGrid(month: string): (string | null)[] {
  const days = daysInMonth(month);
  if (days === 0) return [];
  const first = firstDayOfMonthISO(month);
  const weekday = weekdayOfISO(first);
  const lead = weekday === null ? 0 : WEEK_COLUMN[weekday];

  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let i = 0; i < days; i += 1) cells.push(addDaysISO(first, i));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// Shared class strings, so every panel and icon button looks the same.
export const iconButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40";

export const labelClass = "mb-1 block text-xs font-bold text-ink";

export const nativeDateClass =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-ink shadow-sm focus:border-accent focus:outline-none";

// ---------------------------------------------------------------------------
// localStorage. Every read and write is wrapped, so a full or blocked storage
// never breaks the page; a failed read falls back to empty.

export function readStoredPlans(): StoredPlans {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) return {};
    return parseStoredPlans(JSON.parse(raw) as unknown);
  } catch (e) {
    console.error(`Failed to read ${PLANS_KEY} from localStorage`, e);
    return {};
  }
}

export function writeStoredPlans(plans: StoredPlans): void {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error(`Failed to save ${PLANS_KEY} to localStorage`, e);
  }
}

export function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return [];
  }
}

export function writeStringArray(key: string, values: string[]): void {
  try {
    const unique = [...new Set(values.filter((v) => typeof v === "string"))];
    localStorage.setItem(key, JSON.stringify(unique));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

export function readOldNotes(): Record<string, string> {
  const notes: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(OLD_NOTES_KEY);
    if (!raw) return notes;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return notes;
    }
    for (const [key, value] of Object.entries(parsed)) {
      if (key === "__proto__" || typeof value !== "string") continue;
      notes[key] = value;
    }
  } catch (e) {
    console.error(`Failed to read ${OLD_NOTES_KEY} from localStorage`, e);
  }
  return notes;
}
