import type { DashboardOverview, KPITrend, PipelineSummary, SkillGapSummary, PartnerHighlight } from "./types";
import { departmentSummaryData } from "./mock-departments";

export const kpiTrends: KPITrend[] = [
  { metric: "Assessed Students", current: 84, previous: 71, changePercent: 18, direction: "up" },
  { metric: "Placement Ready", current: 51, previous: 43, changePercent: 19, direction: "up" },
  { metric: "Active Internships", current: 47, previous: 38, changePercent: 24, direction: "up" },
  { metric: "Students Placed", current: 183, previous: 168, changePercent: 9, direction: "up" },
  { metric: "Avg Skill Score", current: 58, previous: 54, changePercent: 7, direction: "up" },
  { metric: "Partner Count", current: 10, previous: 8, changePercent: 25, direction: "up" },
];

export const topSkillGaps: SkillGapSummary[] = [
  { skillName: "Cloud & Container Infrastructure", gap: 40, industryDemand: 72, studentAvg: 32, worstDept: "IT" },
  { skillName: "PLC / SCADA Automation", gap: 30, industryDemand: 78, studentAvg: 48, worstDept: "EE" },
  { skillName: "ANSYS Finite Element Analysis (FEA)", gap: 26, industryDemand: 72, studentAvg: 46, worstDept: "ME" },
  { skillName: "Real-Time OS (RTOS)", gap: 27, industryDemand: 72, studentAvg: 45, worstDept: "ECE" },
  { skillName: "Big Data & Pipeline ETL", gap: 24, industryDemand: 72, studentAvg: 48, worstDept: "DS" },
];

export const internshipPipeline: PipelineSummary = {
  applied: 234,
  shortlisted: 118,
  ongoing: 47,
  completed: 89,
  rejected: 62,
  total: 550,
};

export const partnerHighlights: PartnerHighlight[] = [
  { id: "p1", name: "TechNova", initials: "TN", engagementLevel: "high", studentsHired: 24, mouStatus: "active" },
  { id: "p2", name: "DataForge", initials: "DF", engagementLevel: "high", studentsHired: 18, mouStatus: "active" },
  { id: "p3", name: "Orbital Cloud", initials: "OC", engagementLevel: "moderate", studentsHired: 15, mouStatus: "active" },
  { id: "p4", name: "Cybergrid Labs", initials: "CG", engagementLevel: "moderate", studentsHired: 12, mouStatus: "expiring-soon" },
  { id: "p5", name: "Finlytics", initials: "FL", engagementLevel: "high", studentsHired: 14, mouStatus: "active" },
];

export const dashboardOverview: DashboardOverview = {
  kpis: {
    totalStudents: 595,
    assessedPercent: 84,
    placementReadyPercent: 51,
    activeInternships: 47,
    studentsPlaced: 183,
    totalPartners: 10,
  },
  trends: kpiTrends,
  departmentSummary: departmentSummaryData,
  topSkillGaps,
  internshipPipeline,
  partnerHighlights,
};
