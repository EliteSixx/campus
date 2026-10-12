import type { components } from "@/lib/ai/types";

type Job = components["schemas"]["Job"];
type Branch = components["schemas"]["Branch"];

interface RecruiterStore {
  savedJob: Job | null;
  shortlistedByJob: Record<string, string[]>;
}

const STORE_KEY = "campuslink-recruiter-store";
const branches = new Set<string>(["CSE", "IT", "ECE", "EEE", "ME", "CE", "OTHER"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptional(value: unknown, type: "number" | "string"): boolean {
  return value === undefined || value === null || typeof value === type;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isJob(value: unknown): value is Job {
  if (!isRecord(value)) return false;

  return (
    typeof value.role === "string" &&
    typeof value.min_cgpa === "number" &&
    isOptional(value.job_id, "string") &&
    isOptional(value.company, "string") &&
    isOptional(value.max_backlogs, "number") &&
    (value.eligible_branches === undefined ||
      (Array.isArray(value.eligible_branches) &&
        value.eligible_branches.every((branch) => typeof branch === "string" && branches.has(branch)))) &&
    (value.required_skills === undefined || isStringArray(value.required_skills)) &&
    (value.preferred_skills === undefined || isStringArray(value.preferred_skills)) &&
    isOptional(value.experience_years, "number") &&
    isOptional(value.ctc_lpa, "number")
  );
}

function isRecruiterStore(value: unknown): value is RecruiterStore {
  if (!isRecord(value) || !("savedJob" in value) || !("shortlistedByJob" in value)) return false;
  if (value.savedJob !== null && !isJob(value.savedJob)) return false;
  if (!isRecord(value.shortlistedByJob)) return false;

  return Object.values(value.shortlistedByJob).every(isStringArray);
}

export function loadRecruiterStore(): RecruiterStore {
  const serialized = window.localStorage.getItem(STORE_KEY);
  if (serialized === null) return { savedJob: null, shortlistedByJob: {} };

  const value: unknown = JSON.parse(serialized);
  if (!isRecruiterStore(value)) {
    throw new Error("Saved recruiter data is invalid. Clear the browser's CampusLink recruiter data and try again.");
  }

  return value;
}

export function saveRecruiterStore(store: RecruiterStore): void {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}
