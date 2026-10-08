"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  AnnouncementStatus,
  Attachment,
  Audience,
  AudienceType,
  Category,
  Priority,
} from "@/data/faculty-announcements";
import {
  audienceLabelFrom,
  countAudience,
  type AudienceOptions,
} from "@/lib/api/faculty-announcements";
import { cn } from "@/lib/utils";
import { formatBytes, type LocalAnnouncement } from "./utils";

const MAX_TITLE = 120;
const MAX_BODY = 2000;
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

const AUDIENCE_CHOICES: { type: AudienceType; label: string }[] = [
  { type: "class", label: "Entire class" },
  { type: "course", label: "Specific course" },
  { type: "department", label: "Department" },
  { type: "selected", label: "Selected students" },
  { type: "individual", label: "Individual student" },
];

const CATEGORIES: Category[] = [
  "general",
  "exam",
  "assignment",
  "schedule",
  "event",
];
const PRIORITIES: Priority[] = ["normal", "important", "urgent"];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-semibold text-danger">{message}</p>;
}

export function ComposeAnnouncement({
  options,
  onClose,
  onSaved,
}: {
  options: AudienceOptions;
  onClose: () => void;
  onSaved: (item: LocalAnnouncement, message: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [audienceType, setAudienceType] = useState<AudienceType>("class");
  const [classValue, setClassValue] = useState(options.classes[0]?.id ?? "");
  const [courseValue, setCourseValue] = useState(options.courses[0]?.id ?? "");
  const [departmentValue, setDepartmentValue] = useState(
    options.departments[0]?.id ?? "",
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [individualId, setIndividualId] = useState("");
  const [studentQuery, setStudentQuery] = useState("");

  const [category, setCategory] = useState<Category>("general");
  const [priority, setPriority] = useState<Priority>("normal");
  const [pinned, setPinned] = useState(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState("");

  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduleAt, setScheduleAt] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // components/ui/input.tsx is a plain function component and takes no ref, so
  // the panel holds the ref and the first field is looked up inside it.
  const panelRef = useRef<HTMLElement>(null);

  // Focus moves into the panel when it opens.
  useEffect(() => {
    panelRef.current
      ?.querySelector<HTMLInputElement>("#announcement-title")
      ?.focus();
  }, []);

  const audience: Audience = useMemo(() => {
    switch (audienceType) {
      case "class":
        return { type: "class", classId: classValue };
      case "course":
        return { type: "course", courseId: courseValue };
      case "department":
        return { type: "department", departmentId: departmentValue };
      case "selected":
        return { type: "selected", studentIds: selectedIds };
      case "individual":
        return {
          type: "individual",
          studentIds: individualId ? [individualId] : [],
        };
    }
  }, [
    audienceType,
    classValue,
    courseValue,
    departmentValue,
    selectedIds,
    individualId,
  ]);

  // Counted from the same option data the server resolved, so this matches
  // what the announcement will actually reach.
  const reach = countAudience(audience, options);
  const audienceLabel = audienceLabelFrom(audience, options);
  const audienceName = audienceLabel.split(" • ")[0];

  const hasContent =
    title.trim() !== "" || body.trim() !== "" || attachments.length > 0;

  function requestClose() {
    if (hasContent && !window.confirm("Discard changes?")) return;
    onClose();
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Reads the latest state through the closure this effect is re-created
      // with, so the discard prompt reflects what is actually typed.
      if (hasContent && !window.confirm("Discard changes?")) return;
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hasContent, onClose]);

  const shownStudents = options.students.filter((student) => {
    const q = studentQuery.trim().toLowerCase();
    if (q === "") return true;
    return (
      student.name.toLowerCase().includes(q) ||
      (student.rollNumber ?? "").toLowerCase().includes(q)
    );
  });

  function toggleStudent(id: string) {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id],
    );
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files;
    if (!picked) return;

    const incoming = Array.from(picked);
    const tooBig = incoming.filter((f) => f.size > MAX_BYTES);
    const withinSize = incoming.filter((f) => f.size <= MAX_BYTES);
    const room = Math.max(0, MAX_FILES - attachments.length);
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
    setFileError(problems.join(" "));

    // Metadata only — the file itself is never read or uploaded.
    const stamp = Date.now();
    setAttachments((current) => [
      ...current,
      ...accepted.map((file, i) => ({
        id: `att-local-${stamp}-${i}`,
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
      })),
    ]);

    // Lets the same file be picked again after being removed.
    event.target.value = "";
  }

  function validate(mode: "draft" | "send"): Record<string, string> {
    const found: Record<string, string> = {};

    if (title.trim() === "") found.title = "Title is required.";
    else if (title.length > MAX_TITLE) {
      found.title = `Keep the title to ${MAX_TITLE} characters.`;
    }

    if (mode === "send") {
      if (body.trim() === "") found.body = "A message body is required.";
      else if (body.length > MAX_BODY) {
        found.body = `Keep the message to ${MAX_BODY} characters.`;
      }
      if (reach === 0) {
        found.audience = "Choose an audience that reaches at least one student.";
      }
      if (sendMode === "schedule") {
        if (scheduleAt === "") found.schedule = "Pick a date and time.";
        else if (new Date(scheduleAt).getTime() <= Date.now()) {
          found.schedule = "The scheduled time must be in the future.";
        }
      }
    }

    return found;
  }

  function save(mode: "draft" | "send") {
    const found = validate(mode);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Clock read in an event handler, never during render.
    const nowISO = new Date().toISOString();
    const status: AnnouncementStatus =
      mode === "draft"
        ? "draft"
        : sendMode === "schedule"
          ? "scheduled"
          : "published";

    const item: LocalAnnouncement = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      audience,
      priority,
      category,
      attachments,
      status,
      createdAt: nowISO,
      publishAt:
        status === "draft"
          ? null
          : status === "scheduled"
            ? new Date(scheduleAt).toISOString()
            : nowISO,
      pinned,
      readBy: [],
      audienceLabel,
      recipientCount: reach,
    };

    const message =
      status === "draft"
        ? "Draft saved"
        : status === "scheduled"
          ? `Announcement scheduled for ${audienceName}`
          : `Announcement published to ${audienceName}`;

    onSaved(item, message);
  }

  const sendLabel = sendMode === "schedule" ? "Schedule" : "Publish";

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
        aria-labelledby="compose-heading"
        className="relative ml-auto flex h-full w-full flex-col border-border bg-surface shadow-lg dark:bg-slate-950 sm:max-w-xl sm:border-l"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border p-5">
          <h2 id="compose-heading" className="text-base font-bold text-ink">
            New announcement
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close compose panel"
            className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
          {/* Title */}
          <div>
            <label
              htmlFor="announcement-title"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Title *
            </label>
            <Input
              id="announcement-title"
              maxLength={MAX_TITLE}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="mt-1 text-right font-mono text-[11px] tabular text-ink-muted">
              {title.length} / {MAX_TITLE}
            </p>
            <FieldError message={errors.title} />
          </div>

          {/* Body */}
          <div>
            <label
              htmlFor="announcement-body"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Message *
            </label>
            <Textarea
              id="announcement-body"
              rows={6}
              maxLength={MAX_BODY}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="mt-1 text-right font-mono text-[11px] tabular text-ink-muted">
              {body.length} / {MAX_BODY}
            </p>
            <FieldError message={errors.body} />
          </div>

          {/* Audience */}
          <div>
            <span className="mb-1.5 block text-xs font-bold text-ink">
              Audience *
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCE_CHOICES.map((choice) => {
                const active = audienceType === choice.type;
                return (
                  <button
                    key={choice.type}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setAudienceType(choice.type)}
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
              {audienceType === "class" && (
                <>
                  <label
                    htmlFor="audience-class"
                    className="mb-1 block text-xs font-bold text-ink"
                  >
                    Class
                  </label>
                  <Select
                    id="audience-class"
                    className="text-xs"
                    value={classValue}
                    onChange={(e) => setClassValue(e.target.value)}
                  >
                    {options.classes.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label} ({option.studentCount})
                      </option>
                    ))}
                  </Select>
                </>
              )}

              {audienceType === "course" && (
                <>
                  <label
                    htmlFor="audience-course"
                    className="mb-1 block text-xs font-bold text-ink"
                  >
                    Course
                  </label>
                  <Select
                    id="audience-course"
                    className="text-xs"
                    value={courseValue}
                    onChange={(e) => setCourseValue(e.target.value)}
                  >
                    {options.courses.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label} ({option.studentCount})
                      </option>
                    ))}
                  </Select>
                </>
              )}

              {audienceType === "department" && (
                <>
                  <label
                    htmlFor="audience-department"
                    className="mb-1 block text-xs font-bold text-ink"
                  >
                    Department
                  </label>
                  <Select
                    id="audience-department"
                    className="text-xs"
                    value={departmentValue}
                    onChange={(e) => setDepartmentValue(e.target.value)}
                  >
                    {options.departments.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label} ({option.studentCount})
                      </option>
                    ))}
                  </Select>
                </>
              )}

              {(audienceType === "selected" ||
                audienceType === "individual") && (
                <div>
                  <label
                    htmlFor="audience-student-search"
                    className="mb-1 block text-xs font-bold text-ink"
                  >
                    Search students
                  </label>
                  <Input
                    id="audience-student-search"
                    className="text-xs"
                    placeholder="Name or roll number"
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                  />

                  {audienceType === "selected" && (
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedIds((ids) => [
                            ...new Set([
                              ...ids,
                              ...shownStudents.map((s) => s.id),
                            ]),
                          ])
                        }
                      >
                        Select all shown
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedIds([])}
                        disabled={selectedIds.length === 0}
                      >
                        Clear
                      </Button>
                    </div>
                  )}

                  <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2 scrollbar-thin">
                    {shownStudents.length === 0 ? (
                      <p className="px-1 py-2 text-xs text-ink-muted">
                        No students match that search.
                      </p>
                    ) : (
                      shownStudents.map((student) => (
                        <label
                          key={student.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 text-xs text-ink hover:bg-surface-raised"
                        >
                          <input
                            type={
                              audienceType === "selected" ? "checkbox" : "radio"
                            }
                            name="audience-student"
                            className="h-3.5 w-3.5 shrink-0 accent-violet-600"
                            checked={
                              audienceType === "selected"
                                ? selectedIds.includes(student.id)
                                : individualId === student.id
                            }
                            onChange={() =>
                              audienceType === "selected"
                                ? toggleStudent(student.id)
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
              )}
            </div>

            <p className="mt-2 text-xs text-ink-muted">
              Will reach{" "}
              <span className="font-mono tabular font-semibold text-ink">
                {reach}
              </span>{" "}
              student{reach === 1 ? "" : "s"}
              {reach > 0 && <> · {audienceName}</>}
            </p>
            <FieldError message={errors.audience} />
          </div>

          {/* Category and priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="announcement-category"
                className="mb-1 block text-xs font-bold text-ink"
              >
                Category
              </label>
              <Select
                id="announcement-category"
                className="text-xs"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {value[0].toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label
                htmlFor="announcement-priority"
                className="mb-1 block text-xs font-bold text-ink"
              >
                Priority
              </label>
              <Select
                id="announcement-priority"
                className="text-xs"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {value[0].toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Pin */}
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-ink">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-violet-600"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            Pin to top
          </label>

          {/* Attachments */}
          <div>
            <label
              htmlFor="announcement-files"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Attachments
            </label>
            <input
              id="announcement-files"
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

            {attachments.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5"
                  >
                    <Paperclip className="h-3 w-3 shrink-0 text-ink-muted" />
                    <span className="min-w-0 flex-1 truncate text-xs text-ink">
                      {file.name}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] tabular text-ink-muted">
                      {formatBytes(file.sizeBytes)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((a) => a.id !== file.id),
                        )
                      }
                      aria-label={`Remove ${file.name}`}
                      className="shrink-0 rounded p-0.5 text-ink-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Send options */}
          <div>
            <span className="mb-1.5 block text-xs font-bold text-ink">
              Send
            </span>
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink">
                <input
                  type="radio"
                  name="send-mode"
                  className="h-3.5 w-3.5 accent-violet-600"
                  checked={sendMode === "now"}
                  onChange={() => setSendMode("now")}
                />
                Publish now
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink">
                <input
                  type="radio"
                  name="send-mode"
                  className="h-3.5 w-3.5 accent-violet-600"
                  checked={sendMode === "schedule"}
                  onChange={() => setSendMode("schedule")}
                />
                Schedule for later
              </label>
            </div>

            {sendMode === "schedule" && (
              <div className="mt-2">
                <label
                  htmlFor="announcement-schedule"
                  className="mb-1 block text-xs font-bold text-ink"
                >
                  Date and time
                </label>
                <Input
                  id="announcement-schedule"
                  type="datetime-local"
                  className="text-xs"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                />
              </div>
            )}
            <FieldError message={errors.schedule} />
          </div>

          <p className="text-[11px] text-ink-muted">
            <Badge tone="neutral" className="mr-1.5 text-[10px]">
              Local
            </Badge>
            Saved in this browser only. Nothing is sent to students.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => save("draft")}
          >
            Save as draft
          </Button>
          <Button type="button" size="sm" onClick={() => save("send")}>
            {sendLabel}
          </Button>
        </div>
      </aside>
    </div>
  );
}
