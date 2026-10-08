"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Megaphone, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { Attachment } from "@/data/faculty-announcements";
import { FACULTY_ID, type Message } from "@/data/faculty-messages";
import type { StudentOption } from "@/lib/api/faculty-announcements";
import { cn } from "@/lib/utils";
import { PendingAttachments } from "./MessageAttachments";
import {
  MAX_FILES,
  MAX_GROUP,
  MAX_REPLY,
  MAX_SUBJECT,
  MIN_GROUP,
  pickAttachments,
  type ListRow,
  type LocalConversation,
} from "./utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-semibold text-danger">{message}</p>;
}

export function NewMessage({
  students,
  rows,
  onClose,
  onCreated,
  initialStudentId = null,
  initialSubject = null,
}: {
  students: StudentOption[];
  // Existing conversations, used to spot a one-to-one thread that already
  // exists with the chosen student.
  rows: ListRow[];
  onClose: () => void;
  onCreated: (conversation: LocalConversation, message: string) => void;
  // Prefill from a "Message student" link. Read once, when the panel opens.
  initialStudentId?: string | null;
  initialSubject?: string | null;
}) {
  // Only a student the picker offers can be prefilled.
  const prefilledId =
    initialStudentId !== null && students.some((s) => s.id === initialStudentId)
      ? initialStudentId
      : "";
  const prefilledSubject = initialSubject ?? "";

  const [mode, setMode] = useState<"one" | "group">("one");
  const [individualId, setIndividualId] = useState(prefilledId);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [studentQuery, setStudentQuery] = useState("");

  const [subject, setSubject] = useState(prefilledSubject);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const panelRef = useRef<HTMLElement>(null);

  // components/ui/input.tsx is a plain function component and takes no ref, so
  // the panel holds the ref and the first field is looked up inside it.
  useEffect(() => {
    panelRef.current
      ?.querySelector<HTMLInputElement>("#new-message-search")
      ?.focus();
  }, []);

  // Only what the teacher did counts: typed text, attachments, or a recipient
  // they picked or changed. Values that came prefilled from a link and were
  // left alone never trigger the discard prompt.
  const hasContent =
    subject.trim() !== prefilledSubject.trim() ||
    body.trim() !== "" ||
    attachments.length > 0 ||
    individualId !== prefilledId ||
    groupIds.length > 0;

  function requestClose() {
    if (hasContent && !window.confirm("Discard message?")) return;
    onClose();
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Reads the latest state through the closure this effect is re-created
      // with, so the discard prompt reflects what is actually typed.
      if (hasContent && !window.confirm("Discard message?")) return;
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hasContent, onClose]);

  const shown = students.filter((student) => {
    const q = studentQuery.trim().toLowerCase();
    if (q === "") return true;
    return (
      student.name.toLowerCase().includes(q) ||
      (student.rollNumber ?? "").toLowerCase().includes(q)
    );
  });

  const recipientIds = mode === "one" ? (individualId ? [individualId] : []) : groupIds;

  // A one-to-one thread with this student that already exists, seed or local.
  const existing = useMemo(() => {
    if (mode !== "one" || individualId === "") return null;
    return (
      rows.find(
        (row) =>
          !row.isGroup &&
          row.participantIds.length === 1 &&
          row.participantIds[0] === individualId,
      ) ?? null
    );
  }, [mode, individualId, rows]);

  const existingName =
    students.find((s) => s.id === individualId)?.name ?? "this student";

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files;
    if (!picked) return;
    const { accepted, error } = pickAttachments(picked, attachments, Date.now());
    setFileError(error);
    setAttachments((current) => [...current, ...accepted]);
    event.target.value = "";
  }

  function send() {
    const found: Record<string, string> = {};

    if (mode === "one" && individualId === "") {
      found.recipients = "Choose a student to message.";
    }
    if (mode === "group") {
      if (groupIds.length < MIN_GROUP || groupIds.length > MAX_GROUP) {
        found.recipients = `A group needs between ${MIN_GROUP} and ${MAX_GROUP} students. You have picked ${groupIds.length}.`;
      }
    }
    if (subject.trim() === "") found.subject = "A subject is required.";
    if (body.trim() === "") found.body = "A first message is required.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Clock read in an event handler, never during render.
    const stamp = Date.now();
    const first: Message = {
      id: `local-${stamp}-m1`,
      senderId: FACULTY_ID,
      body: body.trim(),
      sentAt: new Date().toISOString(),
      attachments,
      readAt: null,
    };

    const conversation: LocalConversation = {
      id: `local-${stamp}`,
      subject: subject.trim(),
      participantIds: recipientIds,
      isGroup: mode === "group",
      messages: [first],
    };

    const who =
      mode === "one"
        ? existingName
        : `${recipientIds.length} students`;
    onCreated(conversation, `Message sent to ${who}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={requestClose}
        aria-hidden="true"
      />

      {/* Full screen on a phone, a side panel from sm up. */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-message-heading"
        className="relative ml-auto flex h-full w-full flex-col border-border bg-surface shadow-lg dark:bg-slate-950 sm:max-w-xl sm:border-l"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border p-5">
          <h2 id="new-message-heading" className="text-base font-bold text-ink">
            New message
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close new message panel"
            className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
          {/* Recipients */}
          <div>
            <span className="mb-1.5 block text-xs font-bold text-ink">To *</span>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "one" as const, label: "One student" },
                  { id: "group" as const, label: "Small group" },
                ]
              ).map((choice) => {
                const active = mode === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMode(choice.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      active
                        ? "bg-accent text-white shadow-sm"
                        : "text-ink-muted hover:bg-surface-raised hover:text-ink",
                    )}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <label
                htmlFor="new-message-search"
                className="mb-1 block text-xs font-bold text-ink"
              >
                Search students
              </label>
              <Input
                id="new-message-search"
                className="text-xs"
                placeholder="Name or roll number"
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
              />

              {mode === "group" && (
                <p className="mt-1.5 text-[11px] text-ink-muted">
                  Pick between {MIN_GROUP} and {MAX_GROUP} students ·{" "}
                  <span className="font-mono tabular text-ink">
                    {groupIds.length}
                  </span>{" "}
                  selected
                </p>
              )}

              <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2 scrollbar-thin">
                {shown.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-ink-muted">
                    No students match that search.
                  </p>
                ) : (
                  shown.map((student) => (
                    <label
                      key={student.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 text-xs text-ink hover:bg-surface-raised"
                    >
                      <input
                        type={mode === "group" ? "checkbox" : "radio"}
                        name="new-message-student"
                        className="h-3.5 w-3.5 shrink-0 accent-violet-600"
                        checked={
                          mode === "group"
                            ? groupIds.includes(student.id)
                            : individualId === student.id
                        }
                        onChange={() =>
                          mode === "group"
                            ? setGroupIds((ids) =>
                                ids.includes(student.id)
                                  ? ids.filter((i) => i !== student.id)
                                  : [...ids, student.id],
                              )
                            : setIndividualId(student.id)
                        }
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {student.name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] tabular text-ink-muted">
                        {student.rollNumber ?? "—"}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <FieldError message={errors.recipients} />

            {existing && (
              <p className="mt-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-[11px] text-ink-muted">
                You already have a conversation with {existingName}.{" "}
                <Link
                  href={`/faculty/messages/${existing.id}`}
                  className="font-semibold text-accent hover:underline"
                >
                  Open conversation
                </Link>
                . You can still start a new one.
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="new-message-subject"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Subject *
            </label>
            <Input
              id="new-message-subject"
              maxLength={MAX_SUBJECT}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <p className="mt-1 text-right font-mono text-[11px] tabular text-ink-muted">
              {subject.length} / {MAX_SUBJECT}
            </p>
            <FieldError message={errors.subject} />
          </div>

          {/* First message */}
          <div>
            <label
              htmlFor="new-message-body"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Message *
            </label>
            <Textarea
              id="new-message-body"
              rows={5}
              maxLength={MAX_REPLY}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="mt-1 text-right font-mono text-[11px] tabular text-ink-muted">
              {body.length} / {MAX_REPLY}
            </p>
            <FieldError message={errors.body} />
          </div>

          {/* Attachments */}
          <div>
            <label
              htmlFor="new-message-files"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Attachments
            </label>
            <input
              id="new-message-files"
              type="file"
              multiple
              onChange={handleFiles}
              className="block w-full text-xs text-ink-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface-raised file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink hover:file:bg-border/40"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              Demo: files are not uploaded. Up to {MAX_FILES} files, 10 MB each.
            </p>
            {fileError && (
              <p className="mt-1 text-xs font-semibold text-danger">
                {fileError}
              </p>
            )}
            <PendingAttachments
              attachments={attachments}
              onRemove={(id) =>
                setAttachments((current) => current.filter((a) => a.id !== id))
              }
            />
          </div>

          <p className="flex items-start gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-[11px] text-ink-muted">
            <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              For class-wide updates, use{" "}
              <Link
                href="/faculty/announcements"
                className="font-semibold text-accent hover:underline"
              >
                Announcements
              </Link>
              .
            </span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button type="button" size="sm" variant="outline" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={send}>
            <Send className="h-3.5 w-3.5" />
            Send message
          </Button>
        </div>
      </aside>
    </div>
  );
}
