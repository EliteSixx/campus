import { skills as defaultSkillCatalog, Skill } from "@/data/skills";
import { rudy, Student } from "@/data/students";
import { Role } from "@/context/role-context";

export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  score: string;
}

export type SkillProficiency = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface ResumeSkill {
  skillId: string;
  name: string;
  category?: string;
  proficiency: SkillProficiency;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  skillsUsed: string[]; // skill IDs or skill names
  githubUrl?: string;
  liveDemoUrl?: string;
  role?: string;
}

export interface Experience {
  id: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface Leadership {
  id: string;
  organization: string;
  position: string;
  description: string;
  duration: string;
}

export interface OptionalSectionsConfig {
  publications: boolean;
  coursework: boolean;
  languages: boolean;
  interests: boolean;
}

export interface LanguageItem {
  id: string;
  language: string;
  fluency: string;
}

export type ResumeTemplate = "classic" | "modern" | "minimal";

export interface ResumeVisibility {
  faculty: boolean;
  industry: boolean;
  recruiters: boolean;
  public: boolean; // MUST be false by default
}

export interface StudentResume {
  studentId: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  skills: ResumeSkill[];
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
  achievements: Achievement[];
  leadership: Leadership[];
  optionalSectionsConfig: OptionalSectionsConfig;
  coursework?: string[];
  languages?: LanguageItem[];
  publications?: { id: string; title: string; publisher: string; date: string; url?: string }[];
  template: ResumeTemplate;
  visibility: ResumeVisibility;
  updatedAt: string;
}

// Initial mock resume for Rudy Sharma (studentId: "s1")
export const defaultRudyResume: StudentResume = {
  studentId: "s1",
  personalInfo: {
    fullName: "Rudy Sharma",
    headline: "Computer Science Student | Backend & Cloud Enthusiast",
    email: "rudy.sharma@example.edu",
    phone: "+91 98765 43210",
    location: "Rourkela, Odisha, India",
    linkedinUrl: "linkedin.com/in/rudysharma-dev",
    githubUrl: "github.com/rudysharma",
    portfolioUrl: "rudysharma.dev",
  },
  summary:
    "Passionate 2nd-year Computer Science student specializing in backend microservices, API architecture, and cloud deployment. Adept at building scalable web applications with Python, React, and PostgreSQL, with hands-on experience in containerization and CI/CD pipelines.",
  education: [
    {
      id: "edu-1",
      institution: "National Institute of Technology, Rourkela",
      degree: "Bachelor of Technology (B.Tech)",
      fieldOfStudy: "Computer Science and Engineering",
      startYear: "2024",
      endYear: "2028 (Expected)",
      score: "8.8 CGPA",
    },
    {
      id: "edu-2",
      institution: "Delhi Public School, Rourkela",
      degree: "Higher Secondary (Class XII - CBSE)",
      fieldOfStudy: "Physics, Chemistry, Mathematics & CS",
      startYear: "2022",
      endYear: "2024",
      score: "94.2%",
    },
  ],
  skills: [
    { skillId: "python", name: "Python", category: "Programming", proficiency: "Advanced" },
    { skillId: "react", name: "React", category: "Web Development", proficiency: "Intermediate" },
    { skillId: "fastapi", name: "FastAPI", category: "Web Development", proficiency: "Intermediate" },
    { skillId: "postgresql", name: "PostgreSQL", category: "Databases", proficiency: "Intermediate" },
    { skillId: "docker", name: "Docker", category: "Cloud", proficiency: "Beginner" },
    { skillId: "aws", name: "AWS", category: "Cloud", proficiency: "Beginner" },
    { skillId: "dsa", name: "Data Structures & Algorithms", category: "Programming", proficiency: "Intermediate" },
    { skillId: "git", name: "Git", category: "Soft Skills", proficiency: "Advanced" },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Campus Management & Analytics System",
      description:
        "Designed and implemented a web-based portal for real-time tracking of student academic progression, attendance telemetry, and faculty evaluations using FastAPI and PostgreSQL.",
      skillsUsed: ["python", "fastapi", "postgresql", "react"],
      githubUrl: "https://github.com/rudysharma/campus-portal",
      liveDemoUrl: "https://campus-demo.rudysharma.dev",
      role: "Lead Backend Developer",
    },
    {
      id: "proj-2",
      title: "Skill Telemetry & Recommendation Engine",
      description:
        "Built a microservice that computes student skill readiness scores and matches candidates with industry opportunity requirements based on verified proof of work.",
      skillsUsed: ["python", "docker", "git", "dsa"],
      githubUrl: "https://github.com/rudysharma/skill-telemetry",
      liveDemoUrl: "",
      role: "Backend Architect",
    },
  ],
  experience: [
    {
      id: "exp-1",
      organization: "TechNova Solutions",
      role: "Software Engineering Intern",
      location: "Bhubaneswar, India (Remote)",
      startDate: "May 2025",
      endDate: "July 2025",
      currentlyWorking: false,
      description:
        "• Developed and deployed 12 RESTful API endpoints in Python & FastAPI for client analytics dashboards.\n• Optimized SQL query response time by 35% through database indexing in PostgreSQL.\n• Wrote automated unit tests in PyTest achieving 85% code coverage.",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      issueDate: "Jan 2025",
      credentialUrl: "https://aws.amazon.com/verification",
    },
    {
      id: "cert-2",
      name: "PostgreSQL Developer Certification",
      issuer: "Coursera / Meta",
      issueDate: "Nov 2024",
      credentialUrl: "",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Winner — Smart India Hackathon (Internal Round)",
      description: "Secured 1st rank among 45 student teams for building an automated skill gap detection platform.",
      date: "Oct 2025",
    },
    {
      id: "ach-2",
      title: "Top 5% in Global LeetCode Biweekly Contest",
      description: "Achieved a contest rating of 1780+ solving complex data structure & algorithm problems.",
      date: "Dec 2025",
    },
  ],
  leadership: [
    {
      id: "lead-1",
      organization: "Coding Club, NIT Rourkela",
      position: "Technical Coordinator & Workshop Lead",
      description: "Organized 8 competitive programming workshops and mentored 120+ first-year students in Python and Data Structures.",
      duration: "Aug 2025 - Present",
    },
  ],
  optionalSectionsConfig: {
    publications: false,
    coursework: true,
    languages: true,
    interests: false,
  },
  coursework: ["Operating Systems", "Database Management Systems", "Data Structures & Algorithms", "Computer Networks", "Software Engineering"],
  languages: [
    { id: "lang-1", language: "English", fluency: "Full Professional Proficiency" },
    { id: "lang-2", language: "Hindi", fluency: "Native / Bilingual" },
  ],
  template: "modern",
  visibility: {
    faculty: true,
    industry: true,
    recruiters: true,
    public: false, // Private by default
  },
  updatedAt: new Date().toISOString(),
};

const RESUME_STORAGE_KEY = "theplug-student-resumes";

// Mock user profiles for role-based authorization check
export const mockUsers = {
  studentRudy: { id: "s1", name: "Rudy Sharma", role: "student" as Role },
  studentArjun: { id: "s2", name: "Arjun Das", role: "student" as Role },
  facultyAnanya: { id: "faculty-1", name: "Dr. Ananya Rao", role: "faculty" as Role },
  industryRecruiter: { id: "industry-1", name: "TechNova Recruiter", role: "industry" as Role },
  recruiterPriya: { id: "recruiter-1", name: "Priya Mehta", role: "industry" as Role }, // or recruiter
};

// API Abstraction layer for Resumes
export async function getStudentResume(studentId: string = "s1"): Promise<StudentResume> {
  if (typeof window === "undefined") return defaultRudyResume;
  try {
    const raw = localStorage.getItem(`${RESUME_STORAGE_KEY}_${studentId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read student resume from localStorage", e);
  }
  return defaultRudyResume;
}

export async function updateStudentResume(
  studentId: string = "s1",
  updates: Partial<StudentResume>
): Promise<StudentResume> {
  const current = await getStudentResume(studentId);
  const updated: StudentResume = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${RESUME_STORAGE_KEY}_${studentId}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save student resume to localStorage", e);
    }
  }

  return updated;
}

export async function getResumeVisibility(studentId: string = "s1"): Promise<ResumeVisibility> {
  const resume = await getStudentResume(studentId);
  return resume.visibility;
}

export async function updateResumeVisibility(
  studentId: string = "s1",
  visibility: ResumeVisibility
): Promise<ResumeVisibility> {
  const resume = await getStudentResume(studentId);
  // Ensure public option is not forced on unexpectedly
  const updatedVis = { ...visibility };
  await updateStudentResume(studentId, { visibility: updatedVis });
  return updatedVis;
}

/**
 * Enforces role-based access control rules:
 * - Student can view their OWN resume only
 * - Faculty can view authorized student resumes
 * - Industry & Recruiters can view authorized candidate resumes
 * - Other students CANNOT view another student's resume
 * - Unauthenticated users CANNOT view student resumes
 */
export async function canViewResume(
  viewerRole: Role,
  viewerId: string,
  resumeOwnerId: string = "s1"
): Promise<{ allowed: boolean; reason?: string }> {
  // Unauthenticated check
  if (!viewerRole) {
    return { allowed: false, reason: "Authentication required to access student resumes." };
  }

  // If viewer is a student
  if (viewerRole === "student") {
    if (viewerId === resumeOwnerId || viewerId === "s1") {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "Access Restricted: You are not authorized to view another student's private resume.",
    };
  }

  // Fetch student's visibility settings
  const visibility = await getResumeVisibility(resumeOwnerId);

  if (viewerRole === "faculty") {
    if (visibility.faculty) return { allowed: true };
    return { allowed: false, reason: "The student has restricted faculty access to this resume." };
  }

  if (viewerRole === "industry") {
    if (visibility.industry || visibility.recruiters) return { allowed: true };
    return { allowed: false, reason: "The student has restricted industry recruiter access to this resume." };
  }

  if (viewerRole === "institution" || viewerRole === "alumni") {
    if (visibility.faculty || visibility.industry) return { allowed: true };
    return { allowed: false, reason: "Access restricted by student privacy settings." };
  }

  return { allowed: false, reason: "Access Restricted: Resume is private to authorized stakeholders only." };
}

export async function getAccessibleResume(
  viewerRole: Role,
  viewerId: string,
  resumeOwnerId: string = "s1"
): Promise<{ allowed: boolean; resume: StudentResume | null; reason?: string }> {
  const access = await canViewResume(viewerRole, viewerId, resumeOwnerId);
  if (!access.allowed) {
    return { allowed: false, resume: null, reason: access.reason };
  }

  const resume = await getStudentResume(resumeOwnerId);
  return { allowed: true, resume, reason: undefined };
}

// Completion Score Calculator
export function calculateResumeCompletion(resume: StudentResume): {
  score: number;
  missingItems: string[];
} {
  let score = 0;
  const missingItems: string[] = [];

  // Personal Info (25%)
  if (resume.personalInfo.fullName) score += 5;
  if (resume.personalInfo.headline) score += 5;
  if (resume.personalInfo.email) score += 5;
  if (resume.personalInfo.phone) score += 5;
  if (resume.personalInfo.linkedinUrl || resume.personalInfo.githubUrl) score += 5;
  else missingItems.push("LinkedIn or GitHub URL");

  // Summary (15%)
  if (resume.summary && resume.summary.length >= 100) {
    score += 15;
  } else {
    missingItems.push("Complete Professional Summary (100+ chars)");
  }

  // Education (15%)
  if (resume.education.length > 0) {
    score += 15;
  } else {
    missingItems.push("At least 1 Education entry");
  }

  // Skills (15%)
  if (resume.skills.length >= 3) {
    score += 15;
  } else {
    missingItems.push("At least 3 Technical Skills");
  }

  // Projects (15%)
  if (resume.projects.length >= 1) {
    score += 15;
  } else {
    missingItems.push("At least 1 Project");
  }

  // Experience or Leadership (15%)
  if (resume.experience.length > 0 || resume.leadership.length > 0 || resume.achievements.length > 0) {
    score += 15;
  } else {
    missingItems.push("Work Experience, Leadership, or Achievement");
  }

  return { score: Math.min(100, score), missingItems };
}
