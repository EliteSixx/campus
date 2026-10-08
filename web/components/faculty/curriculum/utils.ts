import {
  DRAFTS_KEY,
  parseStoredDrafts,
  type InsightPosting,
  type InsightSkill,
  type StoredDrafts,
  type TopicStatus,
} from "@/lib/api/curriculum-insights-meta";

// Shared bits for the curriculum analysis views.
//
// Only lib/api/curriculum-insights-meta.ts is imported, and it carries no data
// at runtime, so this file is safe in both server and client components. No
// clock is read here.

export type Tone = "success" | "warning" | "danger";

// Green at 60 and above, amber 40–59, red below 40.
export function scoreTone(score: number): Tone {
  if (score >= 60) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

export const SCORE_TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export const SCORE_BAR: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

// ---------------------------------------------------------------------------
// Links that look like buttons. Same classes as components/ui/button.tsx, so a
// Next <Link> can take the look without a <button> nested inside an <a>.

export type LinkButtonVariant = "primary" | "secondary" | "ghost";

const LINK_BUTTON_BASE =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

const LINK_BUTTON_VARIANTS: Record<LinkButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:opacity-95 shadow-md shadow-accent/20 active:scale-[0.98] font-semibold dark:bg-gradient-to-r dark:from-violet-600 dark:to-indigo-600",
  secondary:
    "bg-surface-raised hover:bg-border text-ink border border-border hover:border-border-strong active:scale-[0.98]",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-raised",
};

const LINK_BUTTON_SIZES = {
  sm: "h-8 px-3 text-xs rounded-lg",
} as const;

export function linkButtonClass(
  variant: LinkButtonVariant,
  size: keyof typeof LINK_BUTTON_SIZES = "sm",
): string {
  return `${LINK_BUTTON_BASE} ${LINK_BUTTON_VARIANTS[variant]} ${LINK_BUTTON_SIZES[size]}`;
}

// A small inline text link, e.g. "Draft it".
export const textLinkClass =
  "inline-flex items-center gap-1 rounded text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

// ---------------------------------------------------------------------------
// Routes.

export function subjectHref(id: string): string {
  return `/faculty/subjects/${encodeURIComponent(id)}`;
}

// The detail page's draft tab, optionally with a skill to add.
export function draftHref(id: string, skillId?: string): string {
  const base = `${subjectHref(id)}?tab=draft`;
  return skillId ? `${base}&addSkill=${encodeURIComponent(skillId)}` : base;
}

export function plannerHref(id: string): string {
  return `/faculty/planner?subject=${encodeURIComponent(id)}`;
}

// The printable syllabus revision proposal for one subject.
export function proposalHref(subjectId: string): string {
  return `${subjectHref(subjectId)}/proposal`;
}

// ---------------------------------------------------------------------------
// Text.

// ["A", "B", "C"] → "A, B and C".
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

// Own keys only, so an id like "constructor" never reads the prototype.
export function skillOf(
  skills: Record<string, InsightSkill>,
  skillId: string,
): InsightSkill | null {
  return Object.prototype.hasOwnProperty.call(skills, skillId)
    ? skills[skillId]
    : null;
}

export function skillNameOf(
  skills: Record<string, InsightSkill>,
  skillId: string,
): string {
  return skillOf(skills, skillId)?.name ?? skillId;
}

// ---------------------------------------------------------------------------
// localStorage. Every read and write is wrapped, so a full or blocked storage
// never breaks the page; a failed read falls back to empty. Call these from
// effects and event handlers only.

export function readStoredDrafts(): StoredDrafts {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return {};
    return parseStoredDrafts(JSON.parse(raw) as unknown);
  } catch (e) {
    console.error(`Failed to read ${DRAFTS_KEY} from localStorage`, e);
    return {};
  }
}

export function writeStoredDrafts(drafts: StoredDrafts): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch (e) {
    console.error(`Failed to save ${DRAFTS_KEY} to localStorage`, e);
  }
}

// ---------------------------------------------------------------------------
// Subject detail page.

export const DETAIL_TABS = [
  "topics",
  "missing",
  "demand",
  "students",
  "draft",
] as const;

export type DetailTab = (typeof DETAIL_TABS)[number];

export function isDetailTab(value: unknown): value is DetailTab {
  return (
    typeof value === "string" &&
    (DETAIL_TABS as readonly string[]).includes(value)
  );
}

// The planner opens this subject and, once it has a plan, the Add Lecture panel
// prefilled for the skill (see app/faculty/planner/page.tsx).
export function plannerSkillHref(subjectId: string, skillId: string): string {
  return `${plannerHref(subjectId)}&addSkill=${encodeURIComponent(skillId)}`;
}

export const MAX_DRAFT_NAME = 120;
export const MAX_REASON = 300;

export const TOPIC_STATUS_TONE = {
  Foundational: "cyan",
  "Industry-current": "success",
  Outdated: "danger",
} as const satisfies Record<TopicStatus, string>;

export const labelClass = "mb-1 block text-xs font-bold text-ink";

export const counterClass = "mt-1 text-right text-[11px] tabular text-ink-muted";

// A posting that asks for at least one skill a subject is expected to teach.
export interface RelatedPosting {
  posting: InsightPosting;
  // The posting's skills that are on the subject's expected list.
  overlapSkillIds: string[];
}

// Biggest overlap first, then by title.
export function relatedPostingsFor(
  industrySkillIds: string[],
  postings: InsightPosting[],
): RelatedPosting[] {
  const expected = new Set(industrySkillIds);
  return postings
    .map((posting) => ({
      posting,
      overlapSkillIds: posting.skillIds.filter((id) => expected.has(id)),
    }))
    .filter((r) => r.overlapSkillIds.length > 0)
    .sort(
      (a, b) =>
        b.overlapSkillIds.length - a.overlapSkillIds.length ||
        a.posting.title.localeCompare(b.posting.title, "en"),
    );
}

// "16 Sept 2026, 15:30" in India time, from a stored ISO string. Formats the
// given instant only — no clock is read. null for an unreadable value.
export function formatSavedAt(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(date);
}
