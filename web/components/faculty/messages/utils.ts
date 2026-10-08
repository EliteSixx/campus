import type { Attachment } from "@/data/faculty-announcements";
import { FACULTY_ID, type Message } from "@/data/faculty-messages";
import type { ConversationParticipant } from "@/lib/api/faculty-messages";
import { truncate } from "@/components/faculty/announcements/utils";

// Shared bits for the message views. formatDateTime, formatBytes and truncate
// are imported from the announcements section rather than copied, so both
// features format dates and sizes identically.

export const READ_KEY = "theplug-messages-read";
export const REPLIES_KEY = "theplug-messages-replies";
export const LOCAL_CONVOS_KEY = "theplug-messages-local";

export const MAX_FILES = 5;
export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_REPLY = 1000;
export const MAX_SUBJECT = 100;
export const PREVIEW_LENGTH = 80;

export const MIN_GROUP = 2;
export const MAX_GROUP = 10;

export const QUICK_REPLIES = [
  "Noted, thank you.",
  "Please meet me in my cabin tomorrow.",
  "Approved.",
  "Please share the document.",
];

export interface ThreadParticipant extends ConversationParticipant {
  // False for students outside this faculty member's cohort, whose
  // /faculty/students/[id] page would 404.
  hasDetailPage: boolean;
}

// A conversation normalised for the thread view, whichever source it came from.
export interface ThreadData {
  id: string;
  subject: string;
  isGroup: boolean;
  participants: ThreadParticipant[];
  // Oldest first, local replies already merged in.
  messages: Message[];
  isLocal: boolean;
}

// One row of the inbox.
export interface ListRow {
  id: string;
  subject: string;
  participantIds: string[];
  participantNames: string[];
  isGroup: boolean;
  preview: string;
  lastMessageAt: string | null;
  unreadCount: number;
  hasAttachment: boolean;
  isLocal: boolean;
}

export const isFromStudent = (message: Message) =>
  message.senderId !== FACULTY_ID;

// A student message counts as unread until either the seed data says it was
// read or this browser has recorded it as read.
export function unreadMessageIds(
  messages: Message[],
  readIds: string[],
): string[] {
  const read = new Set(readIds);
  return messages
    .filter((m) => isFromStudent(m) && m.readAt === null && !read.has(m.id))
    .map((m) => m.id);
}

export function unreadCountOf(messages: Message[], readIds: string[]): number {
  return unreadMessageIds(messages, readIds).length;
}

export function previewOf(messages: Message[]): string {
  const last = messages[messages.length - 1];
  return last ? truncate(last.body, PREVIEW_LENGTH) : "";
}

export function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

// "Ananya Nair" for one, "Ananya, Tanvi +1" once it is a group.
export function participantSummary(names: string[]): string {
  if (names.length === 0) return "No participants";
  if (names.length === 1) return names[0];
  const firstNames = names.map((n) => n.split(/\s+/)[0]);
  if (names.length === 2) return firstNames.join(", ");
  return `${firstNames.slice(0, 2).join(", ")} +${names.length - 2}`;
}

// Day heading above a group of messages, in the same fixed zone and locale as
// formatDateTime so the two never disagree about which day a message is on.
export function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

// Messages split into day buckets, keeping time order.
export function groupByDay(
  messages: Message[],
): { day: string; messages: Message[] }[] {
  const groups: { day: string; messages: Message[] }[] = [];
  for (const message of messages) {
    const day = formatDay(message.sentAt);
    const current = groups[groups.length - 1];
    if (current && current.day === day) current.messages.push(message);
    else groups.push({ day, messages: [message] });
  }
  return groups;
}

// `stamp` is passed in rather than read here, so no clock is touched outside
// the event handler that calls this.
export function pickAttachments(
  picked: FileList,
  existing: Attachment[],
  stamp: number,
): { accepted: Attachment[]; error: string } {
  const incoming = Array.from(picked);
  const tooBig = incoming.filter((f) => f.size > MAX_BYTES);
  const withinSize = incoming.filter((f) => f.size <= MAX_BYTES);
  const room = Math.max(0, MAX_FILES - existing.length);
  const accepted = withinSize.slice(0, room);

  const problems: string[] = [];
  if (tooBig.length > 0) {
    problems.push(
      `${tooBig.length} file${tooBig.length === 1 ? " is" : "s are"} over 10 MB and ${tooBig.length === 1 ? "was" : "were"} skipped.`,
    );
  }
  if (withinSize.length > room) {
    problems.push(`You can attach at most ${MAX_FILES} files.`);
  }

  return {
    // Metadata only — the file itself is never read or uploaded.
    accepted: accepted.map((file, i) => ({
      id: `att-local-${stamp}-${i}`,
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type || "application/octet-stream",
    })),
    error: problems.join(" "),
  };
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

export const readReadIds = () => readJSON<string[]>(READ_KEY, [], isArray);
export const writeReadIds = (ids: string[]) => writeJSON(READ_KEY, ids);

export type ReplyMap = Record<string, Message[]>;
export const readReplies = () => readJSON<ReplyMap>(REPLIES_KEY, {}, isObject);
export const writeReplies = (map: ReplyMap) => writeJSON(REPLIES_KEY, map);

// Local conversations are stored in the same shape as the seed data.
export type LocalConversation = {
  id: string;
  subject: string;
  participantIds: string[];
  isGroup: boolean;
  messages: Message[];
};
export const readLocalConversations = () =>
  readJSON<LocalConversation[]>(LOCAL_CONVOS_KEY, [], isArray);
export const writeLocalConversations = (items: LocalConversation[]) =>
  writeJSON(LOCAL_CONVOS_KEY, items);

// Newest conversation first. A thread with nothing in it has no time to sort
// on, so it sinks rather than jumping to the top.
export function sortRows(rows: ListRow[]): ListRow[] {
  return [...rows].sort((a, b) =>
    (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""),
  );
}
