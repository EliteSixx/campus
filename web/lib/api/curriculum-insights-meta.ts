import type { ProgramType } from "@/data/faculty-programs";
import type { OpportunityType } from "@/data/opportunities";
import type { TopicStatus } from "@/lib/api/curriculum";

// Types and pure logic for the curriculum analysis pages.
//
// Client-safe on purpose: every import above is `import type`, which
// TypeScript erases, so nothing here pulls a data module into the browser. The
// server side that fills CurriculumInsightsWorkspace is
// getCurriculumInsightsWorkspace() in lib/api/curriculum-insights.ts.
//
// The scoring helpers repeat the formula in lib/api/curriculum.ts exactly, so a
// score worked out here in the browser equals the one the server pages show.
//
// No clock is read in this file. Anything that needs a stamp or "now" takes it
// as an argument.

export type { TopicStatus } from "@/lib/api/curriculum";

// ===========================================================================
// Server workspace: what the curriculum pages hand to the client.

export interface InsightSkill {
  id: string;
  name: string;
  category: string;
  // Postings that list this skill as required or preferred.
  demandCount: number;
  totalPostings: number;
}

export interface InsightPosting {
  id: string;
  // The role, e.g. "Backend Developer Intern".
  title: string;
  // Company name, or the company id when the company is unknown.
  company: string;
  location: string;
  type: OpportunityType;
  // requiredSkillIds ∪ preferredSkillIds, unique.
  skillIds: string[];
  requiredSkillIds: string[];
  preferredSkillIds: string[];
}

export interface InsightTopic {
  id: string;
  // `${subjectId}:${topicId}`. Topic ids repeat across subjects, so this is
  // the only safe identity.
  key: string;
  name: string;
  hours: number;
  foundational: boolean;
  skillIds: string[];
  skillNames: string[];
  // Postings asking for ANY of this topic's skills.
  demandCount: number;
  status: TopicStatus;
  // Topic-level materials, matched on course + topic.
  materialsCount: number;
}

export interface InsightSubject {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  enrolled: number;
  industrySkillIds: string[];
  // Syllabus order.
  topics: InsightTopic[];
  alignmentScore: number;
  // Both most-demanded first, in the same order as lib/api/curriculum.ts.
  coveredSkillIds: string[];
  missingSkillIds: string[];
  totalHours: number;
  outdatedHours: number;
  outdatedCount: number;
}

export type MatrixCell = "taught" | "missing" | "out-of-scope";

export interface SkillMatrix {
  // Top MATRIX_SKILL_LIMIT by demand among every subject's industrySkillIds,
  // ties by name.
  skillIds: string[];
  subjectIds: string[];
  // cells[skillId][subjectId]
  cells: Record<string, Record<string, MatrixCell>>;
}

export interface SharedGap {
  skillId: string;
  name: string;
  demandCount: number;
  // Every subject missing this skill, in subject order. Always two or more.
  subjectIds: string[];
}

export interface QuickWin {
  subjectId: string;
  subjectCode: string;
  skillId: string;
  skillName: string;
  demandCount: number;
  scoreBefore: number;
  // The score if this ONE missing skill were taught.
  scoreAfter: number;
  gain: number;
}

export interface SubjectStudentSkill {
  skillId: string;
  name: string;
  taught: boolean;
  // Rounded cohort average. null when no cohort student is scored on it.
  averageScore: number | null;
  // Cohort students below STRUGGLING_BELOW or with no score, counted only
  // when at least one cohort student is scored on the skill; 0 otherwise.
  strugglingCount: number;
}

export interface SubjectStudentImpact {
  subjectId: string;
  cohortSize: number;
  // One row per industrySkillId, in the subject's own order.
  skills: SubjectStudentSkill[];
}

export interface ProgramMatch {
  id: string;
  title: string;
  provider: string;
  type: ProgramType;
  durationWeeks: number;
  skillIds: string[];
  // The program's skills that some subject is missing.
  matchedSkillIds: string[];
}

export interface CurriculumInsightsWorkspace {
  faculty: { name: string; department: string };
  totalPostings: number;
  overallAlignment: number;
  subjectCount: number;
  // Sum of studentsEnrolled across subjects.
  enrolledStudents: number;
  // Cohort students with skill data (getMyCohort).
  trackedStudents: number;
  totalOutdatedTopics: number;
  totalOutdatedHours: number;
  // Every skill referenced by a subject, a posting or a matched program.
  skills: Record<string, InsightSkill>;
  postings: InsightPosting[];
  subjects: InsightSubject[];
  matrix: SkillMatrix;
  sharedGaps: SharedGap[];
  quickWins: QuickWin[];
  studentImpact: SubjectStudentImpact[];
  programs: ProgramMatch[];
}

// A skill score below this is the "To learn" band in faculty-roster.ts and
// the struggling threshold on the faculty dashboard.
export const STRUGGLING_BELOW = 40;

export const MATRIX_SKILL_LIMIT = 10;

// ===========================================================================
// Scoring. Same formula as analyzeSubject() in lib/api/curriculum.ts.

// Postings that list the skill as required or preferred.
export function countSkillDemand(
  skillId: string,
  postings: InsightPosting[],
): number {
  return postings.filter((p) => p.skillIds.includes(skillId)).length;
}

// Postings matching ANY of the skills. No skills means no demand.
export function countTopicDemand(
  skillIds: string[],
  postings: InsightPosting[],
): number {
  if (skillIds.length === 0) return 0;
  return postings.filter((p) => skillIds.some((s) => p.skillIds.includes(s)))
    .length;
}

export function classifyTopicStatus(
  foundational: boolean,
  demandCount: number,
): TopicStatus {
  if (foundational) return "Foundational";
  if (demandCount > 0) return "Industry-current";
  return "Outdated";
}

export interface AlignmentResult {
  score: number;
  // Both most-demanded first; equal demand keeps industrySkillIds order.
  coveredSkillIds: string[];
  missingSkillIds: string[];
  coveredDemand: number;
  missingDemand: number;
}

export function computeAlignment(
  industrySkillIds: string[],
  taughtSkillIds: string[],
  postings: InsightPosting[],
): AlignmentResult {
  const taught = new Set(taughtSkillIds);
  const withDemand = industrySkillIds.map((id) => ({
    id,
    demand: countSkillDemand(id, postings),
  }));
  // Array.prototype.sort is stable, as in the original.
  const byDemand = (a: { demand: number }, b: { demand: number }) =>
    b.demand - a.demand;

  const covered = withDemand.filter((s) => taught.has(s.id)).sort(byDemand);
  const missing = withDemand.filter((s) => !taught.has(s.id)).sort(byDemand);

  const coveredDemand = covered.reduce((sum, s) => sum + s.demand, 0);
  const missingDemand = missing.reduce((sum, s) => sum + s.demand, 0);
  const score =
    coveredDemand + missingDemand === 0
      ? 100
      : Math.round((coveredDemand / (coveredDemand + missingDemand)) * 100);

  return {
    score,
    coveredSkillIds: covered.map((s) => s.id),
    missingSkillIds: missing.map((s) => s.id),
    coveredDemand,
    missingDemand,
  };
}

// The union of every topic's skills, in first-seen order.
export function taughtSkillIdsOf(topics: { skillIds: string[] }[]): string[] {
  return [...new Set(topics.flatMap((t) => t.skillIds))];
}

export function postingsForSkill(
  skillId: string,
  postings: InsightPosting[],
): InsightPosting[] {
  return postings.filter((p) => p.skillIds.includes(skillId));
}

export function programsForSkill(
  skillId: string,
  programs: ProgramMatch[],
): ProgramMatch[] {
  return programs.filter((p) => p.skillIds.includes(skillId));
}

// ===========================================================================
// Cross-subject views, built from InsightSubject so server and client agree.

// Own keys only, so an id like "constructor" never reads the prototype.
function hasSkill(skills: Record<string, InsightSkill>, skillId: string) {
  return Object.prototype.hasOwnProperty.call(skills, skillId);
}

function nameOf(skills: Record<string, InsightSkill>, skillId: string): string {
  return hasSkill(skills, skillId) ? skills[skillId].name : skillId;
}

export function buildSkillMatrix(
  subjects: InsightSubject[],
  skills: Record<string, InsightSkill>,
  postings: InsightPosting[],
): SkillMatrix {
  const pool = [...new Set(subjects.flatMap((s) => s.industrySkillIds))];
  const skillIds = pool
    .map((id) => ({
      id,
      name: nameOf(skills, id),
      demand: countSkillDemand(id, postings),
    }))
    .sort((a, b) => b.demand - a.demand || a.name.localeCompare(b.name, "en"))
    .slice(0, MATRIX_SKILL_LIMIT)
    .map((s) => s.id);

  const taughtBySubject = new Map(
    subjects.map((s) => [s.id, new Set(taughtSkillIdsOf(s.topics))]),
  );

  const cells: Record<string, Record<string, MatrixCell>> = {};
  for (const skillId of skillIds) {
    const row: Record<string, MatrixCell> = {};
    for (const subject of subjects) {
      row[subject.id] = taughtBySubject.get(subject.id)?.has(skillId)
        ? "taught"
        : subject.industrySkillIds.includes(skillId)
          ? "missing"
          : "out-of-scope";
    }
    cells[skillId] = row;
  }

  return { skillIds, subjectIds: subjects.map((s) => s.id), cells };
}

// Skills missing from two or more subjects, most demanded first, then by name.
export function buildSharedGaps(
  subjects: InsightSubject[],
  skills: Record<string, InsightSkill>,
  postings: InsightPosting[],
): SharedGap[] {
  const missingIn = new Map<string, string[]>();
  for (const subject of subjects) {
    for (const skillId of subject.missingSkillIds) {
      missingIn.set(skillId, [...(missingIn.get(skillId) ?? []), subject.id]);
    }
  }

  return [...missingIn.entries()]
    .filter(([, subjectIds]) => subjectIds.length >= 2)
    .map(([skillId, subjectIds]) => ({
      skillId,
      name: nameOf(skills, skillId),
      demandCount: countSkillDemand(skillId, postings),
      subjectIds,
    }))
    .sort(
      (a, b) =>
        b.demandCount - a.demandCount || a.name.localeCompare(b.name, "en"),
    );
}

// Every missing skill of every subject, scored as if it alone were taught.
// Biggest gain first, then most demanded; equal rows keep subject order.
export function buildQuickWins(
  subjects: InsightSubject[],
  skills: Record<string, InsightSkill>,
  postings: InsightPosting[],
): QuickWin[] {
  const wins = subjects.flatMap((subject) => {
    const taught = taughtSkillIdsOf(subject.topics);
    const before = computeAlignment(subject.industrySkillIds, taught, postings);
    return before.missingSkillIds.map((skillId): QuickWin => {
      const after = computeAlignment(
        subject.industrySkillIds,
        [...taught, skillId],
        postings,
      );
      return {
        subjectId: subject.id,
        subjectCode: subject.code,
        skillId,
        skillName: nameOf(skills, skillId),
        demandCount: countSkillDemand(skillId, postings),
        scoreBefore: before.score,
        scoreAfter: after.score,
        gain: after.score - before.score,
      };
    });
  });

  return wins.sort((a, b) => b.gain - a.gain || b.demandCount - a.demandCount);
}

// ===========================================================================
// Syllabus revision draft, stored in localStorage.

// Every subject's draft, as StoredDrafts keyed by subject id.
export const DRAFTS_KEY = "theplug-curriculum-drafts";

export type TopicAction = "keep" | "reduce" | "remove";

export const TOPIC_ACTIONS: readonly TopicAction[] = ["keep", "reduce", "remove"];

export interface DraftTopicChange {
  topicId: string;
  action: TopicAction;
  // keep: the topic's current hours. reduce: 1 .. current - 1. remove: 0.
  hours: number;
  reason: string;
}

export interface DraftAddedTopic {
  // `local-${stamp}`
  id: string;
  // Trimmed, never empty.
  name: string;
  // Whole hours, at least 1.
  hours: number;
  // Unique.
  skillIds: string[];
  reason: string;
}

export interface CurriculumDraft {
  version: 1;
  subjectId: string;
  // One per original topic, syllabus order.
  changes: DraftTopicChange[];
  added: DraftAddedTopic[];
  // UTC ISO, set by the caller. null for a draft never saved.
  updatedAt: string | null;
}

export type StoredDrafts = Record<string, CurriculumDraft>;

export function createDraft(subject: InsightSubject): CurriculumDraft {
  return {
    version: 1,
    subjectId: subject.id,
    changes: subject.topics.map((t) => ({
      topicId: t.id,
      action: "keep",
      hours: t.hours,
      reason: "",
    })),
    added: [],
    updatedAt: null,
  };
}

// Hours a change is allowed to carry for a topic of `original` hours. A topic
// of one hour cannot be reduced, so reduce falls back to keep.
function normalizeChange(
  change: DraftTopicChange,
  original: number,
): DraftTopicChange {
  if (change.action === "remove") return { ...change, hours: 0 };
  if (change.action === "reduce" && original > 1) {
    const wanted = Number.isFinite(change.hours)
      ? Math.round(change.hours)
      : original - 1;
    return { ...change, hours: Math.min(original - 1, Math.max(1, wanted)) };
  }
  return { ...change, action: "keep", hours: original };
}

// Lines a draft up with the current syllabus: one change per topic in syllabus
// order (unknown topics dropped, new ones kept), hours clamped by action. Use
// after reading a stored draft, since parseStoredDrafts cannot see the syllabus.
export function reconcileDraft(
  subject: InsightSubject,
  draft: CurriculumDraft,
): CurriculumDraft {
  // A draft for another subject says nothing about this one.
  if (draft.subjectId !== subject.id) return createDraft(subject);
  const byTopic = new Map(draft.changes.map((c) => [c.topicId, c]));
  return {
    version: 1,
    subjectId: subject.id,
    changes: subject.topics.map((t) =>
      normalizeChange(
        byTopic.get(t.id) ?? {
          topicId: t.id,
          action: "keep",
          hours: t.hours,
          reason: "",
        },
        t.hours,
      ),
    ),
    added: draft.added,
    updatedAt: draft.updatedAt,
  };
}

const isTopicAction = (v: unknown): v is TopicAction =>
  typeof v === "string" && (TOPIC_ACTIONS as readonly string[]).includes(v);

// ---------------------------------------------------------------------------
// Immutable edits. Each returns a new draft, or the same draft when the input
// is invalid (unknown topic, bad action, non-finite hours, empty name).

// Needs the subject because a reduce is clamped against the topic's current
// hours, which the draft does not carry. Without `hours`, reduce keeps an
// existing reduced value or takes one hour off.
export function setTopicAction(
  subject: InsightSubject,
  draft: CurriculumDraft,
  topicId: string,
  action: TopicAction,
  hours?: number,
): CurriculumDraft {
  const topic = subject.topics.find((t) => t.id === topicId);
  if (!topic || draft.subjectId !== subject.id || !isTopicAction(action)) {
    return draft;
  }
  if (hours !== undefined && !Number.isFinite(hours)) return draft;
  if (action === "reduce" && topic.hours <= 1) return draft;

  const reconciled = reconcileDraft(subject, draft);
  return {
    ...reconciled,
    changes: reconciled.changes.map((c) => {
      if (c.topicId !== topicId) return c;
      const wanted =
        hours ??
        (c.action === "reduce" ? c.hours : Math.max(1, topic.hours - 1));
      return normalizeChange({ ...c, action, hours: wanted }, topic.hours);
    }),
  };
}

export function setTopicReason(
  draft: CurriculumDraft,
  topicId: string,
  reason: string,
): CurriculumDraft {
  if (!draft.changes.some((c) => c.topicId === topicId)) return draft;
  return {
    ...draft,
    changes: draft.changes.map((c) =>
      c.topicId === topicId ? { ...c, reason } : c,
    ),
  };
}

export interface AddedTopicFields {
  name: string;
  hours: number;
  skillIds: string[];
  reason: string;
}

const cleanName = (name: string): string | null => {
  const trimmed = name.trim();
  return trimmed === "" ? null : trimmed;
};

const cleanHours = (hours: number): number | null => {
  if (!Number.isFinite(hours)) return null;
  const whole = Math.round(hours);
  return whole >= 1 ? whole : null;
};

const cleanSkillIds = (skillIds: string[]): string[] => [
  ...new Set(skillIds.filter((id) => typeof id === "string" && id !== "")),
];

// The id is `local-${stamp}`; if that id is already used, the stamp is bumped
// until it is free so a quick second add is never lost.
export function addTopic(
  draft: CurriculumDraft,
  stamp: number,
  fields: AddedTopicFields,
): CurriculumDraft {
  const name = cleanName(fields.name);
  const hours = cleanHours(fields.hours);
  if (!Number.isFinite(stamp) || name === null || hours === null) return draft;

  const used = new Set(draft.added.map((t) => t.id));
  let next = Math.round(stamp);
  while (used.has(`local-${next}`)) next += 1;

  return {
    ...draft,
    added: [
      ...draft.added,
      {
        id: `local-${next}`,
        name,
        hours,
        skillIds: cleanSkillIds(fields.skillIds),
        reason: fields.reason,
      },
    ],
  };
}

// The name is stored trimmed, so a text input should hold its own value and
// commit on blur rather than write every keystroke through here.
export function updateAddedTopic(
  draft: CurriculumDraft,
  id: string,
  patch: Partial<AddedTopicFields>,
): CurriculumDraft {
  const current = draft.added.find((t) => t.id === id);
  if (!current) return draft;

  const name = patch.name === undefined ? current.name : cleanName(patch.name);
  const hours =
    patch.hours === undefined ? current.hours : cleanHours(patch.hours);
  if (name === null || hours === null) return draft;

  const updated: DraftAddedTopic = {
    id,
    name,
    hours,
    skillIds:
      patch.skillIds === undefined
        ? current.skillIds
        : cleanSkillIds(patch.skillIds),
    reason: patch.reason ?? current.reason,
  };
  return {
    ...draft,
    added: draft.added.map((t) => (t.id === id ? updated : t)),
  };
}

export function removeAddedTopic(
  draft: CurriculumDraft,
  id: string,
): CurriculumDraft {
  if (!draft.added.some((t) => t.id === id)) return draft;
  return { ...draft, added: draft.added.filter((t) => t.id !== id) };
}

export function withDraftUpdatedAt(
  draft: CurriculumDraft,
  iso: string,
): CurriculumDraft {
  return { ...draft, updatedAt: iso };
}

// True when the draft differs from a fresh createDraft(): any topic not kept,
// any added topic, or any reason written (so a note is never thrown away).
export function isDraftChanged(draft: CurriculumDraft): boolean {
  return (
    draft.added.length > 0 ||
    draft.changes.some((c) => c.action !== "keep" || c.reason.trim() !== "")
  );
}

// ---------------------------------------------------------------------------
// Draft analysis: what the syllabus would score and weigh after the draft.

export interface DraftTopicRow {
  // The topic id for an original topic, the `local-…` id for an added one.
  id: string;
  name: string;
  // 0 for an added topic.
  hoursBefore: number;
  hoursAfter: number;
  action: TopicAction | "add";
  status: TopicStatus;
  demandCount: number;
  reason: string;
}

export interface DraftAnalysis {
  scoreBefore: number;
  scoreAfter: number;
  delta: number;
  hoursBefore: number;
  hoursAfter: number;
  hoursDelta: number;
  outdatedHoursBefore: number;
  outdatedHoursAfter: number;
  coveredBefore: string[];
  coveredAfter: string[];
  missingBefore: string[];
  missingAfter: string[];
  // Skills taught after but not before (including new in-demand skills).
  newlyCovered: string[];
  // Skills covered before that the draft leaves missing.
  newlyMissing: string[];
  // Original topics in syllabus order, then added topics in draft order.
  topics: DraftTopicRow[];
}

// Scoring rules:
// - Taught after = skills of every topic not removed (keep, or reduce with
//   hours > 0) ∪ skills of every added topic. Reducing hours never changes
//   the score; only removing a topic can.
// - The scoring set is the subject's industrySkillIds, PLUS any added topic's
//   skill that is not already in it (and is a known skill). Without this,
//   adding a genuinely new in-demand skill could never move the score. Those
//   extra skills are always taught, so they only ever add covered demand.
// - Added topics are never foundational; their status comes from
//   classifyTopicStatus with countTopicDemand.
// A draft with no changes gives exactly subject.alignmentScore.
export function computeDraftAnalysis(
  subject: InsightSubject,
  draft: CurriculumDraft,
  postings: InsightPosting[],
  skills: Record<string, InsightSkill>,
): DraftAnalysis {
  const draftFor = reconcileDraft(subject, draft);
  const changeFor = new Map(draftFor.changes.map((c) => [c.topicId, c]));

  const originalRows: DraftTopicRow[] = subject.topics.map((topic) => {
    const change = changeFor.get(topic.id);
    return {
      id: topic.id,
      name: topic.name,
      hoursBefore: topic.hours,
      hoursAfter: change?.hours ?? topic.hours,
      action: change?.action ?? "keep",
      status: topic.status,
      demandCount: topic.demandCount,
      reason: change?.reason ?? "",
    };
  });

  const addedRows: DraftTopicRow[] = draftFor.added.map((added) => {
    const demandCount = countTopicDemand(added.skillIds, postings);
    return {
      id: added.id,
      name: added.name,
      hoursBefore: 0,
      hoursAfter: added.hours,
      action: "add",
      status: classifyTopicStatus(false, demandCount),
      demandCount,
      reason: added.reason,
    };
  });

  const keptTopics = subject.topics.filter(
    (t) => changeFor.get(t.id)?.action !== "remove",
  );
  const addedSkillIds = taughtSkillIdsOf(draftFor.added).filter(
    (id) => hasSkill(skills, id),
  );

  const before = computeAlignment(
    subject.industrySkillIds,
    taughtSkillIdsOf(subject.topics),
    postings,
  );

  const scoringSet = [
    ...subject.industrySkillIds,
    ...addedSkillIds.filter((id) => !subject.industrySkillIds.includes(id)),
  ];
  const after = computeAlignment(
    scoringSet,
    [...taughtSkillIdsOf(keptTopics), ...addedSkillIds],
    postings,
  );

  const rows = [...originalRows, ...addedRows];
  const sumHours = (list: DraftTopicRow[], pick: "hoursBefore" | "hoursAfter") =>
    list.reduce((sum, r) => sum + r[pick], 0);
  const outdated = rows.filter((r) => r.status === "Outdated");

  const hoursBefore = sumHours(originalRows, "hoursBefore");
  const hoursAfter = sumHours(rows, "hoursAfter");

  return {
    scoreBefore: before.score,
    scoreAfter: after.score,
    delta: after.score - before.score,
    hoursBefore,
    hoursAfter,
    hoursDelta: hoursAfter - hoursBefore,
    outdatedHoursBefore: sumHours(
      originalRows.filter((r) => r.status === "Outdated"),
      "hoursBefore",
    ),
    outdatedHoursAfter: sumHours(outdated, "hoursAfter"),
    coveredBefore: before.coveredSkillIds,
    coveredAfter: after.coveredSkillIds,
    missingBefore: before.missingSkillIds,
    missingAfter: after.missingSkillIds,
    newlyCovered: after.coveredSkillIds.filter(
      (id) => !before.coveredSkillIds.includes(id),
    ),
    newlyMissing: after.missingSkillIds.filter((id) =>
      before.coveredSkillIds.includes(id),
    ),
    topics: rows,
  };
}

// ===========================================================================
// Reading stored drafts. Anything malformed is skipped; this never throws.

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const stringOr = (v: unknown, fallback: string): string =>
  typeof v === "string" ? v : fallback;

// Hours are checked for shape only; reconcileDraft clamps them against the
// syllabus once the subject is known.
function parseChange(value: unknown): DraftTopicChange | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.topicId !== "string" ||
    value.topicId === "" ||
    !isTopicAction(value.action) ||
    typeof value.hours !== "number" ||
    !Number.isFinite(value.hours)
  ) {
    return null;
  }
  const action = value.action;
  if (action !== "remove" && value.hours < 1) return null;
  return {
    topicId: value.topicId,
    action,
    hours: action === "remove" ? 0 : Math.round(value.hours),
    reason: stringOr(value.reason, ""),
  };
}

function parseAdded(value: unknown): DraftAddedTopic | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    value.id === "" ||
    typeof value.name !== "string" ||
    typeof value.hours !== "number"
  ) {
    return null;
  }
  const name = cleanName(value.name);
  const hours = cleanHours(value.hours);
  if (name === null || hours === null) return null;
  return {
    id: value.id,
    name,
    hours,
    skillIds: Array.isArray(value.skillIds)
      ? cleanSkillIds(
          value.skillIds.filter((id): id is string => typeof id === "string"),
        )
      : [],
    reason: stringOr(value.reason, ""),
  };
}

function parseDraft(value: unknown, key: string): CurriculumDraft | null {
  if (!isRecord(value)) return null;
  if (
    value.version !== 1 ||
    value.subjectId !== key ||
    !Array.isArray(value.changes) ||
    !Array.isArray(value.added)
  ) {
    return null;
  }

  // Duplicate topic or added ids would be ambiguous; the first wins.
  const topicIds = new Set<string>();
  const changes: DraftTopicChange[] = [];
  for (const item of value.changes) {
    const change = parseChange(item);
    if (!change || topicIds.has(change.topicId)) continue;
    topicIds.add(change.topicId);
    changes.push(change);
  }

  const addedIds = new Set<string>();
  const added: DraftAddedTopic[] = [];
  for (const item of value.added) {
    const topic = parseAdded(item);
    if (!topic || addedIds.has(topic.id)) continue;
    addedIds.add(topic.id);
    added.push(topic);
  }

  return {
    version: 1,
    subjectId: key,
    changes,
    added,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export function parseStoredDrafts(value: unknown): StoredDrafts {
  const drafts: StoredDrafts = {};
  if (!isRecord(value)) return drafts;
  for (const [key, entry] of Object.entries(value)) {
    // A "__proto__" key would reassign the object's prototype, not add a draft.
    if (key === "__proto__") continue;
    const draft = parseDraft(entry, key);
    if (draft) drafts[key] = draft;
  }
  return drafts;
}
