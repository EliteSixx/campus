/* ==========================================================================
   Demo Alumni Data Provider — Typed, Coherent, Stable-ID Fixtures
   ========================================================================== */

// --------------- Institutions ---------------
export interface DemoInstitution {
  id: string;
  name: string;
  shortName: string;
  location: string;
}

export const INSTITUTIONS: DemoInstitution[] = [
  { id: "cupgs-odisha", name: "Central University of Post-Graduate Studies, Odisha", shortName: "CUPGS Odisha", location: "Koraput, Odisha" },
  { id: "nit-rourkela", name: "National Institute of Technology, Rourkela", shortName: "NIT Rourkela", location: "Rourkela, Odisha" },
];

// --------------- Demo Seed Date ---------------
export const DEMO_SEED_DATE = new Date("2026-09-10T10:00:00+05:30");

function daysAgo(n: number): string {
  const d = new Date(DEMO_SEED_DATE);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
function daysFromNow(n: number): string {
  const d = new Date(DEMO_SEED_DATE);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// --------------- Alumni Profiles ---------------
export interface DemoAlumni {
  id: string;
  name: string;
  email: string;
  institutionId: string;
  department: string;
  gradYear: string;
  jobTitle: string;
  employer: string;
  location: string;
  domain: string;
  bio: string;
  skills: string[];
  mentoringTopics: string[];
  availableForMentorship: boolean;
  avatarInitials: string;
  careerPath: string;
  membershipStatus: "approved" | "pending" | "rejected" | "suspended";
  timezone: string;
}

export const DEMO_ALUMNI: DemoAlumni[] = [
  {
    id: "alum-001",
    name: "Priya Mohanty",
    email: "priya.mohanty@gmail.com",
    institutionId: "cupgs-odisha",
    department: "Computer Science & Engineering",
    gradYear: "2021",
    jobTitle: "Senior Software Engineer",
    employer: "AsterCloud Labs",
    location: "Bengaluru, India",
    domain: "Software Engineering",
    bio: "Class of 2021 CSE graduate passionate about scalable backend systems and developer tooling. I enjoy helping juniors navigate the shift from college projects to production-grade engineering through mentorship, code reviews, and mock interviews.",
    skills: ["React", "TypeScript", "Node.js", "Go", "PostgreSQL", "System Design"],
    mentoringTopics: ["Resume Review", "Backend Development", "Interview Prep", "System Design"],
    availableForMentorship: true,
    avatarInitials: "PM",
    careerPath: "Intern @ TCS → SDE I @ Flipkart → Senior SDE @ AsterCloud Labs",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  {
    id: "alum-002",
    name: "Rohan Behera",
    email: "rohan.behera@outlook.com",
    institutionId: "cupgs-odisha",
    department: "Information Technology",
    gradYear: "2020",
    jobTitle: "Lead AI Research Engineer",
    employer: "NeuraForge AI",
    location: "Hyderabad, India",
    domain: "Data & AI",
    bio: "Exploring the intersection of LLMs and real-world applications. I lead a team of 6 building production NLP pipelines. Happy to mentor students interested in machine learning careers.",
    skills: ["PyTorch", "LLMs", "Deep Learning", "Python", "MLOps"],
    mentoringTopics: ["ML Career Path", "Research Projects", "Data Science Interviews"],
    availableForMentorship: true,
    avatarInitials: "RB",
    careerPath: "Data Intern @ Mu Sigma → ML Engineer @ Swiggy → Lead AI @ NeuraForge AI",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  {
    id: "alum-003",
    name: "Ananya Deshmukh",
    email: "ananya.d@proton.me",
    institutionId: "cupgs-odisha",
    department: "Electronics & Communication",
    gradYear: "2022",
    jobTitle: "Cloud Infrastructure Architect",
    employer: "CloudNova Solutions",
    location: "Pune, India",
    domain: "Cloud & Infra",
    bio: "Certified AWS Solutions Architect with 3+ years of experience in designing resilient cloud infrastructure. I enjoy helping ECE students transition into DevOps and cloud roles.",
    skills: ["AWS", "Terraform", "Docker", "Kubernetes", "Linux"],
    mentoringTopics: ["Cloud Certifications", "DevOps Transition", "Infrastructure Design"],
    availableForMentorship: false,
    avatarInitials: "AD",
    careerPath: "Cloud Engineer @ Wipro → Solutions Architect @ CloudNova",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  {
    id: "alum-004",
    name: "Kabir Verma",
    email: "kabir.verma@gmail.com",
    institutionId: "cupgs-odisha",
    department: "Computer Science & Engineering",
    gradYear: "2019",
    jobTitle: "Senior Product Manager",
    employer: "PayGrid Fintech",
    location: "Mumbai, India",
    domain: "Product & PM",
    bio: "From writing code to shaping products. 5 years into the PM journey, I now lead payments product strategy. Love to help CS grads explore the PM career path.",
    skills: ["Product Strategy", "A/B Testing", "SQL", "User Research"],
    mentoringTopics: ["PM Career Switch", "Product Case Studies", "Interview Prep"],
    availableForMentorship: true,
    avatarInitials: "KV",
    careerPath: "SDE @ Flipkart → APM @ Razorpay → Sr PM @ PayGrid Fintech",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  {
    id: "alum-005",
    name: "Sneha Pattanayak",
    email: "sneha.p@email.com",
    institutionId: "cupgs-odisha",
    department: "Computer Science & Engineering",
    gradYear: "2023",
    jobTitle: "Backend Engineer II",
    employer: "StackBridge Tech",
    location: "Remote / Bengaluru",
    domain: "Software Engineering",
    bio: "Recent grad working on fintech APIs. Passionate about API design, performance tuning, and open-source contributions. Open to mentoring final-year students on campus-to-industry transition.",
    skills: ["Ruby", "Go", "PostgreSQL", "REST APIs", "Microservices"],
    mentoringTopics: ["Campus to Industry", "Open Source", "API Design"],
    availableForMentorship: true,
    avatarInitials: "SP",
    careerPath: "Intern @ Razorpay → Backend Engineer @ StackBridge Tech",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  {
    id: "alum-006",
    name: "Aditya Roy Chowdhury",
    email: "aditya.rc@email.com",
    institutionId: "cupgs-odisha",
    department: "Computer Science & Engineering",
    gradYear: "2018",
    jobTitle: "Engineering Manager",
    employer: "RideWave Mobility",
    location: "Bengaluru, India",
    domain: "Software Engineering",
    bio: "8 years of engineering experience, now managing a team of 12 building ride-matching systems. I can help with leadership, system design, and scaling engineering teams.",
    skills: ["Leadership", "Scalable Systems", "Java", "Kafka", "Microservices"],
    mentoringTopics: ["Engineering Leadership", "System Design", "Career Growth"],
    availableForMentorship: true,
    avatarInitials: "AR",
    careerPath: "SDE @ Ola → Staff SDE @ Swiggy → EM @ RideWave Mobility",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  {
    id: "alum-007",
    name: "Deepika Nair",
    email: "deepika.nair@email.com",
    institutionId: "cupgs-odisha",
    department: "Data Science",
    gradYear: "2022",
    jobTitle: "Data Analyst",
    employer: "InsightPulse Analytics",
    location: "Chennai, India",
    domain: "Data & AI",
    bio: "Turning raw data into actionable product insights. I work primarily with SQL, Python, and Tableau dashboards. Happy to guide students transitioning into analytics roles.",
    skills: ["SQL", "Python", "Tableau", "Statistics", "Excel"],
    mentoringTopics: ["Data Analytics Career", "SQL Mastery", "Dashboard Design"],
    availableForMentorship: true,
    avatarInitials: "DN",
    careerPath: "Data Intern @ Deloitte → Analyst @ InsightPulse Analytics",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  {
    id: "alum-008",
    name: "Sameer Mohapatra",
    email: "sameer.m@email.com",
    institutionId: "cupgs-odisha",
    department: "Mechanical Engineering",
    gradYear: "2021",
    jobTitle: "DevOps Engineer",
    employer: "NexGen Platforms",
    location: "Noida, India",
    domain: "Cloud & Infra",
    bio: "Mechanical engineer turned DevOps specialist. I transitioned from core engineering to tech through self-study and bootcamps. I help non-CS students explore tech career paths.",
    skills: ["Docker", "CI/CD", "AWS", "Bash", "Ansible"],
    mentoringTopics: ["Non-CS to Tech", "DevOps Learning Path", "Cloud Basics"],
    availableForMentorship: true,
    avatarInitials: "SM",
    careerPath: "Mechanical Trainee @ L&T → DevOps @ NexGen Platforms",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  // Second college fixtures
  {
    id: "alum-nitr-001",
    name: "Vikram Sahoo",
    email: "vikram.s@email.com",
    institutionId: "nit-rourkela",
    department: "Computer Science & Engineering",
    gradYear: "2020",
    jobTitle: "Staff Engineer",
    employer: "TechNova Inc",
    location: "Bengaluru, India",
    domain: "Software Engineering",
    bio: "Building distributed systems at scale. NIT Rourkela alum passionate about mentoring.",
    skills: ["Java", "Distributed Systems", "Kafka", "AWS"],
    mentoringTopics: ["System Design", "DSA", "Career Growth"],
    availableForMentorship: true,
    avatarInitials: "VS",
    careerPath: "SDE @ Amazon → Staff Engineer @ TechNova",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
  {
    id: "alum-nitr-002",
    name: "Ritika Das",
    email: "ritika.d@email.com",
    institutionId: "nit-rourkela",
    department: "Electronics & Communication",
    gradYear: "2021",
    jobTitle: "Embedded Systems Engineer",
    employer: "ChipLogic Semiconductor",
    location: "Hyderabad, India",
    domain: "Hardware & Embedded",
    bio: "Working on ASIC verification. Happy to guide ECE students into VLSI/embedded careers.",
    skills: ["Verilog", "SystemVerilog", "C", "FPGA"],
    mentoringTopics: ["VLSI Careers", "Embedded Systems", "Core ECE Jobs"],
    availableForMentorship: true,
    avatarInitials: "RD",
    careerPath: "Graduate Trainee @ TI → Embedded Engineer @ ChipLogic",
    membershipStatus: "approved",
    timezone: "Asia/Kolkata",
  },
];

// --------------- Demo Students ---------------
export interface DemoStudent {
  id: string;
  name: string;
  email: string;
  institutionId: string;
  department: string;
  year: string;
  avatarInitials: string;
  skills: string[];
  readinessScore: number;
}

export const DEMO_STUDENTS: DemoStudent[] = [
  { id: "stu-001", name: "Rudy Sharma", email: "rudy@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (2nd Year)", year: "2nd Year", avatarInitials: "RS", skills: ["Go", "Distributed Systems", "REST APIs"], readinessScore: 82 },
  { id: "stu-002", name: "Ananya Iyer", email: "ananya.i@cupgs.edu", institutionId: "cupgs-odisha", department: "Information Technology (3rd Year)", year: "3rd Year", avatarInitials: "AI", skills: ["PostgreSQL", "Query Optimization", "Python"], readinessScore: 78 },
  { id: "stu-003", name: "Kabir Das", email: "kabir.d@cupgs.edu", institutionId: "cupgs-odisha", department: "Electronics & Communication (4th Year)", year: "4th Year", avatarInitials: "KD", skills: ["Cloud Architecture", "AWS", "Terraform"], readinessScore: 74 },
  { id: "stu-004", name: "Meera Sahoo", email: "meera.s@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (3rd Year)", year: "3rd Year", avatarInitials: "MS", skills: ["React", "TypeScript", "Node.js"], readinessScore: 85 },
  { id: "stu-005", name: "Arjun Pradhan", email: "arjun.p@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (4th Year)", year: "4th Year", avatarInitials: "AP", skills: ["Java", "Spring Boot", "Docker"], readinessScore: 79 },
  { id: "stu-006", name: "Priyanka Mohanty", email: "priyanka.m@cupgs.edu", institutionId: "cupgs-odisha", department: "Data Science (2nd Year)", year: "2nd Year", avatarInitials: "PM", skills: ["Python", "Pandas", "SQL"], readinessScore: 71 },
  { id: "stu-007", name: "Siddharth Naik", email: "siddharth.n@cupgs.edu", institutionId: "cupgs-odisha", department: "Information Technology (4th Year)", year: "4th Year", avatarInitials: "SN", skills: ["Ruby", "PostgreSQL", "REST APIs"], readinessScore: 76 },
  { id: "stu-008", name: "Tanisha Behera", email: "tanisha.b@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (3rd Year)", year: "3rd Year", avatarInitials: "TB", skills: ["Python", "ML", "TensorFlow"], readinessScore: 80 },
  { id: "stu-009", name: "Rahul Tripathy", email: "rahul.t@cupgs.edu", institutionId: "cupgs-odisha", department: "Mechanical Engineering (3rd Year)", year: "3rd Year", avatarInitials: "RT", skills: ["Python", "AutoCAD", "Matlab"], readinessScore: 65 },
  { id: "stu-010", name: "Kavya Panda", email: "kavya.p@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (2nd Year)", year: "2nd Year", avatarInitials: "KP", skills: ["HTML/CSS", "JavaScript", "React"], readinessScore: 68 },
  { id: "stu-011", name: "Nikhil Jena", email: "nikhil.j@cupgs.edu", institutionId: "cupgs-odisha", department: "Data Science (4th Year)", year: "4th Year", avatarInitials: "NJ", skills: ["Python", "Deep Learning", "PyTorch"], readinessScore: 83 },
  { id: "stu-012", name: "Swati Mishra", email: "swati.m@cupgs.edu", institutionId: "cupgs-odisha", department: "Electronics & Communication (2nd Year)", year: "2nd Year", avatarInitials: "SM", skills: ["C", "Embedded C", "Arduino"], readinessScore: 62 },
  { id: "stu-013", name: "Ishaan Shukla", email: "ishaan.s@cupgs.edu", institutionId: "cupgs-odisha", department: "Information Technology (3rd Year)", year: "3rd Year", avatarInitials: "IS", skills: ["PostgreSQL", "Query Optimization", "Python"], readinessScore: 77 },
  { id: "stu-014", name: "Subham Sethy", email: "subham.s@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (3rd Year)", year: "3rd Year", avatarInitials: "SS", skills: ["Generative AI", "Agentic AI", "Python"], readinessScore: 78 },
  { id: "stu-015", name: "Shiba Narayan Mishra", email: "shiba.m@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (3rd Year)", year: "3rd Year", avatarInitials: "SNM", skills: ["Data Analysis", "SQL", "Python"], readinessScore: 88 },
  { id: "stu-016", name: "Brajesh Panigrahi", email: "brajesh.p@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (3rd Year)", year: "3rd Year", avatarInitials: "BP", skills: ["Generative AI", "Agentic AI", "Next.js"], readinessScore: 78 },
  { id: "stu-017", name: "Sameer Krishna Padhiary", email: "sameer.p@cupgs.edu", institutionId: "cupgs-odisha", department: "Computer Science (3rd Year)", year: "3rd Year", avatarInitials: "SKP", skills: ["CyberSecurity", "Networking", "Linux"], readinessScore: 78 },
  // NIT Rourkela students
  { id: "stu-nitr-001", name: "Amit Behera", email: "amit.b@nitr.edu", institutionId: "nit-rourkela", department: "Computer Science (3rd Year)", year: "3rd Year", avatarInitials: "AB", skills: ["Java", "DSA", "System Design"], readinessScore: 87 },
  { id: "stu-nitr-002", name: "Prachi Mohapatra", email: "prachi.m@nitr.edu", institutionId: "nit-rourkela", department: "ECE (4th Year)", year: "4th Year", avatarInitials: "PM", skills: ["Verilog", "FPGA", "C"], readinessScore: 75 },
  { id: "stu-nitr-003", name: "Rohit Nayak", email: "rohit.n@nitr.edu", institutionId: "nit-rourkela", department: "Computer Science (2nd Year)", year: "2nd Year", avatarInitials: "RN", skills: ["Python", "React", "SQL"], readinessScore: 72 },
];

// --------------- Mentorship Requests ---------------
export type MentorshipStatus = "pending" | "accepted" | "declined" | "scheduled" | "completed" | "cancelled";

export interface DemoMentorshipRequest {
  id: string;
  studentId: string;
  alumniId: string;
  topic: string;
  goals: string;
  message: string;
  preferredTimes: string;
  status: MentorshipStatus;
  createdAt: string;
  updatedAt: string;
  reply?: string;
}

export const DEMO_MENTORSHIP_REQUESTS: DemoMentorshipRequest[] = [
  {
    id: "mreq-001",
    studentId: "stu-001",
    alumniId: "alum-001",
    topic: "System Design & Technical Prep",
    goals: "Prepare for Tier-1 backend engineering interviews",
    message: "Hi Priya! I'm Rudy, a 2nd year CSE student. I've been building REST APIs in Go and would love guidance on system design patterns and how to prepare for interviews at companies like AsterCloud.",
    preferredTimes: "Weekday evenings after 6 PM IST",
    status: "pending",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "mreq-002",
    studentId: "stu-004",
    alumniId: "alum-001",
    topic: "Resume & Portfolio Review",
    goals: "Improve my resume for SDE internship applications",
    message: "Hello! I'm Meera, 3rd year CSE. My React/TypeScript portfolio needs a professional review. Could you help me structure my resume for product-based company applications?",
    preferredTimes: "Saturday mornings 10-12 PM IST",
    status: "pending",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: "mreq-003",
    studentId: "stu-005",
    alumniId: "alum-001",
    topic: "Backend Development Guidance",
    goals: "Learn microservices architecture with Spring Boot",
    message: "Hi! I'm Arjun from 4th year CSE. I've built monolithic apps with Spring Boot and want to learn how to break them into microservices. Your experience at AsterCloud would be invaluable.",
    preferredTimes: "Flexible, any weekday evening",
    status: "pending",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: "mreq-004",
    studentId: "stu-006",
    alumniId: "alum-001",
    topic: "Career Transition & Roadmap",
    goals: "Transition from data science coursework to full-stack engineering",
    message: "Hey Priya! I'm Priyanka, 2nd year Data Science. I realized I enjoy building web applications more than pure analytics. Could you guide me on transitioning toward full-stack engineering roles?",
    preferredTimes: "Weekends preferred",
    status: "pending",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "mreq-005",
    studentId: "stu-010",
    alumniId: "alum-001",
    topic: "Interview Prep",
    goals: "Crack frontend developer interviews",
    message: "Hi! I'm Kavya, 2nd year CSE. I know HTML/CSS/JS and React basics. I'd love your help preparing for frontend developer interview rounds — both technical and behavioral.",
    preferredTimes: "Tuesday/Thursday evenings after 5 PM IST",
    status: "pending",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
];

// --------------- Active Mentees (accepted requests with sessions) ---------------
export interface DemoMentee {
  id: string;
  studentId: string;
  alumniId: string;
  topic: string;
  acceptedAt: string;
  sessionsCompleted: number;
  nextSession?: string;
}

export const DEMO_MENTEES: DemoMentee[] = [
  { id: "mentee-001", studentId: "stu-002", alumniId: "alum-001", topic: "Resume & Portfolio Review", acceptedAt: daysAgo(30), sessionsCompleted: 3, nextSession: daysFromNow(2) },
  { id: "mentee-002", studentId: "stu-003", alumniId: "alum-001", topic: "Cloud Architecture Career", acceptedAt: daysAgo(45), sessionsCompleted: 4 },
  { id: "mentee-003", studentId: "stu-007", alumniId: "alum-001", topic: "Backend Engineering Roadmap", acceptedAt: daysAgo(20), sessionsCompleted: 2, nextSession: daysFromNow(5) },
  { id: "mentee-004", studentId: "stu-008", alumniId: "alum-001", topic: "ML to Full-Stack Transition", acceptedAt: daysAgo(14), sessionsCompleted: 1, nextSession: daysFromNow(3) },
];

// --------------- Sessions ---------------
export interface DemoSession {
  id: string;
  menteeId: string;
  studentId: string;
  alumniId: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  meetLink: string;
  status: "upcoming" | "completed" | "cancelled";
  feedback?: string;
}

export const DEMO_SESSIONS: DemoSession[] = [
  // 3 upcoming
  { id: "sess-u1", menteeId: "mentee-001", studentId: "stu-002", alumniId: "alum-001", topic: "Resume Final Review", date: daysFromNow(2), time: "5:00 PM IST", duration: "45 min", meetLink: "https://meet.google.com/demo-abc-def", status: "upcoming" },
  { id: "sess-u2", menteeId: "mentee-003", studentId: "stu-007", alumniId: "alum-001", topic: "API Design Patterns", date: daysFromNow(5), time: "6:30 PM IST", duration: "60 min", meetLink: "https://meet.google.com/demo-ghi-jkl", status: "upcoming" },
  { id: "sess-u3", menteeId: "mentee-004", studentId: "stu-008", alumniId: "alum-001", topic: "ML Project Review", date: daysFromNow(3), time: "4:00 PM IST", duration: "45 min", meetLink: "https://meet.google.com/demo-mno-pqr", status: "upcoming" },
  // 8 completed
  { id: "sess-c1", menteeId: "mentee-001", studentId: "stu-002", alumniId: "alum-001", topic: "Resume Structure Workshop", date: daysAgo(28), time: "5:00 PM IST", duration: "45 min", meetLink: "", status: "completed", feedback: "Great session, Priya helped me restructure my resume with impact-driven bullet points." },
  { id: "sess-c2", menteeId: "mentee-001", studentId: "stu-002", alumniId: "alum-001", topic: "Portfolio GitHub Cleanup", date: daysAgo(21), time: "5:30 PM IST", duration: "60 min", meetLink: "", status: "completed" },
  { id: "sess-c3", menteeId: "mentee-001", studentId: "stu-002", alumniId: "alum-001", topic: "Mock Interview Round 1", date: daysAgo(14), time: "6:00 PM IST", duration: "60 min", meetLink: "", status: "completed", feedback: "Improved my confidence in behavioral questions significantly." },
  { id: "sess-c4", menteeId: "mentee-002", studentId: "stu-003", alumniId: "alum-001", topic: "AWS Fundamentals Overview", date: daysAgo(40), time: "4:00 PM IST", duration: "45 min", meetLink: "", status: "completed" },
  { id: "sess-c5", menteeId: "mentee-002", studentId: "stu-003", alumniId: "alum-001", topic: "Terraform Hands-on", date: daysAgo(33), time: "4:00 PM IST", duration: "60 min", meetLink: "", status: "completed" },
  { id: "sess-c6", menteeId: "mentee-002", studentId: "stu-003", alumniId: "alum-001", topic: "Cloud Architecture Patterns", date: daysAgo(26), time: "5:00 PM IST", duration: "45 min", meetLink: "", status: "completed" },
  { id: "sess-c7", menteeId: "mentee-002", studentId: "stu-003", alumniId: "alum-001", topic: "AWS Solutions Architect Prep", date: daysAgo(19), time: "5:00 PM IST", duration: "60 min", meetLink: "", status: "completed", feedback: "Kabir is now confident to attempt the SA Associate exam." },
  { id: "sess-c8", menteeId: "mentee-003", studentId: "stu-007", alumniId: "alum-001", topic: "REST API Best Practices", date: daysAgo(15), time: "6:00 PM IST", duration: "45 min", meetLink: "", status: "completed" },
];

// --------------- Referrals ---------------
export interface DemoReferral {
  id: string;
  alumniId: string;
  institutionId: string;
  roleTitle: string;
  company: string;
  location: string;
  requiredReadiness: number;
  slotsRemaining: number;
  applicantsCount: number;
  skillsRequired: string[];
  postedDate: string;
  status: "open" | "closed";
}

export type ReferralSlot = DemoReferral;

export const DEMO_REFERRALS: DemoReferral[] = [
  {
    id: "ref-d01",
    alumniId: "alum-001",
    institutionId: "cupgs-odisha",
    roleTitle: "Software Engineer I (Backend)",
    company: "AsterCloud Labs",
    location: "Bengaluru / Hybrid",
    requiredReadiness: 75,
    slotsRemaining: 3,
    applicantsCount: 12,
    skillsRequired: ["Go", "Node.js", "PostgreSQL", "Docker"],
    postedDate: daysAgo(10),
    status: "open",
  },
  {
    id: "ref-d02",
    alumniId: "alum-001",
    institutionId: "cupgs-odisha",
    roleTitle: "Frontend Engineer (React)",
    company: "AsterCloud Labs",
    location: "Remote / Bengaluru",
    requiredReadiness: 70,
    slotsRemaining: 2,
    applicantsCount: 8,
    skillsRequired: ["React", "TypeScript", "CSS", "REST APIs"],
    postedDate: daysAgo(7),
    status: "open",
  },
  {
    id: "ref-d03",
    alumniId: "alum-001",
    institutionId: "cupgs-odisha",
    roleTitle: "Cloud Infrastructure Intern",
    company: "AsterCloud Labs",
    location: "Bengaluru",
    requiredReadiness: 60,
    slotsRemaining: 0,
    applicantsCount: 15,
    skillsRequired: ["AWS", "Linux", "Docker", "Bash"],
    postedDate: daysAgo(30),
    status: "closed",
  },
];

// --------------- Proof Reviews ---------------
export interface DemoProofReview {
  id: string;
  studentId: string;
  alumniId: string;
  skillName: string;
  readinessScore: number;
  repoLink: string;
  projectTitle: string;
  verified: boolean;
  reviewedAt?: string;
  reviewNote?: string;
}

export const DEMO_PROOF_REVIEWS: DemoProofReview[] = [
  { id: "pf-001", studentId: "stu-001", alumniId: "alum-001", skillName: "Distributed Systems & Go", readinessScore: 82, repoLink: "github.com/rudysharma/distributed-cache", projectTitle: "Distributed Cache Engine", verified: true, reviewedAt: daysAgo(12), reviewNote: "Solid implementation of consistent hashing." },
  { id: "pf-002", studentId: "stu-002", alumniId: "alum-001", skillName: "PostgreSQL & Query Optimization", readinessScore: 78, repoLink: "github.com/ananyaiyer/sql-indexer", projectTitle: "SQL Index Optimizer", verified: true, reviewedAt: daysAgo(18) },
  { id: "pf-003", studentId: "stu-004", alumniId: "alum-001", skillName: "React & TypeScript", readinessScore: 85, repoLink: "github.com/meerasahoo/react-dashboard", projectTitle: "Admin Dashboard", verified: true, reviewedAt: daysAgo(8) },
  { id: "pf-004", studentId: "stu-005", alumniId: "alum-001", skillName: "Spring Boot Microservices", readinessScore: 79, repoLink: "github.com/arjunp/microservice-demo", projectTitle: "E-Commerce Microservice", verified: true, reviewedAt: daysAgo(15) },
  { id: "pf-005", studentId: "stu-007", alumniId: "alum-001", skillName: "REST API Design", readinessScore: 76, repoLink: "github.com/siddharthnaik/rest-api-kit", projectTitle: "API Toolkit", verified: true, reviewedAt: daysAgo(20) },
  { id: "pf-006", studentId: "stu-008", alumniId: "alum-001", skillName: "ML Pipeline with TensorFlow", readinessScore: 80, repoLink: "github.com/tanishab/ml-pipeline", projectTitle: "Image Classification Pipeline", verified: true, reviewedAt: daysAgo(10) },
  { id: "pf-007", studentId: "stu-011", alumniId: "alum-001", skillName: "Deep Learning with PyTorch", readinessScore: 83, repoLink: "github.com/nikhilj/pytorch-nlp", projectTitle: "NLP Sentiment Analyzer", verified: true, reviewedAt: daysAgo(22) },
  { id: "pf-008", studentId: "stu-003", alumniId: "alum-001", skillName: "AWS & Terraform", readinessScore: 74, repoLink: "github.com/kabirdas/terraform-infra", projectTitle: "Cloud Infrastructure as Code", verified: true, reviewedAt: daysAgo(25) },
  { id: "pf-009", studentId: "stu-001", alumniId: "alum-001", skillName: "Concurrency in Go", readinessScore: 79, repoLink: "github.com/rudysharma/go-concurrency", projectTitle: "Concurrent Task Scheduler", verified: true, reviewedAt: daysAgo(30) },
  { id: "pf-010", studentId: "stu-004", alumniId: "alum-001", skillName: "Next.js Full-Stack", readinessScore: 81, repoLink: "github.com/meerasahoo/nextjs-blog", projectTitle: "Full-Stack Blog Platform", verified: true, reviewedAt: daysAgo(14) },
  { id: "pf-011", studentId: "stu-005", alumniId: "alum-001", skillName: "Docker & Containerization", readinessScore: 72, repoLink: "github.com/arjunp/docker-workshop", projectTitle: "Docker Workshop Labs", verified: true, reviewedAt: daysAgo(28) },
  { id: "pf-012", studentId: "stu-002", alumniId: "alum-001", skillName: "Database Design", readinessScore: 77, repoLink: "github.com/ananyaiyer/db-normalizer", projectTitle: "Database Normalizer Tool", verified: true, reviewedAt: daysAgo(35) },
  { id: "pf-013", studentId: "stu-006", alumniId: "alum-001", skillName: "Python Data Wrangling", readinessScore: 71, repoLink: "github.com/priyankam/data-cleaner", projectTitle: "Data Cleaning Pipeline", verified: true, reviewedAt: daysAgo(16) },
  { id: "pf-014", studentId: "stu-008", alumniId: "alum-001", skillName: "Neural Network Basics", readinessScore: 75, repoLink: "github.com/tanishab/nn-from-scratch", projectTitle: "Neural Net from Scratch", verified: true, reviewedAt: daysAgo(40) },
  { id: "pf-015", studentId: "stu-007", alumniId: "alum-001", skillName: "Ruby on Rails", readinessScore: 73, repoLink: "github.com/siddharthnaik/rails-crm", projectTitle: "CRM Application", verified: true, reviewedAt: daysAgo(32) },
  { id: "pf-016", studentId: "stu-010", alumniId: "alum-001", skillName: "JavaScript Fundamentals", readinessScore: 68, repoLink: "github.com/kavyap/js-algorithms", projectTitle: "JS Algorithm Practice", verified: true, reviewedAt: daysAgo(9) },
  { id: "pf-017", studentId: "stu-009", alumniId: "alum-001", skillName: "Python Automation", readinessScore: 65, repoLink: "github.com/rahult/python-automate", projectTitle: "Automation Scripts", verified: true, reviewedAt: daysAgo(38) },
  { id: "pf-018", studentId: "stu-011", alumniId: "alum-001", skillName: "Computer Vision", readinessScore: 80, repoLink: "github.com/nikhilj/cv-object-detect", projectTitle: "Object Detection System", verified: true, reviewedAt: daysAgo(5) },
  // Pending reviews
  { id: "pf-019", studentId: "stu-012", alumniId: "alum-001", skillName: "Embedded C Programming", readinessScore: 62, repoLink: "github.com/swatim/embedded-sensor", projectTitle: "Sensor Data Logger", verified: false },
  { id: "pf-020", studentId: "stu-009", alumniId: "alum-001", skillName: "Matlab Simulations", readinessScore: 64, repoLink: "github.com/rahult/matlab-sims", projectTitle: "Mechanical Simulation Suite", verified: false },
  // Ishaan's cohort proofs
  { id: "pf-021", studentId: "stu-013", alumniId: "alum-001", skillName: "PostgreSQL & Query Optimization", readinessScore: 77, repoLink: "github.com/ishaanshukla/sql-indexer", projectTitle: "SQL Indexer", verified: true, reviewedAt: daysAgo(4), reviewNote: "Strong query execution plan analysis." },
  { id: "pf-022", studentId: "stu-014", alumniId: "alum-001", skillName: "Generative and Agentic AI", readinessScore: 78, repoLink: "github.com/subhamsethy/gen-ai", projectTitle: "Agentic AI Framework", verified: true, reviewedAt: daysAgo(3), reviewNote: "Excellent agentic workflow design." },
  { id: "pf-023", studentId: "stu-015", alumniId: "alum-001", skillName: "Data Analyst", readinessScore: 88, repoLink: "github.com/snm/da", projectTitle: "Business Intelligence Pipeline", verified: true, reviewedAt: daysAgo(2), reviewNote: "Comprehensive EDA and dashboard." },
  { id: "pf-024", studentId: "stu-016", alumniId: "alum-001", skillName: "Generative and Agentic AI", readinessScore: 78, repoLink: "github.com/bp/gen-ai", projectTitle: "Multi-Agent System", verified: true, reviewedAt: daysAgo(1), reviewNote: "Clean orchestrator implementation." },
  { id: "pf-025", studentId: "stu-017", alumniId: "alum-001", skillName: "CyberSecurity", readinessScore: 78, repoLink: "github.com/skp/cs", projectTitle: "Vulnerability Scanner", verified: true, reviewedAt: daysAgo(1), reviewNote: "Thorough network packet inspector." },
];

// --------------- Guidance Questions ---------------
export interface DemoGuidanceQuestion {
  id: string;
  studentId: string;
  institutionId: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  status: "open" | "resolved";
  answers: DemoGuidanceAnswer[];
}

export interface DemoGuidanceAnswer {
  id: string;
  authorId: string;
  authorRole: "alumni" | "student";
  body: string;
  createdAt: string;
}

export const DEMO_GUIDANCE_QUESTIONS: DemoGuidanceQuestion[] = [
  {
    id: "gq-001",
    studentId: "stu-001",
    institutionId: "cupgs-odisha",
    title: "How should I prepare for system design interviews as a 2nd year student?",
    body: "I've been doing DSA on LeetCode for 3 months but system design feels overwhelming. Where should I start? Which resources are actually useful vs. overhyped?",
    tags: ["interview-prep", "system-design", "career"],
    createdAt: daysAgo(6),
    status: "resolved",
    answers: [
      { id: "ga-001", authorId: "alum-001", authorRole: "alumni", body: "Start with 'Designing Data-Intensive Applications' by Kleppmann for fundamentals, then practice with mock designs on YouTube channels like System Design Interview. At your stage, focus on understanding trade-offs (SQL vs. NoSQL, monolith vs. microservice) rather than memorizing architectures. Build 2-3 projects that involve multiple services talking to each other — that's worth more than any book.", createdAt: daysAgo(5) },
      { id: "ga-002", authorId: "alum-006", authorRole: "alumni", body: "I'd add: don't skip the basics. Understand HTTP, TCP, DNS, load balancers, and caching before diving into complex designs. Draw diagrams by hand. The interviewers care more about your thought process than the final answer.", createdAt: daysAgo(4) },
    ],
  },
  {
    id: "gq-002",
    studentId: "stu-004",
    institutionId: "cupgs-odisha",
    title: "Is it worth learning TypeScript deeply for frontend roles?",
    body: "I know basic TypeScript but many job postings demand 'strong TypeScript skills'. What does that actually mean in practice? Should I invest time in advanced TS patterns?",
    tags: ["frontend", "typescript", "career"],
    createdAt: daysAgo(8),
    status: "resolved",
    answers: [
      { id: "ga-003", authorId: "alum-001", authorRole: "alumni", body: "Absolutely yes. In production React codebases, TypeScript is non-negotiable. Learn generics, utility types (Pick, Omit, Partial), discriminated unions, and how to type hooks properly. Build a project with strict TypeScript — no `any` types allowed. That exercise alone will make you interview-ready.", createdAt: daysAgo(7) },
    ],
  },
  {
    id: "gq-003",
    studentId: "stu-009",
    institutionId: "cupgs-odisha",
    title: "Can a mechanical engineering student realistically switch to tech?",
    body: "I'm in 3rd year Mech but I've been self-learning Python and web development. Is it realistic to target software roles during placement? What should my strategy be?",
    tags: ["career-transition", "non-cs", "placement"],
    createdAt: daysAgo(10),
    status: "resolved",
    answers: [
      { id: "ga-004", authorId: "alum-008", authorRole: "alumni", body: "I did exactly this! Mech 2021 grad, now working as a DevOps Engineer. Here's what worked for me: 1) Build 3-4 solid projects on GitHub, 2) Get at least one cloud certification (AWS CCP is easiest to start), 3) Contribute to open source to show you can work with real codebases, 4) Network aggressively on LinkedIn. Companies care about demonstrated skills, not your branch name. You've got this!", createdAt: daysAgo(9) },
    ],
  },
  {
    id: "gq-004",
    studentId: "stu-006",
    institutionId: "cupgs-odisha",
    title: "What's the difference between Data Analyst and Data Scientist roles?",
    body: "My curriculum covers both analytics and ML. For placement season, should I target analyst or scientist roles? Which has better growth for freshers?",
    tags: ["data-science", "career", "placement"],
    createdAt: daysAgo(4),
    status: "open",
    answers: [
      { id: "ga-005", authorId: "alum-007", authorRole: "alumni", body: "Great question! Data Analyst roles focus on SQL, Excel, dashboarding (Tableau/Power BI), and business storytelling. Data Scientist roles lean more toward statistics, ML models, and Python/R programming. For freshers, Analyst roles are more abundant and easier to land. You can always transition to DS after 1-2 years with industry experience. My advice: nail SQL and learn one visualization tool really well.", createdAt: daysAgo(3) },
    ],
  },
  {
    id: "gq-005",
    studentId: "stu-005",
    institutionId: "cupgs-odisha",
    title: "How important are DSA skills for backend engineering roles?",
    body: "I've built several projects with Spring Boot and Docker but I struggle with competitive programming. Will companies reject me for weak DSA despite strong project experience?",
    tags: ["interview-prep", "dsa", "backend"],
    createdAt: daysAgo(12),
    status: "resolved",
    answers: [
      { id: "ga-006", authorId: "alum-001", authorRole: "alumni", body: "Unfortunately, most product-based companies still gate on DSA in interviews. You don't need to be a competitive programmer — just be solid with arrays, strings, trees, graphs, dynamic programming, and backtracking at a medium LeetCode level. Spend 1-2 hours daily for 2-3 months. Your project experience is excellent and will shine in later rounds, but you need to clear the DSA filter first.", createdAt: daysAgo(11) },
      { id: "ga-007", authorId: "alum-004", authorRole: "alumni", body: "Adding a PM perspective: some startups and product companies do value project work over DSA. Target companies that have take-home assignments or system design rounds instead of pure algorithmic rounds. Your Spring Boot + Docker experience is rare for college students — leverage that.", createdAt: daysAgo(10) },
    ],
  },
  {
    id: "gq-006",
    studentId: "stu-008",
    institutionId: "cupgs-odisha",
    title: "Best way to showcase ML projects on a resume?",
    body: "I have 3 ML projects but I'm not sure how to present them. Should I focus on the model accuracy, the business problem, or the technical stack?",
    tags: ["resume", "ml", "projects"],
    createdAt: daysAgo(7),
    status: "open",
    answers: [
      { id: "ga-008", authorId: "alum-002", authorRole: "alumni", body: "Always lead with the business problem and impact: 'Built a sentiment analysis pipeline that classifies 10K+ reviews/min with 94% accuracy'. Then mention your tech stack (PyTorch, HuggingFace, etc.). Quantify everything — dataset size, training time, accuracy improvements. Deploy at least one project as a web app or API. A live demo link on your resume is worth 10 Jupyter notebooks.", createdAt: daysAgo(6) },
    ],
  },
];

// --------------- Resources ---------------
export interface DemoResource {
  id: string;
  alumniId: string;
  institutionId: string;
  title: string;
  description: string;
  category: string;
  content: string;
  link?: string;
  createdAt: string;
}

export const DEMO_RESOURCES: DemoResource[] = [
  {
    id: "res-001",
    alumniId: "alum-001",
    institutionId: "cupgs-odisha",
    title: "The Perfect Tech Resume — Checklist",
    description: "A structured checklist covering format, content, action verbs, and common mistakes for tech resumes targeting product companies.",
    category: "Resume",
    content: "✅ One page only (for freshers/1-2 YOE)\n✅ Contact info at top: Name, Email, LinkedIn, GitHub, Portfolio\n✅ Education section with GPA only if > 8.0\n✅ Projects section with 3-4 impactful projects\n✅ Each project: Title, Tech Stack, 2-3 impact bullets starting with action verbs\n✅ Quantify results: 'Reduced latency by 40%' not 'Improved performance'\n✅ Skills section: Group by category (Languages, Frameworks, Tools)\n✅ No photos, no objective statement, no references\n✅ Use a clean LaTeX template (Jake's Resume or Deedy)\n❌ Never lie about technologies you haven't used\n❌ Avoid listing soft skills without evidence",
    createdAt: daysAgo(15),
  },
  {
    id: "res-002",
    alumniId: "alum-001",
    institutionId: "cupgs-odisha",
    title: "90-Day DSA Preparation Plan",
    description: "A structured 90-day plan for mastering data structures and algorithms, organized by topic with recommended LeetCode problems.",
    category: "Interview Prep",
    content: "Week 1-2: Arrays & Strings (Two Pointers, Sliding Window)\nWeek 3-4: Linked Lists & Stacks/Queues\nWeek 5-6: Trees & Binary Search Trees\nWeek 7-8: Graphs (BFS, DFS, Topological Sort)\nWeek 9-10: Dynamic Programming (1D → 2D)\nWeek 11-12: Backtracking & Greedy\nWeek 13: Mock Interviews & Review\n\nDaily routine: 2 problems (1 medium + 1 easy), review solutions, maintain a tracking sheet.\nResources: NeetCode 150, Striver's SDE Sheet, LeetCode Discuss.",
    createdAt: daysAgo(20),
  },
  {
    id: "res-003",
    alumniId: "alum-001",
    institutionId: "cupgs-odisha",
    title: "Project Presentation Tips for Campus Interviews",
    description: "How to present your coding projects confidently during technical interviews — structure, talking points, and demo tips.",
    category: "Interview Prep",
    content: "1. Start with the PROBLEM, not the tech stack\n2. Explain your ROLE: 'I designed the database schema and built the REST API layer'\n3. Walk through the ARCHITECTURE with a simple diagram\n4. Highlight CHALLENGES: 'Handling concurrent writes was tricky — I used optimistic locking'\n5. Show RESULTS: Performance metrics, user feedback, deployment stats\n6. Prepare for FOLLOW-UPS: 'What would you do differently?', 'How would you scale this?'\n7. Keep your demo SHORT (2-3 minutes max)\n8. Have your code open on GitHub, not just locally\n\nPro tip: Practice explaining your project to a non-technical friend. If they understand it, interviewers will too.",
    createdAt: daysAgo(12),
  },
  {
    id: "res-004",
    alumniId: "alum-002",
    institutionId: "cupgs-odisha",
    title: "Getting Started with Machine Learning — A Practical Roadmap",
    description: "A no-nonsense roadmap for students wanting to break into ML/AI, covering prerequisites, courses, and project ideas.",
    category: "Career Guidance",
    content: "Prerequisites: Python (intermediate), Linear Algebra basics, Statistics basics\n\nPhase 1 (Month 1-2): Andrew Ng's ML course on Coursera, implement algorithms from scratch\nPhase 2 (Month 3-4): Deep Learning Specialization, build 2 projects with PyTorch/TensorFlow\nPhase 3 (Month 5-6): Specialize — NLP, CV, or Tabular. Pick one and go deep.\n\nProject ideas:\n- Sentiment analysis on product reviews\n- Image classification for medical imaging\n- Time series forecasting for stock prices\n- Chatbot using transformer models\n\nDeploy at least one model as a Flask/FastAPI web service. Kaggle competitions are great for practice but don't spend more than 20% of your time there.",
    createdAt: daysAgo(25),
  },
  {
    id: "res-005",
    alumniId: "alum-004",
    institutionId: "cupgs-odisha",
    title: "Product Management for Engineers — Career Switch Guide",
    description: "How software engineers can successfully transition to product management roles, based on my personal experience.",
    category: "Career Guidance",
    content: "Why engineers make great PMs: You understand technical trade-offs, can prototype ideas, and speak the developer's language.\n\nSkills to develop:\n1. User empathy: Talk to 5 real users of any product you use. Write down their pain points.\n2. Data analysis: Master SQL + one analytics tool (Mixpanel, Amplitude, or GA4)\n3. Communication: Practice writing PRDs and presenting to non-technical audiences\n4. Strategy: Read 'Inspired' by Marty Cagan and 'The Lean Startup'\n\nHow to make the switch:\n- Start as a technical PM or PM in a startup (easier entry)\n- Build a portfolio: Product teardowns, case studies, feature proposals\n- Network with PMs on LinkedIn, attend product meetups\n\nInterview prep: Practice case studies (estimate, improve, design) and SQL for analytics rounds.",
    createdAt: daysAgo(18),
  },
  {
    id: "res-006",
    alumniId: "alum-008",
    institutionId: "cupgs-odisha",
    title: "Non-CS to Tech — Transition Playbook",
    description: "A step-by-step guide for non-CS engineering students who want to break into software/DevOps/cloud roles.",
    category: "Career Guidance",
    content: "Step 1: Pick ONE domain — Web Dev, DevOps, Data, or Cloud. Don't spread thin.\nStep 2: Complete one structured course (FreeCodeCamp for web, KodeKloud for DevOps)\nStep 3: Build 3 projects of increasing complexity. Push everything to GitHub.\nStep 4: Get certified — AWS CCP, Docker DCA, or equivalent. It signals commitment.\nStep 5: Contribute to 1-2 open source projects. Even documentation PRs count.\nStep 6: Update LinkedIn with your new skills. Connect with people in your target role.\nStep 7: Apply broadly. Apply to startups that care about skills over degrees.\n\nMindset: Your non-CS background is an ASSET, not a liability. Mechanical engineers understand systems thinking. Electrical engineers understand signals/logic. Frame your story positively.",
    createdAt: daysAgo(22),
  },
];

// --------------- Helper to get student/alumni by ID ---------------
export function getStudentById(id: string): DemoStudent | undefined {
  return DEMO_STUDENTS.find((s) => s.id === id);
}

export function getAlumniById(id: string): DemoAlumni | undefined {
  return DEMO_ALUMNI.find((a) => a.id === id);
}

export function getInstitutionById(id: string): DemoInstitution | undefined {
  return INSTITUTIONS.find((i) => i.id === id);
}

export function getAlumniForInstitution(institutionId: string): DemoAlumni[] {
  return DEMO_ALUMNI.filter((a) => a.institutionId === institutionId && a.membershipStatus === "approved");
}

export function getStudentsForInstitution(institutionId: string): DemoStudent[] {
  return DEMO_STUDENTS.filter((s) => s.institutionId === institutionId);
}

// Primary demo alumni (for the logged-in alumni console)
export const PRIMARY_DEMO_ALUMNI_ID = "alum-001";
export const PRIMARY_DEMO_INSTITUTION_ID = "cupgs-odisha";

// --------------- Impact Scores & Leaderboard ---------------
export interface DemoImpactScore {
  alumniId: string;
  name: string;
  avatarInitials: string;
  menteesHelped: number;
  referralsHired: number;
  sessions: number;
  guidanceResolved: number;
  score: number;
  streak: number; // weeks
  rank: number;
}

export const DEMO_IMPACT_SCORES: DemoImpactScore[] = [
  { alumniId: "alum-001", name: "Priya Mohanty", avatarInitials: "PM", menteesHelped: 4, referralsHired: 3, sessions: 11, guidanceResolved: 5, score: 77, streak: 6, rank: 1 },
  { alumniId: "alum-006", name: "Aditya Roy Chowdhury", avatarInitials: "AR", menteesHelped: 3, referralsHired: 2, sessions: 9, guidanceResolved: 4, score: 62, streak: 4, rank: 2 },
  { alumniId: "alum-002", name: "Rohan Behera", avatarInitials: "RB", menteesHelped: 2, referralsHired: 2, sessions: 7, guidanceResolved: 3, score: 53, streak: 3, rank: 3 },
  { alumniId: "alum-004", name: "Kabir Verma", avatarInitials: "KV", menteesHelped: 2, referralsHired: 1, sessions: 6, guidanceResolved: 2, score: 38, streak: 2, rank: 4 },
  { alumniId: "alum-008", name: "Sameer Mohapatra", avatarInitials: "SM", menteesHelped: 1, referralsHired: 1, sessions: 5, guidanceResolved: 3, score: 29, streak: 2, rank: 5 },
  { alumniId: "alum-005", name: "Sneha Pattanayak", avatarInitials: "SP", menteesHelped: 1, referralsHired: 1, sessions: 4, guidanceResolved: 1, score: 24, streak: 1, rank: 6 },
  { alumniId: "alum-007", name: "Deepika Nair", avatarInitials: "DN", menteesHelped: 1, referralsHired: 0, sessions: 3, guidanceResolved: 2, score: 18, streak: 1, rank: 7 },
  { alumniId: "alum-003", name: "Ananya Deshmukh", avatarInitials: "AD", menteesHelped: 0, referralsHired: 0, sessions: 2, guidanceResolved: 1, score: 7, streak: 0, rank: 8 },
];

// --------------- Referral Pipeline ---------------
export type PipelineStage = "referred" | "screening" | "interview" | "offer" | "hired";

export interface DemoReferralPipeline {
  id: string;
  studentId: string;
  studentName: string;
  avatarInitials: string;
  company: string;
  referredDate: string;
  stage: PipelineStage;
}

export const DEMO_REFERRAL_PIPELINE: DemoReferralPipeline[] = [
  { id: "rp-001", studentId: "stu-001", studentName: "Rudy Sharma", avatarInitials: "RS", company: "AsterCloud Labs", referredDate: daysAgo(14), stage: "interview" },
  { id: "rp-002", studentId: "stu-004", studentName: "Meera Sahoo", avatarInitials: "MS", company: "AsterCloud Labs", referredDate: daysAgo(10), stage: "screening" },
  { id: "rp-003", studentId: "stu-005", studentName: "Arjun Pradhan", avatarInitials: "AP", company: "NeuraForge AI", referredDate: daysAgo(21), stage: "offer" },
  { id: "rp-004", studentId: "stu-003", studentName: "Kabir Das", avatarInitials: "KD", company: "CloudNova Solutions", referredDate: daysAgo(30), stage: "hired" },
  { id: "rp-005", studentId: "stu-006", studentName: "Priyanka Mohanty", avatarInitials: "PM", company: "PayGrid Fintech", referredDate: daysAgo(7), stage: "referred" },
  { id: "rp-006", studentId: "stu-008", studentName: "Tanisha Behera", avatarInitials: "TB", company: "NeuraForge AI", referredDate: daysAgo(5), stage: "referred" },
  { id: "rp-007", studentId: "stu-007", studentName: "Siddharth Naik", avatarInitials: "SN", company: "StackBridge Tech", referredDate: daysAgo(18), stage: "interview" },
  { id: "rp-008", studentId: "stu-002", studentName: "Ananya Iyer", avatarInitials: "AI", company: "RideWave Mobility", referredDate: daysAgo(25), stage: "screening" },
  { id: "rp-009", studentId: "stu-010", studentName: "Kavya Panda", avatarInitials: "KP", company: "AsterCloud Labs", referredDate: daysAgo(3), stage: "referred" },
];

// --------------- Network Graph ---------------
export interface DemoNetworkNode {
  id: string;
  label: string;
  type: "alumni" | "mentee" | "company";
  initials?: string;
}

export interface DemoNetworkEdge {
  source: string;
  target: string;
  relation: "mentoring" | "works_at" | "referred_to";
}

export const DEMO_NETWORK_NODES: DemoNetworkNode[] = [
  // Alumni
  { id: "n-alum-001", label: "Priya Mohanty", type: "alumni", initials: "PM" },
  { id: "n-alum-002", label: "Rohan Behera", type: "alumni", initials: "RB" },
  { id: "n-alum-006", label: "Aditya R.C.", type: "alumni", initials: "AR" },
  // Mentees
  { id: "n-stu-001", label: "Rudy Sharma", type: "mentee", initials: "RS" },
  { id: "n-stu-002", label: "Ananya Iyer", type: "mentee", initials: "AI" },
  { id: "n-stu-004", label: "Meera Sahoo", type: "mentee", initials: "MS" },
  { id: "n-stu-005", label: "Arjun Pradhan", type: "mentee", initials: "AP" },
  { id: "n-stu-007", label: "Siddharth Naik", type: "mentee", initials: "SN" },
  { id: "n-stu-008", label: "Tanisha Behera", type: "mentee", initials: "TB" },
  { id: "n-stu-003", label: "Kabir Das", type: "mentee", initials: "KD" },
  // Companies
  { id: "n-co-astercloud", label: "AsterCloud Labs", type: "company" },
  { id: "n-co-neuraforge", label: "NeuraForge AI", type: "company" },
  { id: "n-co-cloudnova", label: "CloudNova", type: "company" },
  { id: "n-co-ridewave", label: "RideWave", type: "company" },
];

export const DEMO_NETWORK_EDGES: DemoNetworkEdge[] = [
  // Mentoring
  { source: "n-alum-001", target: "n-stu-002", relation: "mentoring" },
  { source: "n-alum-001", target: "n-stu-003", relation: "mentoring" },
  { source: "n-alum-001", target: "n-stu-007", relation: "mentoring" },
  { source: "n-alum-001", target: "n-stu-008", relation: "mentoring" },
  { source: "n-alum-002", target: "n-stu-001", relation: "mentoring" },
  { source: "n-alum-006", target: "n-stu-004", relation: "mentoring" },
  { source: "n-alum-006", target: "n-stu-005", relation: "mentoring" },
  // Works at
  { source: "n-alum-001", target: "n-co-astercloud", relation: "works_at" },
  { source: "n-alum-002", target: "n-co-neuraforge", relation: "works_at" },
  { source: "n-alum-006", target: "n-co-ridewave", relation: "works_at" },
  // Referred to
  { source: "n-stu-001", target: "n-co-astercloud", relation: "referred_to" },
  { source: "n-stu-004", target: "n-co-astercloud", relation: "referred_to" },
  { source: "n-stu-005", target: "n-co-neuraforge", relation: "referred_to" },
  { source: "n-stu-003", target: "n-co-cloudnova", relation: "referred_to" },
];

// --------------- Badges ---------------
export interface DemoBadge {
  id: string;
  name: string;
  description: string;
  iconName: string; // lucide icon name
  earned: boolean;
  earnedDate?: string;
  lockedMessage?: string;
}

export const DEMO_BADGES: DemoBadge[] = [
  { id: "badge-001", name: "First Mentee", description: "Accepted your first mentorship request", iconName: "heart-handshake", earned: true, earnedDate: daysAgo(45) },
  { id: "badge-002", name: "Session Streak", description: "Completed 5 mentoring sessions in a row", iconName: "flame", earned: true, earnedDate: daysAgo(20) },
  { id: "badge-003", name: "Referral Champion", description: "Had a referred student get hired", iconName: "trophy", earned: true, earnedDate: daysAgo(30) },
  { id: "badge-004", name: "Proof Verifier", description: "Verified 10+ student skill proofs", iconName: "shield-check", earned: true, earnedDate: daysAgo(12) },
  { id: "badge-005", name: "Guidance Guru", description: "Answered 5 questions on the Guidance Hub", iconName: "help-circle", earned: true, earnedDate: daysAgo(8) },
  { id: "badge-006", name: "Community Builder", description: "Connected with 10+ alumni in the network", iconName: "network", earned: false, lockedMessage: "3 more connections to unlock" },
  { id: "badge-007", name: "Pipeline Pro", description: "Moved 5 referrals through the full pipeline", iconName: "git-branch", earned: false, lockedMessage: "2 more referrals to unlock" },
  { id: "badge-008", name: "Impact Legend", description: "Reach an Impact Score of 100+", iconName: "star", earned: false, lockedMessage: "23 more points to unlock" },
];
