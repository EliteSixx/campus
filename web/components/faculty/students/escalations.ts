import type { PredictionState, RiskLevel } from "./at-risk-data";
import type { DemoMentor } from "./escalation-mentors";

// Escalation rules for the Mentor "At-risk students" screen, as pure functions.
//
// Nothing here scores a student. A student counts as at-risk only when the AI
// service returned HIGH or MEDIUM, and an escalation copies the reasons and
// interventions from that response unchanged. No clock is read and no storage
// is touched: ids and timestamps are arguments, and useEscalations does the
// saving.

export type EscalationStatus = "OPEN" | "RESOLVED";

// The returned risk levels that count as at-risk.
export type AtRiskLevel = Exclude<RiskLevel, "LOW">;

export const MAX_RESOLUTION_NOTE = 300;

export interface Escalation {
  // "esc-<timestamp>"
  id: string;
  studentId: string;
  // Risk, reasons and interventions exactly as the service returned them when
  // the escalation was created.
  risk: AtRiskLevel;
  reasons: string[];
  interventions: string[];
  mentorId: string;
  mentorName: string;
  // ISO timestamp.
  createdAt: string;
  status: EscalationStatus;
  // Both null while OPEN.
  resolvedAt: string | null;
  resolutionNote: string | null;
}

// ---------------------------------------------------------------------------
// Who can be escalated.

export type EscalationEligibility =
  | { eligible: true; risk: AtRiskLevel; reasons: string[]; interventions: string[] }
  // `reason` is a short phrase with no full stop, shown where the action would be.
  | { eligible: false; reason: string };

// Only a real (non-stub) prediction of HIGH or MEDIUM can be escalated.
export function escalationEligibility(prediction: PredictionState): EscalationEligibility {
  switch (prediction.status) {
    case "loading":
      return { eligible: false, reason: "Waiting for the risk prediction" };
    case "no_activity":
      return { eligible: false, reason: "No prediction: no activity data" };
    case "error":
      return { eligible: false, reason: "No prediction: the request failed" };
    case "ok": {
      const { risk, reasons, interventions, meta } = prediction.data;
      if (meta.stub) return { eligible: false, reason: "Stub prediction, not a model result" };
      if (risk !== "HIGH" && risk !== "MEDIUM") return { eligible: false, reason: "Low risk" };
      return { eligible: true, risk, reasons, interventions };
    }
  }
}

// ---------------------------------------------------------------------------
// Lookups. Generic so they also work on the display rows in useEscalations.

export function findOpenEscalation<T extends Escalation>(all: T[], studentId: string): T | null {
  return all.find((e) => e.studentId === studentId && e.status === "OPEN") ?? null;
}

// Newest first.
export function openEscalations<T extends Escalation>(all: T[]): T[] {
  return all
    .filter((e) => e.status === "OPEN")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Most recently resolved first.
export function resolvedEscalations<T extends Escalation>(all: T[]): T[] {
  return all
    .filter((e) => e.status === "RESOLVED")
    .sort((a, b) => (b.resolvedAt ?? "").localeCompare(a.resolvedAt ?? ""));
}

// The escalation to show for one student: the open one, or else the one
// resolved most recently.
export function currentEscalation<T extends Escalation>(all: T[], studentId: string): T | null {
  return (
    findOpenEscalation(all, studentId) ??
    resolvedEscalations(all).find((e) => e.studentId === studentId) ??
    null
  );
}

// ---------------------------------------------------------------------------
// Changes. Each returns a new list and leaves `all` untouched.

export type EscalationResult =
  | { ok: true; escalations: Escalation[] }
  | { ok: false; error: string };

export interface NewEscalation {
  id: string;
  studentId: string;
  // The student's prediction as it stands when the mentor confirms.
  prediction: PredictionState;
  mentor: DemoMentor;
  // ISO timestamp, used as createdAt.
  now: string;
}

// A student can have one OPEN escalation at a time.
export function createEscalation(all: Escalation[], input: NewEscalation): EscalationResult {
  const open = findOpenEscalation(all, input.studentId);
  if (open) {
    return {
      ok: false,
      error: `${input.studentId} is already escalated to ${open.mentorName}.`,
    };
  }
  const eligibility = escalationEligibility(input.prediction);
  if (!eligibility.eligible) {
    return { ok: false, error: `${input.studentId} cannot be escalated. ${eligibility.reason}.` };
  }
  const escalation: Escalation = {
    id: input.id,
    studentId: input.studentId,
    risk: eligibility.risk,
    reasons: [...eligibility.reasons],
    interventions: [...eligibility.interventions],
    mentorId: input.mentor.mentor_id,
    mentorName: input.mentor.name,
    createdAt: input.now,
    status: "OPEN",
    resolvedAt: null,
    resolutionNote: null,
  };
  return { ok: true, escalations: [escalation, ...all] };
}

export interface EscalationResolution {
  id: string;
  note: string;
  // ISO timestamp, used as resolvedAt.
  now: string;
}

// Resolving needs a note; it is trimmed and cut to MAX_RESOLUTION_NOTE.
export function resolveEscalation(
  all: Escalation[],
  input: EscalationResolution,
): EscalationResult {
  const note = input.note.trim().slice(0, MAX_RESOLUTION_NOTE);
  if (note === "") return { ok: false, error: "Add a short note before resolving." };
  const target = all.find((e) => e.id === input.id);
  if (!target) return { ok: false, error: "This escalation no longer exists." };
  if (target.status !== "OPEN") return { ok: false, error: "This escalation is already resolved." };
  return {
    ok: true,
    escalations: all.map(
      (e): Escalation =>
        e.id === input.id
          ? { ...e, status: "RESOLVED", resolvedAt: input.now, resolutionNote: note }
          : e,
    ),
  };
}

// ---------------------------------------------------------------------------
// Stored records.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

// Anything malformed is dropped rather than repaired.
export function parseStoredEscalations(value: unknown): Escalation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): Escalation[] => {
    if (!isRecord(item)) return [];
    const { id, studentId, risk, reasons, interventions, mentorId, mentorName, createdAt } = item;
    if (
      typeof id !== "string" ||
      typeof studentId !== "string" ||
      (risk !== "HIGH" && risk !== "MEDIUM") ||
      !isStringArray(reasons) ||
      !isStringArray(interventions) ||
      typeof mentorId !== "string" ||
      typeof mentorName !== "string" ||
      typeof createdAt !== "string"
    ) {
      return [];
    }
    const base: Omit<Escalation, "status" | "resolvedAt" | "resolutionNote"> = {
      id,
      studentId,
      risk,
      reasons,
      interventions,
      mentorId,
      mentorName,
      createdAt,
    };
    const { status, resolvedAt, resolutionNote } = item;
    if (status === "OPEN") {
      return [{ ...base, status, resolvedAt: null, resolutionNote: null }];
    }
    if (
      status === "RESOLVED" &&
      typeof resolvedAt === "string" &&
      typeof resolutionNote === "string"
    ) {
      return [{ ...base, status, resolvedAt, resolutionNote }];
    }
    return [];
  });
}
