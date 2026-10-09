import type { components } from "@/lib/ai/types";

export type DemoStudent = components["schemas"]["Student"];
export type DemoJob = components["schemas"]["Job"];

export interface DemoPlacementDrive {
  drive_id: string;
  job_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  panel: string;
  graduation_year: number;
  student_ids: string[];
}

export interface DemoApplication {
  application_id: string;
  student_id: string;
  job_id: string;
  company: string;
  status: "OFFERED" | "SHORTLISTED" | "APPLIED";
  applied_at: string;
  ctc_lpa: number;
}

export interface DemoDocument {
  document_id: string;
  label: string;
  required: boolean;
  status: "PENDING" | "SUBMITTED" | "VERIFIED";
}

export interface DemoOffer {
  offer_id: string;
  student_id: string;
  application_id: string;
  company: string;
  role: string;
  ctc_lpa: number;
  joining_date: string;
  document_checklist: DemoDocument[];
}

export interface DemoPlacementActivity {
  student_id: string;
  drives_applied: number;
  shortlisted: number;
  interviews_attended: number;
  rejections: number;
}
