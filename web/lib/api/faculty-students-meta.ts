import type {
  AssignmentStatus,
  SubmissionStatus,
} from "@/data/assignments";
import type { InternshipStatus } from "@/data/faculty-student-records";
import type { ReadinessBucket } from "@/data/students";
import type { SkillPlanRow } from "@/lib/api/faculty-roster";

// Types and pure logic for the faculty "My Students" pages.
//
// Client-safe on purpose: every import above is `import type`, which
// TypeScript erases, so nothing here pulls a data module into the browser. The
// server side that fills StudentsWorkspace is getStudentsWorkspace() in
// lib/api/faculty-students-workspace.ts.
//
// No clock is read in this file. "Today" is always passed in as a calendar
// date, "YYYY-MM-DD", and compared as a string.

// ===========================================================================
// Thresholds and storage.

// Below this attendance a student cannot sit the end-semester exam.
export const ATTENDANCE_MIN = 75;
// Internal marks (out of 100) below this are worth a word with the student.
export const INTERNAL_LOW = 50;
// Skill readiness below this is flagged; matches STRUGGLING_BELOW in
// lib/api/curriculum-insights-meta.ts.
export const READINESS_LOW = 40;
export const WEAKEST_SKILL_LIMIT = 6;
export const NEXT_STEPS_LIMIT = 3;

// Private notes a faculty member keeps on a student, in this browser only.
export const NOTES_KEY = "theplug-student-notes";
export const MAX_NOTE = 500;

// ===========================================================================
// Server workspace: what the students pages hand to the client.

// One of MY subjects in the student's in-progress semester. `code` is the
// faculty curriculum code (CS301), not the programme code.
export interface StudentSubjectRecord {
  subjectId: string;
  code: string;
  name: string;
  internalMarks: number;
  attendance: number;
}

export interface StudentAssignmentRecord {
  assignmentId: string;
  subjectId: string;
  subjectCode: string;
  title: string;
  dueDate: string;
  maxMarks: number;
  assignmentStatus: AssignmentStatus;
  submissionStatus: SubmissionStatus;
  submittedOn: string | null;
  marks: number | null;
}

export interface SkillSummary {
  learnt: number;
  developing: number;
  toLearn: number;
  notAssessed: number;
}

export interface CohortStudentRow {
  id: string;
  name: string;
  rollNumber: string | null;
  yearLabel: string;
  currentSemester: number | null;
  careerGoal: string;
  readiness: ReadinessBucket;
  skillReadiness: number;
  cgpa: number | null;
  latestInternship: { company: string; status: InternshipStatus } | null;
  subjects: StudentSubjectRecord[];
  assignments: StudentAssignmentRecord[];
  skillSummary: SkillSummary;
}

export type AttentionKind =
  | "low-attendance"
  | "low-internal"
  | "missing-assignment"
  | "late-submission"
  | "low-readiness";

export interface AttentionReason {
  kind: AttentionKind;
  severity: "high" | "medium";
  text: string;
  subjectId: string | null;
  assignmentId: string | null;
  // The number behind the reason (attendance %, marks, readiness %), or null.
  value: number | null;
}

export type SubjectImpactVerdict =
  | "on-track"
  | "syllabus-behind"
  | "teaching-not-landing"
  | "both-weak"
  | "no-skill-data";

export interface SubjectImpactRow {
  subjectId: string;
  code: string;
  name: string;
  semester: number;
  // Industry alignment, from analyzeSubject() in lib/api/curriculum.ts.
  alignmentScore: number;
  // Cohort average on the skills this subject teaches, from
  // getSubjectTeachingImpact(). null when none of them has student data.
  skillAverage: number | null;
  measuredSkillNames: string[];
  unmeasuredSkillNames: string[];
  // Cohort students with this subject in their in-progress semester.
  studentsTaking: number;
  // Rounded means over those students; null when nobody takes it.
  classInternalAverage: number | null;
  classAttendanceAverage: number | null;
  verdict: SubjectImpactVerdict;
}

// Topic ids repeat across subjects, so a topic is always named with its subject.
export interface SkillTopicRef {
  subjectId: string;
  code: string;
  topicId: string;
  topicName: string;
}

export interface WeakSkillRow {
  skillId: string;
  name: string;
  cohortAverage: number;
  // Cohort students below STRUGGLING_BELOW or with no score.
  strugglingCount: number;
  cohortSize: number;
  demandCount: number;
  totalPostings: number;
  // Topics of my subjects that teach it.
  taughtIn: SkillTopicRef[];
  // The missing-skill quick win with the biggest alignment gain; null when no
  // subject of mine lists the skill as missing.
  bestFit: { subjectId: string; code: string; gain: number } | null;
  // My subjects that list it among their expected industry skills.
  expectedIn: { subjectId: string; code: string }[];
}

export interface StudentsWorkspace {
  department: string;
  // Cohort students with skill data on The Plug.
  trackedStudents: number;
  // Sum of studentsEnrolled across subjects (students taking two subjects are
  // counted twice, as on the curriculum pages).
  enrolledStudents: number;
  averageReadiness: number;
  totalPostings: number;
  students: CohortStudentRow[];
  subjectImpact: SubjectImpactRow[];
  weakestSkills: WeakSkillRow[];
}

export interface StudentNote {
  // "local-<timestamp>"
  id: string;
  studentId: string;
  body: string;
  // ISO timestamp.
  createdAt: string;
}

// ===========================================================================
// Attention.

export function getAttentionReasons(
  row: CohortStudentRow,
  todayISO: string,
): AttentionReason[] {
  const reasons: AttentionReason[] = [];

  for (const subject of row.subjects) {
    if (subject.attendance < ATTENDANCE_MIN) {
      reasons.push({
        kind: "low-attendance",
        severity: "high",
        text: `Attendance ${subject.attendance}% in ${subject.code} (below ${ATTENDANCE_MIN}%)`,
        subjectId: subject.subjectId,
        assignmentId: null,
        value: subject.attendance,
      });
    }
    if (subject.internalMarks < INTERNAL_LOW) {
      reasons.push({
        kind: "low-internal",
        severity: "medium",
        text: `Internal marks ${subject.internalMarks}/100 in ${subject.code}`,
        subjectId: subject.subjectId,
        assignmentId: null,
        value: subject.internalMarks,
      });
    }
  }

  for (const a of row.assignments) {
    const overdue =
      a.dueDate < todayISO || a.assignmentStatus === "Closed";
    if (a.submissionStatus === "Not Submitted" && overdue) {
      reasons.push({
        kind: "missing-assignment",
        severity: "high",
        text: `${a.title} (${a.subjectCode}) not submitted`,
        subjectId: a.subjectId,
        assignmentId: a.assignmentId,
        value: null,
      });
    }
    if (a.submissionStatus === "Late" && a.marks === null) {
      reasons.push({
        kind: "late-submission",
        severity: "medium",
        text: `${a.title} (${a.subjectCode}) submitted late`,
        subjectId: a.subjectId,
        assignmentId: a.assignmentId,
        value: null,
      });
    }
  }

  if (row.skillReadiness < READINESS_LOW) {
    reasons.push({
      kind: "low-readiness",
      severity: "medium",
      text: `Readiness ${row.skillReadiness}%`,
      subjectId: null,
      assignmentId: null,
      value: row.skillReadiness,
    });
  }

  // High first; Array.prototype.sort is stable, so each group keeps its order.
  return reasons.sort(
    (a, b) => Number(b.severity === "high") - Number(a.severity === "high"),
  );
}

export function needsAttention(
  row: CohortStudentRow,
  todayISO: string,
): boolean {
  return getAttentionReasons(row, todayISO).length > 0;
}

// ===========================================================================
// Teaching impact.

export function subjectImpactVerdict(
  alignmentScore: number,
  skillAverage: number | null,
): SubjectImpactVerdict {
  if (skillAverage === null) return "no-skill-data";
  const aligned = alignmentScore >= 50;
  const landing = skillAverage >= 60;
  if (aligned && landing) return "on-track";
  if (!aligned && landing) return "syllabus-behind";
  if (aligned && !landing) return "teaching-not-landing";
  return "both-weak";
}

export const VERDICT_TEXT: Record<SubjectImpactVerdict, string> = {
  "on-track":
    "The syllabus matches what industry asks for, and students score well on what you teach.",
  "syllabus-behind":
    "Students score well on what you teach, but the syllabus covers little of what industry asks for.",
  "teaching-not-landing":
    "The syllabus covers what industry asks for, but students are not yet scoring well on it.",
  "both-weak":
    "The syllabus covers little of what industry asks for, and students score low on what it does teach.",
  "no-skill-data":
    "None of the skills this subject teaches has student data yet, so there is nothing to measure.",
};

// ===========================================================================
// Links, next steps, notes, tones.

export function messageStudentHref(studentId: string, subject?: string): string {
  const base = `/faculty/messages?to=${encodeURIComponent(studentId)}`;
  return subject ? `${base}&subject=${encodeURIComponent(subject)}` : base;
}

// "To learn" first, then "Developing", most demanded first inside each.
// "Not assessed" and "Learnt" are never next steps.
export function pickNextSteps(
  skillPlanRows: SkillPlanRow[],
  limit: number = NEXT_STEPS_LIMIT,
): SkillPlanRow[] {
  const rank = (row: SkillPlanRow) => (row.status === "To learn" ? 0 : 1);
  return skillPlanRows
    .filter((row) => row.status === "To learn" || row.status === "Developing")
    .sort((a, b) => rank(a) - rank(b) || b.demandCount - a.demandCount)
    .slice(0, limit);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Anything malformed is dropped rather than repaired; bodies are cut to
// MAX_NOTE. Empty bodies are dropped too.
export function parseStoredNotes(value: unknown): StudentNote[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): StudentNote[] => {
    if (!isRecord(item)) return [];
    const { id, studentId, body, createdAt } = item;
    if (
      typeof id !== "string" ||
      typeof studentId !== "string" ||
      typeof body !== "string" ||
      typeof createdAt !== "string"
    ) {
      return [];
    }
    const trimmed = body.trim().slice(0, MAX_NOTE);
    if (trimmed === "") return [];
    return [{ id, studentId, body: trimmed, createdAt }];
  });
}

// The score colours on the student pages: 60 and up is good, 40 and up is
// middling, anything lower is a concern.
export function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 60) return "success";
  if (score >= 40) return "warning";
  return "danger";
}
