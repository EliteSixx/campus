import type { ProgramMode, ProgramType } from "@/data/faculty-programs";

// Types and pure rules for /faculty/programs. Only types are imported, so this
// file carries no data at runtime and is safe in client components.
//
// About dates: data/faculty-programs.ts has no calendar dates. `startsIn` is a
// display string relative to when the data was written ("3 weeks",
// "Applications close in 6 weeks"). parseStartsIn() reads the number of weeks
// out of it and nothing more, so no rule here needs today's date and no date is
// ever made up.

// ---------------------------------------------------------------------------
// Rows.

export interface ProgramGapSubject {
  id: string;
  code: string;
}

export interface ProgramGap {
  skillId: string;
  name: string;
  // Live postings that ask for this skill.
  demandCount: number;
  // My subjects whose syllabus is missing it.
  subjects: ProgramGapSubject[];
}

// What `startsIn` says, in weeks from when the data was written.
export interface ProgramTiming {
  kind: "starts" | "closes";
  weeks: number;
}

export interface ProgramRow {
  id: string;
  title: string;
  provider: string;
  type: ProgramType;
  mode: ProgramMode;
  durationWeeks: number;
  // "Fully sponsored", "Up to ₹18 lakh", "Honorarium" — shown as written.
  costText: string;
  eligibility: string;
  description: string;
  skillIds: string[];
  skillNames: string[];
  seatsLeft: number;
  // The data's own words, e.g. "3 weeks" or "Applications close in 6 weeks".
  startText: string;
  // null when startText does not say a number of weeks.
  timing: ProgramTiming | null;
  // Skills this programme teaches that some subject of mine is missing.
  gaps: ProgramGap[];
  gapSkillIds: string[];
  gapSubjectCodes: string[];
  // Sum of each gap skill's posting count, as the old page and the faculty
  // dashboard rank by. A posting asking for two gap skills counts twice.
  gapDemand: number;
  // Distinct live postings asking for at least one gap skill.
  postingsCount: number;
  // The weakest cohort skill (from My Students) this programme teaches.
  studentImpact: { skillName: string; cohortAverage: number } | null;
  // Position in getProgramsWithImpact(), the order the dashboard uses.
  impactRank: number;
}

export interface ProgramsTotals {
  open: number;
  matchedToGaps: number;
  gapSkillsCovered: number;
  // Starting, or closing for applications, within SOON_WEEKS.
  startingSoon: number;
}

export interface ProgramsWorkspace {
  faculty: { name: string; department: string };
  totalPostings: number;
  // In impact order.
  rows: ProgramRow[];
  totals: ProgramsTotals;
}

// ---------------------------------------------------------------------------
// Kinds of programme.

// Research grants pay for research; they do not close a teaching gap.
export function isFunding(type: ProgramType): boolean {
  return type === "Research Grant";
}

// ---------------------------------------------------------------------------
// Timing and urgency.

export const URGENT_WEEKS = 2;
export const SOON_WEEKS = 4;
export const FEW_SEATS = 5;

// "3 weeks" → starts in 3; "Applications close in 6 weeks" → closes in 6.
// Anything else → null, and the text is shown as it is.
export function parseStartsIn(text: string): ProgramTiming | null {
  const trimmed = text.trim();
  const starts = /^(\d+)\s+weeks?$/i.exec(trimmed);
  if (starts) return { kind: "starts", weeks: Number(starts[1]) };
  const closes = /^applications close in\s+(\d+)\s+weeks?$/i.exec(trimmed);
  if (closes) return { kind: "closes", weeks: Number(closes[1]) };
  return null;
}

function weeksText(n: number): string {
  return `${n} ${n === 1 ? "week" : "weeks"}`;
}

// "Starts in 3 weeks", "Applications close in 6 weeks", or the raw text.
export function timingText(row: ProgramRow): string {
  if (!row.timing) return row.startText;
  return row.timing.kind === "starts"
    ? `Starts in ${weeksText(row.timing.weeks)}`
    : `Applications close in ${weeksText(row.timing.weeks)}`;
}

export function startsSoon(row: ProgramRow): boolean {
  return row.timing !== null && row.timing.weeks <= SOON_WEEKS;
}

export type UrgencyLevel = "high" | "medium" | "none";

export interface Urgency {
  level: UrgencyLevel;
  text: string;
}

// High: 5 seats or fewer, or starting / closing within 2 weeks.
// Medium: starting / closing within 4 weeks.
export function urgencyOf(row: ProgramRow): Urgency {
  const parts: string[] = [];
  let level: UrgencyLevel = "none";

  if (row.timing && row.timing.weeks <= SOON_WEEKS) {
    level = row.timing.weeks <= URGENT_WEEKS ? "high" : "medium";
    parts.push(timingText(row));
  }
  if (row.seatsLeft <= FEW_SEATS) {
    level = "high";
    parts.push(`${row.seatsLeft} ${row.seatsLeft === 1 ? "seat" : "seats"} left`);
  }
  return { level, text: parts.join(" · ") };
}

// ---------------------------------------------------------------------------
// Ranking.

export type RankKey = "impact" | "soonest" | "shortest";

export const RANK_LABEL: Record<RankKey, string> = {
  impact: "Gap impact",
  soonest: "Starting soonest",
  shortest: "Shortest first",
};

// impact   — the dashboard's order: posting demand of the gaps closed, most
//            first, then the data's own order (impactRank holds both).
// soonest  — fewest weeks to start or close first; no week count goes last.
// shortest — fewest weeks long first.
// Ties fall back to impact order.
export function rankPrograms(rows: ProgramRow[], key: RankKey): ProgramRow[] {
  const byImpact = (a: ProgramRow, b: ProgramRow) => a.impactRank - b.impactRank;
  return [...rows].sort((a, b) => {
    if (key === "soonest") {
      const wa = a.timing?.weeks ?? Number.POSITIVE_INFINITY;
      const wb = b.timing?.weeks ?? Number.POSITIVE_INFINITY;
      if (wa !== wb) return wa - wb;
    }
    if (key === "shortest" && a.durationWeeks !== b.durationWeeks) {
      return a.durationWeeks - b.durationWeeks;
    }
    return byImpact(a, b);
  });
}

// The subject missing the most of this programme's gap skills (first listed on
// a tie), and its most-demanded missing skill: where a syllabus draft helps most.
export function bestDraftTarget(
  row: ProgramRow,
): { subject: ProgramGapSubject; skillId: string } | null {
  const counts = new Map<string, { subject: ProgramGapSubject; gaps: ProgramGap[] }>();
  for (const gap of row.gaps) {
    for (const subject of gap.subjects) {
      const entry = counts.get(subject.id) ?? { subject, gaps: [] };
      entry.gaps.push(gap);
      counts.set(subject.id, entry);
    }
  }
  let best: { subject: ProgramGapSubject; gaps: ProgramGap[] } | null = null;
  for (const entry of counts.values()) {
    if (!best || entry.gaps.length > best.gaps.length) best = entry;
  }
  if (!best) return null;
  const skill = [...best.gaps].sort((a, b) => b.demandCount - a.demandCount)[0];
  return skill ? { subject: best.subject, skillId: skill.skillId } : null;
}

// Distinct gap skills across some programmes, in first-seen order.
export function distinctGaps(rows: ProgramRow[]): ProgramGap[] {
  const seen = new Map<string, ProgramGap>();
  for (const row of rows) {
    for (const gap of row.gaps) {
      if (!seen.has(gap.skillId)) seen.set(gap.skillId, gap);
    }
  }
  return [...seen.values()];
}

// ---------------------------------------------------------------------------
// Saved choices, in localStorage. Read and write from effects and handlers only.

export const PROGRAMS_KEY = "theplug-faculty-programs";

export type ProgramStatus = "shortlisted" | "applied" | "hidden";

const STATUSES: readonly ProgramStatus[] = ["shortlisted", "applied", "hidden"];

export interface StoredProgram {
  status: ProgramStatus;
  // ISO timestamp of the last change.
  savedAt: string;
}

export type StoredPrograms = Record<string, StoredProgram>;

// Anything that is not { [id]: { status, savedAt } } with a known status is
// dropped. Own keys only.
export function parseStoredPrograms(value: unknown): StoredPrograms {
  const out: StoredPrograms = {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return out;
  }
  for (const [id, entry] of Object.entries(value)) {
    if (!id || typeof entry !== "object" || entry === null) continue;
    const { status, savedAt } = entry as Record<string, unknown>;
    if (
      typeof status === "string" &&
      (STATUSES as readonly string[]).includes(status) &&
      typeof savedAt === "string"
    ) {
      out[id] = { status: status as ProgramStatus, savedAt };
    }
  }
  return out;
}
