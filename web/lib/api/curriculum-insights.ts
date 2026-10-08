import { getCompanyById } from "@/data/companies";
import { getFacultyProfile } from "@/lib/api/analytics";
import {
  getAllSubjectAnalyses,
  getCurriculumOverview,
} from "@/lib/api/curriculum";
import { getMaterials } from "@/lib/api/faculty-materials";
import { getProgramsWithImpact } from "@/lib/api/faculty-programs";
import {
  getCohortSkillHealth,
  getMyCohort,
} from "@/lib/api/faculty-students";
import { getAllOpportunities } from "@/lib/api/opportunities";
import { getSkillCatalog } from "@/lib/api/skills";
import {
  STRUGGLING_BELOW,
  buildQuickWins,
  buildSharedGaps,
  buildSkillMatrix,
  countSkillDemand,
  type CurriculumInsightsWorkspace,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
  type ProgramMatch,
  type SubjectStudentImpact,
} from "@/lib/api/curriculum-insights-meta";

// Everything the curriculum analysis pages need, as one plain-JSON workspace.
//
// Subjects, scores, topics and statuses come straight from analyzeSubject()
// (via getAllSubjectAnalyses), filtered to the faculty member's department the
// same way the lecture planner does, so every number matches today's pages.
// The cross-subject views (matrix, shared gaps, quick wins) are built with the
// pure helpers in curriculum-insights-meta.ts, the same code the browser runs.
//
// Topics are always identified by subject + topic id. No clock is read.

// --- Postings --------------------------------------------------------------

async function collectPostings(): Promise<InsightPosting[]> {
  const opportunities = await getAllOpportunities();
  return opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    company: getCompanyById(o.companyId)?.name ?? o.companyId,
    location: o.location,
    type: o.type,
    skillIds: [...new Set([...o.requiredSkills, ...o.preferredSkills])],
    requiredSkillIds: [...o.requiredSkills],
    preferredSkillIds: [...o.preferredSkills],
  }));
}

// --- Skills ----------------------------------------------------------------

// A skill id missing from the catalog keeps its id as its name.
async function collectSkills(
  skillIds: string[],
  postings: InsightPosting[],
): Promise<Record<string, InsightSkill>> {
  const catalog = new Map((await getSkillCatalog()).map((s) => [s.id, s]));
  const skills: Record<string, InsightSkill> = {};
  for (const id of new Set(skillIds)) {
    const known = catalog.get(id);
    skills[id] = {
      id,
      name: known?.name ?? id,
      category: known?.category ?? "Other",
      demandCount: countSkillDemand(id, postings),
      totalPostings: postings.length,
    };
  }
  return skills;
}

// --- Student impact --------------------------------------------------------

// Averages reuse getCohortSkillHealth. Struggling follows the faculty
// dashboard: below STRUGGLING_BELOW or no score, counted only for a skill at
// least one cohort student is scored on.
async function collectStudentImpact(
  subjects: InsightSubject[],
  skills: Record<string, InsightSkill>,
): Promise<{ cohortSize: number; impact: SubjectStudentImpact[] }> {
  const [cohort, health] = await Promise.all([
    getMyCohort(),
    getCohortSkillHealth(),
  ]);
  const averages = new Map(health.map((h) => [h.skillId, h.averageScore]));
  const cohortSize = cohort.total;

  const impact = subjects.map((subject) => {
    const taught = new Set(subject.topics.flatMap((t) => t.skillIds));
    return {
      subjectId: subject.id,
      cohortSize,
      skills: subject.industrySkillIds.map((skillId) => {
        const averageScore = averages.get(skillId) ?? null;
        const strugglingCount =
          averageScore === null
            ? 0
            : cohort.students.filter((student) => {
                const score = student.skills.find(
                  (k) => k.skillId === skillId,
                )?.score;
                return score === undefined || score < STRUGGLING_BELOW;
              }).length;
        return {
          skillId,
          name: skills[skillId]?.name ?? skillId,
          taught: taught.has(skillId),
          averageScore,
          strugglingCount,
        };
      }),
    };
  });

  return { cohortSize, impact };
}

// --- Workspace -------------------------------------------------------------

export async function getCurriculumInsightsWorkspace(): Promise<CurriculumInsightsWorkspace> {
  const [profile, allAnalyses, overview, postings, programsWithImpact] =
    await Promise.all([
      getFacultyProfile(),
      getAllSubjectAnalyses(),
      getCurriculumOverview(),
      collectPostings(),
      getProgramsWithImpact(),
    ]);

  const analyses = allAnalyses.filter(
    (a) => a.subject.department === profile.department,
  );

  // Subjects, straight from analyzeSubject. Materials are counted per topic
  // with course + topic together, never the topic id alone.
  const subjects: InsightSubject[] = await Promise.all(
    analyses.map(async (a) => {
      const topics = await Promise.all(
        a.topics.map(async (t) => ({
          id: t.topic.id,
          key: `${a.subject.id}:${t.topic.id}`,
          name: t.topic.name,
          hours: t.topic.hours,
          foundational: t.topic.foundational,
          skillIds: [...t.topic.skillIds],
          skillNames: [...t.skillNames],
          demandCount: t.demandCount,
          status: t.status,
          materialsCount: (
            await getMaterials({ courseId: a.subject.id, topicId: t.topic.id })
          ).length,
        })),
      );
      const outdated = topics.filter((t) => t.status === "Outdated");
      return {
        id: a.subject.id,
        code: a.subject.code,
        name: a.subject.name,
        semester: a.subject.semester,
        credits: a.subject.credits,
        enrolled: a.subject.studentsEnrolled,
        industrySkillIds: [...a.subject.industrySkillIds],
        topics,
        alignmentScore: a.alignmentScore,
        coveredSkillIds: a.coveredSkills.map((s) => s.skillId),
        missingSkillIds: a.missingSkills.map((s) => s.skillId),
        totalHours: topics.reduce((sum, t) => sum + t.hours, 0),
        outdatedHours: outdated.reduce((sum, t) => sum + t.hours, 0),
        outdatedCount: a.outdatedCount,
      };
    }),
  );

  // Programs that teach at least one skill some subject is missing. Order is
  // getProgramsWithImpact's (biggest gap impact first).
  const missing = new Set(subjects.flatMap((s) => s.missingSkillIds));
  const programs: ProgramMatch[] = programsWithImpact.flatMap((p) => {
    const matchedSkillIds = p.skillIds.filter((id) => missing.has(id));
    if (matchedSkillIds.length === 0) return [];
    return [
      {
        id: p.id,
        title: p.title,
        provider: p.provider,
        type: p.type,
        durationWeeks: p.durationWeeks,
        skillIds: [...p.skillIds],
        matchedSkillIds,
      },
    ];
  });

  const skills = await collectSkills(
    [
      ...subjects.flatMap((s) => [
        ...s.industrySkillIds,
        ...s.topics.flatMap((t) => t.skillIds),
      ]),
      ...postings.flatMap((p) => p.skillIds),
      ...programs.flatMap((p) => p.skillIds),
    ],
    postings,
  );

  const { cohortSize, impact: studentImpact } = await collectStudentImpact(
    subjects,
    skills,
  );

  return {
    faculty: { name: profile.name, department: profile.department },
    totalPostings: overview.totalPostings,
    overallAlignment: overview.overallAlignment,
    subjectCount: overview.subjectCount,
    enrolledStudents: overview.studentsTaught,
    trackedStudents: cohortSize,
    totalOutdatedTopics: overview.outdatedTopicCount,
    totalOutdatedHours: subjects.reduce((sum, s) => sum + s.outdatedHours, 0),
    skills,
    postings,
    subjects,
    matrix: buildSkillMatrix(subjects, skills, postings),
    sharedGaps: buildSharedGaps(subjects, skills, postings),
    quickWins: buildQuickWins(subjects, skills, postings),
    studentImpact,
    programs,
  };
}

// Thin helper for the detail page: the workspace plus one of its subjects.
export async function getSubjectInsights(
  id: string,
): Promise<{
  workspace: CurriculumInsightsWorkspace;
  subject: InsightSubject;
} | null> {
  const workspace = await getCurriculumInsightsWorkspace();
  const subject = workspace.subjects.find((s) => s.id === id);
  return subject ? { workspace, subject } : null;
}
