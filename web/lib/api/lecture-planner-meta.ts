import type {
  AcademicCalendar,
  ExamPeriod,
} from "@/data/faculty-academic-calendar";
import type { Weekday } from "@/data/timetable";
import type { TopicStatus } from "@/lib/api/curriculum";
import type {
  MaterialType,
  MaterialVisibility,
} from "@/lib/api/faculty-materials-meta";

// Types and pure logic for the lecture planner.
//
// Client-safe on purpose: every import above is `import type`, which
// TypeScript erases, so nothing here pulls a data module into the browser. The
// server side that fills PlannerWorkspace is getPlannerWorkspace() in
// lib/api/lecture-planner.ts.
//
// No clock is read in this file. Dates are calendar dates, "YYYY-MM-DD", and
// all arithmetic goes through Date.UTC so no time zone can shift a day.
// Anything that needs "today" or "now" takes it as an argument.

export type { AcademicCalendar, ExamPeriod, Holiday } from "@/data/faculty-academic-calendar";
export type { Weekday } from "@/data/timetable";

// ===========================================================================
// Server workspace: what the planner page hands to the client.

export type PlannerCalendar = AcademicCalendar;

export interface PlannerTopicInfo {
  // `${subjectId}:${topicId}`. Topic ids repeat across subjects, so this is
  // the only safe identity.
  key: string;
  topicId: string;
  name: string;
  hours: number;
  status: TopicStatus;
  skillNames: string[];
  // null when no unit lists this topic.
  unitId: string | null;
}

export interface PlannerUnitInfo {
  id: string;
  number: number;
  title: string;
  // Topic keys in teaching order within the unit.
  topicKeys: string[];
}

export interface PlannerClassSlot {
  weekday: Weekday;
  // "HH:MM", 24-hour.
  start: string;
  end: string;
  room: string;
  section: string | null;
  type: "Lecture" | "Lab";
}

export interface PlannerMaterialRef {
  id: string;
  title: string;
  type: MaterialType;
  topicKey: string;
  visibility: MaterialVisibility;
}

export interface PlannerMissingSkillInfo {
  name: string;
  demandCount: number;
}

export interface PlannerSubjectWorkspace {
  id: string;
  code: string;
  name: string;
  semester: number;
  alignmentScore: number;
  totalHours: number;
  // Units in teaching order.
  units: PlannerUnitInfo[];
  // Syllabus order.
  topics: PlannerTopicInfo[];
  lectureSlots: PlannerClassSlot[];
  labSlots: PlannerClassSlot[];
  // Unique, Monday → Friday, taken from lectureSlots.
  lectureWeekdays: Weekday[];
  // Topic-level materials only.
  materials: PlannerMaterialRef[];
  // Top 3, most demanded first.
  missingSkills: PlannerMissingSkillInfo[];
  totalPostings: number;
}

export interface PlannerWorkspace {
  faculty: { name: string; department: string };
  calendar: PlannerCalendar;
  subjects: PlannerSubjectWorkspace[];
}

// ===========================================================================
// The editable plan, stored in localStorage.

// Every subject's plan, as StoredPlans keyed by subject id.
export const PLANS_KEY = "theplug-planner-plans";
// Delivered topic keys, `${subjectId}:${topicId}`. The current planner board and
// the faculty dashboard both read this, so it must keep that exact format.
export const DELIVERED_KEY = "theplug-planner-delivered";

export type LectureType =
  | "lecture"
  | "lab"
  | "tutorial"
  | "revision"
  | "class-test"
  | "guest";

export type LectureStatus = "planned" | "delivered" | "cancelled";

export type TeachingMethod =
  | "board"
  | "slides"
  | "demo"
  | "discussion"
  | "hands-on"
  | "other";

export const LECTURE_TYPE_LABEL: Record<LectureType, string> = {
  lecture: "Lecture",
  lab: "Lab",
  tutorial: "Tutorial",
  revision: "Revision",
  "class-test": "Class test",
  guest: "Guest lecture",
};

export const LECTURE_STATUS_LABEL: Record<LectureStatus, string> = {
  planned: "Planned",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const TEACHING_METHOD_LABEL: Record<TeachingMethod, string> = {
  board: "Board",
  slides: "Slides",
  demo: "Demo",
  discussion: "Discussion",
  "hands-on": "Hands-on",
  other: "Other",
};

export interface PlannedLecture {
  // Generated: `${subjectId}-${topicId}-${n}`. Custom: `local-${stamp}`.
  id: string;
  subjectId: string;
  unitId: string | null;
  // null for a custom lecture not tied to a topic.
  topicKey: string | null;
  title: string;
  subtopic: string;
  type: LectureType;
  status: LectureStatus;
  durationHours: number;
  learningOutcome: string;
  method: TeachingMethod | null;
  homework: string;
  notes: string;
  materialIds: string[];
  // "YYYY-MM-DD", set only while status is "delivered".
  actualDate: string | null;
  isCustom: boolean;
}

export interface SubjectPlan {
  version: 1;
  subjectId: string;
  startDate: string;
  endDate: string;
  weekdays: Weekday[];
  // Teaching order.
  lectures: PlannedLecture[];
  // UTC ISO, set by the caller. null for a plan never saved.
  updatedAt: string | null;
}

export type StoredPlans = Record<string, SubjectPlan>;

// ===========================================================================
// Small helpers.

const WEEKDAYS: readonly Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

// getUTCDay() order: 0 is Sunday.
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const SHORT_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MONTH = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type DayName = (typeof DAY_NAMES)[number];

const MS_PER_DAY = 86_400_000;

// Upper bound on how many days getTeachingDates will walk, so a nonsense range
// can never hang the page. Ten years is far beyond any semester.
const MAX_RANGE_DAYS = 3660;

export function makePlanTopicKey(subjectId: string, topicId: string): string {
  return `${subjectId}:${topicId}`;
}

// Whole-number percentage, clamped to 0–100. 0 when there is nothing to divide by.
export function getPercent(part: number, total: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}

const isWeekday = (value: unknown): value is Weekday =>
  typeof value === "string" && (WEEKDAYS as readonly string[]).includes(value);

// ===========================================================================
// Date helpers. "YYYY-MM-DD" only; never `new Date("YYYY-MM-DD")`.

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

// Milliseconds at UTC midnight, or null for anything that is not a real date.
function toUTC(iso: string): number | null {
  const parts = parseISO(iso);
  if (!parts) return null;
  const ms = Date.UTC(parts.y, parts.m - 1, parts.d);
  const check = new Date(ms);
  // Date.UTC rolls 2026-02-30 over into March, so the parts must survive.
  if (
    check.getUTCFullYear() !== parts.y ||
    check.getUTCMonth() !== parts.m - 1 ||
    check.getUTCDate() !== parts.d
  ) {
    return null;
  }
  return ms;
}

function fromUTC(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isValidISODate(value: unknown): value is string {
  return typeof value === "string" && toUTC(value) !== null;
}

// Unchanged input when the date is invalid.
export function addDaysISO(iso: string, days: number): string {
  const ms = toUTC(iso);
  if (ms === null || !Number.isFinite(days)) return iso;
  return fromUTC(ms + Math.trunc(days) * MS_PER_DAY);
}

// null only for an invalid date.
export function weekdayOfISO(iso: string): DayName | null {
  const ms = toUTC(iso);
  if (ms === null) return null;
  return DAY_NAMES[new Date(ms).getUTCDay()];
}

// Whole days from a to b (negative when b is earlier). 0 if either is invalid.
export function daysBetweenISO(a: string, b: string): number {
  const from = toUTC(a);
  const to = toUTC(b);
  if (from === null || to === null) return 0;
  return Math.round((to - from) / MS_PER_DAY);
}

// "Wed 16 Sep". Built from fixed name tables rather than toLocaleDateString, so
// every browser and the server produce identical text.
export function formatPlanDate(iso: string): string {
  const ms = toUTC(iso);
  if (ms === null) return iso;
  const date = new Date(ms);
  return `${SHORT_DAY[date.getUTCDay()]} ${date.getUTCDate()} ${SHORT_MONTH[date.getUTCMonth()]}`;
}

export function getHolidayName(
  iso: string,
  calendar: PlannerCalendar,
): string | null {
  return calendar.holidays.find((h) => h.date === iso)?.name ?? null;
}

export function getExamPeriod(
  iso: string,
  calendar: PlannerCalendar,
): ExamPeriod | null {
  return (
    calendar.examPeriods.find((p) => p.start <= iso && iso <= p.end) ?? null
  );
}

// Every date from start to end (inclusive) that falls on one of `weekdays`
// and is neither a holiday nor inside an exam period. [] for bad input.
export function getTeachingDates(
  startISO: string,
  endISO: string,
  weekdays: Weekday[],
  calendar: PlannerCalendar,
): string[] {
  const start = toUTC(startISO);
  const end = toUTC(endISO);
  if (start === null || end === null || start > end) return [];

  const chosen = new Set(weekdays.filter(isWeekday));
  if (chosen.size === 0) return [];

  const span = Math.min(Math.round((end - start) / MS_PER_DAY), MAX_RANGE_DAYS);
  const dates: string[] = [];
  for (let i = 0; i <= span; i += 1) {
    const ms = start + i * MS_PER_DAY;
    const iso = fromUTC(ms);
    const day = DAY_NAMES[new Date(ms).getUTCDay()];
    if (!isWeekday(day) || !chosen.has(day)) continue;
    if (getHolidayName(iso, calendar) !== null) continue;
    if (getExamPeriod(iso, calendar) !== null) continue;
    dates.push(iso);
  }
  return dates;
}

// ===========================================================================
// Building and scheduling a plan.

function blankLecture(
  fields: Pick<PlannedLecture, "id" | "subjectId" | "title" | "type" | "isCustom"> &
    Partial<Pick<PlannedLecture, "unitId" | "topicKey" | "subtopic">>,
): PlannedLecture {
  return {
    id: fields.id,
    subjectId: fields.subjectId,
    unitId: fields.unitId ?? null,
    topicKey: fields.topicKey ?? null,
    title: fields.title,
    subtopic: fields.subtopic ?? "",
    type: fields.type,
    status: "planned",
    durationHours: 1,
    learningOutcome: "",
    method: null,
    homework: "",
    notes: "",
    materialIds: [],
    actualDate: null,
    isCustom: fields.isCustom,
  };
}

// One lecture per syllabus hour, in unit order and then topic order inside each
// unit. Topics no unit lists follow at the end, in syllabus order.
export function generatePlanFromSyllabus(
  subject: PlannerSubjectWorkspace,
  calendar: PlannerCalendar,
): SubjectPlan {
  const topicByKey = new Map(subject.topics.map((t) => [t.key, t]));
  const ordered: PlannerTopicInfo[] = [];
  const seen = new Set<string>();

  const units = [...subject.units].sort((a, b) => a.number - b.number);
  for (const unit of units) {
    for (const key of unit.topicKeys) {
      const topic = topicByKey.get(key);
      if (!topic || seen.has(key)) continue;
      ordered.push(topic);
      seen.add(key);
    }
  }
  for (const topic of subject.topics) {
    if (!seen.has(topic.key)) {
      ordered.push(topic);
      seen.add(topic.key);
    }
  }

  const lectures = ordered.flatMap((topic) => {
    // A topic always gets at least one lecture, even if its hours are 0.
    const count = Math.max(1, Math.round(topic.hours));
    return Array.from({ length: count }, (_, i) =>
      blankLecture({
        id: `${subject.id}-${topic.topicId}-${i + 1}`,
        subjectId: subject.id,
        unitId: topic.unitId,
        topicKey: topic.key,
        title: topic.name,
        type: "lecture",
        isCustom: false,
      }),
    );
  });

  return {
    version: 1,
    subjectId: subject.id,
    startDate: calendar.startDate,
    endDate: calendar.endDate,
    weekdays: [...subject.lectureWeekdays],
    lectures,
    updatedAt: null,
  };
}

// Lecture id → its date. Dates are handed out in teaching order to lectures
// that are not cancelled, so cancelling one pulls every later lecture earlier.
// Cancelled lectures, and any that run past the last teaching date, get null.
export function scheduleLectures(
  plan: SubjectPlan,
  calendar: PlannerCalendar,
): Record<string, string | null> {
  const dates = getTeachingDates(
    plan.startDate,
    plan.endDate,
    plan.weekdays,
    calendar,
  );
  const schedule: Record<string, string | null> = {};
  let next = 0;
  for (const lecture of plan.lectures) {
    if (lecture.status === "cancelled") {
      schedule[lecture.id] = null;
      continue;
    }
    schedule[lecture.id] = dates[next] ?? null;
    next += 1;
  }
  return schedule;
}

// ===========================================================================
// Immutable edits. Each returns a new plan, or the same plan object when
// nothing changes, so a caller can compare by reference.

export function insertLecture(
  plan: SubjectPlan,
  lecture: PlannedLecture,
  afterLectureId: string | null,
): SubjectPlan {
  if (lecture.subjectId !== plan.subjectId) return plan;
  if (plan.lectures.some((l) => l.id === lecture.id)) return plan;

  const lectures = [...plan.lectures];
  if (afterLectureId === null) {
    lectures.unshift(lecture);
  } else {
    const index = lectures.findIndex((l) => l.id === afterLectureId);
    // An unknown anchor appends rather than losing the lecture.
    if (index === -1) lectures.push(lecture);
    else lectures.splice(index + 1, 0, lecture);
  }
  return { ...plan, lectures };
}

export function moveLecture(
  plan: SubjectPlan,
  lectureId: string,
  direction: "up" | "down",
): SubjectPlan {
  const index = plan.lectures.findIndex((l) => l.id === lectureId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= plan.lectures.length) return plan;

  const lectures = [...plan.lectures];
  [lectures[index], lectures[target]] = [lectures[target], lectures[index]];
  return { ...plan, lectures };
}

export type LecturePatch = Partial<
  Omit<PlannedLecture, "id" | "subjectId" | "isCustom">
>;

export function updateLecture(
  plan: SubjectPlan,
  lectureId: string,
  patch: LecturePatch,
): SubjectPlan {
  const index = plan.lectures.findIndex((l) => l.id === lectureId);
  if (index === -1) return plan;

  const current = plan.lectures[index];
  const updated: PlannedLecture = {
    ...current,
    ...patch,
    // Identity cannot be patched, even by an object carrying extra keys.
    id: current.id,
    subjectId: current.subjectId,
    isCustom: current.isCustom,
  };
  if (updated.status !== "delivered") updated.actualDate = null;

  const lectures = [...plan.lectures];
  lectures[index] = updated;
  return { ...plan, lectures };
}

// actualDate is kept only for "delivered", and only if it is a real date.
export function setLectureStatus(
  plan: SubjectPlan,
  lectureId: string,
  status: LectureStatus,
  actualDate: string | null,
): SubjectPlan {
  return updateLecture(plan, lectureId, {
    status,
    actualDate:
      status === "delivered" && isValidISODate(actualDate) ? actualDate : null,
  });
}

// Only custom lectures can be deleted; syllabus lectures are cancelled instead.
export function deleteLecture(plan: SubjectPlan, lectureId: string): SubjectPlan {
  const lecture = plan.lectures.find((l) => l.id === lectureId);
  if (!lecture || !lecture.isCustom) return plan;
  return { ...plan, lectures: plan.lectures.filter((l) => l.id !== lectureId) };
}

// `stamp` is passed in so no clock is read here; the caller takes it from an
// event handler.
export function makeCustomLecture(
  subjectId: string,
  stamp: number,
  fields: {
    title: string;
    type: LectureType;
    unitId?: string | null;
    topicKey?: string | null;
    subtopic?: string;
  },
): PlannedLecture {
  return blankLecture({
    id: `local-${stamp}`,
    subjectId,
    title: fields.title,
    type: fields.type,
    unitId: fields.unitId ?? null,
    topicKey: fields.topicKey ?? null,
    subtopic: fields.subtopic ?? "",
    isCustom: true,
  });
}

export function withUpdatedAt(plan: SubjectPlan, iso: string): SubjectPlan {
  return { ...plan, updatedAt: iso };
}

// ===========================================================================
// Progress.

export interface PlanProgress {
  // Not cancelled.
  totalActive: number;
  delivered: number;
  cancelled: number;
  // Hours across active lectures, and across delivered ones.
  totalHours: number;
  deliveredHours: number;
  hoursPct: number;
  // Active lectures scheduled on or before today. null when today is unknown.
  expectedByToday: number | null;
  // Delivered lectures whose actual date is today or earlier (or unrecorded).
  deliveredByToday: number | null;
  behindBy: number | null;
  aheadBy: number | null;
  // Date of the last active lecture; null if it has no date (overflow).
  projectedFinish: string | null;
  // Active lectures with no teaching date left for them.
  overflowCount: number;
  // The calendar's last teaching day, and how many days projectedFinish lands
  // before it (negative never happens, since overflow gives null).
  semesterEnd: string;
  bufferDays: number | null;
  // Active lectures grouped by unit, in the order units first appear.
  perUnit: { unitId: string | null; delivered: number; total: number }[];
}

export function getPlanProgress(
  plan: SubjectPlan,
  schedule: Record<string, string | null>,
  calendar: PlannerCalendar,
  todayISO: string | null,
): PlanProgress {
  const active = plan.lectures.filter((l) => l.status !== "cancelled");
  const delivered = active.filter((l) => l.status === "delivered");
  const dateOf = (l: PlannedLecture) => schedule[l.id] ?? null;

  const totalHours = active.reduce((sum, l) => sum + l.durationHours, 0);
  const deliveredHours = delivered.reduce((sum, l) => sum + l.durationHours, 0);

  const today = isValidISODate(todayISO) ? todayISO : null;
  const expectedByToday =
    today === null
      ? null
      : active.filter((l) => {
          const date = dateOf(l);
          return date !== null && date <= today;
        }).length;
  const deliveredByToday =
    today === null
      ? null
      : delivered.filter((l) => l.actualDate === null || l.actualDate <= today)
          .length;

  const last = active[active.length - 1];
  const projectedFinish = last ? dateOf(last) : null;

  const perUnit: PlanProgress["perUnit"] = [];
  for (const lecture of active) {
    let row = perUnit.find((u) => u.unitId === lecture.unitId);
    if (!row) {
      row = { unitId: lecture.unitId, delivered: 0, total: 0 };
      perUnit.push(row);
    }
    row.total += 1;
    if (lecture.status === "delivered") row.delivered += 1;
  }

  return {
    totalActive: active.length,
    delivered: delivered.length,
    cancelled: plan.lectures.length - active.length,
    totalHours,
    deliveredHours,
    hoursPct: getPercent(deliveredHours, totalHours),
    expectedByToday,
    deliveredByToday,
    behindBy:
      expectedByToday === null || deliveredByToday === null
        ? null
        : Math.max(0, expectedByToday - deliveredByToday),
    aheadBy:
      expectedByToday === null || deliveredByToday === null
        ? null
        : Math.max(0, deliveredByToday - expectedByToday),
    projectedFinish,
    overflowCount: active.filter((l) => dateOf(l) === null).length,
    semesterEnd: calendar.endDate,
    bufferDays:
      projectedFinish === null
        ? null
        : daysBetweenISO(projectedFinish, calendar.endDate),
    perUnit,
  };
}

// Topic keys whose every non-cancelled lecture is delivered (and that have at
// least one). Same `${subjectId}:${topicId}` format as DELIVERED_KEY.
export function deliveredTopicKeys(plan: SubjectPlan): string[] {
  const byTopic = new Map<string, { total: number; delivered: number }>();
  for (const lecture of plan.lectures) {
    if (lecture.topicKey === null || lecture.status === "cancelled") continue;
    const entry = byTopic.get(lecture.topicKey) ?? { total: 0, delivered: 0 };
    entry.total += 1;
    if (lecture.status === "delivered") entry.delivered += 1;
    byTopic.set(lecture.topicKey, entry);
  }
  return [...byTopic.entries()]
    .filter(([, e]) => e.total > 0 && e.delivered === e.total)
    .map(([key]) => key);
}

// The DELIVERED_KEY list with this plan's subject replaced by what the plan
// says, leaving every other subject's keys as they were.
export function mergeDeliveredKeys(
  existing: string[],
  plan: SubjectPlan,
): string[] {
  const prefix = `${plan.subjectId}:`;
  return [
    ...existing.filter((key) => !key.startsWith(prefix)),
    ...deliveredTopicKeys(plan),
  ];
}

// ===========================================================================
// Reading stored plans. Anything malformed is skipped; this never throws.

const LECTURE_TYPES: readonly LectureType[] = [
  "lecture", "lab", "tutorial", "revision", "class-test", "guest",
];
const LECTURE_STATUSES: readonly LectureStatus[] = [
  "planned", "delivered", "cancelled",
];
const TEACHING_METHODS: readonly TeachingMethod[] = [
  "board", "slides", "demo", "discussion", "hands-on", "other",
];

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (list as readonly string[]).includes(v);

const stringOr = (v: unknown, fallback: string): string =>
  typeof v === "string" ? v : fallback;

const stringOrNull = (v: unknown): string | null | undefined =>
  v === null || v === undefined ? null : typeof v === "string" ? v : undefined;

// Required fields must be right; optional text fields that are missing (from an
// older save) fall back to their blank value.
function parseLecture(value: unknown, subjectId: string): PlannedLecture | null {
  if (!isRecord(value)) return null;
  const unitId = stringOrNull(value.unitId);
  const topicKey = stringOrNull(value.topicKey);
  if (
    typeof value.id !== "string" ||
    value.id === "" ||
    value.subjectId !== subjectId ||
    typeof value.title !== "string" ||
    !isOneOf(LECTURE_TYPES, value.type) ||
    !isOneOf(LECTURE_STATUSES, value.status) ||
    typeof value.durationHours !== "number" ||
    !Number.isFinite(value.durationHours) ||
    value.durationHours <= 0 ||
    typeof value.isCustom !== "boolean" ||
    unitId === undefined ||
    topicKey === undefined
  ) {
    return null;
  }

  const status = value.status;
  return {
    id: value.id,
    subjectId,
    unitId,
    topicKey,
    title: value.title,
    subtopic: stringOr(value.subtopic, ""),
    type: value.type,
    status,
    durationHours: value.durationHours,
    learningOutcome: stringOr(value.learningOutcome, ""),
    method: isOneOf(TEACHING_METHODS, value.method) ? value.method : null,
    homework: stringOr(value.homework, ""),
    notes: stringOr(value.notes, ""),
    materialIds: Array.isArray(value.materialIds)
      ? value.materialIds.filter((id): id is string => typeof id === "string")
      : [],
    actualDate:
      status === "delivered" && isValidISODate(value.actualDate)
        ? value.actualDate
        : null,
    isCustom: value.isCustom,
  };
}

function parsePlan(value: unknown, key: string): SubjectPlan | null {
  if (!isRecord(value)) return null;
  if (
    value.version !== 1 ||
    value.subjectId !== key ||
    !isValidISODate(value.startDate) ||
    !isValidISODate(value.endDate) ||
    !Array.isArray(value.weekdays) ||
    !Array.isArray(value.lectures)
  ) {
    return null;
  }

  // Duplicate lecture ids would make the schedule ambiguous; the first wins.
  const ids = new Set<string>();
  const lectures: PlannedLecture[] = [];
  for (const item of value.lectures) {
    const lecture = parseLecture(item, key);
    if (!lecture || ids.has(lecture.id)) continue;
    ids.add(lecture.id);
    lectures.push(lecture);
  }

  return {
    version: 1,
    subjectId: key,
    startDate: value.startDate,
    endDate: value.endDate,
    weekdays: WEEKDAYS.filter((day) =>
      (value.weekdays as unknown[]).includes(day),
    ),
    lectures,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export function parseStoredPlans(value: unknown): StoredPlans {
  const plans: StoredPlans = {};
  if (!isRecord(value)) return plans;
  for (const [key, entry] of Object.entries(value)) {
    // A "__proto__" key would reassign the object's prototype, not add a plan.
    if (key === "__proto__") continue;
    const plan = parsePlan(entry, key);
    if (plan) plans[key] = plan;
  }
  return plans;
}
