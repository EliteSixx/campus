import type {
  FacultyProfileDetail,
  Publication,
  ResearchProject,
} from "@/data/faculty-profile";

// Shared bits for /faculty/profile.
//
// Only types are imported from the data layer, so this file is safe in both
// server and client components. No clock is read here.

// ---------------------------------------------------------------------------
// Tabs.

export const PROFILE_TABS = [
  "overview",
  "teaching",
  "publications",
  "projects",
  "settings",
] as const;

export type ProfileTab = (typeof PROFILE_TABS)[number];

export function isProfileTab(value: unknown): value is ProfileTab {
  return (
    typeof value === "string" &&
    (PROFILE_TABS as readonly string[]).includes(value)
  );
}

export function profileTabHref(tab: ProfileTab): string {
  return `/faculty/profile?tab=${tab}`;
}

export const PROFILE_TAB_PREFIX = "profile";

// ---------------------------------------------------------------------------
// The plain data the page hands to the client component.

export interface TeachingSubject {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  // null when the curriculum analysis has no entry for the subject.
  enrolled: number | null;
  alignmentScore: number | null;
  // Lecture and lab hours a week; null when the timetable has no slot for it.
  weeklyHours: number | null;
}

export interface SemesterStats {
  subjectCount: number;
  trackedStudents: number;
  enrolledStudents: number;
  overallAlignment: number;
  weeklyTeachingHours: number;
}

export interface WeeklyHours {
  theoryHours: number;
  labHours: number;
  // Highest first.
  perSubject: { id: string; code: string; name: string; hours: number }[];
}

export interface DevelopmentFocus {
  industryExposure: string;
  recommendedProgram: {
    title: string;
    durationWeeks: number;
    skillAlignment: number;
  };
  developmentProgram: {
    title: string;
    durationWeeks: number;
    outcome: string;
  };
}

export interface FacultyProfileView {
  record: FacultyProfileDetail;
  // Newest first.
  publications: Publication[];
  // Ongoing first.
  projects: ResearchProject[];
  totalCitations: number;
  subjects: TeachingSubject[];
  stats: SemesterStats;
  hours: WeeklyHours;
  focus: DevelopmentFocus;
}

// ---------------------------------------------------------------------------
// Text.

const TITLES = new Set(["dr", "prof", "mr", "mrs", "ms", "miss"]);

// "Dr. Shiba Narayan Mishra" → "SM". Titles are skipped, then the first and
// last names give the two letters.
export function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => w && !TITLES.has(w.replace(/\.$/, "").toLowerCase()));
  if (words.length === 0) return "FC";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export const PUBLICATION_TONE = {
  Journal: "success",
  Conference: "accent",
  "Book Chapter": "cyan",
} as const satisfies Record<Publication["type"], string>;

export const PROJECT_TONE = {
  Ongoing: "accent",
  Completed: "success",
  "Under Review": "warning",
} as const satisfies Record<ResearchProject["status"], string>;
