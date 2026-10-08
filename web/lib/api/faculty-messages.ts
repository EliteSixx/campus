import {
  conversations,
  FACULTY_ID,
  type Conversation,
  type Message,
} from "@/data/faculty-messages";
import { students } from "@/data/students";
import { studentRecords } from "@/data/faculty-student-records";

// Faculty message threads, flattened for the inbox list and the thread view.
//
// "Unread" always means unread *by the faculty member*: a message a student
// sent that has no readAt. The faculty member's own messages carry a readAt for
// when the student opened them, which is a different thing and never counted
// here.
//
// No clock is read in this file, so the server and client render alike.

const PREVIEW_LENGTH = 80;

export interface ConversationSummary {
  id: string;
  subject: string;
  // Ids as well as names: the new-message panel matches on id to spot an
  // existing one-to-one thread, which matching on display names would get
  // wrong the moment two students share a name.
  participantIds: string[];
  participantNames: string[];
  isGroup: boolean;
  // First ~80 characters of the most recent message, ellipsised if cut.
  lastMessagePreview: string;
  // null only if a thread somehow has no messages.
  lastMessageAt: string | null;
  unreadCount: number;
  // The ids behind that count. The inbox needs them, not just the total,
  // because a browser can mark messages read locally: subtracting those ids is
  // the only way a closed conversation's badge stays correct.
  unreadMessageIds: string[];
  // Drives the paperclip on the inbox row.
  lastMessageHasAttachment: boolean;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  rollNumber: string | null;
}

export interface ConversationDetail {
  id: string;
  subject: string;
  isGroup: boolean;
  participants: ConversationParticipant[];
  // Oldest first, the order a thread is read in.
  messages: Message[];
  unreadCount: number;
}

function studentName(studentId: string): string {
  return students.find((s) => s.id === studentId)?.name ?? studentId;
}

function rollNumberOf(studentId: string): string | null {
  return (
    studentRecords.find((r) => r.studentId === studentId)?.rollNumber ?? null
  );
}

const isFromStudent = (message: Message) => message.senderId !== FACULTY_ID;

function unreadIdsOf(conversation: Conversation): string[] {
  return conversation.messages
    .filter((m) => isFromStudent(m) && m.readAt === null)
    .map((m) => m.id);
}

function unreadCount(conversation: Conversation): number {
  return unreadIdsOf(conversation).length;
}

function sortedMessages(conversation: Conversation): Message[] {
  return [...conversation.messages].sort((a, b) =>
    a.sentAt.localeCompare(b.sentAt),
  );
}

function lastMessage(conversation: Conversation): Message | null {
  const messages = sortedMessages(conversation);
  return messages[messages.length - 1] ?? null;
}

function preview(body: string): string {
  const text = body.trim();
  return text.length <= PREVIEW_LENGTH
    ? text
    : `${text.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  return conversations
    .map((conversation) => {
      const last = lastMessage(conversation);
      return {
        id: conversation.id,
        subject: conversation.subject,
        participantIds: conversation.participantIds,
        participantNames: conversation.participantIds.map(studentName),
        isGroup: conversation.isGroup,
        lastMessagePreview: last ? preview(last.body) : "",
        lastMessageAt: last?.sentAt ?? null,
        unreadCount: unreadCount(conversation),
        unreadMessageIds: unreadIdsOf(conversation),
        lastMessageHasAttachment: (last?.attachments.length ?? 0) > 0,
      };
    })
    // Newest first. A thread with no messages has nothing to sort on, so it
    // sinks to the bottom rather than jumping to the top.
    .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

export async function getConversationById(
  id: string,
): Promise<ConversationDetail | null> {
  const conversation = conversations.find((c) => c.id === id);
  if (!conversation) return null;

  return {
    id: conversation.id,
    subject: conversation.subject,
    isGroup: conversation.isGroup,
    participants: conversation.participantIds.map((studentId) => ({
      id: studentId,
      name: studentName(studentId),
      rollNumber: rollNumberOf(studentId),
    })),
    messages: sortedMessages(conversation),
    unreadCount: unreadCount(conversation),
  };
}

export async function getUnreadMessageCount(): Promise<number> {
  return conversations.reduce((sum, c) => sum + unreadCount(c), 0);
}
