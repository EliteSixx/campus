import { assignments, submissions } from "@/data/assignments";
import { subjects, type Subject } from "@/data/curriculum";
import { getSemesterAcademics } from "@/lib/api/academics";
import { analyzeSubject, getCurriculumOverview } from "@/lib/api/curriculum";
import { getCurriculumInsightsWorkspace } from "@/lib/api/curriculum-insights";
import { STRUGGLING_BELOW } from "@/lib/api/curriculum-insights-meta";
import {
  getCohortSkillHealth,
  getMyCohort,
  getSubjectTeachingImpact,
} from "@/lib/api/faculty-students";
import {
  getMySubjects,
  getRoster,
  getStudentDetail,
  getStudentSkillPlan,
  topicsTeaching,
  type RosterEntry,
  type StudentDetail,
} from "@/lib/api/faculty-roster";
import {
  WEAKEST_SKILL_LIMIT,
  subjectImpactVerdict,
  type CohortStudentRow,
  type SkillSummary,
  type StudentAssignmentRecord,
  type StudentSubjectRecord,
  type StudentsWorkspace,
  type SubjectImpactRow,
  type WeakSkillRow,
} from "@/lib/api/faculty-students-meta";

// Server-side collector for the faculty "My Students" pages: one plain-JSON
// workspace, with the types and pure rules in faculty-students-meta.ts.
//
// Nothing is recomputed here that another faculty page already computes. The
// roster, transcript, skill plan, cohort skill averages, teaching impact,
// alignment and quick wins all come from the functions behind those pages, so
// every number matches wherever else it appears.
//
// No clock is read in this file. What counts as overdue is decided by the
// caller, which passes "today" to getAttentionReasons().

function roundedMean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

async function buildStudentRow(
  entry: RosterEntry,
  mySubjects: Subject[],
): Promise<CohortStudentRow> {
  const { student } = entry;
  const [transcript, skillPlan] = await Promise.all([
    getSemesterAcademics(student.id),
    getStudentSkillPlan(student),
  ]);

  // Only my subjects, and only from the semester the student is sitting now.
  const subjectById = new Map(mySubjects.map((s) => [s.id, s]));
  const inProgress = transcript.semesters.find(
    (s) => s.status === "In Progress",
  );
  const studentSubjects: StudentSubjectRecord[] = (
    inProgress?.rows ?? []
  ).flatMap((row) => {
    const subject = subjectById.get(row.subjectId);
    if (!subject) return [];
    return [
      {
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        internalMarks: row.internalMarks,
        attendance: row.attendance,
      },
    ];
  });

  // Every submission row for this student, whatever its status.
  const studentAssignments: StudentAssignmentRecord[] = submissions
    .filter((s) => s.studentId === student.id)
    .flatMap((submission) => {
      const assignment = assignments.find(
        (a) => a.id === submission.assignmentId,
      );
      if (!assignment) return [];
      const subject = subjects.find((s) => s.id === assignment.subjectId);
      return [
        {
          assignmentId: assignment.id,
          subjectId: assignment.subjectId,
          subjectCode: subject?.code ?? assignment.subjectId,
          title: assignment.title,
          dueDate: assignment.dueDate,
          maxMarks: assignment.maxMarks,
          assignmentStatus: assignment.status,
          submissionStatus: submission.status,
          submittedOn: submission.submittedOn,
          marks: submission.marks,
        },
      ];
    });

  const skillSummary: SkillSummary = {
    learnt: skillPlan.filter((s) => s.status === "Learnt").length,
    developing: skillPlan.filter((s) => s.status === "Developing").length,
    toLearn: skillPlan.filter((s) => s.status === "To learn").length,
    notAssessed: skillPlan.filter((s) => s.status === "Not assessed").length,
  };

  return {
    id: student.id,
    name: student.name,
    rollNumber: entry.rollNumber,
    yearLabel: entry.yearLabel,
    currentSemester: entry.currentSemester,
    careerGoal: student.careerGoal,
    readiness: student.readiness,
    skillReadiness: student.skillReadiness,
    cgpa: entry.cgpa,
    latestInternship: entry.latestInternship
      ? {
          company: entry.latestInternship.company,
          status: entry.latestInternship.status,
        }
      : null,
    subjects: studentSubjects,
    assignments: studentAssignments,
    skillSummary,
  };
}

export async function getStudentsWorkspace(): Promise<StudentsWorkspace> {
  const [
    cohort,
    roster,
    mySubjects,
    health,
    impact,
    overview,
    insights,
  ] = await Promise.all([
    getMyCohort(),
    getRoster(),
    getMySubjects(),
    getCohortSkillHealth(),
    getSubjectTeachingImpact(),
    getCurriculumOverview(),
    getCurriculumInsightsWorkspace(),
  ]);

  const students = await Promise.all(
    roster.map((entry) => buildStudentRow(entry, mySubjects)),
  );

  // --- Teaching impact ------------------------------------------------------
  // Skill numbers straight from getSubjectTeachingImpact(). A skill counts as
  // measured when getCohortSkillHealth() has an average for it, which is the
  // same test that function applies.
  const measuredIds = new Set(health.map((h) => h.skillId));
  const healthName = new Map(health.map((h) => [h.skillId, h.name]));

  const subjectImpact: SubjectImpactRow[] = await Promise.all(
    mySubjects.map(async (subject) => {
      const analysis = await analyzeSubject(subject.id);
      const alignmentScore = analysis?.alignmentScore ?? 0;
      const teaching = impact.find((i) => i.id === subject.id);
      const skillAverage = teaching?.cohortAverage ?? null;

      const taught = [...new Set(subject.topics.flatMap((t) => t.skillIds))];
      const measuredSkillNames = taught
        .filter((id) => measuredIds.has(id))
        .map((id) => healthName.get(id) ?? id);

      const taking = students.flatMap((student) =>
        student.subjects.filter((s) => s.subjectId === subject.id),
      );

      return {
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        semester: subject.semester,
        alignmentScore,
        skillAverage,
        measuredSkillNames,
        unmeasuredSkillNames: teaching?.unmeasuredSkillNames ?? [],
        studentsTaking: taking.length,
        classInternalAverage: roundedMean(taking.map((s) => s.internalMarks)),
        classAttendanceAverage: roundedMean(taking.map((s) => s.attendance)),
        verdict: subjectImpactVerdict(alignmentScore, skillAverage),
      };
    }),
  );

  // --- Weakest skills -------------------------------------------------------
  // The same first six, in the same order, as getCohortSkillHealth() gives the
  // current students page.
  const cohortSize = cohort.students.length;
  const weakestSkills: WeakSkillRow[] = health
    .slice(0, WEAKEST_SKILL_LIMIT)
    .map((skill) => {
      const strugglingCount = cohort.students.filter((student) => {
        const score = student.skills.find(
          (k) => k.skillId === skill.skillId,
        )?.score;
        return score === undefined || score < STRUGGLING_BELOW;
      }).length;

      // Quick wins are already biggest gain first; the first match is the best.
      const win = insights.quickWins.find((q) => q.skillId === skill.skillId);

      return {
        skillId: skill.skillId,
        name: skill.name,
        cohortAverage: skill.averageScore,
        strugglingCount,
        cohortSize,
        demandCount: skill.demandCount,
        totalPostings: overview.totalPostings,
        taughtIn: topicsTeaching(skill.skillId, mySubjects),
        bestFit: win
          ? { subjectId: win.subjectId, code: win.subjectCode, gain: win.gain }
          : null,
        expectedIn: mySubjects
          .filter((subject) => subject.industrySkillIds.includes(skill.skillId))
          .map((subject) => ({ subjectId: subject.id, code: subject.code })),
      };
    });

  return {
    department: cohort.department,
    trackedStudents: cohort.total,
    enrolledStudents: overview.studentsTaught,
    averageReadiness: cohort.averageReadiness,
    totalPostings: overview.totalPostings,
    students,
    subjectImpact,
    weakestSkills,
  };
}

// One student's workspace row plus the detail the student page needs. null
// when the id is not in this faculty member's cohort, so the page can still
// call notFound().
export async function getStudentWorkspaceRow(
  id: string,
): Promise<{ row: CohortStudentRow; detail: StudentDetail } | null> {
  const [roster, detail, mySubjects] = await Promise.all([
    getRoster(),
    getStudentDetail(id),
    getMySubjects(),
  ]);
  const entry = roster.find((e) => e.student.id === id);
  if (!entry || !detail) return null;

  return { row: await buildStudentRow(entry, mySubjects), detail };
}
