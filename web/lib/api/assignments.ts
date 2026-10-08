import {
  assignments,
  submissions,
  type Assignment,
  type AssignmentStatus,
  type Submission,
  type SubmissionStatus,
} from "@/data/assignments";
import { getSubjectById, subjects } from "@/data/curriculum";
import { getFacultyProfile } from "@/lib/api/analytics";

// Assignments plus the counts the faculty list needs, flattened so the client
// list works from plain data and never pulls the data modules into the
// browser bundle.
//
// No new data: every figure is counted from data/assignments.ts, and subject
// names and codes come from data/curriculum.ts.
//
// No clock is read here. Whether an assignment is overdue depends on today's
// date, so it is worked out in the browser with isAssignmentOverdue() from
// app/faculty/assignments/overdue.ts.

export interface AssignmentWithStats extends Assignment {
  subjectName: string;
  subjectCode: string;
  totalStudents: number;
  submittedCount: number;
  notSubmittedCount: number;
  lateCount: number;
  evaluatedCount: number;
  // Mean of the marks awarded so far, rounded. null when nothing is marked.
  averageMarks: number | null;
}

export interface AssignmentSubject {
  id: string;
  code: string;
  name: string;
}

const SUBMITTED: SubmissionStatus[] = [
  "Submitted",
  "Late",
  "Evaluated",
  "Returned",
];
const EVALUATED: SubmissionStatus[] = ["Evaluated", "Returned"];

const STATUS_ORDER: Record<AssignmentStatus, number> = {
  Published: 0,
  Draft: 1,
  Closed: 2,
};

function withStats(assignment: Assignment): AssignmentWithStats {
  const subject = getSubjectById(assignment.subjectId);
  const mine = submissions.filter((s) => s.assignmentId === assignment.id);
  const marks = mine
    .map((s) => s.marks)
    .filter((m): m is number => m !== null);

  const submittedCount = mine.filter((s) =>
    SUBMITTED.includes(s.status),
  ).length;

  return {
    ...assignment,
    subjectName: subject?.name ?? assignment.subjectId,
    subjectCode: subject?.code ?? assignment.subjectId,
    totalStudents: mine.length,
    submittedCount,
    notSubmittedCount: mine.length - submittedCount,
    lateCount: mine.filter((s) => s.status === "Late").length,
    evaluatedCount: mine.filter((s) => EVALUATED.includes(s.status)).length,
    averageMarks:
      marks.length > 0
        ? Math.round(marks.reduce((sum, m) => sum + m, 0) / marks.length)
        : null,
  };
}

export async function getAssignmentsWithStats(): Promise<AssignmentWithStats[]> {
  return assignments
    .map((assignment) => withStats(assignment))
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        a.dueDate.localeCompare(b.dueDate),
    );
}

// Work waiting to be marked first, finished work last.
const SUBMISSION_ORDER: Record<SubmissionStatus, number> = {
  Submitted: 0,
  Late: 1,
  "Not Submitted": 2,
  Evaluated: 3,
  Returned: 4,
};

export interface AssignmentDetail {
  assignment: AssignmentWithStats;
  submissions: Submission[];
}

export async function getAssignmentDetail(
  id: string,
): Promise<AssignmentDetail | null> {
  const assignment = assignments.find((a) => a.id === id);
  if (!assignment) return null;

  const mine = submissions
    .filter((s) => s.assignmentId === assignment.id)
    .sort(
      (a, b) =>
        SUBMISSION_ORDER[a.status] - SUBMISSION_ORDER[b.status] ||
        a.studentName.localeCompare(b.studentName),
    );

  return { assignment: withStats(assignment), submissions: mine };
}

// The subjects the logged-in faculty member teaches, for the course picker.
// Scoped the same way as the lecture planner.
export async function getAssignmentSubjects(): Promise<AssignmentSubject[]> {
  const { department } = await getFacultyProfile();
  return subjects
    .filter((s) => s.department === department)
    .map((s) => ({ id: s.id, code: s.code, name: s.name }));
}

// Mean score across every evaluated or returned submission, as a percentage
// of each assignment's maximum marks so assignments out of 15, 20 and 25 can
// be averaged together. null when nothing has been evaluated.
export async function getEvaluatedScorePercent(): Promise<{
  percent: number | null;
  count: number;
}> {
  const percents = submissions.flatMap((s) => {
    if (!EVALUATED.includes(s.status) || s.marks === null) return [];
    const assignment = assignments.find((a) => a.id === s.assignmentId);
    if (!assignment || assignment.maxMarks <= 0) return [];
    return [(s.marks / assignment.maxMarks) * 100];
  });

  return {
    percent:
      percents.length > 0
        ? Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length)
        : null,
    count: percents.length,
  };
}
