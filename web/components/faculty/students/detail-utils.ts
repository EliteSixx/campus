import type { SubmissionStatus } from "@/data/assignments";
import type { OfferStatus } from "@/data/faculty-student-records";
import type { SemesterBlock } from "@/lib/api/academics";
import type { StudentAssignmentRecord } from "@/lib/api/faculty-students-meta";
import type { SkillPlanStatus } from "@/lib/api/faculty-roster";
import type { BadgeTone } from "./utils";

// Shared bits for the student detail page and the progress report.
//
// Only types are imported from the data layer, so this file is safe in both
// server and client components. No clock is read and no Date is built here.

// ---------------------------------------------------------------------------
// Tabs.

export const STUDENT_DETAIL_TABS = [
  "overview",
  "academics",
  "skills",
  "internships",
  "offers",
] as const;

export type StudentDetailTab = (typeof STUDENT_DETAIL_TABS)[number];

export function isStudentDetailTab(value: unknown): value is StudentDetailTab {
  return (
    typeof value === "string" &&
    (STUDENT_DETAIL_TABS as readonly string[]).includes(value)
  );
}

export function studentDetailTabHref(
  studentId: string,
  tab: StudentDetailTab,
): string {
  return `/faculty/students/${encodeURIComponent(studentId)}?tab=${tab}`;
}

export function studentReportHref(studentId: string): string {
  return `/faculty/students/${encodeURIComponent(studentId)}/report`;
}

// ---------------------------------------------------------------------------
// Tones.

export const OFFER_TONE: Record<OfferStatus, BadgeTone> = {
  Offered: "success",
  Accepted: "success",
  "Under Review": "warning",
  "Not Offered": "neutral",
};

export const PLAN_TONE: Record<SkillPlanStatus, BadgeTone> = {
  Learnt: "success",
  Developing: "warning",
  "To learn": "danger",
  "Not assessed": "neutral",
};

export const SEMESTER_TONE: Record<SemesterBlock["status"], BadgeTone> = {
  Completed: "success",
  "In Progress": "warning",
};

// Headings in the order a skill plan should be worked through.
export const PLAN_GROUPS: { status: SkillPlanStatus; heading: string }[] = [
  { status: "To learn", heading: "Still to learn" },
  { status: "Not assessed", heading: "Not assessed" },
  { status: "Developing", heading: "Developing" },
  { status: "Learnt", heading: "Learnt" },
];

// ---------------------------------------------------------------------------
// Assignments.

// Work that has reached the faculty member, whatever happened after.
const HANDED_IN: SubmissionStatus[] = ["Submitted", "Late", "Evaluated", "Returned"];

export function isHandedIn(status: SubmissionStatus): boolean {
  return HANDED_IN.includes(status);
}

export interface AssignmentBadge {
  tone: BadgeTone;
  label: string;
}

// The status badge for one assignment. A missing submission is only a problem
// once the assignment is closed or its due date has passed, which needs today;
// null means "wait for today" and the caller shows a skeleton.
export function assignmentBadge(
  a: StudentAssignmentRecord,
  todayISO: string | null,
): AssignmentBadge | null {
  switch (a.submissionStatus) {
    case "Returned":
    case "Evaluated":
      return { tone: "success", label: a.submissionStatus };
    case "Submitted":
      return { tone: "accent", label: "Submitted" };
    case "Late":
      return { tone: "warning", label: "Late" };
    case "Not Submitted":
      if (a.assignmentStatus === "Closed") {
        return { tone: "danger", label: "Not submitted" };
      }
      if (todayISO === null) return null;
      return a.dueDate < todayISO
        ? { tone: "danger", label: "Not submitted" }
        : { tone: "neutral", label: "Not submitted yet" };
  }
}

// ---------------------------------------------------------------------------
// Dates.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "26 Sep 2026" for a date-only string, built from its parts so no Date (and
// no time zone) is involved.
export function formatShortISODate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return iso;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

// "16 Sep 2026, 14:05" in Asia/Kolkata for a stored UTC timestamp. Builds a
// Date, so call it from an effect or event handler, never during render.
export function formatNoteTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(date);
}
