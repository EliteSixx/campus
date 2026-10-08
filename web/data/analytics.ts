export interface SkillDemandVsReadiness {
  skill: string;
  industryDemand: number;
  studentReadiness: number;
}

export const institutionAnalytics = {
  totalStudents: 500,
  placementReady: 182,
  nearReady: 147,
  criticalGap: 171,
  skillComparison: [
    { skill: "Python", industryDemand: 78, studentReadiness: 74 },
    { skill: "Cloud Computing", industryDemand: 72, studentReadiness: 21 },
    { skill: "Docker", industryDemand: 68, studentReadiness: 18 },
    { skill: "Cybersecurity", industryDemand: 61, studentReadiness: 42 },
    { skill: "React", industryDemand: 56, studentReadiness: 63 },
    { skill: "PostgreSQL", industryDemand: 52, studentReadiness: 40 },
    { skill: "Communication", industryDemand: 65, studentReadiness: 58 },
  ] as SkillDemandVsReadiness[],
  criticalGapSkill: {
    skill: "Cloud Computing",
    industryDemand: 72,
    studentReadiness: 21,
    gap: 51,
  },
  recommendedIntervention: {
    title: "Cloud & DevOps Industry Readiness Program",
    targetStudents: 143,
    durationWeeks: 6,
    readinessBefore: 36,
    readinessAfter: 52,
    studentsBecomingReady: 81,
    industryPartners: 8,
  },
  interventionPrograms: [
    {
      id: "p1",
      name: "Cloud & DevOps Bootcamp",
      skillFocus: "Cloud Computing, Docker, AWS",
      baseline: 36,
    },
    {
      id: "p2",
      name: "Cybersecurity Fundamentals Sprint",
      skillFocus: "Cybersecurity, Networking",
      baseline: 42,
    },
    {
      id: "p3",
      name: "Backend Systems Accelerator",
      skillFocus: "PostgreSQL, FastAPI, REST APIs",
      baseline: 48,
    },
    {
      id: "p4",
      name: "Full Stack Readiness Track",
      skillFocus: "React, Node.js, TypeScript",
      baseline: 55,
    },
  ],
};

export const industryAnalytics = {
  activeOpportunities: 12,
  totalApplicants: 240,
  averageMatch: 71,
  topSkillDemand: [
    { skill: "Python", trend: 14 },
    { skill: "Cloud Computing", trend: 24 },
    { skill: "React", trend: 9 },
    { skill: "Docker", trend: 18 },
    { skill: "Cybersecurity", trend: 12 },
  ],
  marketInsights: [
    { skill: "Cloud Computing", change: 24 },
    { skill: "Docker", change: 18 },
    { skill: "Cybersecurity", change: 12 },
    { skill: "Python", change: 14 },
    { skill: "React", change: 9 },
  ],
};

export const facultyProfile = {
  name: "Dr. Shiba Narayan Mishra",
  department: "Computer Science",
  currentExpertise: ["Networking", "Python", "Operating Systems"],
  industryExposure: "Moderate",
  recommendedProgram: {
    title: "Cloud Security Industry Immersion",
    durationWeeks: 4,
    skillAlignment: 78,
  },
  departmentGaps: [
    { skill: "Cloud Computing", studentsStruggling: 118 },
    { skill: "Docker", studentsStruggling: 96 },
    { skill: "DevOps", studentsStruggling: 84 },
  ],
  facultyDevelopmentProgram: {
    title: "Faculty Cloud & DevOps Enablement Track",
    durationWeeks: 4,
    outcome:
      "Equip faculty to mentor Cloud/DevOps project work and co-teach industry-aligned modules.",
  },
};

export const skillDevelopmentStages = [
  "Assessment Completed",
  "Skill Gap Identified",
  "Learning Program Recommended",
  "Project Assigned",
  "Placement Ready",
] as const;

export const rudyCurrentStageIndex = 2; // "Learning Program Recommended"
