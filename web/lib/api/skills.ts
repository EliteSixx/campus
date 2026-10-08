import { skills, getSkillById, SkillCategory } from "@/data/skills";
import { rudy, getStudentById, SkillScore } from "@/data/students";
import { institutionAnalytics } from "@/data/analytics";
import { ResumeSkill } from "./resumes";

export interface SkillGapItem {
  skillId: string;
  name: string;
  current: number;
  target: number;
  gap: number;
}

export async function getSkillCatalog() {
  return skills;
}

export function getHydratedStudentSkills(studentId: string = "s1"): SkillScore[] {
  const student = getStudentById(studentId) ?? rudy;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`theplug-student-skills-${studentId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        student.skills = parsed;
      }
    } catch (e) {
      console.error("Failed to read student skills from localStorage", e);
    }
  }
  return student.skills;
}

export function syncResumeSkills(studentId: string = "s1", resumeSkills: ResumeSkill[]): SkillScore[] {
  const student = getStudentById(studentId) ?? rudy;

  const proficiencyToScore = (prof: string): number => {
    switch (prof) {
      case "Expert":
        return 95;
      case "Advanced":
        return 85;
      case "Intermediate":
        return 65;
      case "Beginner":
        return 45;
      default:
        return 60;
    }
  };

  const updatedSkills: SkillScore[] = [...student.skills];

  resumeSkills.forEach((s) => {
    const score = proficiencyToScore(s.proficiency);
    const existingIndex = updatedSkills.findIndex((item) => item.skillId === s.skillId);
    if (existingIndex !== -1) {
      updatedSkills[existingIndex] = {
        ...updatedSkills[existingIndex],
        score,
      };
    } else {
      updatedSkills.push({
        skillId: s.skillId,
        score,
      });
    }
  });

  student.skills = updatedSkills;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`theplug-student-skills-${studentId}`, JSON.stringify(updatedSkills));
    } catch (e) {
      console.error("Failed to persist synced resume skills", e);
    }
  }

  return updatedSkills;
}

export async function getTopSkillGaps(studentId: string = "s1"): Promise<SkillGapItem[]> {
  const studentSkills = getHydratedStudentSkills(studentId);
  const targets: Record<string, number> = {
    "cloud-computing": 70,
    docker: 60,
    postgresql: 70,
    aws: 55,
    fastapi: 70,
  };
  return studentSkills
    .filter((s) => targets[s.skillId] !== undefined)
    .map((s) => ({
      skillId: s.skillId,
      name: getSkillById(s.skillId)?.name ?? s.skillId,
      current: s.score,
      target: targets[s.skillId],
      gap: Math.max(0, targets[s.skillId] - s.score),
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);
}

export async function getSkillRadar(studentId: string = "s1") {
  const studentSkills = getHydratedStudentSkills(studentId);
  const categories: SkillCategory[] = [
    "Programming",
    "Web Development",
    "Cloud",
    "Cybersecurity",
    "Databases",
    "Soft Skills",
  ];
  return categories.map((category) => {
    const catSkillIds = skills.filter((s) => s.category === category).map((s) => s.id);
    const scores = studentSkills.filter((s) => catSkillIds.includes(s.skillId));
    const avg = scores.length
      ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
      : 0;
    return { category, score: avg };
  });
}

export async function getSkillGapAnalysis(studentId: string = "s1") {
  const student = getStudentById(studentId) ?? rudy;
  const studentSkills = getHydratedStudentSkills(studentId);

  const industryRequirements: Record<string, number> = {
    python: 75,
    fastapi: 70,
    postgresql: 65,
    docker: 60,
    aws: 55,
  };
  const comparison = Object.entries(industryRequirements).map(([skillId, required]) => {
    const current = studentSkills.find((s) => s.skillId === skillId)?.score ?? 0;
    return {
      skillId,
      name: getSkillById(skillId)?.name ?? skillId,
      yourScore: current,
      industryScore: required,
      gap: Math.max(0, required - current),
    };
  });
  return {
    careerGoal: student.careerGoal,
    careerReadiness: student.skillReadiness,
    comparison,
    recommendedIntervention: {
      title: "Backend Cloud Readiness Program",
      durationWeeks: 6,
      readinessBefore: student.skillReadiness,
      readinessAfter: Math.min(97, student.skillReadiness + 15),
      skillsDeveloped: ["Docker", "PostgreSQL", "AWS"],
    },
  };
}

export async function getInstitutionSkillComparison() {
  return institutionAnalytics.skillComparison;
}
