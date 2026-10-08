"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailOpen, Paperclip, Send, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { Attachment } from "@/data/faculty-announcements";
import { formatDateTime } from "@/components/faculty/announcements/utils";
import { cn } from "@/lib/utils";
import { MessageAttachments, PendingAttachments } from "./MessageAttachments";
import {
  groupByDay,
  isFromStudent,
  MAX_FILES,
  MAX_REPLY,
  pickAttachments,
  QUICK_REPLIES,
  type ThreadData,
  type ThreadParticipant,
} from "./utils";

function ParticipantName({ participant }: { participant: ThreadParticipant }) {
  const label = participant.rollNumber
    ? `${participant.name} · ${participant.rollNumber}`
    : participant.name;

  // Only linked when that student really has a page — students outside this
  // faculty member's cohort would 404.
  return participant.hasDetailPage ? (
    <Link
      href={`/faculty/students/${participant.id}`}
      className="font-semibold text-accent hover:underline"
    >
      {label}
    </Link>
  ) : (
    <span className="text-ink">{label}</span>
  );
}

export function ConversationThread({
  thread,
  senderNames,
  onSendReply,
  onMarkUnread,
  hasUnread,
}: {
  thread: ThreadData;
  // Student id -> display name, for the sender line above group bubbles.
  senderNames: Record<string, string>;
  onSendReply: (body: string, attachments: Attachment[]) => void;
  onMarkUnread: () => void;
  hasUnread: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Jump to the newest message when the thread opens and whenever one arrives.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread.id, thread.messages.length]);

  const canSend = draft.trim() !== "";

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files;
    if (!picked) return;
    // Clock read in an event handler, never during render.
    const { accepted, error } = pickAttachments(picked, attachments, Date.now());
    setFileError(error);
    setAttachments((current) => [...current, ...accepted]);
    // Lets the same file be picked again after being removed.
    event.target.value = "";
  }

  function send() {
    if (!canSend) return;
    onSendReply(draft.trim(), attachments);
    setDraft("");
    setAttachments([]);
    setFileError("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter breaks the line.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  const groups = groupByDay(thread.messages);

  return (
    <Card className="flex h-full flex-col p-0">
      {/* Header */}
      <div className="border-b border-border p-4">
        <Link
          href="/faculty/messages"
          className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline lg:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-ink">{thread.subject}</h2>
              {thread.isLocal && <Badge tone="neutral">Local</Badge>}
              {thread.isGroup && (
                <Badge tone="cyan" className="text-[10px]">
                  <Users className="h-3 w-3" />
                  Group · {thread.participants.length} members
                </Badge>
              )}
            </div>

            <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-ink-muted">
              {thread.participants.map((participant, i) => (
                <span key={participant.id}>
                  <ParticipantName participant={participant} />
                  {i < thread.participants.length - 1 && (
                    <span aria-hidden="true">,</span>
                  )}
                </span>
              ))}
            </p>
          </div>

          {hasUnread ? (
            <Badge tone="accent" className="shrink-0">
              Unread
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={onMarkUnread}
            >
              <MailOpen className="h-3.5 w-3.5" />
              Mark as unread
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        aria-live="polite"
        aria-label={`Messages in ${thread.subject}`}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin"
      >
        {groups.map((group) => (
          <div key={group.day} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                {group.day}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {group.messages.map((message) => {
              const fromStudent = isFromStudent(message);
              // A reply written in this browser was never delivered anywhere.
              const isLocalReply = message.id.startsWith("local-");

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    fromStudent ? "justify-start" : "justify-end",
                  )}
                >
                  <div className="max-w-[85%] sm:max-w-[75%]">
                    {fromStudent && thread.isGroup && (
                      <p className="mb-0.5 px-1 text-[10px] font-bold text-ink-muted">
                        {senderNames[message.senderId] ?? message.senderId}
                      </p>
                    )}

                    <div
                      className={cn(
                        "rounded-xl px-3 py-2",
                        fromStudent
                          ? "rounded-tl-sm border border-border bg-surface-raised text-ink"
                          : "rounded-tr-sm bg-accent text-white",
                      )}
                    >
                      <p className="whitespace-pre-line text-xs leading-relaxed">
                        {message.body}
                      </p>
                      <MessageAttachments
                        attachments={message.attachments}
                        onBubble={!fromStudent}
                      />
                    </div>

                    <p
                      className={cn(
                        "mt-0.5 px-1 font-mono text-[10px] tabular text-ink-muted",
                        fromStudent ? "text-left" : "text-right",
                      )}
                    >
                      {formatDateTime(message.sentAt)}
                      {!fromStudent && (
                        <>
                          {" · "}
                          {isLocalReply
                            ? "Sent"
                            : message.readAt !== null
                              ? "Seen"
                              : "Delivered"}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div className="border-t border-border p-4">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => setDraft(text)}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {text}
            </button>
          ))}
        </div>

        <div className="mt-2">
          <label htmlFor="reply-body" className="sr-only">
            Write a reply
          </label>
          <Textarea
            id="reply-body"
            rows={3}
            maxLength={MAX_REPLY}
            placeholder="Write a reply… Enter sends, Shift+Enter adds a line."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <PendingAttachments
          attachments={attachments}
          onRemove={(id) =>
            setAttachments((current) => current.filter((a) => a.id !== id))
          }
        />
        {fileError && (
          <p className="mt-1 text-xs font-semibold text-danger">{fileError}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="reply-files"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
            >
              <Paperclip className="h-3.5 w-3.5" />
              Attach
            </label>
            <input
              id="reply-files"
              type="file"
              multiple
              onChange={handleFiles}
              className="sr-only"
            />
            <span className="text-[10px] text-ink-muted">
              Demo: files are not uploaded. Up to {MAX_FILES}, 10 MB each.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tabular text-ink-muted">
              {draft.length} / {MAX_REPLY}
            </span>
            <Button size="sm" disabled={!canSend} onClick={send}>
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
