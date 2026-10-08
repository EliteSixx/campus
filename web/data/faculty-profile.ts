export interface OfficeHour {
  day: string;
  slot: string;
}

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: number;
  type: "Journal" | "Conference" | "Book Chapter";
  coAuthors: string;
  citations: number;
  doi?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  agency: string;
  role: string;
  duration: string;
  funding: string;
  status: "Ongoing" | "Completed" | "Under Review";
  studentsInvolved: number;
}

export interface FacultyProfileDetail {
  name: string;
  designation: string;
  department: string;
  employeeId: string;
  initials: string;
  qualification: string;
  specialization: string[];
  yearsOfExperience: number;
  teachingSince: number;
  email: string;
  officeRoom: string;
  officeHours: OfficeHour[];
  bio: string;
  subjectIds: string[];
  researchInterests: string[];
  expertiseAreas: { area: string; level: number }[];
  publications: Publication[];
  projects: ResearchProject[];
}

export const facultyProfileDetail: FacultyProfileDetail = {
  name: "Dr. Shiba Narayan Mishra",
  designation: "Associate Professor",
  department: "Computer Science & Engineering",
  employeeId: "EMP-CSE-2041",
  initials: "SM",
  qualification:
    "Ph.D. in Computer Science (NIT Rourkela), M.Tech (CSE), B.Tech (CSE)",
  specialization: [
    "Computer Networks",
    "Operating Systems",
    "Applied Python",
    "Network Security",
  ],
  yearsOfExperience: 12,
  teachingSince: 2014,
  email: "shiba.mishra@university.edu",
  officeRoom: "CSE Block, Room 214",
  officeHours: [
    { day: "Monday", slot: "2:00 PM – 4:00 PM" },
    { day: "Wednesday", slot: "11:00 AM – 1:00 PM" },
    { day: "Friday", slot: "3:00 PM – 5:00 PM" },
  ],
  bio: "Associate Professor in Computer Science with twelve years of teaching and applied research experience. Works on keeping the department's curriculum aligned with what industry actually hires for, and supervises final-year projects in systems and network security.",
  subjectIds: ["cs301", "cs302", "cs303", "cs304"],
  researchInterests: [
    "Software-defined networking",
    "Intrusion detection using machine learning",
    "Operating system scheduling for containerised workloads",
    "Curriculum design and employability analytics",
  ],
  expertiseAreas: [
    { area: "Computer Networks", level: 92 },
    { area: "Operating Systems", level: 88 },
    { area: "Network Security", level: 79 },
    { area: "Python & Applied Programming", level: 84 },
    { area: "Cloud & Containerisation", level: 46 },
  ],
  publications: [
    {
      id: "p1",
      title: "A Lightweight Intrusion Detection Framework for Campus Networks",
      venue: "IEEE Transactions on Network and Service Management",
      year: 2025,
      type: "Journal",
      coAuthors: "with R. Panda, A. Mohanty",
      citations: 18,
      doi: "10.1109/TNSM.2025.004217",
    },
    {
      id: "p2",
      title: "Scheduling Trade-offs in Containerised Academic Workloads",
      venue: "International Conference on Distributed Computing Systems",
      year: 2024,
      type: "Conference",
      coAuthors: "with S. Behera",
      citations: 11,
    },
    {
      id: "p3",
      title: "Mapping Undergraduate Curricula to Industry Skill Demand",
      venue: "Journal of Engineering Education Transformations",
      year: 2024,
      type: "Journal",
      coAuthors: "sole author",
      citations: 26,
      doi: "10.16920/jeet.2024.v37i3.019",
    },
    {
      id: "p4",
      title: "Teaching Computer Networks Through Packet-Level Simulation",
      venue: "Advances in Engineering Pedagogy (Springer)",
      year: 2022,
      type: "Book Chapter",
      coAuthors: "with M. Sahoo",
      citations: 9,
    },
  ],
  projects: [
    {
      id: "pr1",
      title: "Campus Network Threat Telemetry Platform",
      agency: "AICTE RPS",
      role: "Principal Investigator",
      duration: "2025 – 2027",
      funding: "₹14.6 lakh",
      status: "Ongoing",
      studentsInvolved: 4,
    },
    {
      id: "pr2",
      title: "Skill Gap Analysis for Tier-2 Engineering Colleges",
      agency: "State Department of Higher Education",
      role: "Principal Investigator",
      duration: "2024 – 2026",
      funding: "₹8.2 lakh",
      status: "Ongoing",
      studentsInvolved: 3,
    },
    {
      id: "pr3",
      title: "Low-Cost Virtual Lab for Operating Systems Instruction",
      agency: "Institute Seed Grant",
      role: "Co-Investigator",
      duration: "2021 – 2023",
      funding: "₹3.5 lakh",
      status: "Completed",
      studentsInvolved: 6,
    },
  ],
};
