import type { AiError, PredictPlacementResponse, ReadinessResponse } from "@/lib/ai/client";
import type { components } from "@/lib/ai/types";
import { demoApplications } from "@/data/demo/applications";
import { demoPlacementActivities } from "@/data/demo/placement-activity";
import { demoStudents } from "@/data/demo/students";
import type { DemoApplication, DemoStudent } from "@/data/demo/types";

// Data plumbing for the Mentor "At-risk students" screen.
//
// Nothing here scores a student. Risk, probability and readiness level all come
// from the AI service through @/lib/ai/client; this file only joins demo seed
// records and orders rows by the values the service returned.

export type PlacementActivity = components["schemas"]["PlacementActivity"];
export type RiskLevel = components["schemas"]["RiskLevel"];
export type ReadinessLevel = components["schemas"]["ReadinessLevel"];

export type CallState<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: AiError };

// "no_activity": no placement-activity record exists, so no prediction is
// requested. The service would default missing activity to zeros, which would
// silently invent numbers.
export type PredictionState = CallState<PredictPlacementResponse> | { status: "no_activity" };

export interface AtRiskSource {
  student: DemoStudent;
  activity: PlacementActivity | null;
  // Demo application records for context only. They hold no interview or
  // rejection counts, so they cannot stand in for a placement-activity record.
  applications: DemoApplication[];
}

export interface AtRiskRow extends AtRiskSource {
  readiness: CallState<ReadinessResponse>;
  prediction: PredictionState;
}

// Looks the student up in demoPlacementActivities. A student with no record
// there gets null, which the screen shows as "No activity data" without calling
// the service.
function activityFor(studentId: string): PlacementActivity | null {
  const record = demoPlacementActivities.find((a) => a.student_id === studentId);
  if (!record) return null;
  const { drives_applied, shortlisted, interviews_attended, rejections } = record;
  return { drives_applied, shortlisted, interviews_attended, rejections };
}

export function buildSources(): AtRiskSource[] {
  return demoStudents.map((student) => ({
    student,
    activity: activityFor(student.student_id),
    applications: demoApplications.filter((a) => a.student_id === student.student_id),
  }));
}

// ---------------------------------------------------------------------------
// Ordering and filtering (by values returned from the service).

const RISK_ORDER: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function sortKey(row: AtRiskRow): number {
  switch (row.prediction.status) {
    case "ok":
      return RISK_ORDER[row.prediction.data.risk];
    case "loading":
      return 3;
    case "error":
      return 4;
    case "no_activity":
      return 5;
  }
}

// HIGH first, then MEDIUM, LOW, still loading, failed, and no activity data.
// Within one risk level, the higher returned probability comes first.
export function sortRows(rows: AtRiskRow[]): AtRiskRow[] {
  return [...rows].sort((a, b) => {
    const byRisk = sortKey(a) - sortKey(b);
    if (byRisk !== 0) return byRisk;
    if (a.prediction.status === "ok" && b.prediction.status === "ok") {
      const byProbability =
        b.prediction.data.probability_unplaced - a.prediction.data.probability_unplaced;
      if (byProbability !== 0) return byProbability;
    }
    return a.student.student_id.localeCompare(b.student.student_id);
  });
}

export type RiskFilter = "ALL" | RiskLevel | "NONE";

export const RISK_FILTERS: { value: RiskFilter; label: string }[] = [
  { value: "ALL", label: "All students" },
  { value: "HIGH", label: "High risk" },
  { value: "MEDIUM", label: "Medium risk" },
  { value: "LOW", label: "Low risk" },
  { value: "NONE", label: "No prediction" },
];

export function matchesFilter(row: AtRiskRow, filter: RiskFilter): boolean {
  if (filter === "ALL") return true;
  if (row.prediction.status !== "ok") return filter === "NONE";
  return row.prediction.data.risk === filter;
}

// ---------------------------------------------------------------------------
// Display helpers. Formatting only; no values are derived.

export const READINESS_LABEL: Record<ReadinessLevel, string> = {
  NOT_READY: "Not ready",
  DEVELOPING: "Developing",
  READY: "Ready",
  HIGHLY_EMPLOYABLE: "Highly employable",
};

export const READINESS_TONE: Record<ReadinessLevel, "danger" | "warning" | "success" | "accent"> = {
  NOT_READY: "danger",
  DEVELOPING: "warning",
  READY: "success",
  HIGHLY_EMPLOYABLE: "accent",
};

export const RISK_TONE: Record<RiskLevel, "danger" | "warning" | "success"> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "success",
};

const percent = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 1 });

// Shows the service's probability_unplaced (0 to 1) as a percentage.
export function formatProbability(probability: number): string {
  return percent.format(probability);
}

export function studentLabel(student: DemoStudent): string {
  return `${student.branch} · ${student.graduation_year}`;
}
