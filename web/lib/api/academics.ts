import { getStudentAcademics } from "@/data/student-academics";
import { getProgrammeSubject } from "@/data/programme-curriculum";
import type { SemesterRecord } from "@/data/student-academics";

// The full programme transcript for one student, joined to the degree
// curriculum in data/programme-curriculum.ts.
//
// Note this is a different curriculum from data/curriculum.ts: that file holds
// only the handful of subjects the logged-in faculty member teaches and drives
// the alignment scoring. This one is the whole eight-semester degree, which is
// what a transcript has to show. The two share subject ids (cs301–cs304) but
// not codes.
//
// data/student-academics.ts is the only source for marks, attendance, semester
// status and SGPA, and CGPA is always computed from it here, never stored.

export interface SemesterSubjectRow {
  subjectId: string;
  name: string;
  code: string;
  // null if the subject is not in the programme curriculum.
  credits: number | null;
  internalMarks: number;
  semesterMarks: number | null;
  attendance: number;
}

export interface SemesterBlock {
  semester: number;
  status: SemesterRecord["status"];
  sgpa: number | null;
  rows: SemesterSubjectRow[];
}

export interface SemesterAcademics {
  // Newest semester first, the order a transcript is read in.
  semesters: SemesterBlock[];
  currentSemester: number | null;
  // "3rd Year" for semester 5 or 6. null when there is no semester record.
  yearLabel: string | null;
  completedSemesters: number;
  overallAttendance: number;
  // Credit-weighted over completed semesters; null when none is completed.
  cgpa: number | null;
}

function buildRows(record: SemesterRecord): SemesterSubjectRow[] {
  return record.subjects.map((subject) => {
    const programme = getProgrammeSubject(subject.subjectId);
    return {
      subjectId: subject.subjectId,
      name: programme?.name ?? subject.subjectId,
      code: programme?.code ?? subject.subjectId,
      credits: programme?.credits ?? null,
      internalMarks: subject.internalMarks,
      semesterMarks: subject.semesterMarks,
      attendance: subject.attendance,
    };
  });
}

// A semester's credits are the sum of its subjects' credits in the programme
// curriculum. A subject missing from the curriculum adds nothing.
function semesterCredits(record: SemesterRecord): number {
  return record.subjects.reduce(
    (sum, subject) => sum + (getProgrammeSubject(subject.subjectId)?.credits ?? 0),
    0,
  );
}

// CGPA = Σ(SGPA × semester credits) ÷ Σ(semester credits), over completed
// semesters only, rounded to 2 decimals. null when nothing is completed yet.
export function computeCgpa(records: SemesterRecord[]): number | null {
  let weighted = 0;
  let credits = 0;
  for (const record of records) {
    if (record.status !== "Completed" || record.sgpa === null) continue;
    const semCredits = semesterCredits(record);
    weighted += record.sgpa * semCredits;
    credits += semCredits;
  }
  if (credits === 0) return null;
  return Math.round((weighted / credits) * 100) / 100;
}

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

// Two semesters to a year: semesters 1–2 are "1st Year", 7–8 "4th Year".
export function yearLabelFor(semester: number): string {
  return `${ordinal(Math.ceil(semester / 2))} Year`;
}

// The year a student is in now, from their in-progress semester. Synchronous so
// audience maths can call it per student. null when the student has no
// semester in progress (or no record at all); callers fall back to
// Student.year from data/students.ts.
export function getYearLabel(studentId: string): string | null {
  const inProgress = getStudentAcademics(studentId)?.semesters.find(
    (s) => s.status === "In Progress",
  );
  return inProgress ? yearLabelFor(inProgress.semester) : null;
}

export async function getSemesterAcademics(
  studentId: string,
): Promise<SemesterAcademics> {
  const academics = getStudentAcademics(studentId);
  const records = academics?.semesters ?? [];

  const semesters: SemesterBlock[] = records
    .map((record) => ({
      semester: record.semester,
      status: record.status,
      sgpa: record.sgpa,
      rows: buildRows(record),
    }))
    .sort((a, b) => b.semester - a.semester);

  // The semester in progress is the one they are sitting in; once everything is
  // marked complete the latest finished semester is the best answer.
  const inProgress = semesters.find((s) => s.status === "In Progress");
  const currentSemester =
    inProgress?.semester ?? semesters[0]?.semester ?? null;

  const attendances = semesters.flatMap((s) => s.rows.map((r) => r.attendance));
  const overallAttendance = attendances.length
    ? Math.round(
        attendances.reduce((sum, a) => sum + a, 0) / attendances.length,
      )
    : 0;

  return {
    semesters,
    currentSemester,
    yearLabel: currentSemester === null ? null : yearLabelFor(currentSemester),
    completedSemesters: semesters.filter((s) => s.status === "Completed").length,
    overallAttendance,
    cgpa: computeCgpa(records),
  };
}
