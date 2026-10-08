import type { SlotType, Weekday } from "@/data/timetable";
import type { ResolvedSlot } from "@/lib/api/timetable";

// Shared bits for the timetable views. Only types are imported from the data
// layer, so none of the data modules reach the browser bundle.

export const typeTone = {
  Lecture: "accent",
  Lab: "cyan",
  "Office Hours": "success",
  Meeting: "neutral",
} as const;

// Indexed by Date#getDay(), so Sunday is 0.
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Tailwind only ships classes it can see written out in full, so the palette is
// a list of literal class strings rather than anything built from a subject id.
// A subject keeps the same colour everywhere because the index comes from the
// subject order the API returns, which is stable.
const SUBJECT_STYLES = [
  "border-violet-500/60 bg-violet-500/10 hover:bg-violet-500/20",
  "border-cyan-500/60 bg-cyan-500/10 hover:bg-cyan-500/20",
  "border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20",
  "border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20",
  "border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20",
  "border-blue-500/60 bg-blue-500/10 hover:bg-blue-500/20",
];

const SUBJECT_SWATCHES = [
  "bg-violet-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-blue-500",
];

// Office Hours and Meeting slots have no subject, so they stay neutral.
const NO_SUBJECT_STYLE = "border-border bg-surface-raised hover:bg-border/40";

function paletteIndex(subjectId: string, subjectIds: string[]): number {
  const i = subjectIds.indexOf(subjectId);
  return (i < 0 ? 0 : i) % SUBJECT_STYLES.length;
}

export function slotStyle(slot: ResolvedSlot, subjectIds: string[]): string {
  if (!slot.subjectId) return NO_SUBJECT_STYLE;
  return SUBJECT_STYLES[paletteIndex(slot.subjectId, subjectIds)];
}

export function subjectSwatch(subjectId: string, subjectIds: string[]): string {
  return SUBJECT_SWATCHES[paletteIndex(subjectId, subjectIds)];
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

// Office Hours and Meeting slots carry a title instead of a subject.
export function slotLabel(slot: ResolvedSlot): string {
  return slot.subjectName ?? slot.title ?? slot.type;
}

export function slotTypeTone(type: SlotType) {
  return typeTone[type];
}

// Today as one of the timetable's own weekdays, or null at the weekend. Only
// ever called with a date read after mount, never during render.
export function weekdayFromDate(date: Date, days: Weekday[]): Weekday | null {
  const name = DAY_NAMES[date.getDay()];
  return days.find((day) => day === name) ?? null;
}
