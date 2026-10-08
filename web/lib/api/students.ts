import { rudy, students, getStudentById, Student } from "@/data/students";
import { opportunities, Opportunity } from "@/data/opportunities";
import { rudyCurrentStageIndex, skillDevelopmentStages } from "@/data/analytics";
import { getHydratedStudentSkills } from "./skills";
import { isOpportunityActive } from "./opportunities";

// NOTE: every function here is a thin async wrapper around mock data.
// Swap the body for a `fetch("/api/...")` call against the FastAPI
// backend later without touching any calling component.

export async function getStudentProfile(studentId: string = "s1"): Promise<Student> {
  const student = getStudentById(studentId) ?? rudy;
  const skills = getHydratedStudentSkills(studentId);
  const baseProfile = {
    ...student,
    skills,
  };

  // Safe client overlay from UserProfileContext localStorage if present (P1.2)
  if (typeof window !== "undefined" && studentId === "s1") {
    try {
      const stored = localStorage.getItem("skillsync-user-profiles");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.student) {
          return {
            ...baseProfile,
            name: parsed.student.name || baseProfile.name,
            email: parsed.student.email ?? baseProfile.email,
            department: parsed.student.department || baseProfile.department,
            careerGoal: parsed.student.careerGoal || baseProfile.careerGoal,
            bio: parsed.student.bio ?? baseProfile.bio,
            employabilityScore: parsed.student.employabilityScore ?? baseProfile.employabilityScore,
            skillReadiness: parsed.student.skillReadiness ?? baseProfile.skillReadiness,
            profileStrength: parsed.student.profileStrength ?? baseProfile.profileStrength,
          };
        }
      }
    } catch {
      // Safe fallback
    }
  }

  return baseProfile;
}

export async function getStudentSkills(studentId: string = "s1") {
  return getHydratedStudentSkills(studentId);
}

export async function getAllStudents(): Promise<Student[]> {
  return students;
}

export async function getRecommendedOpportunities(studentId: string = "s1"): Promise<
  (Opportunity & { matchScore: number; matchingSkills: string[]; missingSkills: string[] })[]
> {
  const student = await getStudentProfile(studentId);
  const now = new Date();
  const activeOnly = opportunities.filter((opp) => isOpportunityActive(opp.deadline, now));
  const pool = activeOnly.length > 0 ? activeOnly : opportunities;

  const scored = pool.map((opp) => {
    const studentSkillIds = new Set(
      student.skills.filter((s) => s.score >= 50).map((s) => s.skillId)
    );
    const matchingSkills = opp.requiredSkills.filter((id) => studentSkillIds.has(id));
    const missingSkills = opp.requiredSkills.filter((id) => !studentSkillIds.has(id));
    const matchScore = Math.round((matchingSkills.length / opp.requiredSkills.length) * 100);
    return { ...opp, matchScore, matchingSkills, missingSkills };
  });
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

export async function getSkillTimeline() {
  return { stages: skillDevelopmentStages, currentIndex: rudyCurrentStageIndex };
}
