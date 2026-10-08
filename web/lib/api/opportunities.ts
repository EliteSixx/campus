import { opportunities, getOpportunityById } from "@/data/opportunities";
import { rudy, getStudentById } from "@/data/students";
import { getSkillById } from "@/data/skills";

export type OpportunityStatus = "Open" | "Closing Soon" | "Closed";

export function getOpportunityStatus(deadline: string, now: Date = new Date()): OpportunityStatus {
  if (!deadline) return "Open";
  const deadlineDate = new Date(deadline);
  // Compare end of deadline day with current time
  deadlineDate.setHours(23, 59, 59, 999);
  const diffMs = deadlineDate.getTime() - now.getTime();
  if (diffMs < 0) return "Closed";
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 7) return "Closing Soon";
  return "Open";
}

export function isOpportunityActive(deadline: string, now: Date = new Date()): boolean {
  return getOpportunityStatus(deadline, now) !== "Closed";
}

export async function getAllOpportunities() {
  return opportunities;
}

export async function getOpportunity(id: string) {
  return getOpportunityById(id);
}

export async function getOpportunityMatch(opportunityId: string, studentId: string = "s1") {
  const opp = getOpportunityById(opportunityId);
  const student = getStudentById(studentId) ?? rudy;
  if (!opp) return null;

  const scoreOf = (skillId: string) => student.skills.find((s) => s.skillId === skillId)?.score ?? 0;

  const strong = opp.requiredSkills.filter((id) => scoreOf(id) >= 65);
  const partial = opp.requiredSkills.filter((id) => scoreOf(id) >= 40 && scoreOf(id) < 65);
  const missing = opp.requiredSkills.filter((id) => scoreOf(id) < 40);

  const matchScore = Math.round(
    ((strong.length + partial.length * 0.5) / opp.requiredSkills.length) * 100
  );

  return {
    matchScore,
    strong: strong.map((id) => getSkillById(id)?.name ?? id),
    partial: partial.map((id) => getSkillById(id)?.name ?? id),
    missing: missing.map((id) => getSkillById(id)?.name ?? id),
  };
}

export async function getCandidatesForOpportunity() {
  // Used by the industry candidate intelligence table.
  const { students } = await import("@/data/students");
  return students;
}
