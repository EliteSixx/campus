import type { AnnouncementStatus } from "@/data/faculty-announcements";
import type { AssignmentStatus } from "@/data/assignments";
import type { SlotType, Weekday } from "@/data/timetable";
import type { CohortStudentRow } from "@/lib/api/faculty-students-meta";

// Types and pure helpers for the faculty dashboard.
//
// This file is client-safe on purpose. The imports above are `import type`,
// which TypeScript erases at compile time, so no data module reaches the
// browser bundle through here. The server-side collector that fills these
// shapes is lib/api/faculty-dashboard.ts.
//
// No clock is read in this file. Every helper that needs "now" takes the date
// as an argument, so the browser decides what today is.

// ---------------------------------------------------------------------------
// Data shapes. Everything is plain JSON: strings, numbers, booleans, arrays,
// plain objects and null.

export interface DashboardFaculty {
  name: string;
  department: string;
}

export interface DashboardQuickStats {
  subjectsCount: number;
  // Students of the faculty member's own department that exist in
  // data/students.ts — not the syllabus enrolment total.
  cohortStudentsCount: number;
  curriculumAlignmentPct: number;
  // Topics classified "Outdated": not foundational and no posting asks for
  // any skill they teach.
  topicsWithoutDemandCount: number;
}

export interface DashboardTimetableSlot {
  id: string;
  // Same values as data/timetable.ts: "Monday" .. "Friday".
  day: Weekday;
  // "HH:MM", 24-hour, as stored.
  startTime: string;
  endTime: string;
  // null for Office Hours and Meeting slots, which have no subject.
  subjectId: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  // What to show as the slot's heading: the subject name when there is one,
  // otherwise the slot's own title ("Student consultation hours").
  title: string;
  room: string;
  // The section, e.g. "CSE-A". null when the slot has none.
  className: string | null;
  type: SlotType;
}

export interface DashboardAssignmentSummary {
  id: string;
  title: string;
  subjectCode: string;
  // Sections this subject is timetabled for, e.g. "CSE-A". null if none.
  className: string | null;
  // As stored: a date-only ISO string, "2026-09-26".
  dueDate: string;
  status: AssignmentStatus;
  totalStudents: number;
  // Submitted, late, evaluated or returned.
  totalSubmissions: number;
  // Submitted but not yet evaluated or returned.
  pendingEvaluation: number;
}

export interface DashboardPlannerProgress {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  // Always 0 from the server: delivery is recorded only in the browser.
  coveredTopics: number;
  totalTopics: number;
  // Sum of topic hours, the denominator of the planner's coverage %.
  totalHours: number;
  // `${subjectId}:${topicId}` for every topic, the same keys the planner
  // writes to localStorage "theplug-planner-delivered", so the client can
  // count delivered topics without the curriculum data.
  topicKeys: string[];
  // The same keys with each topic's hours, in syllabus order.
  topics: { key: string; hours: number }[];
}

export interface DashboardMaterialsCoverage {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalTopics: number;
  // makeTopicKey(courseId, topicId) for every topic of the course.
  topicKeys: string[];
  // The subset with at least one seed material, published or hidden — the
  // same rule /faculty/materials counts coverage by.
  topicKeysWithMaterials: string[];
}

export interface DashboardAnnouncementSummary {
  id: string;
  title: string;
  status: AnnouncementStatus;
  audienceLabel: string;
  // UTC ISO.
  createdAt: string;
  // UTC ISO. null only for drafts, which never appear in this list.
  publishAt: string | null;
  readCount: number;
  totalRecipients: number;
}

export interface DashboardConversationSummary {
  id: string;
  subject: string;
  isGroup: boolean;
  // One name, or the names joined with ", " for a group.
  participantName: string;
  // Present only for a one-to-one thread with a student in the cohort, who is
  // the only kind of student with a /faculty/students/[id] page.
  participantStudentId?: string;
  lastMessagePreview: string;
  // UTC ISO.
  lastMessageAt: string;
  baseUnreadCount: number;
  // The student messages the seed data marks unread. Unread in the browser is
  // these ids minus localStorage "theplug-messages-read", which is exactly
  // how MessagesClient counts it.
  unreadMessageIds: string[];
}

export interface DashboardSubjectAlignment {
  id: string;
  code: string;
  name: string;
  scorePct: number;
}

export interface DashboardMissingSkill {
  skill: string;
  postingsCount: number;
  totalPostings: number;
}

export interface DashboardStudentSkillGap {
  skill: string;
  studentsStruggling: number;
  cohortSize: number;
}

export interface DashboardRecommendation {
  id: string;
  title: string;
  // "4 weeks".
  duration: string;
  alignmentPct?: number;
  outcome?: string;
  href: string;
}

export interface FacultyDashboardData {
  faculty: DashboardFaculty;
  stats: DashboardQuickStats;
  // The whole week, in day then start-time order.
  timetable: DashboardTimetableSlot[];
  assignments: DashboardAssignmentSummary[];
  plannerProgress: DashboardPlannerProgress[];
  materialsCoverage: DashboardMaterialsCoverage[];
  // Latest 5 published or scheduled, newest (publishAt ?? createdAt) first.
  recentAnnouncements: DashboardAnnouncementSummary[];
  draftAnnouncementsCount: number;
  // Newest lastMessageAt first.
  conversations: DashboardConversationSummary[];
  subjectAlignment: DashboardSubjectAlignment[];
  // How many live postings the alignment scores are measured against.
  totalPostings: number;
  // Top 3.
  topMissingSkills: DashboardMissingSkill[];
  // Top 3.
  studentSkillGaps: DashboardStudentSkillGap[];
  recommendation: DashboardRecommendation | null;
  // The cohort rows from getStudentsWorkspace(), exactly as the My Students
  // page gets them. Who needs attention depends on today, so the browser
  // counts them with needsAttention() from faculty-students-meta.ts.
  attentionStudents: CohortStudentRow[];
}

// ---------------------------------------------------------------------------
// Time helpers. The zone is pinned (Asia/Kolkata by default) so the answer does
// not depend on which machine runs the code.

export type DayKey = Weekday | "Saturday" | "Sunday";

const DAY_KEYS: readonly DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const isDayKey = (value: string): value is DayKey =>
  (DAY_KEYS as readonly string[]).includes(value);

// The weekday in `timeZone`, spelt the way data/timetable.ts spells it.
// Returns null only for an invalid Date.
export function getDayKeyFromDate(
  date: Date,
  timeZone = "Asia/Kolkata",
): DayKey | null {
  if (Number.isNaN(date.getTime())) return null;
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone,
  }).format(date);
  return isDayKey(weekday) ? weekday : null;
}

// Minutes since midnight in `timeZone`. Returns null only for an invalid Date.
export function getMinutesFromDate(
  date: Date,
  timeZone = "Asia/Kolkata",
): number | null {
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    // h23 so midnight is "00", never "24".
    hourCycle: "h23",
    timeZone,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

// "09:30" -> 570. Returns NaN for anything that is not "H:MM" or "HH:MM".
export function timeToMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return Number.NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

// Slots on the date's weekday in `timeZone`, earliest first.
export function getTodaySlots(
  slots: DashboardTimetableSlot[],
  date: Date,
  timeZone = "Asia/Kolkata",
): DashboardTimetableSlot[] {
  const day = getDayKeyFromDate(date, timeZone);
  if (day === null) return [];
  return slots
    .filter((slot) => slot.day === day)
    .sort(
      (a, b) =>
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime) ||
        timeToMinutes(a.endTime) - timeToMinutes(b.endTime),
    );
}

// The slot running at `date` (start inclusive, end exclusive) and the first one
// starting after it, both from today's slots only.
export function getCurrentAndNextSlot(
  slots: DashboardTimetableSlot[],
  date: Date,
  timeZone = "Asia/Kolkata",
): {
  current: DashboardTimetableSlot | null;
  next: DashboardTimetableSlot | null;
} {
  const now = getMinutesFromDate(date, timeZone);
  if (now === null) return { current: null, next: null };

  const today = getTodaySlots(slots, date, timeZone);
  const current =
    today.find(
      (slot) =>
        timeToMinutes(slot.startTime) <= now &&
        now < timeToMinutes(slot.endTime),
    ) ?? null;
  const next = today.find((slot) => timeToMinutes(slot.startTime) > now) ?? null;

  return { current, next };
}

// ---------------------------------------------------------------------------
// Small pure helpers.

// Whole-number percentage, clamped to 0–100. 0 when there is nothing to divide by.
export function getPercent(part: number, total: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}

// Topic ids repeat across courses, so a topic is always identified by both.
// Same format as topicKey() in components/faculty/materials/utils.ts and the
// planner's planKey().
export function makeTopicKey(courseId: string, topicId: string): string {
  return `${courseId}:${topicId}`;
}
