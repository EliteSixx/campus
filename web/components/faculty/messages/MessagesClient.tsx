"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquare, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import type { Attachment } from "@/data/faculty-announcements";
import { FACULTY_ID, type Message } from "@/data/faculty-messages";
import type { StudentOption } from "@/lib/api/faculty-announcements";
import type {
  ConversationDetail,
  ConversationSummary,
} from "@/lib/api/faculty-messages";
import { cn } from "@/lib/utils";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";
import { NewMessage } from "./NewMessage";
import {
  previewOf,
  readLocalConversations,
  readReadIds,
  readReplies,
  sortRows,
  unreadCountOf,
  unreadMessageIds,
  writeLocalConversations,
  writeReadIds,
  writeReplies,
  type ListRow,
  type LocalConversation,
  type ReplyMap,
  type ThreadData,
  type ThreadParticipant,
} from "./utils";

export function MessagesClient({
  summaries,
  students,
  detail,
  selectedId,
  studentIdsWithDetailPage,
  initialComposeTo = null,
  initialComposeSubject = null,
}: {
  summaries: ConversationSummary[];
  students: StudentOption[];
  // Server-loaded thread, null on the inbox page and for local ids.
  detail: ConversationDetail | null;
  selectedId: string | null;
  studentIdsWithDetailPage: string[];
  // From /faculty/messages?to=&subject=, already validated on the server.
  initialComposeTo?: string | null;
  initialComposeSubject?: string | null;
}) {
  const router = useRouter();

  const [readIds, setReadIds] = useState<string[]>([]);
  const [replies, setReplies] = useState<ReplyMap>({});
  const [localConvos, setLocalConvos] = useState<LocalConversation[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [composeOpen, setComposeOpen] = useState(false);
  // What the open compose panel starts with. Held here rather than read from
  // the props, because the URL (and so the props) is cleared once it opens.
  const [composePrefill, setComposePrefill] = useState<{
    studentId: string;
    subject: string | null;
  } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Everything below comes from this browser, so it is read after mount only.
  // Until then the seed values render, which is what the server sent.
  useEffect(() => {
    setReadIds(readReadIds());
    setReplies(readReplies());
    setLocalConvos(readLocalConversations());
    setLoaded(true);
  }, []);

  // A ?to= link opens the compose panel once, after storage has loaded so the
  // "already have a conversation" hint can see local threads too. The query is
  // then dropped from the URL, so a reload does not open it again.
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (!loaded || initialComposeTo === null || deepLinkHandled.current) return;
    deepLinkHandled.current = true;
    setComposePrefill({
      studentId: initialComposeTo,
      subject: initialComposeSubject,
    });
    setComposeOpen(true);
    router.replace("/faculty/messages", { scroll: false });
  }, [loaded, initialComposeTo, initialComposeSubject, router]);

  function openCompose() {
    setComposePrefill(null);
    setComposeOpen(true);
  }

  function closeCompose() {
    setComposeOpen(false);
    setComposePrefill(null);
  }

  const withPages = useMemo(
    () => new Set(studentIdsWithDetailPage),
    [studentIdsWithDetailPage],
  );

  const studentsById = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  );

  const senderNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const student of students) names[student.id] = student.name;
    return names;
  }, [students]);

  const toParticipant = (id: string): ThreadParticipant => {
    const student = studentsById.get(id);
    return {
      id,
      name: student?.name ?? id,
      rollNumber: student?.rollNumber ?? null,
      hasDetailPage: withPages.has(id),
    };
  };

  // Seed rows and locally created ones, each with this browser's replies
  // merged in so the preview, time and ordering reflect the latest message.
  const rows = useMemo<ListRow[]>(() => {
    const readSet = new Set(readIds);

    const seedRows: ListRow[] = summaries.map((summary) => {
      const extra = replies[summary.id] ?? [];
      const last = extra[extra.length - 1];
      return {
        id: summary.id,
        subject: summary.subject,
        participantIds: summary.participantIds,
        participantNames: summary.participantNames,
        isGroup: summary.isGroup,
        preview: last ? previewOf(extra) : summary.lastMessagePreview,
        lastMessageAt: last?.sentAt ?? summary.lastMessageAt,
        // The seed unread ids minus whatever this browser has since marked
        // read. Replies are the faculty member's own, so they never add unread.
        unreadCount: loaded
          ? summary.unreadMessageIds.filter((id) => !readSet.has(id)).length
          : summary.unreadCount,
        hasAttachment: last
          ? last.attachments.length > 0
          : summary.lastMessageHasAttachment,
        isLocal: false,
      };
    });

    const localRows: ListRow[] = localConvos.map((conversation) => {
      const all = [...conversation.messages, ...(replies[conversation.id] ?? [])];
      const last = all[all.length - 1];
      return {
        id: conversation.id,
        subject: conversation.subject,
        participantIds: conversation.participantIds,
        participantNames: conversation.participantIds.map(
          (id) => studentsById.get(id)?.name ?? id,
        ),
        isGroup: conversation.isGroup,
        preview: previewOf(all),
        lastMessageAt: last?.sentAt ?? null,
        unreadCount: unreadCountOf(all, readIds),
        hasAttachment: (last?.attachments.length ?? 0) > 0,
        isLocal: true,
      };
    });

    return sortRows([...seedRows, ...localRows]);
  }, [summaries, replies, localConvos, readIds, loaded, studentsById]);

  const totalUnread = rows.reduce((sum, row) => sum + row.unreadCount, 0);

  // The open conversation, from the server for a seed id or from storage for
  // a local one, with replies appended.
  const thread = useMemo<ThreadData | null>(() => {
    if (!selectedId) return null;

    const extra = replies[selectedId] ?? [];

    if (detail) {
      return {
        id: detail.id,
        subject: detail.subject,
        isGroup: detail.isGroup,
        participants: detail.participants.map((p) => ({
          ...p,
          hasDetailPage: withPages.has(p.id),
        })),
        messages: [...detail.messages, ...extra],
        isLocal: false,
      };
    }

    const local = localConvos.find((c) => c.id === selectedId);
    if (!local) return null;

    return {
      id: local.id,
      subject: local.subject,
      isGroup: local.isGroup,
      participants: local.participantIds.map(toParticipant),
      messages: [...local.messages, ...extra],
      isLocal: true,
    };
  }, [selectedId, detail, localConvos, replies, withPages, studentsById]);

  // Opening a conversation marks its unread student messages as read. The ref
  // stops "mark as unread" from being undone while the thread stays open.
  const markedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!loaded || !selectedId || !thread) return;
    if (markedRef.current === selectedId) return;
    markedRef.current = selectedId;

    const ids = unreadMessageIds(thread.messages, readIds);
    if (ids.length === 0) return;

    setReadIds((current) => {
      const next = [...new Set([...current, ...ids])];
      writeReadIds(next);
      return next;
    });
    // readIds is deliberately not a dependency: re-running on its own change
    // would immediately undo "mark as unread".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, selectedId, thread]);

  function markUnread() {
    if (!thread) return;
    const own = new Set(thread.messages.map((m) => m.id));
    setReadIds((current) => {
      const next = current.filter((id) => !own.has(id));
      writeReadIds(next);
      return next;
    });
  }

  function sendReply(body: string, attachments: Attachment[]) {
    if (!selectedId) return;

    // Clock read in an event handler, never during render.
    const stamp = Date.now();
    const message: Message = {
      id: `local-${stamp}`,
      senderId: FACULTY_ID,
      body,
      sentAt: new Date().toISOString(),
      attachments,
      readAt: null,
    };

    setReplies((current) => {
      const next = {
        ...current,
        [selectedId]: [...(current[selectedId] ?? []), message],
      };
      writeReplies(next);
      return next;
    });
  }

  function createConversation(
    conversation: LocalConversation,
    message: string,
  ) {
    const next = [conversation, ...localConvos];
    setLocalConvos(next);
    writeLocalConversations(next);
    setFlash(message);
    closeCompose();
    router.push(`/faculty/messages/${conversation.id}`);
  }

  const threadUnread = thread ? unreadCountOf(thread.messages, readIds) > 0 : false;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          ...(selectedId
            ? [
                { label: "Messages", href: "/faculty/messages" },
                { label: thread?.subject ?? "Conversation" },
              ]
            : [{ label: "Messages" }]),
        ]}
      />

      {flash && (
        <Card className="mb-4 flex items-center justify-between gap-3 border-success/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {flash}
          </p>
          <button
            type="button"
            onClick={() => setFlash(null)}
            aria-label="Dismiss message"
            className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}

      {/* Two columns from lg up. Below that only one side shows, decided by
          whether a conversation is open — done in CSS so there is no client
          width check and nothing to mismatch on hydration. */}
      <div className="flex gap-4 lg:h-[calc(100vh-11rem)]">
        <div
          className={cn(
            "w-full lg:w-[360px] lg:shrink-0",
            selectedId ? "hidden lg:block" : "block",
          )}
        >
          <ConversationList
            rows={rows}
            selectedId={selectedId}
            totalUnread={totalUnread}
            onNewMessage={openCompose}
          />
        </div>

        <div
          className={cn(
            "min-w-0 flex-1",
            selectedId ? "block" : "hidden lg:block",
          )}
        >
          {thread ? (
            <ConversationThread
              thread={thread}
              senderNames={senderNames}
              onSendReply={sendReply}
              onMarkUnread={markUnread}
              hasUnread={threadUnread}
            />
          ) : selectedId ? (
            // A local id that is not in this browser's storage.
            <Card className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="mx-auto h-6 w-6 text-ink-faint" />
                <p className="mt-2 text-sm font-semibold text-ink">
                  {loaded ? "Conversation not found" : "Loading conversation…"}
                </p>
                {loaded && (
                  <>
                    <p className="mt-1 text-xs text-ink-muted">
                      It may have been started in another browser, or removed
                      from this one&apos;s storage.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push("/faculty/messages")}
                    >
                      Back to messages
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ) : (
            <Card className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="mx-auto h-6 w-6 text-ink-faint" />
                <p className="mt-2 text-sm font-semibold text-ink">
                  Select a conversation
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Pick a thread on the left, or start a new one.
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={openCompose}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New message
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {composeOpen && (
        <NewMessage
          students={students}
          rows={rows}
          onClose={closeCompose}
          onCreated={createConversation}
          initialStudentId={composePrefill?.studentId ?? null}
          initialSubject={composePrefill?.subject ?? null}
        />
      )}
    </>
  );
}
