export interface HistoricalYearData {
  year: string;
  totalStudents: number;
  assessedCount: number;
  placementRate: number;
  totalPlaced: number;
  averageCTC: string;
  highestCTC: string;
  activeRecruiters: number;
  totalInternships: number;
  departments: {
    deptId: string;
    deptName: string;
    students: number;
    placed: number;
    placementRate: number;
    avgScore: number;
    topHiringCompany: string;
  }[];
  topRecruiters: {
    name: string;
    hiredCount: number;
    avgPackage: string;
    domain: string;
  }[];
}

export const HISTORICAL_YEARS: Record<string, HistoricalYearData> = {
  "2024-25": {
    year: "2024–25",
    totalStudents: 565,
    assessedCount: 512,
    placementRate: 82.4,
    totalPlaced: 466,
    averageCTC: "8.6 LPA",
    highestCTC: "44.0 LPA",
    activeRecruiters: 52,
    totalInternships: 210,
    departments: [
      { deptId: "cse", deptName: "Computer Science & Engineering", students: 172, placed: 154, placementRate: 89.5, avgScore: 65, topHiringCompany: "Microsoft / TechNova" },
      { deptId: "it", deptName: "Information Technology", students: 115, placed: 98, placementRate: 85.2, avgScore: 61, topHiringCompany: "DataForge" },
      { deptId: "ece", deptName: "Electronics & Communication", students: 86, placed: 67, placementRate: 77.9, avgScore: 54, topHiringCompany: "Qualcomm / Intel" },
      { deptId: "ds", deptName: "Data Science & AI", students: 52, placed: 48, placementRate: 92.3, avgScore: 70, topHiringCompany: "Amazon AWS" },
      { deptId: "me", deptName: "Mechanical Engineering", students: 72, placed: 51, placementRate: 70.8, avgScore: 43, topHiringCompany: "Tata Motors / L&T" },
      { deptId: "ee", deptName: "Electrical Engineering", students: 68, placed: 48, placementRate: 70.5, avgScore: 46, topHiringCompany: "Schneider Electric" },
    ],
    topRecruiters: [
      { name: "TechNova Systems", hiredCount: 42, avgPackage: "9.2 LPA", domain: "Full Stack & Cloud" },
      { name: "Tata Consultancy Services", hiredCount: 58, avgPackage: "7.0 LPA", domain: "Enterprise Software" },
      { name: "DataForge Analytics", hiredCount: 26, avgPackage: "11.5 LPA", domain: "Data Science & ML" },
      { name: "Orbital Cloud", hiredCount: 18, avgPackage: "14.0 LPA", domain: "DevOps & Cloud" },
      { name: "Finlytics Tech", hiredCount: 22, avgPackage: "10.8 LPA", domain: "Fintech Systems" },
    ],
  },
  "2023-24": {
    year: "2023–24",
    totalStudents: 530,
    assessedCount: 468,
    placementRate: 78.6,
    totalPlaced: 417,
    averageCTC: "7.8 LPA",
    highestCTC: "38.5 LPA",
    activeRecruiters: 45,
    totalInternships: 184,
    departments: [
      { deptId: "cse", deptName: "Computer Science & Engineering", students: 165, placed: 142, placementRate: 86.0, avgScore: 63, topHiringCompany: "Amazon / Infosys" },
      { deptId: "it", deptName: "Information Technology", students: 108, placed: 89, placementRate: 82.4, avgScore: 59, topHiringCompany: "Cognizant" },
      { deptId: "ece", deptName: "Electronics & Communication", students: 82, placed: 60, placementRate: 73.1, avgScore: 51, topHiringCompany: "Texas Instruments" },
      { deptId: "ds", deptName: "Data Science & AI", students: 44, placed: 39, placementRate: 88.6, avgScore: 66, topHiringCompany: "MuSigma" },
      { deptId: "me", deptName: "Mechanical Engineering", students: 68, placed: 44, placementRate: 64.7, avgScore: 40, topHiringCompany: "Mahindra" },
      { deptId: "ee", deptName: "Electrical Engineering", students: 63, placed: 43, placementRate: 68.2, avgScore: 43, topHiringCompany: "ABB India" },
    ],
    topRecruiters: [
      { name: "Infosys Ltd", hiredCount: 52, avgPackage: "6.5 LPA", domain: "IT Consulting" },
      { name: "Wipro Technologies", hiredCount: 38, avgPackage: "6.2 LPA", domain: "Enterprise IT" },
      { name: "TechNova Systems", hiredCount: 34, avgPackage: "8.5 LPA", domain: "Software Dev" },
      { name: "Qualcomm India", hiredCount: 14, avgPackage: "18.0 LPA", domain: "VLSI / Hardware" },
      { name: "Deloitte USI", hiredCount: 20, avgPackage: "9.0 LPA", domain: "Advisory" },
    ],
  },
  "2022-23": {
    year: "2022–23",
    totalStudents: 495,
    assessedCount: 420,
    placementRate: 74.3,
    totalPlaced: 368,
    averageCTC: "7.1 LPA",
    highestCTC: "32.0 LPA",
    activeRecruiters: 39,
    totalInternships: 156,
    departments: [
      { deptId: "cse", deptName: "Computer Science & Engineering", students: 155, placed: 128, placementRate: 82.5, avgScore: 60, topHiringCompany: "TCS / Capgemini" },
      { deptId: "it", deptName: "Information Technology", students: 100, placed: 78, placementRate: 78.0, avgScore: 56, topHiringCompany: "HCL Tech" },
      { deptId: "ece", deptName: "Electronics & Communication", students: 78, placed: 53, placementRate: 67.9, avgScore: 48, topHiringCompany: "Robert Bosch" },
      { deptId: "ds", deptName: "Data Science & AI", students: 36, placed: 31, placementRate: 86.1, avgScore: 62, topHiringCompany: "Fractal Analytics" },
      { deptId: "me", deptName: "Mechanical Engineering", students: 66, placed: 40, placementRate: 60.6, avgScore: 38, topHiringCompany: "Hero MotoCorp" },
      { deptId: "ee", deptName: "Electrical Engineering", students: 60, placed: 38, placementRate: 63.3, avgScore: 41, topHiringCompany: "Siemens" },
    ],
    topRecruiters: [
      { name: "Tata Consultancy Services", hiredCount: 64, avgPackage: "6.0 LPA", domain: "IT Services" },
      { name: "Capgemini India", hiredCount: 42, avgPackage: "6.5 LPA", domain: "Systems" },
      { name: "Tech Mahindra", hiredCount: 28, avgPackage: "5.8 LPA", domain: "Telecom" },
      { name: "L&T Technology Services", hiredCount: 19, avgPackage: "7.2 LPA", domain: "Engineering" },
    ],
  },
  "2021-22": {
    year: "2021–22",
    totalStudents: 460,
    assessedCount: 375,
    placementRate: 71.5,
    totalPlaced: 329,
    averageCTC: "6.4 LPA",
    highestCTC: "28.0 LPA",
    activeRecruiters: 34,
    totalInternships: 132,
    departments: [
      { deptId: "cse", deptName: "Computer Science & Engineering", students: 145, placed: 116, placementRate: 80.0, avgScore: 57, topHiringCompany: "Wipro / TCS" },
      { deptId: "it", deptName: "Information Technology", students: 92, placed: 70, placementRate: 76.0, avgScore: 53, topHiringCompany: "Infosys" },
      { deptId: "ece", deptName: "Electronics & Communication", students: 74, placed: 48, placementRate: 64.8, avgScore: 45, topHiringCompany: "KPIT" },
      { deptId: "ds", deptName: "Data Science & AI", students: 28, placed: 23, placementRate: 82.1, avgScore: 59, topHiringCompany: "Accenture" },
      { deptId: "me", deptName: "Mechanical Engineering", students: 63, placed: 37, placementRate: 58.7, avgScore: 36, topHiringCompany: "Ashok Leyland" },
      { deptId: "ee", deptName: "Electrical Engineering", students: 58, placed: 35, placementRate: 60.3, avgScore: 39, topHiringCompany: "BHEL" },
    ],
    topRecruiters: [
      { name: "Cognizant Technology", hiredCount: 48, avgPackage: "5.5 LPA", domain: "IT" },
      { name: "Tata Consultancy Services", hiredCount: 52, avgPackage: "5.2 LPA", domain: "IT" },
      { name: "Accenture India", hiredCount: 36, avgPackage: "6.5 LPA", domain: "Consulting" },
      { name: "Wipro", hiredCount: 30, avgPackage: "5.0 LPA", domain: "Software" },
    ],
  },
};

export interface ArchiveReportDefinition {
  id: string;
  title: string;
  category: "placements" | "skills" | "internships" | "partnerships";
  description: string;
  format: string;
  recordsCount: number;
  fileName: string;
  headers: string[];
  generateRows: (year: string) => (string | number)[][];
}

export const ARCHIVE_REPORTS: ArchiveReportDefinition[] = [
  {
    id: "rep-placement-master",
    title: "Batch Placement Master Sheet",
    category: "placements",
    description: "Complete student-level placement record with company offers, CTC package, offer date, and role designation.",
    format: "CSV / Excel",
    recordsCount: 450,
    fileName: "Placement_Master_Sheet",
    headers: ["Registration ID", "Student Name", "Department", "Company", "Role", "CTC Offered (LPA)", "Offer Category", "Status"],
    generateRows: (year) => {
      const depts = ["CSE", "IT", "ECE", "DS", "ME", "EE"];
      const companies = ["TechNova Systems", "Tata Consultancy Services", "DataForge Analytics", "Amazon", "Microsoft", "Infosys", "Deloitte"];
      const roles = ["Software Engineer", "Frontend Developer", "Data Analyst", "DevOps Trainee", "Embedded Engineer", "Systems Analyst"];
      const rows: (string | number)[][] = [];
      const cleanYear = year.replace(/[^0-9]/g, "").slice(0, 4) || "2024";

      for (let i = 1; i <= 60; i++) {
        const dept = depts[i % depts.length];
        const num = String(i).padStart(3, "0");
        const regId = `${dept}${cleanYear}${num}`;
        const company = companies[i % companies.length];
        const role = roles[i % roles.length];
        const ctc = (5.5 + (i % 15) * 1.2).toFixed(1);
        rows.push([regId, `Student ${num}`, dept, company, role, ctc, i % 3 === 0 ? "Dream Offer" : "Standard", "Placed"]);
      }
      return rows;
    },
  },
  {
    id: "rep-skill-audit",
    title: "Institutional Skill Assessment Dossier",
    category: "skills",
    description: "Departmental competency benchmarks, skill readiness indices, gap analysis against active corporate demands.",
    format: "CSV / PDF Dossier",
    recordsCount: 120,
    fileName: "Skill_Assessment_Dossier",
    headers: ["Skill Competency", "Category", "Cohort Tested", "Student Avg (0-100)", "Industry Demand (0-100)", "Deficit Gap", "Benchmarking Status"],
    generateRows: () => {
      const skills = [
        ["Python Programming", "Programming", 512, 74, 82, -8, "Good"],
        ["React & Frontend", "Web Dev", 480, 71, 75, -4, "Aligned"],
        ["Cloud Architecture & AWS", "Cloud", 460, 36, 75, -39, "Critical Gap"],
        ["Docker & Kubernetes", "Cloud", 410, 32, 70, -38, "Critical Gap"],
        ["Data Structures & Algorithms", "Programming", 520, 68, 80, -12, "Moderate Gap"],
        ["SQL & Database Optimization", "Databases", 495, 62, 70, -8, "Good"],
        ["RESTful APIs & Microservices", "Web Dev", 460, 64, 68, -4, "Aligned"],
        ["Embedded C / IoT", "Hardware", 160, 58, 65, -7, "Moderate Gap"],
        ["Professional Communication", "Soft Skills", 530, 68, 72, -4, "Aligned"],
      ];
      return skills;
    },
  },
  {
    id: "rep-internship-registry",
    title: "Corporate Internship & Stipend Registry",
    category: "internships",
    description: "Detailed register of summer internships, corporate project sponsorships, monthly stipends, and PPO conversions.",
    format: "CSV / Excel",
    recordsCount: 210,
    fileName: "Internship_Stipend_Registry",
    headers: ["Student Reg ID", "Student Name", "Department", "Host Organization", "Duration (Months)", "Monthly Stipend (INR)", "PPO Converted"],
    generateRows: (year) => {
      const companies = ["TechNova", "Finlytics", "Orbital Cloud", "Bosch", "Siemens", "L&T"];
      const rows: (string | number)[][] = [];
      const cleanYear = year.replace(/[^0-9]/g, "").slice(0, 4) || "2024";

      for (let i = 1; i <= 40; i++) {
        const num = String(i).padStart(3, "0");
        const company = companies[i % companies.length];
        const stipend = 15000 + (i % 8) * 5000;
        const ppo = i % 2 === 0 ? "Yes" : "Under Evaluation";
        rows.push([`CSE${cleanYear}${num}`, `Intern ${num}`, "CSE", company, "6", stipend, ppo]);
      }
      return rows;
    },
  },
  {
    id: "rep-mou-ledger",
    title: "Corporate MoUs & Engagement Ledger",
    category: "partnerships",
    description: "Historical record of industry MoUs signed, FDPs conducted, student hires per agreement, and validity periods.",
    format: "CSV / Official Ledger",
    recordsCount: 35,
    fileName: "Corporate_MoU_Ledger",
    headers: ["Company Name", "Industry Sector", "Agreement Scope", "Signing Date", "Expiry Date", "Students Hired", "Programs Conducted", "Status"],
    generateRows: (year) => {
      const y = year.split("–")[0].trim() || "2024";
      return [
        ["Tata Consultancy Services", "Software & IT", "Campus Hiring & FDP", `01-08-${y}`, `01-08-${parseInt(y, 10) + 3}`, 58, 4, "Active"],
        ["TechNova Systems", "Cloud & AI", "Incubation & Projects", `15-09-${y}`, `15-09-${parseInt(y, 10) + 3}`, 42, 3, "Active"],
        ["DataForge Analytics", "Fintech & Data", "R&D Collaboration", `10-06-${y}`, `10-06-${parseInt(y, 10) + 2}`, 26, 2, "Active"],
        ["Siemens Digital Industries", "Automation & IoT", "Lab Setup & Certifications", `20-07-${y}`, `20-07-${parseInt(y, 10) + 4}`, 18, 3, "Active"],
        ["Qualcomm India", "Semiconductors", "VLSI Research", `05-11-${y}`, `05-11-${parseInt(y, 10) + 3}`, 14, 2, "Active"],
      ];
    },
  },
];
