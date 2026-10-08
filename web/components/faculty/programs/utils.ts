import type { ProgramMode, ProgramType } from "@/data/faculty-programs";
import type { ProgramStatus, RankKey } from "@/lib/api/faculty-programs-meta";

// Shared bits for /faculty/programs. Only types are imported from the data
// layer, so this file is safe in both server and client components. No clock
// is read here.

// ---------------------------------------------------------------------------
// Tabs.

export const PROGRAM_TABS = ["recommended", "all", "plan"] as const;

export type ProgramsTab = (typeof PROGRAM_TABS)[number];

export function isProgramsTab(value: unknown): value is ProgramsTab {
  return (
    typeof value === "string" &&
    (PROGRAM_TABS as readonly string[]).includes(value)
  );
}

export function programsTabHref(tab: ProgramsTab): string {
  return `/faculty/programs?tab=${tab}`;
}

export const PROGRAMS_TAB_PREFIX = "programs";

export const PLAN_HREF = "/faculty/programs/plan";
export const SKILL_GAPS_HREF = "/faculty/students?tab=gaps";

// ---------------------------------------------------------------------------
// Labels and tones.

// Display order for the type filter, as in lib/api/faculty-programs.ts.
export const TYPE_ORDER: ProgramType[] = [
  "FDP",
  "Certification",
  "Workshop",
  "Research Grant",
  "Consultancy",
];

export const MODES: ProgramMode[] = ["Online", "Hybrid", "On-campus"];

export const TYPE_TONE = {
  FDP: "accent",
  Certification: "cyan",
  Workshop: "neutral",
  "Research Grant": "success",
  Consultancy: "warning",
} as const satisfies Record<ProgramType, string>;

export const STATUS_LABEL: Record<ProgramStatus, string> = {
  shortlisted: "Shortlisted",
  applied: "Applied",
  hidden: "Not relevant",
};

// ---------------------------------------------------------------------------
// Filters on the All programmes tab. Kept by the parent so they survive a tab
// switch.

export interface ProgramFilters {
  query: string;
  type: "All" | ProgramType;
  mode: "All" | ProgramMode;
  cost: string; // "All" or one costText exactly as written in the data
  gapsOnly: boolean;
  sort: RankKey;
}

export const DEFAULT_FILTERS: ProgramFilters = {
  query: "",
  type: "All",
  mode: "All",
  cost: "All",
  gapsOnly: false,
  sort: "impact",
};

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
