import type { InternshipRecord, PlacementTrend } from "./types";

const names = [
  "Rudy Sharma", "Ananya Iyer", "Kabir Kapoor", "Meera Nair", "Arjun Reddy",
  "Ishita Gupta", "Rohan Chauhan", "Sanya Das", "Devansh Menon", "Priya Verma",
  "Vikram Singh", "Nisha Rao", "Aarav Bansal", "Tanvi Joshi", "Karan Malhotra",
  "Riya Pillai", "Yash Agarwal", "Simran Kaur", "Aditya Bhat", "Neha Chatterjee",
  "Harsh Patel", "Divya Sinha", "Rahul Thakur", "Pooja Mishra", "Akash Dubey",
  "Sneha Yadav", "Varun Saxena", "Ankita Shukla", "Nitin Tiwari", "Shalini Pandey",
];

const companies = ["TechNova", "DataForge", "Orbital Cloud", "Cybergrid Labs", "Finlytics", "Northwind Systems", "Pixel Foundry", "Meridian Health Tech", "Vertex Robotics", "Ledgerline"];
const roles = [
  "Backend Developer Intern", "Frontend Developer Intern", "Data Engineering Intern",
  "Cloud Engineer Intern", "Security Analyst Intern", "Full Stack Developer",
  "DevOps Engineer", "ML Engineer Intern", "QA Intern", "Platform Engineer Intern",
  "Software Engineer", "Data Analyst", "Site Reliability Engineer",
];
const departments = ["CSE", "IT", "ECE", "DS", "ME", "EE"];
const statuses: InternshipRecord["status"][] = ["applied", "shortlisted", "ongoing", "completed", "rejected"];

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

export const internshipRecords: InternshipRecord[] = Array.from({ length: 60 }).map((_, i) => {
  const rand = seededRand(i * 31 + 7);
  const statusIdx = Math.floor(rand() * 5);
  const status = statuses[statusIdx];
  const isPlacement = rand() > 0.6;
  const deptIdx = Math.floor(rand() * departments.length);
  const companyIdx = Math.floor(rand() * companies.length);
  const roleIdx = Math.floor(rand() * roles.length);

  const month = Math.floor(rand() * 8) + 1;
  const startDate = `2026-${String(month).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}`;
  const endMonth = Math.min(12, month + Math.floor(rand() * 4) + 2);
  const endDate = status === "completed" ? `2026-${String(endMonth).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}` : null;

  const stipendVal = isPlacement
    ? `₹${Math.floor(rand() * 10 + 6)} LPA`
    : `₹${Math.floor(rand() * 15 + 15)},000/mo`;

  return {
    id: `int-${i + 1}`,
    studentName: names[i % names.length],
    studentId: `s${i + 1}`,
    department: departments[deptIdx],
    company: companies[companyIdx],
    role: roles[roleIdx],
    status,
    startDate,
    endDate,
    stipend: stipendVal,
    type: isPlacement ? "Placement" : "Internship",
  };
});

export const placementTrendData: PlacementTrend[] = [
  { month: "Jan", placements: 8, internships: 5 },
  { month: "Feb", placements: 12, internships: 8 },
  { month: "Mar", placements: 18, internships: 14 },
  { month: "Apr", placements: 22, internships: 10 },
  { month: "May", placements: 28, internships: 6 },
  { month: "Jun", placements: 32, internships: 12 },
  { month: "Jul", placements: 35, internships: 18 },
  { month: "Aug", placements: 28, internships: 22 },
];
