/**
 * Skill Gap Analyzer Engine
 * Strictly scoped within features/samir
 *
 * Evaluates a student's acquired skills against the 10 technology companies,
 * calculates match percentages, identifies missing competencies,
 * sequences recommended learning order, and constructs custom roadmaps.
 */

import { TECH_COMPANIES, TechCompany, PREPARATION_ROADMAPS, PreparationRoadmap } from "./career-intelligence";

export interface CompanyMatchResult {
  company: TechCompany;
  matchScore: number; // 0 to 100
  matchedSkills: string[];
  missingSkills: string[];
  recommendedLearningOrder: string[];
  suggestedProjects: {
    title: string;
    description: string;
    skillsTargeted: string[];
  }[];
  interviewPrepTopics: {
    coding: string[];
    systemDesign: string[];
    behavioral: string[];
  };
}

export interface SkillGapAnalysisResult {
  studentSkills: string[];
  closestCompanies: CompanyMatchResult[];
  overallMissingSkills: string[];
  recommendedLearningOrder: string[];
  universalProjects: {
    title: string;
    description: string;
    skillsTargeted: string[];
  }[];
  interviewPrepTopics: {
    coding: string[];
    systemDesign: string[];
    behavioral: string[];
  };
  roadmaps: PreparationRoadmap[];
}

export const ALL_AVAILABLE_SKILLS: string[] = [
  "Data Structures and Algorithms",
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "TypeScript",
  "C#",
  "Swift",
  "CUDA",
  "SQL",
  "System Design",
  "Cloud Computing",
  "AWS",
  "Azure",
  "Google Cloud (GCP)",
  "Machine Learning and AI",
  "Deep Learning",
  "Computer Architecture",
  "Parallel Computing",
  "Embedded Systems",
  "iOS Development",
  "Operating Systems",
  "Computer Networks",
  "Git & GitHub",
  "Docker & Containers",
  "APIs & Microservices",
  "UI/UX & Frontend",
  "Cybersecurity",
  "Data Engineering",
  "Problem Solving",
  "Communication",
  "Project Management"
];

// Presets for quick student testing
export const STUDENT_PRESETS = [
  {
    name: "CS Sophomore (Fundamentals)",
    skills: ["Data Structures and Algorithms", "Python", "Java", "SQL", "Problem Solving", "Git & GitHub"]
  },
  {
    name: "Full-Stack Web Dev Intern",
    skills: ["JavaScript", "TypeScript", "Python", "SQL", "APIs & Microservices", "UI/UX & Frontend", "Git & GitHub", "Cloud Computing"]
  },
  {
    name: "AI / Data Science Aspirant",
    skills: ["Python", "SQL", "Machine Learning and AI", "Deep Learning", "Data Engineering", "Problem Solving", "Communication"]
  },
  {
    name: "Systems & Cloud Specialist",
    skills: ["C++", "Java", "Data Structures and Algorithms", "System Design", "Cloud Computing", "AWS", "Operating Systems", "Computer Networks"]
  }
];

function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/[^a-z0-9+]/g, "")
    .trim();
}

export function analyzeSkillGap(studentSkills: string[]): SkillGapAnalysisResult {
  const normalizedUserSkills = new Set(studentSkills.map(normalizeSkill));

  const rankedCompanies: CompanyMatchResult[] = TECH_COMPANIES.map((company) => {
    // Combine company core skills
    const companyTargetSkills = Array.from(
      new Set([
        ...company.importantSkills,
        ...company.programmingLanguages.slice(0, 3),
        ...(company.cloudRequirements.length > 0 ? ["Cloud Computing"] : []),
        ...(company.aiMlRequirements.length > 0 ? ["Machine Learning and AI"] : [])
      ])
    );

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    companyTargetSkills.forEach((skill) => {
      const norm = normalizeSkill(skill);
      const isMatched =
        normalizedUserSkills.has(norm) ||
        Array.from(normalizedUserSkills).some(
          (uSkill) => uSkill.includes(norm) || norm.includes(uSkill)
        );

      if (isMatched) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const score = Math.min(
      100,
      Math.max(10, Math.round((matchedSkills.length / Math.max(1, companyTargetSkills.length)) * 100))
    );

    // Learning sequence order for missing skills
    const priorityBuckets: { [bucket: string]: string[] } = {
      fundamentals: [],
      languages: [],
      systemsAndData: [],
      cloudAndInfra: [],
      advanced: []
    };

    missingSkills.forEach((skill) => {
      const lower = skill.toLowerCase();
      if (lower.includes("data structure") || lower.includes("algorithm") || lower.includes("problem solving")) {
        priorityBuckets.fundamentals.push(skill);
      } else if (lower.includes("python") || lower.includes("java") || lower.includes("c++") || lower.includes("c#") || lower.includes("swift")) {
        priorityBuckets.languages.push(skill);
      } else if (lower.includes("sql") || lower.includes("database") || lower.includes("system design") || lower.includes("operating")) {
        priorityBuckets.systemsAndData.push(skill);
      } else if (lower.includes("cloud") || lower.includes("aws") || lower.includes("azure") || lower.includes("network")) {
        priorityBuckets.cloudAndInfra.push(skill);
      } else {
        priorityBuckets.advanced.push(skill);
      }
    });

    const recommendedLearningOrder = [
      ...priorityBuckets.fundamentals,
      ...priorityBuckets.languages,
      ...priorityBuckets.systemsAndData,
      ...priorityBuckets.cloudAndInfra,
      ...priorityBuckets.advanced
    ];

    return {
      company,
      matchScore: score,
      matchedSkills,
      missingSkills,
      recommendedLearningOrder,
      suggestedProjects: company.sampleProjects,
      interviewPrepTopics: company.interviewTopics
    };
  });

  // Sort by match score descending
  rankedCompanies.sort((a, b) => b.matchScore - a.matchScore);

  // Overall missing skills across top 3 closest companies
  const topCompanies = rankedCompanies.slice(0, 3);
  const overallMissingSet = new Set<string>();
  topCompanies.forEach((res) => res.missingSkills.forEach((s) => overallMissingSet.add(s)));
  const overallMissingSkills = Array.from(overallMissingSet);

  // Universal recommended learning order
  const universalPriority: string[] = [];
  ["Data Structures and Algorithms", "Python", "Java", "SQL", "System Design", "Cloud Computing", "Machine Learning and AI"].forEach(
    (core) => {
      if (overallMissingSkills.some((s) => s.toLowerCase().includes(core.toLowerCase()))) {
        universalPriority.push(core);
      }
    }
  );
  overallMissingSkills.forEach((s) => {
    if (!universalPriority.includes(s)) universalPriority.push(s);
  });

  // Top company projects combined
  const universalProjects = topCompanies.flatMap((c) => c.suggestedProjects).slice(0, 4);

  // Consolidated interview prep topics
  const interviewPrepTopics = {
    coding: Array.from(new Set(topCompanies.flatMap((c) => c.interviewPrepTopics.coding))).slice(0, 6),
    systemDesign: Array.from(new Set(topCompanies.flatMap((c) => c.interviewPrepTopics.systemDesign))).slice(0, 6),
    behavioral: Array.from(new Set(topCompanies.flatMap((c) => c.interviewPrepTopics.behavioral))).slice(0, 6)
  };

  return {
    studentSkills,
    closestCompanies: rankedCompanies,
    overallMissingSkills,
    recommendedLearningOrder: universalPriority,
    universalProjects,
    interviewPrepTopics,
    roadmaps: PREPARATION_ROADMAPS
  };
}
