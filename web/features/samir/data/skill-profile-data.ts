import { getSkillById } from "@/data/skills";
import { currentStudent } from "./current-student";

export interface SkillEvidenceItem {
  label: string;
  verified: boolean;
  issuer?: string;
  date?: string;
  credentialId?: string;
}

export interface SkillEvidenceRecord {
  skillId: string;
  name: string;
  category: string;
  score: number;
  confidence: number;
  evidence: SkillEvidenceItem[];
}

export interface IndustryComparisonItem {
  skillId: string;
  name: string;
  category: string;
  yourScore: number;
  industryScore: number;
  gap: number;
  importance: "Critical" | "High" | "Medium";
}

export interface ProfessionalSkillProfileData {
  studentId: string;
  studentName: string;
  department: string;
  year: string;
  careerGoal: string;
  careerReadiness: number;
  readinessBucket: "Placement Ready" | "Near Ready" | "Critical Gap";
  employabilityScore: number;
  profileStrength: number;
  radar: {
    category: string;
    score: number;
    benchmark: number;
  }[];
  comparison: IndustryComparisonItem[];
  evidenceRecords: SkillEvidenceRecord[];
  recommendedIntervention: {
    title: string;
    description: string;
    durationWeeks: number;
    readinessBefore: number;
    readinessAfter: number;
    skillsDeveloped: string[];
    certificationTrack: string;
  };
}

export const professionalSkillProfile: ProfessionalSkillProfileData = {
  studentId: "s1",
  studentName: "Rudy Sharma",
  department: "Computer Science & Engineering",
  year: "3rd Year",
  careerGoal: "Backend Engineer",
  careerReadiness: 76,
  readinessBucket: "Placement Ready",
  employabilityScore: 84,
  profileStrength: 92,
  radar: [
    { category: "Programming", score: 86, benchmark: 80 },
    { category: "Web Development", score: 79, benchmark: 75 },
    { category: "Cloud & DevOps", score: 68, benchmark: 70 },
    { category: "Databases", score: 76, benchmark: 75 },
    { category: "Cybersecurity", score: 71, benchmark: 65 },
    { category: "Soft Skills", score: 84, benchmark: 75 },
  ],
  comparison: [
    {
      skillId: "python",
      name: "Python (Async & Core)",
      category: "Programming",
      yourScore: 88,
      industryScore: 85,
      gap: 0,
      importance: "Critical",
    },
    {
      skillId: "dsa",
      name: "Data Structures & Algorithms",
      category: "Programming",
      yourScore: 84,
      industryScore: 80,
      gap: 0,
      importance: "Critical",
    },
    {
      skillId: "fastapi",
      name: "FastAPI & REST Architecture",
      category: "Web Development",
      yourScore: 78,
      industryScore: 75,
      gap: 0,
      importance: "High",
    },
    {
      skillId: "postgresql",
      name: "PostgreSQL & Query Optimization",
      category: "Databases",
      yourScore: 72,
      industryScore: 75,
      gap: 3,
      importance: "High",
    },
    {
      skillId: "docker",
      name: "Docker & Containerization",
      category: "Cloud & DevOps",
      yourScore: 68,
      industryScore: 75,
      gap: 7,
      importance: "High",
    },
    {
      skillId: "aws",
      name: "AWS Cloud Infrastructure",
      category: "Cloud & DevOps",
      yourScore: 58,
      industryScore: 70,
      gap: 12,
      importance: "Medium",
    },
  ],
  evidenceRecords: [
    {
      skillId: "python",
      name: "Python",
      category: "Programming",
      score: 88,
      confidence: 94,
      evidence: [
        {
          label: "BPUT Dept. Advanced Python Coding Examination (Grade O / 96%)",
          verified: true,
          issuer: "BPUT Examination Cell",
        },
        {
          label: "GitHub Verified Repo: Distributed Crawler & Async Task Engine",
          verified: true,
          issuer: "GitHub CI Automated Scan",
        },
        {
          label: "HackerRank Gold Badge — 5-Star Python Proficiency",
          verified: true,
          issuer: "HackerRank Verified",
        },
        {
          label: "Proctored Lab Viva by Dr. K. Panda (Faculty Verified Sign-off)",
          verified: true,
          issuer: "Dept. of Computer Science",
        },
      ],
    },
    {
      skillId: "dsa",
      name: "Data Structures & Algorithms",
      category: "Programming",
      score: 84,
      confidence: 90,
      evidence: [
        {
          label: "LeetCode Contest Rating 1780 (340+ Problems Solved)",
          verified: true,
          issuer: "LeetCode API Verified",
        },
        {
          label: "GeeksforGeeks Institute Rank #8 (Algorithms Capstone)",
          verified: true,
          issuer: "GFG Campus Chapter",
        },
        {
          label: "BPUT Data Structures Practical Exam (Grade O / 95%)",
          verified: true,
          issuer: "BPUT Academic Records",
        },
        {
          label: "CodeChef Division 2 Active Competitive Rating",
          verified: true,
          issuer: "CodeChef Platform",
        },
      ],
    },
    {
      skillId: "fastapi",
      name: "FastAPI",
      category: "Web Development",
      score: 78,
      confidence: 85,
      evidence: [
        {
          label: "Production Async REST Gateway & OpenAPI 3.0 Specs",
          verified: true,
          issuer: "Live Endpoint Audit",
        },
        {
          label: "Postman Student Expert Certification (ID: PS-2024-9182)",
          verified: true,
          issuer: "Postman Academy",
        },
        {
          label: "OAuth2 & JWT Security Protocol Implementation",
          verified: true,
          issuer: "Security Lab Review",
        },
        {
          label: "Faculty Mentor Code Review (Sign-off Approved)",
          verified: true,
          issuer: "CSE Dept. Mentorship",
        },
      ],
    },
    {
      skillId: "postgresql",
      name: "PostgreSQL",
      category: "Databases",
      score: 72,
      confidence: 82,
      evidence: [
        {
          label: "Relational Schema Normalization & Query Tuning Lab (Grade A+)",
          verified: true,
          issuer: "Database Engineering Lab",
        },
        {
          label: "ACID Transaction & High-Concurrency Benchmark Report",
          verified: true,
          issuer: "Lab Viva Committee",
        },
        {
          label: "Enterprise ERP Database Capstone Implementation",
          verified: true,
          issuer: "Faculty Project Review",
        },
        {
          label: "PostgreSQL DBA Essentials Assessment (Score: 84%)",
          verified: true,
          issuer: "Coursera / Meta Certificate",
        },
      ],
    },
    {
      skillId: "docker",
      name: "Docker",
      category: "Cloud & DevOps",
      score: 68,
      confidence: 76,
      evidence: [
        {
          label: "Multi-Stage Dockerfile Containerization Pipeline",
          verified: true,
          issuer: "Campus DevOps Lab",
        },
        {
          label: "Docker Compose Microservices Mesh (Verified Artifact)",
          verified: true,
          issuer: "GitHub Repo Validation",
        },
        {
          label: "Container Security & Vulnerability Scan (Trivy)",
          verified: true,
          issuer: "Aqua Security Trivy",
        },
        {
          label: "Kubernetes Cluster Deployment Lab (In Progress)",
          verified: false,
          issuer: "Faculty Mentored Sprint",
        },
      ],
    },
    {
      skillId: "aws",
      name: "AWS",
      category: "Cloud & DevOps",
      score: 58,
      confidence: 68,
      evidence: [
        {
          label: "AWS Academy Cloud Foundations (Accreditation Badge)",
          verified: true,
          issuer: "AWS Academy / Credly",
        },
        {
          label: "VPC, EC2 & S3 Multi-Tier Architecture Deployment",
          verified: true,
          issuer: "Cloud Computing Lab Viva",
        },
        {
          label: "Serverless Lambda & DynamoDB Event Pipeline Lab",
          verified: true,
          issuer: "Capstone Review",
        },
        {
          label: "AWS Solutions Architect Associate (Target: Dec 2026)",
          verified: false,
          issuer: "Scheduled Exam",
        },
      ],
    },
    {
      skillId: "react",
      name: "React & Next.js",
      category: "Web Development",
      score: 80,
      confidence: 88,
      evidence: [
        {
          label: "CampusLink Next.js 14 App Router Frontend Implementation",
          verified: true,
          issuer: "Production Build Audit",
        },
        {
          label: "Zustand Global State & Real-time WebSockets Dashboard",
          verified: true,
          issuer: "Codebase Review",
        },
        {
          label: "Google Lighthouse Performance & Accessibility (Score: 98)",
          verified: true,
          issuer: "Chrome DevTools Audit",
        },
        {
          label: "BPUT Web Engineering Laboratory Evaluation (Grade A+)",
          verified: true,
          issuer: "BPUT Dept. Faculty",
        },
      ],
    },
    {
      skillId: "git",
      name: "Git & Version Control",
      category: "Soft Skills",
      score: 92,
      confidence: 95,
      evidence: [
        {
          label: "Gitflow Collaborative Team Sprint (60+ Pull Requests Merged)",
          verified: true,
          issuer: "GitHub Organization Audit",
        },
        {
          label: "GitHub Actions CI/CD Automated Test & Lint Workflows",
          verified: true,
          issuer: "Workflow Badge Passed",
        },
        {
          label: "Open-Source Contributions to Campus Placement Engine",
          verified: true,
          issuer: "Faculty Tech Lead",
        },
      ],
    },
  ],
  recommendedIntervention: {
    title: "Enterprise Backend & Cloud Acceleration Program",
    description:
      "A fast-track curriculum focused on bridging containerization and cloud infrastructure gaps for Tier-1 technology product roles.",
    durationWeeks: 6,
    readinessBefore: 76,
    readinessAfter: 92,
    skillsDeveloped: [
      "Docker Multi-Stage Deployments",
      "PostgreSQL Query Optimization & Indexing",
      "AWS Cloud Infrastructure & ECS Fargate",
    ],
    certificationTrack: "AWS Certified Developer & Docker Certified Associate",
  },
};

const RADAR_CATEGORY_MAP: Record<string, string> = {
  Programming: "Programming",
  "Web Development": "Web Development",
  Cloud: "Cloud & DevOps",
  Databases: "Databases",
  Cybersecurity: "Cybersecurity",
  "Soft Skills": "Soft Skills",
};

/**
 * The rich evidence and benchmark text above is static, but every score shown
 * to the student is taken from the shared current-student record so the Skill
 * Profile, Dashboard and Profile pages always agree.
 */
export async function getProfessionalSkillProfile(): Promise<ProfessionalSkillProfileData> {
  const base = professionalSkillProfile;
  const scoreOf = (id: string, fallback: number) =>
    currentStudent.skills.find((s) => s.skillId === id)?.score ?? fallback;

  const radar = base.radar.map((r) => {
    const inCategory = currentStudent.skills.filter(
      (s) => RADAR_CATEGORY_MAP[getSkillById(s.skillId)?.category ?? ""] === r.category
    );
    const score = inCategory.length
      ? Math.round(inCategory.reduce((sum, s) => sum + s.score, 0) / inCategory.length)
      : r.score;
    return { ...r, score };
  });

  return {
    ...base,
    studentId: currentStudent.id,
    studentName: currentStudent.name,
    department: currentStudent.department,
    year: currentStudent.year,
    careerGoal: currentStudent.careerGoal,
    careerReadiness: currentStudent.skillReadiness,
    readinessBucket: currentStudent.readiness,
    employabilityScore: currentStudent.employabilityScore,
    profileStrength: currentStudent.profileStrength,
    radar,
    comparison: base.comparison.map((c) => {
      const yourScore = scoreOf(c.skillId, c.yourScore);
      return { ...c, yourScore, gap: Math.max(0, c.industryScore - yourScore) };
    }),
    evidenceRecords: base.evidenceRecords.map((e) => ({ ...e, score: scoreOf(e.skillId, e.score) })),
    recommendedIntervention: {
      ...base.recommendedIntervention,
      readinessBefore: currentStudent.skillReadiness,
      readinessAfter: Math.min(100, currentStudent.skillReadiness + 16),
    },
  };
}
