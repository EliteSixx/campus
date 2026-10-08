// Every localStorage key The Plug writes, grouped by the feature that owns it,
// for the Demo data card on the profile settings tab.
//
// The keys are written out here rather than imported, because most of them
// are private constants inside their feature files. If a feature adds a key,
// add it here too; until then it still shows up under "Other saved items" and
// is removed by "Clear everything", because it starts with an app prefix.
//
// Call the functions below from effects and event handlers only.

export const NOTIFY_KEY = "theplug-faculty-notify";

// Every key this app writes starts with one of these.
const APP_PREFIXES = ["theplug-", "skillsync-"];

export interface StorageRow {
  label: string;
  // Exact keys.
  keys: string[];
  // Per-student keys, e.g. `theplug-student-skills-<id>`.
  prefixes?: string[];
}

export interface StorageGroup {
  id: "teaching" | "account" | "student";
  title: string;
  rows: StorageRow[];
}

export const STORAGE_GROUPS: StorageGroup[] = [
  {
    id: "teaching",
    title: "Teaching data",
    rows: [
      { label: "Lecture plans", keys: ["theplug-planner-plans"] },
      { label: "Topics marked delivered", keys: ["theplug-planner-delivered"] },
      { label: "Old planner notes", keys: ["theplug-planner-notes"] },
      { label: "Syllabus drafts", keys: ["theplug-curriculum-drafts"] },
      { label: "Student notes", keys: ["theplug-student-notes"] },
      {
        label: "Uploaded materials",
        keys: ["theplug-materials-local", "theplug-materials-visibility"],
      },
      {
        label: "Messages and replies",
        keys: [
          "theplug-messages-local",
          "theplug-messages-replies",
          "theplug-messages-read",
        ],
      },
      {
        label: "Assignments and evaluations",
        keys: ["theplug-assignments", "theplug-evaluations"],
      },
      { label: "Announcements", keys: ["theplug-announcements"] },
      {
        label: "Development programme choices",
        keys: ["theplug-faculty-programs"],
      },
    ],
  },
  {
    id: "account",
    title: "Account and appearance",
    rows: [
      {
        label: "Theme and layout",
        keys: [
          "theplug-theme-id",
          "theplug-theme-mode",
          "skillsync-sidebar-collapsed",
        ],
      },
      { label: "Current role", keys: ["skillsync-role"] },
      { label: "Profile details (every role)", keys: ["skillsync-user-profiles"] },
      { label: "Faculty alert choices", keys: [NOTIFY_KEY] },
    ],
  },
  {
    id: "student",
    title: "Student pages",
    rows: [
      { label: "Resumes", keys: [], prefixes: ["theplug-student-resumes_"] },
      {
        label: "Skill scores",
        keys: [],
        prefixes: ["theplug-student-skills-"],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Reading.

// Blocked or unavailable storage reads as empty.
function allStoredKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key !== null) keys.push(key);
    }
  } catch (e) {
    console.error("Failed to list localStorage keys", e);
  }
  return keys;
}

function matchingKeys(row: StorageRow, stored: string[]): string[] {
  const exact = row.keys.filter((k) => stored.includes(k));
  const byPrefix = (row.prefixes ?? []).flatMap((p) =>
    stored.filter((k) => k.startsWith(p)),
  );
  return [...exact, ...byPrefix];
}

// How many things one stored value holds: the length of an array, the number
// of entries in an object, or null for a plain value such as "dark".
function itemCount(raw: string): number | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (typeof parsed === "object" && parsed !== null) {
      return Object.keys(parsed).length;
    }
    return null;
  } catch {
    return null;
  }
}

export interface RowStatus {
  // Keys of this row that exist in this browser.
  present: string[];
  // "Empty", "Saved" or "12 items".
  summary: string;
}

function summarise(row: StorageRow, stored: string[]): RowStatus {
  const present = matchingKeys(row, stored);
  if (present.length === 0) return { present, summary: "Empty" };

  // A per-student row counts one item per student.
  if (row.prefixes && row.keys.length === 0) {
    const n = present.length;
    return { present, summary: `${n} ${n === 1 ? "student" : "students"}` };
  }

  let total = 0;
  let counted = false;
  for (const key of present) {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (raw === null) continue;
    const n = itemCount(raw);
    if (n !== null) {
      total += n;
      counted = true;
    }
  }
  if (!counted) return { present, summary: "Saved" };
  return { present, summary: `${total} ${total === 1 ? "item" : "items"}` };
}

export interface StorageSnapshot {
  // By row label.
  rows: Record<string, RowStatus>;
  // App keys that no row above lists.
  otherKeys: string[];
}

export function readStorageSnapshot(): StorageSnapshot {
  const stored = allStoredKeys();
  const rows: Record<string, RowStatus> = {};
  const known = new Set<string>();

  for (const group of STORAGE_GROUPS) {
    for (const row of group.rows) {
      const status = summarise(row, stored);
      rows[row.label] = status;
      status.present.forEach((k) => known.add(k));
    }
  }

  const otherKeys = stored.filter(
    (k) => !known.has(k) && APP_PREFIXES.some((p) => k.startsWith(p)),
  );
  return { rows, otherKeys };
}

// ---------------------------------------------------------------------------
// Clearing. Only keys that belong to this app are ever removed.

function removeKeys(keys: string[]): void {
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove ${key} from localStorage`, e);
    }
  }
}

function groupKeys(groups: StorageGroup[], stored: string[]): string[] {
  return groups.flatMap((g) => g.rows.flatMap((r) => matchingKeys(r, stored)));
}

export const TEACHING_ROW_LABELS = (
  STORAGE_GROUPS.find((g) => g.id === "teaching")?.rows ?? []
).map((r) => r.label);

export function clearTeachingData(): void {
  const stored = allStoredKeys();
  removeKeys(
    groupKeys(
      STORAGE_GROUPS.filter((g) => g.id === "teaching"),
      stored,
    ),
  );
}

export function clearAllAppData(): void {
  const stored = allStoredKeys();
  const listed = groupKeys(STORAGE_GROUPS, stored);
  const other = stored.filter((k) => APP_PREFIXES.some((p) => k.startsWith(p)));
  removeKeys([...new Set([...listed, ...other])]);
}
