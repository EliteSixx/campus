export type SkillCategory =
  | "Programming"
  | "Web Development"
  | "Cloud"
  | "Cybersecurity"
  | "Databases"
  | "Soft Skills";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export const skills: Skill[] = [
  { id: "python", name: "Python", category: "Programming" },
  { id: "java", name: "Java", category: "Programming" },
  { id: "cpp", name: "C++", category: "Programming" },
  { id: "go", name: "Go", category: "Programming" },
  { id: "typescript", name: "TypeScript", category: "Programming" },
  { id: "dsa", name: "Data Structures & Algorithms", category: "Programming" },

  { id: "react", name: "React", category: "Web Development" },
  { id: "nextjs", name: "Next.js", category: "Web Development" },
  { id: "nodejs", name: "Node.js", category: "Web Development" },
  { id: "fastapi", name: "FastAPI", category: "Web Development" },
  { id: "rest-apis", name: "REST APIs", category: "Web Development" },
  { id: "html-css", name: "HTML / CSS", category: "Web Development" },

  { id: "aws", name: "AWS", category: "Cloud" },
  { id: "docker", name: "Docker", category: "Cloud" },
  { id: "kubernetes", name: "Kubernetes", category: "Cloud" },
  { id: "cloud-computing", name: "Cloud Computing", category: "Cloud" },
  { id: "ci-cd", name: "CI/CD", category: "Cloud" },
  { id: "linux", name: "Linux", category: "Cloud" },

  { id: "networking", name: "Networking", category: "Cybersecurity" },
  { id: "cybersecurity", name: "Cybersecurity", category: "Cybersecurity" },
  { id: "pen-testing", name: "Penetration Testing", category: "Cybersecurity" },
  { id: "cryptography", name: "Cryptography", category: "Cybersecurity" },

  { id: "postgresql", name: "PostgreSQL", category: "Databases" },
  { id: "mongodb", name: "MongoDB", category: "Databases" },
  { id: "sql", name: "SQL", category: "Databases" },
  { id: "redis", name: "Redis", category: "Databases" },

  { id: "communication", name: "Communication", category: "Soft Skills" },
  { id: "teamwork", name: "Teamwork", category: "Soft Skills" },
  { id: "problem-solving", name: "Problem Solving", category: "Soft Skills" },
  { id: "git", name: "Git", category: "Soft Skills" },
  { id: "project-management", name: "Project Management", category: "Soft Skills" },
];

export function getSkillById(id: string) {
  return skills.find((s) => s.id === id);
}
