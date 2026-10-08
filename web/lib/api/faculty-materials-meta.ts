import type {
  Material,
  MaterialLevel,
  MaterialType,
} from "@/data/faculty-materials";

// Re-exported so client components can name their types without importing a
// data path at all. `export type` is erased at compile time exactly like the
// import above, so this adds nothing to the browser bundle.
export type {
  ExamType,
  Material,
  MaterialFile,
  MaterialLevel,
  MaterialType,
  MaterialVisibility,
} from "@/data/faculty-materials";

// Pure helpers about material *types*, with no data behind them.
//
// These live apart from lib/api/faculty-materials.ts on purpose: that file
// imports the seed data and the curriculum, so importing anything from it into
// a client component would drag those modules into the browser bundle. The
// imports above are `import type`, which TypeScript erases at compile time, so
// nothing here reaches the browser except the code you see.

export interface MaterialTypeMeta {
  label: string;
  needsFile: boolean;
  needsUrl: boolean;
  // Lower-case, with the dot. Empty for link and video, which carry no file.
  // Readonly because every caller shares the one MATERIAL_TYPE_META object;
  // handing out a mutable array would let a form edit the table it read from.
  acceptedExtensions: readonly string[];
  // 0 where no file is involved.
  maxSizeMb: number;
}

const FILE_ONLY = { needsFile: true, needsUrl: false } as const;
const URL_ONLY = {
  needsFile: false,
  needsUrl: true,
  acceptedExtensions: [],
  maxSizeMb: 0,
} as const;

export const MATERIAL_TYPE_META: Record<MaterialType, MaterialTypeMeta> = {
  pdf: {
    label: "PDF",
    ...FILE_ONLY,
    acceptedExtensions: [".pdf"],
    maxSizeMb: 25,
  },
  ppt: {
    label: "Slides",
    ...FILE_ONLY,
    // Slide decks are the one format that regularly runs large.
    acceptedExtensions: [".ppt", ".pptx"],
    maxSizeMb: 50,
  },
  notes: {
    label: "Notes",
    ...FILE_ONLY,
    acceptedExtensions: [".pdf", ".docx"],
    maxSizeMb: 25,
  },
  pyq: {
    label: "Past paper",
    ...FILE_ONLY,
    acceptedExtensions: [".pdf"],
    maxSizeMb: 25,
  },
  "lab-manual": {
    label: "Lab manual",
    ...FILE_ONLY,
    acceptedExtensions: [".pdf", ".docx"],
    maxSizeMb: 25,
  },
  "question-bank": {
    label: "Question bank",
    ...FILE_ONLY,
    acceptedExtensions: [".pdf", ".docx"],
    maxSizeMb: 25,
  },
  link: { label: "Link", ...URL_ONLY },
  video: { label: "Video", ...URL_ONLY },
};

// Where a material is pinned. A topic implies its unit, so the most specific
// field present decides.
export function materialLevel(material: Material): MaterialLevel {
  if (material.topicId !== null) return "topic";
  if (material.unitId !== null) return "unit";
  return "course";
}

// http and https only: anything else (javascript:, data:, file:) is refused.
export function isValidHttpUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return parsed.protocol === "http:" || parsed.protocol === "https:";
}

export function videoProvider(url: string): "youtube" | "other" {
  if (!isValidHttpUrl(url)) return "other";
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "other";
  }
  // Matched on the exact host, or a subdomain of it, so a lookalike domain
  // such as "youtube.com.example.net" is not treated as YouTube.
  const isHost = (domain: string) =>
    host === domain || host.endsWith(`.${domain}`);
  return isHost("youtube.com") || isHost("youtu.be") ? "youtube" : "other";
}
