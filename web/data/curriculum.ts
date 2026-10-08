// Curriculum data for the Faculty section.
// A subject is broken into topics. Each topic lists which skill ids it teaches.
// Skill ids must match the ids in data/skills.ts.

export interface CurriculumTopic {
  id: string;
  name: string;
  hours: number;
  // true  = must be taught even if industry does not ask for it by name
  // false = its value depends on whether industry still wants it
  foundational: boolean;
  // which skills from data/skills.ts this topic actually builds
  skillIds: string[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: number;
  department: string;
  credits: number;
  studentsEnrolled: number;
  // the skills this subject SHOULD reasonably cover for its domain.
  // anything listed here but not taught by any topic becomes a "missing" skill.
  industrySkillIds: string[];
  topics: CurriculumTopic[];
}

export const subjects: Subject[] = [
  {
    id: "cs301",
    code: "CS301",
    name: "Database Management Systems",
    semester: 5,
    department: "Computer Science",
    credits: 4,
    studentsEnrolled: 68,
    industrySkillIds: [
      "sql",
      "postgresql",
      "mongodb",
      "redis",
      "cloud-computing",
    ],
    topics: [
      {
        id: "t1",
        name: "ER Modelling & Normalization",
        hours: 8,
        foundational: true,
        skillIds: ["sql"],
      },
      {
        id: "t2",
        name: "Relational Algebra & SQL Queries",
        hours: 10,
        foundational: true,
        skillIds: ["sql", "postgresql"],
      },
      {
        id: "t3",
        name: "Transactions & Concurrency Control",
        hours: 8,
        foundational: true,
        skillIds: ["sql"],
      },
      {
        id: "t4",
        name: "Indexing & Query Optimization",
        hours: 6,
        foundational: false,
        skillIds: ["postgresql", "sql"],
      },
      {
        id: "t5",
        name: "Hierarchical & Network Data Models",
        hours: 4,
        foundational: false,
        skillIds: [],
      },
      {
        id: "t6",
        name: "File Organization & B-Trees",
        hours: 6,
        foundational: true,
        skillIds: [],
      },
    ],
  },
  {
    id: "cs302",
    code: "CS302",
    name: "Computer Networks",
    semester: 5,
    department: "Computer Science",
    credits: 4,
    studentsEnrolled: 72,
    industrySkillIds: [
      "networking",
      "cybersecurity",
      "linux",
      "cloud-computing",
      "docker",
    ],
    topics: [
      {
        id: "t1",
        name: "OSI & TCP/IP Reference Models",
        hours: 8,
        foundational: true,
        skillIds: ["networking"],
      },
      {
        id: "t2",
        name: "Routing Algorithms & IP Addressing",
        hours: 10,
        foundational: true,
        skillIds: ["networking"],
      },
      {
        id: "t3",
        name: "Transport Layer & Congestion Control",
        hours: 8,
        foundational: true,
        skillIds: ["networking"],
      },
      {
        id: "t4",
        name: "Network Security Fundamentals",
        hours: 6,
        foundational: false,
        skillIds: ["cybersecurity", "networking"],
      },
      {
        id: "t5",
        name: "ATM & Token Ring Networks",
        hours: 4,
        foundational: false,
        skillIds: [],
      },
    ],
  },
  {
    id: "cs303",
    code: "CS303",
    name: "Operating Systems",
    semester: 5,
    department: "Computer Science",
    credits: 4,
    studentsEnrolled: 75,
    industrySkillIds: ["linux", "docker", "kubernetes", "problem-solving"],
    topics: [
      {
        id: "t1",
        name: "Process Scheduling",
        hours: 10,
        foundational: true,
        skillIds: ["problem-solving"],
      },
      {
        id: "t2",
        name: "Memory Management & Paging",
        hours: 10,
        foundational: true,
        skillIds: [],
      },
      {
        id: "t3",
        name: "Deadlocks & Synchronization",
        hours: 8,
        foundational: true,
        skillIds: ["problem-solving"],
      },
      {
        id: "t4",
        name: "File Systems",
        hours: 6,
        foundational: true,
        skillIds: [],
      },
      {
        id: "t5",
        name: "Shell, System Calls & Linux Internals",
        hours: 6,
        foundational: false,
        skillIds: ["linux"],
      },
    ],
  },
  {
    id: "cs304",
    code: "CS304",
    name: "Web Technologies",
    semester: 7,
    department: "Computer Science",
    credits: 3,
    studentsEnrolled: 64,
    industrySkillIds: [
      "html-css",
      "react",
      "typescript",
      "nodejs",
      "rest-apis",
      "nextjs",
      "git",
    ],
    topics: [
      {
        id: "t1",
        name: "HTML5, CSS & Responsive Layout",
        hours: 8,
        foundational: true,
        skillIds: ["html-css"],
      },
      {
        id: "t2",
        name: "JavaScript & the DOM",
        hours: 8,
        foundational: true,
        skillIds: [],
      },
      {
        id: "t3",
        name: "Server-side Scripting with PHP",
        hours: 8,
        foundational: false,
        skillIds: [],
      },
      {
        id: "t4",
        name: "XML & SOAP Web Services",
        hours: 6,
        foundational: false,
        skillIds: [],
      },
      {
        id: "t5",
        name: "Introduction to REST APIs",
        hours: 4,
        foundational: false,
        skillIds: ["rest-apis"],
      },
    ],
  },
];

export function getSubjectById(id: string) {
  return subjects.find((s) => s.id === id);
}
