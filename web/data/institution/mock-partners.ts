import type { CorporatePartner } from "./types";

export const corporatePartners: CorporatePartner[] = [
  {
    id: "p1", name: "TechNova", initials: "TN", industry: "Cloud Infrastructure", hq: "Bengaluru",
    mouStatus: "active", mouStart: "2024-01-15", mouEnd: "2027-01-14",
    engagementLevel: "high", engagementScore: 92, studentsHired: 24, activePrograms: 3,
    programs: [
      { name: "Cloud DevOps Bootcamp", type: "Workshop", date: "2026-03-10", participants: 85 },
      { name: "TechNova Hackathon 2026", type: "Hackathon", date: "2026-06-15", participants: 120 },
      { name: "Summer Internship Drive", type: "Internship Drive", date: "2026-02-01", participants: 200 },
    ],
    hiringHistory: [{ year: "2023", hired: 8 }, { year: "2024", hired: 12 }, { year: "2025", hired: 18 }, { year: "2026", hired: 24 }],
    contactPerson: "Vikram Mehta", contactEmail: "vikram.mehta@technova.io",
  },
  {
    id: "p2", name: "DataForge", initials: "DF", industry: "Data Engineering", hq: "Hyderabad",
    mouStatus: "active", mouStart: "2024-06-01", mouEnd: "2027-05-31",
    engagementLevel: "high", engagementScore: 88, studentsHired: 18, activePrograms: 2,
    programs: [
      { name: "Data Engineering Masterclass", type: "FDP", date: "2026-04-20", participants: 40 },
      { name: "Analytics Internship Drive", type: "Internship Drive", date: "2026-01-15", participants: 150 },
    ],
    hiringHistory: [{ year: "2023", hired: 5 }, { year: "2024", hired: 10 }, { year: "2025", hired: 14 }, { year: "2026", hired: 18 }],
    contactPerson: "Shreya Patel", contactEmail: "shreya.patel@dataforge.in",
  },
  {
    id: "p3", name: "Orbital Cloud", initials: "OC", industry: "Cloud Platforms", hq: "Bengaluru",
    mouStatus: "active", mouStart: "2025-01-01", mouEnd: "2027-12-31",
    engagementLevel: "moderate", engagementScore: 74, studentsHired: 15, activePrograms: 2,
    programs: [
      { name: "Cloud Certification Prep", type: "Workshop", date: "2026-05-12", participants: 65 },
      { name: "Infrastructure Guest Talk", type: "Guest Lecture", date: "2026-07-18", participants: 90 },
    ],
    hiringHistory: [{ year: "2024", hired: 6 }, { year: "2025", hired: 10 }, { year: "2026", hired: 15 }],
    contactPerson: "Anand Kumar", contactEmail: "anand.k@orbitalcloud.com",
  },
  {
    id: "p4", name: "Cybergrid Labs", initials: "CG", industry: "Cybersecurity", hq: "Pune",
    mouStatus: "expiring-soon", mouStart: "2023-09-01", mouEnd: "2026-08-31",
    engagementLevel: "moderate", engagementScore: 68, studentsHired: 12, activePrograms: 1,
    programs: [
      { name: "Ethical Hacking Workshop", type: "Workshop", date: "2026-02-25", participants: 55 },
      { name: "Cybersecurity FDP", type: "FDP", date: "2025-11-10", participants: 30 },
    ],
    hiringHistory: [{ year: "2023", hired: 4 }, { year: "2024", hired: 6 }, { year: "2025", hired: 9 }, { year: "2026", hired: 12 }],
    contactPerson: "Neelam Saxena", contactEmail: "neelam@cybergridlabs.com",
  },
  {
    id: "p5", name: "Finlytics", initials: "FL", industry: "Fintech", hq: "Mumbai",
    mouStatus: "active", mouStart: "2024-03-01", mouEnd: "2027-02-28",
    engagementLevel: "high", engagementScore: 85, studentsHired: 14, activePrograms: 2,
    programs: [
      { name: "Fintech Innovation Lab", type: "Hackathon", date: "2026-04-05", participants: 80 },
      { name: "Backend Systems Talk", type: "Guest Lecture", date: "2026-06-22", participants: 110 },
    ],
    hiringHistory: [{ year: "2023", hired: 3 }, { year: "2024", hired: 7 }, { year: "2025", hired: 11 }, { year: "2026", hired: 14 }],
    contactPerson: "Rajan Desai", contactEmail: "rajan.desai@finlytics.co",
  },
  {
    id: "p6", name: "Northwind Systems", initials: "NS", industry: "Enterprise Software", hq: "Gurugram",
    mouStatus: "active", mouStart: "2025-04-01", mouEnd: "2028-03-31",
    engagementLevel: "moderate", engagementScore: 71, studentsHired: 10, activePrograms: 1,
    programs: [
      { name: "Enterprise SaaS Architecture", type: "Guest Lecture", date: "2026-03-18", participants: 75 },
    ],
    hiringHistory: [{ year: "2025", hired: 5 }, { year: "2026", hired: 10 }],
    contactPerson: "Amit Chandra", contactEmail: "amit.c@northwind.com",
  },
  {
    id: "p7", name: "Pixel Foundry", initials: "PF", industry: "Product Design", hq: "Remote",
    mouStatus: "pending", mouStart: "2026-09-01", mouEnd: "2028-08-31",
    engagementLevel: "low", engagementScore: 35, studentsHired: 4, activePrograms: 0,
    programs: [
      { name: "UI/UX Design Thinking", type: "Workshop", date: "2026-08-10", participants: 45 },
    ],
    hiringHistory: [{ year: "2025", hired: 2 }, { year: "2026", hired: 4 }],
    contactPerson: "Rhea Malhotra", contactEmail: "rhea@pixelfoundry.design",
  },
  {
    id: "p8", name: "Meridian Health Tech", initials: "MH", industry: "HealthTech", hq: "Chennai",
    mouStatus: "active", mouStart: "2025-06-01", mouEnd: "2028-05-31",
    engagementLevel: "moderate", engagementScore: 62, studentsHired: 8, activePrograms: 1,
    programs: [
      { name: "Healthcare Data Systems", type: "FDP", date: "2026-05-05", participants: 28 },
      { name: "Health Informatics Talk", type: "Guest Lecture", date: "2026-07-02", participants: 60 },
    ],
    hiringHistory: [{ year: "2025", hired: 3 }, { year: "2026", hired: 8 }],
    contactPerson: "Dr. Lakshmi Venkat", contactEmail: "lakshmi.v@meridianht.com",
  },
  {
    id: "p9", name: "Vertex Robotics", initials: "VR", industry: "Robotics", hq: "Pune",
    mouStatus: "active", mouStart: "2024-08-01", mouEnd: "2027-07-31",
    engagementLevel: "low", engagementScore: 48, studentsHired: 6, activePrograms: 1,
    programs: [
      { name: "Embedded Systems Workshop", type: "Workshop", date: "2026-01-20", participants: 35 },
    ],
    hiringHistory: [{ year: "2024", hired: 2 }, { year: "2025", hired: 4 }, { year: "2026", hired: 6 }],
    contactPerson: "Siddharth Jain", contactEmail: "sid.jain@vertexrobotics.in",
  },
  {
    id: "p10", name: "Ledgerline", initials: "LL", industry: "Blockchain", hq: "Remote",
    mouStatus: "expired", mouStart: "2023-01-01", mouEnd: "2025-12-31",
    engagementLevel: "low", engagementScore: 28, studentsHired: 3, activePrograms: 0,
    programs: [
      { name: "Web3 Fundamentals", type: "Guest Lecture", date: "2025-09-15", participants: 50 },
    ],
    hiringHistory: [{ year: "2024", hired: 1 }, { year: "2025", hired: 3 }],
    contactPerson: "Nikhil Rao", contactEmail: "nikhil@ledgerline.xyz",
  },
];

export function getPartnerById(id: string): CorporatePartner | undefined {
  return corporatePartners.find(p => p.id === id);
}
