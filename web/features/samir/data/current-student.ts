/**
 * Single source of truth for the signed-in student across every student screen.
 *
 * Everything the student sees (dashboard, profile, skill profile, opportunities,
 * applications, AI insights) reads identity, headline scores and skill levels
 * from here, so the same number never differs between two pages.
 */
import { rudy, SkillScore } from "@/data/students";
import { getSkillById } from "@/data/skills";
import { defaultRudyResume } from "@/lib/api/resumes";
import type { components } from "@/lib/ai/types";

export type AiStudent = components["schemas"]["Student"];

export const CURRENT_STUDENT_ID = rudy.id;

export const currentStudent = {
  id: rudy.id,
  name: rudy.name,
  firstName: rudy.name.split(" ")[0],
  email: defaultRudyResume.personalInfo.email,
  department: rudy.department,
  year: rudy.year,
  location: "Rourkela, Odisha",
  careerGoal: rudy.careerGoal,
  employabilityScore: rudy.employabilityScore,
  skillReadiness: rudy.skillReadiness,
  profileStrength: rudy.profileStrength,
  readiness: rudy.readiness,
  skills: rudy.skills,
} as const;

export function getCurrentStudentSkillScore(skillId: string): number {
  return rudy.skills.find((s) => s.skillId === skillId)?.score ?? 0;
}

/* -------------------------------------------------------------------------- */
/* Opportunity match — one formula for every screen                           */
/* -------------------------------------------------------------------------- */

export const STRONG_MATCH_MIN = 65;
export const PARTIAL_MATCH_MIN = 40;

export interface SkillMatch {
  matchScore: number;
  /** skill ids at or above STRONG_MATCH_MIN */
  strong: string[];
  /** skill ids between PARTIAL_MATCH_MIN and STRONG_MATCH_MIN */
  partial: string[];
  /** skill ids below PARTIAL_MATCH_MIN */
  missing: string[];
  /** strong + partial: shown with a check mark on cards */
  matchingSkills: string[];
  /** same as missing: shown with a cross on cards */
  missingSkills: string[];
}

export function computeSkillMatch(
  requiredSkills: string[],
  studentSkills: SkillScore[] = rudy.skills
): SkillMatch {
  const scoreOf = (id: string) => studentSkills.find((s) => s.skillId === id)?.score ?? 0;
  const strong = requiredSkills.filter((id) => scoreOf(id) >= STRONG_MATCH_MIN);
  const partial = requiredSkills.filter(
    (id) => scoreOf(id) >= PARTIAL_MATCH_MIN && scoreOf(id) < STRONG_MATCH_MIN
  );
  const missing = requiredSkills.filter((id) => scoreOf(id) < PARTIAL_MATCH_MIN);
  const matchScore = requiredSkills.length
    ? Math.round(((strong.length + partial.length * 0.5) / requiredSkills.length) * 100)
    : 0;
  return { matchScore, strong, partial, missing, matchingSkills: [...strong, ...partial], missingSkills: missing };
}

export function skillName(id: string): string {
  return getSkillById(id)?.name ?? id;
}

/* -------------------------------------------------------------------------- */
/* AI service payload built from the same record                              */
/* -------------------------------------------------------------------------- */

const graduationYear = Number.parseInt(defaultRudyResume.education[0]?.endYear ?? "", 10);

/** The current student expressed in the AI service contract shape. */
export function getCurrentStudentAiRecord(): AiStudent {
  return {
    student_id: "ST001",
    branch: "CSE",
    cgpa: Number.parseFloat(defaultRudyResume.education[0]?.score ?? "") || 8.0,
    backlogs: 0,
    graduation_year: Number.isFinite(graduationYear) ? graduationYear : 2028,
    skills: rudy.skills.filter((s) => s.score >= PARTIAL_MATCH_MIN).map((s) => skillName(s.skillId)),
    certifications: defaultRudyResume.certifications.map((c) => c.name),
    projects: defaultRudyResume.projects.map((p) => ({
      title: p.title,
      tech: p.skillsUsed.map(skillName),
      description: p.description,
    })),
    aptitude_score: 72,
    communication_score: getCurrentStudentSkillScore("communication"),
    mock_interview_score: null,
    is_synthetic: false,
  } as AiStudent;
}
