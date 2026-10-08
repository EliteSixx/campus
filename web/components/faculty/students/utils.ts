import type { InternshipStatus } from "@/data/faculty-student-records";
import type { ReadinessBucket } from "@/data/students";
import type {
  AttentionReason,
  CohortStudentRow,
  SubjectImpactVerdict,
} from "@/lib/api/faculty-students-meta";

// Shared bits for the "My Students" overview.
//
// Only types are imported from the data layer, so this file is safe in both
// server and client components. No clock is read here: "today" is always an
// argument, and the one place that reads the clock is an effect in
// StudentsOverviewClient.

// ---------------------------------------------------------------------------
// Tabs.

export const STUDENT_TABS = ["attention", "impact", "gaps", "roster"] as const;

export type StudentsTab = (typeof STUDENT_TABS)[number];

export function isStudentsTab(value: unknown): value is StudentsTab {
  return (
    typeof value === "string" &&
    (STUDENT_TABS as readonly string[]).includes(value)
  );
}

export function studentsTabHref(tab: StudentsTab): string {
  return `/faculty/students?tab=${tab}`;
}

export const tabId = (tab: StudentsTab) => `students-tab-${tab}`;
export const panelId = (tab: StudentsTab) => `students-panel-${tab}`;

export function studentHref(studentId: string): string {
  return `/faculty/students/${encodeURIComponent(studentId)}`;
}

// ---------------------------------------------------------------------------
// Dates. Everything is shown in Asia/Kolkata.

export const TIME_ZONE = "Asia/Kolkata";

// "2026-09-16" for the calendar day `date` falls on in Asia/Kolkata. Call it
// from an effect only, with the Date made there.
export function isoDateInZone(date: Date, timeZone = TIME_ZONE): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(date);
}

// "Wednesday, 16 September 2026" for a date-only string. Built from its Y-M-D
// parts and formatted in UTC, so the day never shifts. Assembled from parts so
// the comma does not depend on the browser's ICU version. It reads no clock, but
// it does build a Date, so call it from an effect rather than during render.
export function formatLongISODate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`;
}

// ---------------------------------------------------------------------------
// Tones and labels.

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "cyan";

// Same colours the roster has always used.
export const INTERNSHIP_STATUS_TONE: Record<InternshipStatus, BadgeTone> = {
  Completed: "success",
  Ongoing: "accent",
  Selected: "accent",
  Shortlisted: "warning",
  "Interview Scheduled": "warning",
  Applied: "neutral",
  "Not Selected": "danger",
};

// Mirrors the InternshipStatus union in data/faculty-student-records.ts, kept
// here so the filter options do not pull the data module into the browser.
export const INTERNSHIP_STATUSES: InternshipStatus[] = [
  "Applied",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Ongoing",
  "Completed",
  "Not Selected",
];

export const READINESS_TONE: Record<ReadinessBucket, BadgeTone> = {
  "Placement Ready": "success",
  "Near Ready": "warning",
  "Critical Gap": "danger",
};

export const VERDICT_LABEL: Record<SubjectImpactVerdict, string> = {
  "on-track": "On track",
  "syllabus-behind": "Syllabus behind industry",
  "teaching-not-landing": "Teaching not landing",
  "both-weak": "Needs work on both",
  "no-skill-data": "No skill data",
};

export const VERDICT_TONE: Record<SubjectImpactVerdict, BadgeTone> = {
  "on-track": "success",
  "syllabus-behind": "warning",
  "teaching-not-landing": "warning",
  "both-weak": "danger",
  "no-skill-data": "neutral",
};

// ---------------------------------------------------------------------------
// Text.

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

const MAX_MESSAGE_SUBJECT = 80;

// A subject line for "Message" built from a student's first attention reason,
// kept under 80 characters.
export function messageSubjectFor(
  reason: AttentionReason,
  row: CohortStudentRow,
): string {
  const code =
    row.subjects.find((s) => s.subjectId === reason.subjectId)?.code ??
    row.assignments.find((a) => a.subjectId === reason.subjectId)
      ?.subjectCode ??
    "";
  const title =
    row.assignments.find((a) => a.assignmentId === reason.assignmentId)
      ?.title ?? "";

  let text: string;
  switch (reason.kind) {
    case "low-attendance":
      text = `Attendance in ${code}`;
      break;
    case "low-internal":
      text = `Internal marks in ${code}`;
      break;
    case "missing-assignment":
      text = `Assignment: ${title}`;
      break;
    case "late-submission":
      text = `Late submission: ${title}`;
      break;
    case "low-readiness":
      text = "Your readiness score";
      break;
  }

  const trimmed = text.trim();
  return trimmed.length < MAX_MESSAGE_SUBJECT
    ? trimmed
    : `${trimmed.slice(0, MAX_MESSAGE_SUBJECT - 2).trimEnd()}…`;
}

// ---------------------------------------------------------------------------
// Roster sorting.

// The lowest attendance across the student's subjects of mine this semester;
// null when they take none of them.
export function lowestAttendance(row: CohortStudentRow): number | null {
  if (row.subjects.length === 0) return null;
  return Math.min(...row.subjects.map((s) => s.attendance));
}
