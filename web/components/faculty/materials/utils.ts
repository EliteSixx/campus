import {
  FileClock,
  FileText,
  FlaskConical,
  Link2,
  ListChecks,
  NotebookPen,
  Presentation,
  CirclePlay,
  type LucideIcon,
} from "lucide-react";
import type {
  Material,
  MaterialType,
  MaterialVisibility,
} from "@/lib/api/faculty-materials-meta";

// Shared bits for the materials views.
//
// Types come from lib/api/faculty-materials-meta.ts, which re-exports them and
// imports no data at runtime, so nothing here pulls a data module into the
// browser. formatDateTime and formatBytes are imported from the announcements
// section by the components that render, so both features format alike.
//
// THE TOPIC ID RULE: a topic id is only unique within its course — t1 exists in
// all four courses and matches four different materials. Every key, lookup and
// grouping below therefore takes courseId and topicId together, via topicKey().

export const LOCAL_KEY = "theplug-materials-local";
export const VISIBILITY_KEY = "theplug-materials-visibility";

export const MAX_TITLE = 120;
export const MAX_DESCRIPTION = 1000;
export const MAX_TAGS = 8;
export const MAX_TAG_LENGTH = 30;
export const EARLIEST_PYQ_YEAR = 2015;

// Visibility changes made in this browser, keyed by material id. Applies to
// seed material as well as local uploads.
export type VisibilityOverrides = Record<string, MaterialVisibility>;

export const TYPE_ICON: Record<MaterialType, LucideIcon> = {
  pdf: FileText,
  ppt: Presentation,
  notes: NotebookPen,
  pyq: FileClock,
  link: Link2,
  // lucide 0.427 declares this icon as CirclePlay; PlayCircle is the old name.
  video: CirclePlay,
  "lab-manual": FlaskConical,
  "question-bank": ListChecks,
};

// The only correct way to identify a topic. Never key on topicId alone.
export function topicKey(courseId: string, topicId: string): string {
  return `${courseId}:${topicId}`;
}

export const isLocalMaterial = (material: Material) =>
  material.id.startsWith("local-");

export const newestFirst = (a: Material, b: Material) =>
  b.uploadedAt.localeCompare(a.uploadedAt);

// A stored override wins over the seed value, so a hidden-then-shown item reads
// correctly everywhere without the seed data being touched.
export function applyOverrides(
  list: Material[],
  overrides: VisibilityOverrides,
): Material[] {
  return list.map((material) => {
    const override = overrides[material.id];
    return override && override !== material.visibility
      ? { ...material, visibility: override }
      : material;
  });
}

export function mergeMaterials(
  server: Material[],
  local: Material[],
  overrides: VisibilityOverrides,
): Material[] {
  return applyOverrides([...server, ...local], overrides).sort(newestFirst);
}

// "youtube.com" from a full URL, for the row subtitle. Returns the raw value if
// it will not parse, rather than throwing mid-render.
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// A YouTube search URL rather than a specific video, which the seed data uses
// so that no invented video id can 404.
export function isSearchUrl(url: string): boolean {
  return url.includes("results?search_query");
}

export interface PathLabels {
  courseCode: string;
  unitTitle: string | null;
  unitNumber: number | null;
  topicName: string | null;
}

// "CS303 › Unit 3 › Deadlocks & Synchronization", trimmed to whatever is known.
export function pathLabel(labels: PathLabels): string {
  const parts = [labels.courseCode];
  if (labels.unitNumber !== null) parts.push(`Unit ${labels.unitNumber}`);
  if (labels.topicName !== null) parts.push(labels.topicName);
  return parts.join(" › ");
}

export function levelLabel(material: Material): string {
  if (material.topicId !== null) return "Topic-level";
  if (material.unitId !== null) return "Unit-level";
  return "Course-level";
}

function readJSON<T>(key: string, fallback: T, isValid: (v: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? (parsed as T) : fallback;
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

const isArray = (v: unknown) => Array.isArray(v);
const isObject = (v: unknown) =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const readLocalMaterials = () =>
  readJSON<Material[]>(LOCAL_KEY, [], isArray);
export const writeLocalMaterials = (items: Material[]) =>
  writeJSON(LOCAL_KEY, items);

export const readVisibilityOverrides = () =>
  readJSON<VisibilityOverrides>(VISIBILITY_KEY, {}, isObject);
export const writeVisibilityOverrides = (overrides: VisibilityOverrides) =>
  writeJSON(VISIBILITY_KEY, overrides);

// Plain course → unit → topic structure, built on the server and passed to the
// upload panel so its selects never need the data modules.
export interface TopicOption {
  id: string;
  name: string;
}

export interface UnitOption {
  id: string;
  number: number;
  title: string;
  topics: TopicOption[];
}

export interface CourseOption {
  id: string;
  code: string;
  name: string;
  units: UnitOption[];
}
