import type {
  Announcement,
  AnnouncementStatus,
  Category,
  Priority,
} from "@/data/faculty-announcements";
import type { AnnouncementRecipient } from "@/lib/api/faculty-announcements";

// Shared bits for the announcement views. Only types are imported from the
// data layer, so nothing here drags a data module into the browser.

export const LOCAL_KEY = "theplug-announcements";

// An announcement created in the compose form. The audience label and
// recipient count are worked out once at save time from the option lists and
// stored with it, so the list and detail views can render a local item without
// resolving an audience they have no data for.
export interface LocalAnnouncement extends Announcement {
  audienceLabel: string;
  recipientCount: number;
}

// One row of the list, whether it came from the server or from localStorage.
export interface AnnouncementListEntry {
  announcement: Announcement;
  audienceLabel: string;
  totalRecipients: number;
  readCount: number;
  readPercent: number;
  isLocal: boolean;
}

export interface DetailRecipient extends AnnouncementRecipient {
  // False for students outside this faculty member's cohort, whose
  // /faculty/students/[id] page would 404.
  hasDetailPage: boolean;
}

export const priorityTone = {
  urgent: "danger",
  important: "warning",
  normal: "neutral",
} as const satisfies Record<Priority, string>;

export const categoryTone = {
  exam: "accent",
  assignment: "cyan",
  schedule: "warning",
  event: "success",
  general: "neutral",
} as const satisfies Record<Category, string>;

export const statusTone = {
  published: "success",
  scheduled: "accent",
  draft: "neutral",
} as const satisfies Record<AnnouncementStatus, string>;

export const statusLabel = {
  published: "Published",
  scheduled: "Scheduled",
  draft: "Draft",
} as const satisfies Record<AnnouncementStatus, string>;

const CATEGORY_LABEL = {
  exam: "Exam",
  assignment: "Assignment",
  schedule: "Schedule",
  event: "Event",
  general: "General",
} as const satisfies Record<Category, string>;

const PRIORITY_LABEL = {
  urgent: "Urgent",
  important: "Important",
  normal: "Normal",
} as const satisfies Record<Priority, string>;

export const categoryLabel = (category: Category) => CATEGORY_LABEL[category];
export const priorityLabel = (priority: Priority) => PRIORITY_LABEL[priority];

// A scheduled announcement whose time has passed reads as published. `nowISO`
// is null until the clock has been read after mount, and until then the stored
// status is shown as-is — that is what keeps the server and first client
// render identical.
export function effectiveStatus(
  announcement: Announcement,
  nowISO: string | null,
): AnnouncementStatus {
  if (announcement.status !== "scheduled") return announcement.status;
  if (nowISO === null || announcement.publishAt === null) {
    return announcement.status;
  }
  // Both sides are UTC ISO strings, so comparing them as text is correct.
  return announcement.publishAt <= nowISO ? "published" : "scheduled";
}

// Timestamps are stored as UTC ISO strings but the readers are in India, so
// they are displayed in Asia/Kolkata: a 09:00 schedule typed into the compose
// form reads back as 09:00 rather than 03:30.
//
// The zone is pinned rather than left to the environment because the server
// and the browser sit in different ones, and an unpinned zone renders the date
// one way in the server HTML and another after hydration. Any fixed zone
// avoids that; this is the fixed zone that shows the time the user meant.
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function truncate(text: string, length: number): string {
  const trimmed = text.trim();
  return trimmed.length <= length
    ? trimmed
    : `${trimmed.slice(0, length).trimEnd()}…`;
}

// The date line under a card: what happened, or what is going to.
export function dateLine(
  announcement: Announcement,
  status: AnnouncementStatus,
): string {
  if (status === "draft" || announcement.publishAt === null) return "Draft";
  const when = formatDateTime(announcement.publishAt);
  return status === "scheduled"
    ? `Scheduled for ${when}`
    : `Published ${when}`;
}

export function readLocalAnnouncements(): LocalAnnouncement[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalAnnouncement[];
  } catch (e) {
    console.error("Failed to read announcements from localStorage", e);
    return [];
  }
}

export function writeLocalAnnouncements(items: LocalAnnouncement[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save announcement to localStorage", e);
  }
}

export function localToEntry(item: LocalAnnouncement): AnnouncementListEntry {
  return {
    announcement: item,
    audienceLabel: item.audienceLabel,
    totalRecipients: item.recipientCount,
    // Nothing created in this browser has been read by anyone.
    readCount: 0,
    readPercent: 0,
    isLocal: true,
  };
}

// Pinned first, then newest first, with drafts falling back to their creation
// time. Matches the server ordering in lib/api/faculty-announcements.ts, which
// has to be reapplied here once local items are mixed in.
export function sortEntries(
  entries: AnnouncementListEntry[],
): AnnouncementListEntry[] {
  const key = (e: AnnouncementListEntry) =>
    e.announcement.publishAt ?? e.announcement.createdAt;
  return [...entries].sort((a, b) => {
    if (a.announcement.pinned !== b.announcement.pinned) {
      return a.announcement.pinned ? -1 : 1;
    }
    return key(b).localeCompare(key(a));
  });
}
