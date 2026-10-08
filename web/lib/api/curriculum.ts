import { opportunities } from "@/data/opportunities";
import { getSkillById } from "@/data/skills";
import {
  subjects,
  getSubjectById,
  Subject,
  CurriculumTopic,
} from "@/data/curriculum";

export type TopicStatus = "Foundational" | "Industry-current" | "Outdated";

export interface TopicAnalysis {
  topic: CurriculumTopic;
  status: TopicStatus;
  demandCount: number;
  skillNames: string[];
}

export interface SkillDemand {
  skillId: string;
  name: string;
  demandCount: number;
}

export interface SubjectAnalysis {
  subject: Subject;
  alignmentScore: number;
  totalPostings: number;
  topics: TopicAnalysis[];
  coveredSkills: SkillDemand[];
  missingSkills: SkillDemand[];
  outdatedCount: number;
}

const TOTAL_POSTINGS = opportunities.length;

function countDemand(skillId: string): number {
  return opportunities.filter(
    (o) =>
      o.requiredSkills.includes(skillId) || o.preferredSkills.includes(skillId),
  ).length;
}

function skillName(skillId: string): string {
  return getSkillById(skillId)?.name ?? skillId;
}

function countTopicDemand(topic: CurriculumTopic): number {
  if (topic.skillIds.length === 0) return 0;
  return opportunities.filter((o) =>
    topic.skillIds.some(
      (s) => o.requiredSkills.includes(s) || o.preferredSkills.includes(s),
    ),
  ).length;
}

function classifyTopic(
  topic: CurriculumTopic,
  demandCount: number,
): TopicStatus {
  if (topic.foundational) return "Foundational";
  if (demandCount > 0) return "Industry-current";
  return "Outdated";
}

export async function analyzeSubject(
  subjectId: string,
): Promise<SubjectAnalysis | null> {
  const subject = getSubjectById(subjectId);
  if (!subject) return null;

  const taught = new Set(subject.topics.flatMap((t) => t.skillIds));

  const covered: SkillDemand[] = subject.industrySkillIds
    .filter((id) => taught.has(id))
    .map((id) => ({
      skillId: id,
      name: skillName(id),
      demandCount: countDemand(id),
    }))
    .sort((a, b) => b.demandCount - a.demandCount);

  const missing: SkillDemand[] = subject.industrySkillIds
    .filter((id) => !taught.has(id))
    .map((id) => ({
      skillId: id,
      name: skillName(id),
      demandCount: countDemand(id),
    }))
    .sort((a, b) => b.demandCount - a.demandCount);

  const coveredDemand = covered.reduce((sum, s) => sum + s.demandCount, 0);
  const missingDemand = missing.reduce((sum, s) => sum + s.demandCount, 0);
  const alignmentScore =
    coveredDemand + missingDemand === 0
      ? 100
      : Math.round((coveredDemand / (coveredDemand + missingDemand)) * 100);

  const topics: TopicAnalysis[] = subject.topics.map((topic) => {
    const demandCount = countTopicDemand(topic);
    return {
      topic,
      demandCount,
      status: classifyTopic(topic, demandCount),
      skillNames: topic.skillIds.map(skillName),
    };
  });

  return {
    subject,
    alignmentScore,
    totalPostings: TOTAL_POSTINGS,
    topics,
    coveredSkills: covered,
    missingSkills: missing,
    outdatedCount: topics.filter((t) => t.status === "Outdated").length,
  };
}

export async function getAllSubjectAnalyses(): Promise<SubjectAnalysis[]> {
  const results = await Promise.all(subjects.map((s) => analyzeSubject(s.id)));
  return results.filter((r): r is SubjectAnalysis => r !== null);
}

export interface CurriculumOverview {
  overallAlignment: number;
  subjectCount: number;
  studentsTaught: number;
  outdatedTopicCount: number;
  totalPostings: number;
  topMissingSkills: SkillDemand[];
}

export async function getCurriculumOverview(): Promise<CurriculumOverview> {
  const analyses = await getAllSubjectAnalyses();

  const overallAlignment = analyses.length
    ? Math.round(
        analyses.reduce((sum, a) => sum + a.alignmentScore, 0) /
          analyses.length,
      )
    : 0;

  const merged = new Map<string, SkillDemand>();
  for (const a of analyses) {
    for (const m of a.missingSkills) {
      if (!merged.has(m.skillId)) merged.set(m.skillId, m);
    }
  }

  return {
    overallAlignment,
    subjectCount: analyses.length,
    studentsTaught: analyses.reduce(
      (sum, a) => sum + a.subject.studentsEnrolled,
      0,
    ),
    outdatedTopicCount: analyses.reduce((sum, a) => sum + a.outdatedCount, 0),
    totalPostings: TOTAL_POSTINGS,
    topMissingSkills: [...merged.values()]
      .sort((a, b) => b.demandCount - a.demandCount)
      .slice(0, 5),
  };
}

// How many of the live postings ask for a single skill, by id.
// Thin public wrapper so other API modules can reuse countDemand().
export function getSkillDemandCount(skillId: string): number {
  return countDemand(skillId);
}
