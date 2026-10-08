export interface SkillScore {
  skillId: string;
  score: number; // 0-100 current proficiency
}

export interface EvidenceItem {
  label: string;
  verified: boolean;
}

export interface SkillEvidence {
  skillId: string;
  confidence: number; // 0-100
  evidence: EvidenceItem[];
}

export type ReadinessBucket = "Placement Ready" | "Near Ready" | "Critical Gap";

export interface Student {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  department: string;
  year: string;
  careerGoal: string;
  employabilityScore: number;
  skillReadiness: number;
  profileStrength: number;
  applications: number;
  readiness: ReadinessBucket;
  skills: SkillScore[];
  evidence?: SkillEvidence[];
}

const firstNames = [
  "Rudy", "Ananya", "Kabir", "Meera", "Arjun", "Ishita", "Rohan", "Sanya",
  "Devansh", "Priya", "Vikram", "Nisha", "Aarav", "Tanvi", "Karan", "Riya",
  "Yash", "Simran", "Aditya", "Neha",
];
const lastNames = [
  "Sharma", "Iyer", "Kapoor", "Nair", "Reddy", "Gupta", "Chauhan", "Das",
  "Menon", "Verma", "Singh", "Rao", "Bansal", "Joshi", "Malhotra", "Pillai",
  "Agarwal", "Kaur", "Bhat", "Chatterjee",
];
const departments = ["Computer Science", "Information Technology", "Electronics", "Data Science"];
const goals = ["Backend Engineer", "Cloud Engineer", "Frontend Engineer", "Security Analyst", "Data Engineer"];

function bucketFor(readiness: number): ReadinessBucket {
  if (readiness >= 70) return "Placement Ready";
  if (readiness >= 45) return "Near Ready";
  return "Critical Gap";
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSkillSet(rand: () => number): SkillScore[] {
  const skillIds = [
    "python", "java", "dsa", "react", "nodejs", "fastapi", "rest-apis",
    "aws", "docker", "cloud-computing", "linux", "networking", "cybersecurity",
    "postgresql", "mongodb", "sql", "communication", "teamwork", "git", "project-management",
  ];
  return skillIds.map((skillId) => ({
    skillId,
    score: Math.round(20 + rand() * 70),
  }));
}

const generated: Student[] = Array.from({ length: 19 }).map((_, i) => {
  const rand = seededRandom(i * 17 + 3);
  const skillsSet = generateSkillSet(rand);
  const skillReadiness = Math.round(skillsSet.reduce((a, s) => a + s.score, 0) / skillsSet.length);
  const employabilityScore = Math.min(97, Math.round(skillReadiness * 0.9 + rand() * 15));
  const profileStrength = Math.round(50 + rand() * 45);
  return {
    id: `s${i + 2}`,
    name: `${firstNames[(i + 1) % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`,
    department: departments[i % departments.length],
    year: `${2 + (i % 3)}${["nd", "rd", "th"][i % 3]} Year`,
    careerGoal: goals[i % goals.length],
    employabilityScore,
    skillReadiness,
    profileStrength,
    applications: Math.round(rand() * 10),
    readiness: bucketFor(skillReadiness),
    skills: skillsSet,
  };
});

export const rudy: Student = {
  id: "s1",
  name: "Rudy Sharma",
  department: "Computer Science",
  year: "2nd Year",
  careerGoal: "Backend Engineer",
  employabilityScore: 72,
  skillReadiness: 68,
  profileStrength: 85,
  applications: 6,
  readiness: "Near Ready",
  skills: [
    { skillId: "python", score: 82 },
    { skillId: "react", score: 75 },
    { skillId: "networking", score: 68 },
    { skillId: "linux", score: 63 },
    { skillId: "postgresql", score: 48 },
    { skillId: "cloud-computing", score: 32 },
    { skillId: "docker", score: 28 },
    { skillId: "aws", score: 20 },
    { skillId: "fastapi", score: 65 },
    { skillId: "dsa", score: 71 },
    { skillId: "git", score: 88 },
    { skillId: "rest-apis", score: 70 },
    { skillId: "communication", score: 76 },
    { skillId: "teamwork", score: 80 },
    { skillId: "sql", score: 66 },
    { skillId: "mongodb", score: 40 },
    { skillId: "cybersecurity", score: 45 },
    { skillId: "project-management", score: 55 },
    { skillId: "nodejs", score: 58 },
    { skillId: "java", score: 50 },
  ],
  evidence: [
    {
      skillId: "python",
      confidence: 87,
      evidence: [
        { label: "Technical Assessment", verified: true },
        { label: "GitHub Project", verified: true },
        { label: "Coding Challenge", verified: true },
        { label: "Faculty Evaluation", verified: true },
      ],
    },
    {
      skillId: "react",
      confidence: 79,
      evidence: [
        { label: "Technical Assessment", verified: true },
        { label: "GitHub Project", verified: true },
        { label: "Coding Challenge", verified: false },
        { label: "Faculty Evaluation", verified: true },
      ],
    },
    {
      skillId: "postgresql",
      confidence: 54,
      evidence: [
        { label: "Technical Assessment", verified: true },
        { label: "GitHub Project", verified: false },
        { label: "Coding Challenge", verified: false },
        { label: "Faculty Evaluation", verified: false },
      ],
    },
    {
      skillId: "cloud-computing",
      confidence: 38,
      evidence: [
        { label: "Technical Assessment", verified: false },
        { label: "GitHub Project", verified: false },
        { label: "Coding Challenge", verified: true },
        { label: "Faculty Evaluation", verified: false },
      ],
    },
  ],
};

export const students: Student[] = [rudy, ...generated];

export function getStudentById(id: string) {
  return students.find((s) => s.id === id);
}
