import {
  getDayKeyFromDate,
  timeToMinutes,
  type DashboardAnnouncementSummary,
  type DashboardTimetableSlot,
  type DayKey,
} from "@/lib/api/faculty-dashboard-meta";

// Shared bits for the faculty dashboard's client views.
//
// Nothing here imports a data module, not even through a helper: the messages
// utils file is deliberately not used because it imports FACULTY_ID as a value
// from data/faculty-messages, so its storage key is repeated below instead.
//
// No clock is read here. Anything that depends on "now" takes it as an argument.

// localStorage keys owned by other faculty pages. Read only, never written.
export const READ_KEY = "theplug-messages-read";
export const DELIVERED_KEY = "theplug-planner-delivered";

export const TIME_ZONE = "Asia/Kolkata";

export type AnnouncementStatus = DashboardAnnouncementSummary["status"];
export type Tone = "success" | "warning" | "danger";

// Green at 60 and above, amber 40–59, red below 40 — the rule the curriculum
// pages use for alignment scores.
export function scoreTone(pct: number): Tone {
  if (pct >= 60) return "success";
  if (pct >= 40) return "warning";
  return "danger";
}

export const toneText: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export const toneBar: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

// Same tones as components/faculty/timetable/utils.ts.
export const slotTypeTone = {
  Lecture: "accent",
  Lab: "cyan",
  "Office Hours": "success",
  Meeting: "neutral",
} as const satisfies Record<DashboardTimetableSlot["type"], string>;

// The small "View all →" link in a card header.
export const headerLinkClass =
  "inline-flex shrink-0 items-center gap-1 rounded text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export const isTeachingSlot = (slot: DashboardTimetableSlot) =>
  slot.type === "Lecture" || slot.type === "Lab";

export function plural(count: number, word: string, many = `${word}s`): string {
  return `${count} ${count === 1 ? word : many}`;
}

// "Ananya Nair" -> "AN". Same rule as the messages inbox.
export function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

// ---------------------------------------------------------------------------
// Row shapes the client container computes and hands to each card.

export interface PlannerRow {
  subjectId: string;
  code: string;
  name: string;
  deliveredTopics: number;
  totalTopics: number;
  // Delivered hours as a share of total hours, as on /faculty/planner.
  hoursPct: number;
}

export interface CoverageRow {
  courseId: string;
  code: string;
  name: string;
  coveredTopics: number;
  totalTopics: number;
  pct: number;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  // Already passed through effectiveStatusOf. Never "draft".
  status: AnnouncementStatus;
  audienceLabel: string;
  // publishAt ?? createdAt, UTC ISO.
  at: string;
  readCount: number;
  totalRecipients: number;
  isLocal: boolean;
}

export interface MessageRow {
  id: string;
  participantName: string;
  participantStudentId?: string;
  isGroup: boolean;
  subject: string;
  preview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface AttentionAssignment {
  id: string;
  title: string;
  subjectCode: string;
  pendingEvaluation: number;
  dueDate: string;
}

// ---------------------------------------------------------------------------
// Announcements

// The same rule as effectiveStatus() in components/faculty/announcements/
// utils.ts: a scheduled announcement whose time has passed reads as published,
// and nothing changes until the clock is known. Repeated here because that
// function takes a full Announcement, and the dashboard summaries carry only
// the two fields the rule reads.
export function effectiveStatusOf(
  item: { status: AnnouncementStatus; publishAt: string | null },
  nowISO: string | null,
): AnnouncementStatus {
  if (item.status !== "scheduled") return item.status;
  if (nowISO === null || item.publishAt === null) return item.status;
  return item.publishAt <= nowISO ? "published" : "scheduled";
}

// ---------------------------------------------------------------------------
// Dates. Stored instants are UTC ISO; everything shown is in Asia/Kolkata.

// "2026-09-16" for the calendar day `date` falls on in `timeZone`.
export function isoDateInZone(date: Date, timeZone = TIME_ZONE): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(date);
}

function parseISODate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

// Calendar arithmetic on a date-only string. Done in UTC so no zone offset or
// daylight-saving change can move the day.
export function addDaysISO(iso: string, days: number): string {
  const parts = parseISODate(iso);
  if (!parts) return iso;
  const shifted = new Date(Date.UTC(parts.y, parts.m - 1, parts.d + days));
  return shifted.toISOString().slice(0, 10);
}

// Whole days from `fromISO` to `toISO`, both date-only strings.
export function daysBetweenISO(fromISO: string, toISO: string): number {
  const a = parseISODate(fromISO);
  const b = parseISODate(toISO);
  if (!a || !b) return 0;
  const ms = Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d);
  return Math.round(ms / 86_400_000);
}

// "Fri, 26 Sep" for a date-only string. Built from its Y-M-D parts and
// formatted in UTC, so it is never shifted to the day before.
export function formatISODate(iso: string): string {
  const parts = parseISODate(iso);
  if (!parts) return iso;
  return new Date(Date.UTC(parts.y, parts.m - 1, parts.d)).toLocaleDateString(
    "en-GB",
    { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" },
  );
}

// "Wednesday, 16 September 2026" in Asia/Kolkata. Assembled from parts so the
// comma does not depend on the browser's ICU version.
export function formatLongDate(date: Date, timeZone = TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`;
}

// ---------------------------------------------------------------------------
// Timetable

const WEEK: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// The first slot on the next day after today that has any, looking up to a
// week ahead. Used when today has nothing scheduled.
export function firstSlotOfNextWorkingDay(
  slots: DashboardTimetableSlot[],
  date: Date,
  timeZone = TIME_ZONE,
): DashboardTimetableSlot | null {
  const today = getDayKeyFromDate(date, timeZone);
  if (today === null) return null;
  const start = WEEK.indexOf(today);

  for (let offset = 1; offset <= WEEK.length; offset += 1) {
    const day = WEEK[(start + offset) % WEEK.length];
    const onDay = slots
      .filter((slot) => slot.day === day)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    if (onDay.length > 0) return onDay[0];
  }
  return null;
}

// "CS303 Operating Systems", or the slot title for Office Hours and Meetings.
export function slotLabel(slot: DashboardTimetableSlot): string {
  return slot.subjectCode && slot.subjectName
    ? `${slot.subjectCode} ${slot.subjectName}`
    : slot.title;
}

// ---------------------------------------------------------------------------
// localStorage

// A string[] from storage, or [] when it is missing, unreadable or the wrong
// shape. Non-string entries are dropped rather than trusted.
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
