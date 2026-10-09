import type { DemoJob } from "./types";

// JOB001 matches contracts/examples/job.json.
export const demoJobs: DemoJob[] = [
  {
    job_id: "JOB001", company: "Acme Tech", role: "Backend Developer", min_cgpa: 7.0,
    max_backlogs: 0, eligible_branches: ["CSE", "IT"], required_skills: ["Python", "SQL", "REST APIs", "Docker"],
    preferred_skills: ["AWS"], experience_years: 0, ctc_lpa: 8.0,
  },
  {
    job_id: "JOB002", company: "Northstar Analytics", role: "Data Analyst", min_cgpa: 6.5,
    max_backlogs: 1, eligible_branches: ["CSE", "IT", "ECE"], required_skills: ["Python", "SQL", "Pandas"],
    preferred_skills: ["Machine Learning", "AWS"], experience_years: 0, ctc_lpa: 6.5,
  },
  {
    job_id: "JOB003", company: "CircuitWorks", role: "Embedded Systems Engineer", min_cgpa: 6.8,
    max_backlogs: 0, eligible_branches: ["ECE", "EEE"], required_skills: ["C", "C++", "Embedded Systems"],
    preferred_skills: ["Verilog", "Python"], experience_years: 0, ctc_lpa: 7.2,
  },
  {
    job_id: "JOB004", company: "BuildRight Infrastructure", role: "Graduate Civil Engineer", min_cgpa: 6.0,
    max_backlogs: 2, eligible_branches: ["CE"], required_skills: ["AutoCAD", "Structural Analysis", "Excel"],
    preferred_skills: ["Revit", "BIM"], experience_years: 0, ctc_lpa: 5.8,
  },
];
