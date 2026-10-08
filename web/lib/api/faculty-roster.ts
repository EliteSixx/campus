import { getMyCohort } from "@/lib/api/faculty-students";
import { getSkillDemandCount } from "@/lib/api/curriculum";
import { getFacultyProfile } from "@/lib/api/analytics";
import {
  getSemesterAcademics,
  type SemesterAcademics,
} from "@/lib/api/academics";
import type { SkillTopicRef } from "@/lib/api/faculty-students-meta";
import { subjects, type Subject } from "@/data/curriculum";
import { opportunities } from "@/data/opportunities";
import { getSkillById } from "@/data/skills";
import {
  getSkillSyllabus,
  topicsCovered as countCoveredTopics,
} from "@/data/skill-syllabus";
import {
  getStudentRecord,
  type InternshipRecord,
  type InternshipStatus,
  type PrePlacementOffer,
  type StudentRecord,
} from "@/data/faculty-student-records";
import type { Student } from "@/data/students";

// Faculty-side roster: the same cohort as lib/api/faculty-students.ts, but
// joined to the per-student records (roll number, internships, offers) and to
// the transcript in lib/api/academics.ts (CGPA, current semester, year), so a
// faculty member can filter the list and then drill into one student.
//
// Only students in the logged-in faculty member's cohort are ever returned.
// A student with no record is kept in the roster rather than dropped — the
// missing pieces are reported as null instead of being filled in.

// Everything that is not finished and not a rejection still counts as in-flight.
const ACTIVE_STATUSES: InternshipStatus[] = [
  "Applied",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Ongoing",
];

export interface RosterEntry {
  student: Student;
  rollNumber: string | null;
  // Computed from the transcript; null when no semester is completed.
  cgpa: number | null;
  // null when the student has no semester record.
  currentSemester: number | null;
  // From the current semester ("3rd Year"). Falls back to student.year only
  // when the student has no semester record.
  yearLabel: string;
  internships: InternshipRecord[];
  // The array is stored newest first, so the head is the current application.
  latestInternship: InternshipRecord | null;
  completedCount: number;
  activeCount: number;
}

export interface SkillGapRow {
  skillId: string;
  name: string;
  // null when the student has no score recorded for this skill.
  score: number | null;
  demandCount: number;
}

export type SkillPlanStatus =
  | "Learnt"
  | "Developing"
  | "To learn"
  | "Not assessed";

export interface SkillTopic {
  name: string;
  covered: boolean;
}

export interface SkillPlanRow extends SkillGapRow {
  status: SkillPlanStatus;
  // Empty, with both counts at zero, when the skill has no syllabus entry.
  // A "Not assessed" skill keeps its syllabus topics, none of them covered.
  topics: SkillTopic[];
  topicsCovered: number;
  topicsTotal: number;
  // Topics of the faculty member's own subjects that teach this skill; empty
  // when no syllabus of theirs covers it.
  taughtIn: SkillTopicRef[];
}

export interface StudentDetail {
  student: Student;
  record: StudentRecord | null;
  rollNumber: string | null;
  cgpa: number | null;
  currentSemester: number | null;
  yearLabel: string;
  internships: InternshipRecord[];
  offers: PrePlacementOffer[];
  skillPlan: SkillPlanRow[];
  totalPostings: number;
}

function buildEntry(
  student: Student,
  transcript: SemesterAcademics,
): RosterEntry {
  const record = getStudentRecord(student.id);
  const internships = record?.internships ?? [];

  return {
    student,
    rollNumber: record?.rollNumber ?? null,
    cgpa: transcript.cgpa,
    currentSemester: transcript.currentSemester,
    yearLabel: transcript.yearLabel ?? student.year,
    internships,
    latestInternship: internships[0] ?? null,
    completedCount: internships.filter((i) => i.status === "Completed").length,
    activeCount: internships.filter((i) => ACTIVE_STATUSES.includes(i.status))
      .length,
  };
}

export async function getRoster(): Promise<RosterEntry[]> {
  const { students } = await getMyCohort();
  return Promise.all(
    students.map(async (student) =>
      buildEntry(student, await getSemesterAcademics(student.id)),
    ),
  );
}

// Career goals read like "Backend Engineer" or "Security Analyst". The generic
// half says nothing about the domain, so it is dropped and the rest ("backend",
// "security") is what postings are matched on.
const ROLE_WORDS = new Set([
  "engineer",
  "engineering",
  "analyst",
  "developer",
  "intern",
  "internship",
  "manager",
  "scientist",
  "specialist",
  "associate",
  "junior",
  "senior",
  "lead",
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function goalKeywords(goal: string): string[] {
  return words(goal).filter((w) => !ROLE_WORDS.has(w));
}

// Whole-word match so "Data" does not pull in "Database Administrator".
function titleMatchesGoal(title: string, keywords: string[]): boolean {
  if (keywords.length === 0) return false;
  const titleWords = new Set(words(title));
  return keywords.some((k) => titleWords.has(k));
}

function buildSkillGap(student: Student): SkillGapRow[] {
  const keywords = goalKeywords(student.careerGoal);
  const matching = opportunities.filter((o) =>
    titleMatchesGoal(o.title, keywords),
  );

  const demanded = new Set(
    matching.flatMap((o) => [...o.requiredSkills, ...o.preferredSkills]),
  );

  const scores = new Map(student.skills.map((s) => [s.skillId, s.score]));

  const rows: SkillGapRow[] = [...demanded].map((skillId) => ({
    skillId,
    name: getSkillById(skillId)?.name ?? skillId,
    // No score recorded means the skill has not been assessed, which is not
    // the same as scoring 0.
    score: scores.get(skillId) ?? null,
    demandCount: getSkillDemandCount(skillId),
  }));

  // Lowest score first; unassessed skills lead, as nothing is known of them.
  return rows.sort((a, b) => (a.score ?? -1) - (b.score ?? -1));
}

function planStatus(score: number | null): SkillPlanStatus {
  if (score === null) return "Not assessed";
  if (score >= 70) return "Learnt";
  if (score >= 40) return "Developing";
  return "To learn";
}

// The demanded skills from buildSkillGap, re-ordered as a plan: what to pick up
// next comes first, and inside each band the skills the most postings ask for
// lead.
const PLAN_ORDER: SkillPlanStatus[] = [
  "To learn",
  "Not assessed",
  "Developing",
  "Learnt",
];

// The syllabus is an ordered list, so a score of N% means the first N% of the
// topics are behind them. A skill with no syllabus entry gets an empty list
// rather than invented topics, and an unassessed skill covers none.
function buildTopics(skillId: string, score: number | null) {
  const names = getSkillSyllabus(skillId)?.topics ?? [];
  const covered =
    score === null ? 0 : countCoveredTopics(score, names.length);

  return {
    topics: names.map((name, i) => ({ name, covered: i < covered })),
    topicsCovered: covered,
    topicsTotal: names.length,
  };
}

// Every topic of the given subjects whose skillIds include the skill, in
// subject order then syllabus order. Topic ids repeat across subjects, so the
// subject always travels with the topic.
export function topicsTeaching(
  skillId: string,
  mySubjects: Subject[],
): SkillTopicRef[] {
  return mySubjects.flatMap((subject) =>
    subject.topics
      .filter((topic) => topic.skillIds.includes(skillId))
      .map((topic) => ({
        subjectId: subject.id,
        code: subject.code,
        topicId: topic.id,
        topicName: topic.name,
      })),
  );
}

function buildSkillPlan(student: Student, mySubjects: Subject[]): SkillPlanRow[] {
  return buildSkillGap(student)
    .map((row) => ({
      ...row,
      status: planStatus(row.score),
      ...buildTopics(row.skillId, row.score),
      taughtIn: topicsTeaching(row.skillId, mySubjects),
    }))
    .sort((a, b) => {
      const byGroup =
        PLAN_ORDER.indexOf(a.status) - PLAN_ORDER.indexOf(b.status);
      if (byGroup !== 0) return byGroup;
      return b.demandCount - a.demandCount;
    });
}

// Subjects belonging to the logged-in faculty member's department, the same
// filter lib/api/faculty-students.ts and the lecture planner use.
export async function getMySubjects(): Promise<Subject[]> {
  const { department } = await getFacultyProfile();
  return subjects.filter((s) => s.department === department);
}

// One student's skill plan, exactly as the detail page shows it. Exported so
// other server modules never rebuild the plan themselves.
export async function getStudentSkillPlan(
  student: Student,
): Promise<SkillPlanRow[]> {
  return buildSkillPlan(student, await getMySubjects());
}

export async function getStudentDetail(
  studentId: string,
): Promise<StudentDetail | null> {
  const { students } = await getMyCohort();
  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const record = getStudentRecord(studentId) ?? null;
  const transcript = await getSemesterAcademics(studentId);

  return {
    student,
    record,
    rollNumber: record?.rollNumber ?? null,
    cgpa: transcript.cgpa,
    currentSemester: transcript.currentSemester,
    yearLabel: transcript.yearLabel ?? student.year,
    internships: record?.internships ?? [],
    offers: record?.offers ?? [],
    skillPlan: await getStudentSkillPlan(student),
    totalPostings: opportunities.length,
  };
}
