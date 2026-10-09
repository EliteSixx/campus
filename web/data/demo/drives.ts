import type { DemoPlacementDrive } from "./types";

// Both drives share the same slot, venue, panel, and student cohort to expose all three conflicts.
export const demoPlacementDrives: DemoPlacementDrive[] = [
  {
    drive_id: "DRIVE-ACME-2026-01", job_id: "JOB001", title: "Acme Tech Backend Developer Drive",
    date: "2026-10-22", start_time: "10:00", end_time: "12:00", venue: "Seminar Hall 1", panel: "Panel A",
    graduation_year: 2027, student_ids: ["ST001", "ST002", "ST007", "ST008"],
  },
  {
    drive_id: "DRIVE-NORTHSTAR-2026-01", job_id: "JOB002", title: "Northstar Analytics Data Analyst Drive",
    date: "2026-10-22", start_time: "10:00", end_time: "12:00", venue: "Seminar Hall 1", panel: "Panel A",
    graduation_year: 2027, student_ids: ["ST001", "ST003", "ST008", "ST104"],
  },
];
