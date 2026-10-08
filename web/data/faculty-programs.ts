export type ProgramType =
  | "FDP"
  | "Research Grant"
  | "Certification"
  | "Consultancy"
  | "Workshop";

export type ProgramMode = "Online" | "Hybrid" | "On-campus";

export interface FacultyProgram {
  id: string;
  title: string;
  provider: string;
  type: ProgramType;
  mode: ProgramMode;
  durationWeeks: number;
  startsIn: string;
  seatsLeft: number;
  funding: string;
  skillIds: string[];
  description: string;
  eligibility: string;
}

export const facultyPrograms: FacultyProgram[] = [
  {
    id: "fp1",
    title: "Cloud Security Industry Immersion",
    provider: "AWS Academy · IIT Bombay",
    type: "FDP",
    mode: "Hybrid",
    durationWeeks: 4,
    startsIn: "3 weeks",
    seatsLeft: 12,
    funding: "Fully sponsored",
    skillIds: ["cloud-computing", "aws", "cybersecurity", "linux"],
    description:
      "Hands-on immersion in cloud infrastructure security, IAM design and workload hardening, built for faculty who teach networking or security papers.",
    eligibility: "Assistant Professor and above, CSE/IT departments",
  },
  {
    id: "fp2",
    title: "Faculty Cloud & DevOps Enablement Track",
    provider: "NPTEL · Google Cloud",
    type: "FDP",
    mode: "Online",
    durationWeeks: 4,
    startsIn: "1 week",
    seatsLeft: 40,
    funding: "Fully sponsored",
    skillIds: ["docker", "kubernetes", "ci-cd", "cloud-computing"],
    description:
      "Containers, orchestration and CI/CD pipelines taught from a teaching perspective, including lab sheets you can reuse in your own course.",
    eligibility: "Open to all engineering faculty",
  },
  {
    id: "fp3",
    title: "Modern Full-Stack Web Development for Educators",
    provider: "Infosys Springboard",
    type: "FDP",
    mode: "Online",
    durationWeeks: 6,
    startsIn: "2 weeks",
    seatsLeft: 25,
    funding: "Fully sponsored",
    skillIds: ["react", "typescript", "nodejs", "nextjs", "rest-apis"],
    description:
      "Rebuilds a legacy web technologies syllabus around component frameworks, typed JavaScript and REST API design.",
    eligibility: "Faculty currently teaching web technologies or equivalent",
  },
  {
    id: "fp4",
    title: "AICTE Research Grant — Applied Systems Engineering",
    provider: "AICTE",
    type: "Research Grant",
    mode: "On-campus",
    durationWeeks: 52,
    startsIn: "Applications close in 6 weeks",
    seatsLeft: 8,
    funding: "Up to ₹18 lakh",
    skillIds: ["linux", "networking", "problem-solving"],
    description:
      "One-year grant for applied research in distributed systems, operating systems or network infrastructure, with two research assistantships included.",
    eligibility:
      "PhD holders with two or more publications in the last 3 years",
  },
  {
    id: "fp5",
    title: "Database Systems at Scale",
    provider: "PostgreSQL India · Persistent Systems",
    type: "Workshop",
    mode: "Hybrid",
    durationWeeks: 2,
    startsIn: "5 weeks",
    seatsLeft: 18,
    funding: "Travel reimbursed",
    skillIds: ["postgresql", "sql", "redis", "mongodb"],
    description:
      "Query planning, indexing strategy, caching layers and when NoSQL is the right answer. Built around production case studies.",
    eligibility: "Faculty teaching DBMS or data engineering papers",
  },
  {
    id: "fp6",
    title: "Industry Consultancy — Secure API Review Panel",
    provider: "Stripe India",
    type: "Consultancy",
    mode: "Online",
    durationWeeks: 12,
    startsIn: "4 weeks",
    seatsLeft: 4,
    funding: "Honorarium",
    skillIds: ["rest-apis", "cybersecurity", "cryptography"],
    description:
      "Part-time advisory role reviewing API security practices, with permission to anonymise findings for classroom use.",
    eligibility: "5+ years teaching experience in security or web systems",
  },
  {
    id: "fp7",
    title: "Offensive Security for Academic Labs",
    provider: "CERT-In · C-DAC",
    type: "Certification",
    mode: "On-campus",
    durationWeeks: 3,
    startsIn: "7 weeks",
    seatsLeft: 15,
    funding: "Partially sponsored",
    skillIds: ["pen-testing", "cybersecurity", "networking", "linux"],
    description:
      "Certification course covering penetration testing methodology and how to run a safe, legal offensive security lab on campus.",
    eligibility:
      "Faculty with prior networking or security teaching experience",
  },
  {
    id: "fp8",
    title: "Teaching Data Structures with Competitive Programming",
    provider: "CodeChef for Education",
    type: "Workshop",
    mode: "Online",
    durationWeeks: 2,
    startsIn: "2 weeks",
    seatsLeft: 60,
    funding: "Free",
    skillIds: ["dsa", "problem-solving", "cpp"],
    description:
      "Restructures a DSA course around contest-style problem sets, with an auto-graded problem bank for your own students.",
    eligibility: "Open to all faculty",
  },
  {
    id: "fp9",
    title: "Version Control and Collaborative Engineering Practice",
    provider: "GitHub Education",
    type: "Workshop",
    mode: "Online",
    durationWeeks: 1,
    startsIn: "1 week",
    seatsLeft: 100,
    funding: "Free",
    skillIds: ["git", "ci-cd", "teamwork"],
    description:
      "Short workshop on running student projects through real Git workflows, code review and automated checks.",
    eligibility: "Open to all faculty",
  },
  {
    id: "fp10",
    title: "SERB Core Research Grant — Cryptographic Protocols",
    provider: "SERB, Department of Science & Technology",
    type: "Research Grant",
    mode: "On-campus",
    durationWeeks: 104,
    startsIn: "Applications close in 9 weeks",
    seatsLeft: 5,
    funding: "Up to ₹30 lakh",
    skillIds: ["cryptography", "cybersecurity", "problem-solving"],
    description:
      "Two-year core research grant for work on applied cryptography, protocol verification or privacy-preserving systems.",
    eligibility: "PhD holders, principal investigator must be regular faculty",
  },
  {
    id: "fp11",
    title: "Python for Scientific Computing in the Classroom",
    provider: "NPTEL",
    type: "FDP",
    mode: "Online",
    durationWeeks: 8,
    startsIn: "3 weeks",
    seatsLeft: 200,
    funding: "Free",
    skillIds: ["python", "problem-solving"],
    description:
      "Eight-week programme on using Python as a teaching medium across systems, data and numerical methods courses.",
    eligibility: "Open to all faculty",
  },
  {
    id: "fp12",
    title: "Industry Mentor Programme — Backend Engineering",
    provider: "Razorpay Engineering",
    type: "Consultancy",
    mode: "Hybrid",
    durationWeeks: 16,
    startsIn: "6 weeks",
    seatsLeft: 6,
    funding: "Honorarium",
    skillIds: ["nodejs", "postgresql", "rest-apis", "docker"],
    description:
      "Faculty embed part-time with a backend team, then bring production practices back into final-year project supervision.",
    eligibility: "Faculty supervising final-year projects",
  },
];

export function getFacultyProgramById(id: string) {
  return facultyPrograms.find((p) => p.id === id);
}
