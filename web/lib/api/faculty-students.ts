import { getAllStudents } from "@/lib/api/students";
import { getFacultyProfile } from "@/lib/api/analytics";
import { subjects } from "@/data/curriculum";
import { getSkillById } from "@/data/skills";
import { getSkillDemandCount } from "@/lib/api/curriculum";
import type { Student } from "@/data/students";

// Faculty-side view of their own cohort: how the students they teach actually
// score, lined up against what their syllabus covers.
//
// The honest bit: students are only scored on the skill ids that appear in
// their skill sets. Several syllabus skills have no student data at all, so
// anything not present in the cohort is treated as unmeasured rather than 0.

export interface MyCohort {
  department: string;
  students: Student[];
  total: number;
  averageReadiness: number;
  placementReady: number;
  nearReady: number;
  criticalGap: number;
}

export interface TaughtInSubject {
  id: string;
  code: string;
  name: string;
}

export interface CohortSkillHealth {
  skillId: string;
  name: string;
  averageScore: number;
  taughtIn: TaughtInSubject[];
  demandCount: number;
}

export interface SubjectTeachingImpact {
  id: string;
  code: string;
  name: string;
  // null when none of the skills this subject teaches has student data.
  cohortAverage: number | null;
  measuredSkillCount: number;
  unmeasuredSkillNames: string[];
}

function skillName(skillId: string): string {
  return getSkillById(skillId)?.name ?? skillId;
}

// Subjects belonging to the logged-in faculty member's department.
async function getMySubjects() {
  const { department } = await getFacultyProfile();
  return subjects.filter((s) => s.department === department);
}

// skillId -> cohort average score, built only from skills students are
// actually scored on. A skill absent from this map has no student data.
async function getCohortSkillAverages(): Promise<Map<string, number>> {
  const { students } = await getMyCohort();

  const totals = new Map<string, { sum: number; count: number }>();
  for (const student of students) {
    for (const skill of student.skills) {
      const entry = totals.get(skill.skillId) ?? { sum: 0, count: 0 };
      entry.sum += skill.score;
      entry.count += 1;
      totals.set(skill.skillId, entry);
    }
  }

  const averages = new Map<string, number>();
  for (const [skillId, { sum, count }] of totals) {
    if (count > 0) averages.set(skillId, Math.round(sum / count));
  }
  return averages;
}

export async function getMyCohort(): Promise<MyCohort> {
  const [all, { department }] = await Promise.all([
    getAllStudents(),
    getFacultyProfile(),
  ]);

  const students = all.filter((s) => s.department === department);
  const total = students.length;
  const averageReadiness = total
    ? Math.round(students.reduce((sum, s) => sum + s.skillReadiness, 0) / total)
    : 0;

  return {
    department,
    students,
    total,
    averageReadiness,
    placementReady: students.filter((s) => s.readiness === "Placement Ready")
      .length,
    nearReady: students.filter((s) => s.readiness === "Near Ready").length,
    criticalGap: students.filter((s) => s.readiness === "Critical Gap").length,
  };
}

export async function getCohortSkillHealth(): Promise<CohortSkillHealth[]> {
  const [averages, mySubjects] = await Promise.all([
    getCohortSkillAverages(),
    getMySubjects(),
  ]);

  const health: CohortSkillHealth[] = [...averages.entries()].map(
    ([skillId, averageScore]) => ({
      skillId,
      name: skillName(skillId),
      averageScore,
      taughtIn: mySubjects
        .filter((s) => s.topics.some((t) => t.skillIds.includes(skillId)))
        .map((s) => ({ id: s.id, code: s.code, name: s.name })),
      demandCount: getSkillDemandCount(skillId),
    }),
  );

  // Weakest first: this list exists to surface where teaching is not landing.
  return health.sort((a, b) => a.averageScore - b.averageScore);
}

export async function getSubjectTeachingImpact(): Promise<
  SubjectTeachingImpact[]
> {
  const [averages, mySubjects] = await Promise.all([
    getCohortSkillAverages(),
    getMySubjects(),
  ]);

  return mySubjects.map((subject) => {
    const taught = [...new Set(subject.topics.flatMap((t) => t.skillIds))];
    const measured = taught.filter((id) => averages.has(id));
    const unmeasured = taught.filter((id) => !averages.has(id));

    // No student data for any of these skills means no honest average to give.
    const cohortAverage = measured.length
      ? Math.round(
          measured.reduce((sum, id) => sum + (averages.get(id) ?? 0), 0) /
            measured.length,
        )
      : null;

    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      cohortAverage,
      measuredSkillCount: measured.length,
      unmeasuredSkillNames: unmeasured.map(skillName),
    };
  });
}
