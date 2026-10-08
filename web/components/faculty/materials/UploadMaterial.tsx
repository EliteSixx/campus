"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  ExamType,
  Material,
  MaterialType,
} from "@/lib/api/faculty-materials-meta";
import {
  isValidHttpUrl,
  MATERIAL_TYPE_META,
  videoProvider,
} from "@/lib/api/faculty-materials-meta";
import { formatBytes } from "@/components/faculty/announcements/utils";
import { cn } from "@/lib/utils";
import {
  EARLIEST_PYQ_YEAR,
  MAX_DESCRIPTION,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MAX_TITLE,
  pathLabel,
  TYPE_ICON,
  type CourseOption,
} from "./utils";

const TYPE_ORDER: MaterialType[] = [
  "pdf",
  "ppt",
  "notes",
  "pyq",
  "lab-manual",
  "question-bank",
  "link",
  "video",
];

// These are nearly always set against the whole course rather than one topic.
const COURSE_LEVEL_HINT: MaterialType[] = ["pyq", "question-bank", "lab-manual"];

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: "mid-sem", label: "Mid-sem" },
  { value: "end-sem", label: "End-sem" },
  { value: "quiz", label: "Quiz" },
];

type Level = "course" | "unit" | "topic";

export interface UploadPreselect {
  courseId?: string;
  unitId?: string;
  topicId?: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-semibold text-danger">{message}</p>;
}

export function UploadMaterial({
  courses,
  uploadedBy,
  preselect,
  onClose,
  onUploaded,
}: {
  courses: CourseOption[];
  uploadedBy: string;
  preselect: UploadPreselect | null;
  onClose: () => void;
  onUploaded: (material: Material, message: string) => void;
}) {
  const [type, setType] = useState<MaterialType>("pdf");

  const [courseId, setCourseId] = useState(
    preselect?.courseId ?? courses[0]?.id ?? "",
  );
  const [level, setLevel] = useState<Level>(
    preselect?.topicId ? "topic" : preselect?.unitId ? "unit" : "course",
  );
  const [unitId, setUnitId] = useState(preselect?.unitId ?? "");
  const [topicId, setTopicId] = useState(preselect?.topicId ?? "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [file, setFile] = useState<Material["file"]>(null);
  const [fileError, setFileError] = useState("");
  const [url, setUrl] = useState("");

  // Starts at the latest year the seed data knows about, then widens to the
  // real current year after mount. Never reads a clock during render.
  const [currentYear, setCurrentYear] = useState(2026);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  const [pyqYear, setPyqYear] = useState<number | "">("");
  const [examType, setExamType] = useState<ExamType | "">("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [publish, setPublish] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    panelRef.current
      ?.querySelector<HTMLButtonElement>("#upload-first-type")
      ?.focus();
  }, []);

  const meta = MATERIAL_TYPE_META[type];
  const course = courses.find((c) => c.id === courseId);
  const units = course?.units ?? [];
  const unit = units.find((u) => u.id === unitId);
  const topics = unit?.topics ?? [];

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= EARLIEST_PYQ_YEAR; y -= 1) list.push(y);
    return list;
  }, [currentYear]);

  const hasContent =
    title.trim() !== "" ||
    description.trim() !== "" ||
    file !== null ||
    url.trim() !== "" ||
    tags.length > 0;

  function requestClose() {
    if (hasContent && !window.confirm("Discard upload?")) return;
    onClose();
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (hasContent && !window.confirm("Discard upload?")) return;
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hasContent, onClose]);

  // Changing the course invalidates the unit, and changing the unit
  // invalidates the topic — a topic id only means something inside its course.
  function changeCourse(next: string) {
    setCourseId(next);
    setUnitId("");
    setTopicId("");
  }

  function changeUnit(next: string) {
    setUnitId(next);
    setTopicId("");
  }

  function changeType(next: MaterialType) {
    setType(next);
    // The old payload cannot apply to the new type.
    setFile(null);
    setUrl("");
    setFileError("");
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    const dot = picked.name.lastIndexOf(".");
    const extension = dot === -1 ? "" : picked.name.slice(dot).toLowerCase();

    if (!meta.acceptedExtensions.includes(extension)) {
      setFileError(
        `${meta.label} must be one of: ${meta.acceptedExtensions.join(", ")}.`,
      );
      return;
    }
    if (picked.size > meta.maxSizeMb * 1024 * 1024) {
      setFileError(
        `That file is ${formatBytes(picked.size)}; the limit for ${meta.label} is ${meta.maxSizeMb} MB.`,
      );
      return;
    }

    setFileError("");
    // Metadata only — the file itself is never read or uploaded.
    setFile({
      name: picked.name,
      sizeBytes: picked.size,
      mimeType: picked.type || "application/octet-stream",
    });
    // A blank title takes the file name, which is what it would have been.
    if (title.trim() === "") {
      setTitle((dot === -1 ? picked.name : picked.name.slice(0, dot)).slice(0, MAX_TITLE));
    }
  }

  function addTag(raw: string) {
    const value = raw.trim().toLowerCase().replace(/,+$/, "");
    if (value === "") return;
    if (value.length > MAX_TAG_LENGTH) {
      setErrors((e) => ({
        ...e,
        tags: `Tags are at most ${MAX_TAG_LENGTH} characters.`,
      }));
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setErrors((e) => ({ ...e, tags: `At most ${MAX_TAGS} tags.` }));
      return;
    }
    if (tags.includes(value)) {
      setTagDraft("");
      return;
    }
    setTags((current) => [...current, value]);
    setTagDraft("");
    setErrors((e) => ({ ...e, tags: "" }));
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagDraft);
    }
  }

  function validate(): Record<string, string> {
    const found: Record<string, string> = {};

    if (courseId === "") found.course = "Choose a course.";
    if (level !== "course" && unitId === "") found.unit = "Choose a unit.";
    if (level === "topic" && topicId === "") found.topic = "Choose a topic.";

    if (title.trim() === "") found.title = "A title is required.";

    if (meta.needsFile && file === null) {
      found.file = "Pick a file for this material type.";
    }
    if (meta.needsUrl) {
      if (url.trim() === "") found.url = "A URL is required.";
      else if (!isValidHttpUrl(url.trim())) {
        found.url = "Enter a full http:// or https:// URL.";
      }
    }
    if (type === "pyq") {
      if (pyqYear === "") found.pyqYear = "Choose the year.";
      if (examType === "") found.examType = "Choose the exam type.";
    }

    return found;
  }

  function upload() {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Clock read in an event handler, never during render.
    const stamp = Date.now();
    const chosenUnit = level === "course" ? null : unitId;
    const chosenTopic = level === "topic" ? topicId : null;

    const material: Material = {
      id: `local-${stamp}`,
      title: title.trim(),
      description: description.trim(),
      type,
      courseId,
      unitId: chosenUnit,
      topicId: chosenTopic,
      file: meta.needsFile ? file : null,
      url: meta.needsUrl ? url.trim() : null,
      pyq:
        type === "pyq" && pyqYear !== "" && examType !== ""
          ? { year: Number(pyqYear), examType }
          : null,
      tags,
      visibility: publish ? "published" : "hidden",
      uploadedBy,
      uploadedAt: new Date(stamp).toISOString(),
      views: 0,
      downloads: 0,
    };

    const where = pathLabel({
      courseCode: course?.code ?? courseId,
      unitNumber: chosenUnit ? (unit?.number ?? null) : null,
      unitTitle: unit?.title ?? null,
      topicName: chosenTopic
        ? (topics.find((t) => t.id === chosenTopic)?.name ?? null)
        : null,
    });

    onUploaded(material, `Uploaded to ${where}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={requestClose}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-heading"
        className="relative ml-auto flex h-full w-full flex-col border-border bg-surface shadow-lg dark:bg-slate-950 sm:max-w-xl sm:border-l"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border p-5">
          <h2 id="upload-heading" className="text-base font-bold text-ink">
            Upload material
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close upload panel"
            className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
          {/* 1. Type */}
          <div>
            <span className="mb-1.5 block text-xs font-bold text-ink">
              Material type *
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TYPE_ORDER.map((value, index) => {
                const Icon = TYPE_ICON[value];
                const active = type === value;
                return (
                  <button
                    key={value}
                    id={index === 0 ? "upload-first-type" : undefined}
                    type="button"
                    aria-pressed={active}
                    onClick={() => changeType(value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-[10px] font-bold transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      active
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border text-ink-muted hover:bg-surface-raised hover:text-ink",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {MATERIAL_TYPE_META[value].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Placement */}
          <div className="space-y-3 rounded-lg border border-border p-3">
            <div>
              <label
                htmlFor="upload-course"
                className="mb-1 block text-xs font-bold text-ink"
              >
                Course *
              </label>
              <Select
                id="upload-course"
                className="text-xs"
                value={courseId}
                onChange={(e) => changeCourse(e.target.value)}
              >
                {courses.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.code} — {option.name}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.course} />
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-bold text-ink">
                Attach to
              </span>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    { value: "course" as const, label: "Whole course" },
                    { value: "unit" as const, label: "Unit" },
                    { value: "topic" as const, label: "Topic" },
                  ]
                ).map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-ink"
                  >
                    <input
                      type="radio"
                      name="upload-level"
                      className="h-3.5 w-3.5 accent-violet-600"
                      checked={level === option.value}
                      onChange={() => setLevel(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {COURSE_LEVEL_HINT.includes(type) && level !== "course" && (
                <p className="mt-1.5 text-[11px] text-ink-muted">
                  {meta.label} is usually added to the whole course.
                </p>
              )}
            </div>

            {level !== "course" && (
              <div>
                <label
                  htmlFor="upload-unit"
                  className="mb-1 block text-xs font-bold text-ink"
                >
                  Unit *
                </label>
                <Select
                  id="upload-unit"
                  className="text-xs"
                  value={unitId}
                  onChange={(e) => changeUnit(e.target.value)}
                >
                  <option value="">Select a unit…</option>
                  {units.map((option) => (
                    <option key={option.id} value={option.id}>
                      Unit {option.number} — {option.title}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.unit} />
              </div>
            )}

            {level === "topic" && (
              <div>
                <label
                  htmlFor="upload-topic"
                  className="mb-1 block text-xs font-bold text-ink"
                >
                  Topic *
                </label>
                <Select
                  id="upload-topic"
                  className="text-xs"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={unitId === ""}
                >
                  <option value="">
                    {unitId === "" ? "Choose a unit first…" : "Select a topic…"}
                  </option>
                  {topics.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.topic} />
              </div>
            )}
          </div>

          {/* 3. Title and description */}
          <div>
            <label
              htmlFor="upload-title"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Title *
            </label>
            <Input
              id="upload-title"
              maxLength={MAX_TITLE}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="mt-1 text-right font-mono text-[11px] tabular text-ink-muted">
              {title.length} / {MAX_TITLE}
            </p>
            <FieldError message={errors.title} />
          </div>

          <div>
            <label
              htmlFor="upload-description"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Description
            </label>
            <Textarea
              id="upload-description"
              rows={3}
              maxLength={MAX_DESCRIPTION}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="mt-1 text-right font-mono text-[11px] tabular text-ink-muted">
              {description.length} / {MAX_DESCRIPTION}
            </p>
          </div>

          {/* 4. Payload */}
          {meta.needsFile && (
            <div>
              <label
                htmlFor="upload-file"
                className="mb-1 block text-xs font-bold text-ink"
              >
                File *
              </label>
              <input
                id="upload-file"
                type="file"
                accept={meta.acceptedExtensions.join(",")}
                onChange={handleFile}
                className="block w-full text-xs text-ink-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface-raised file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink hover:file:bg-border/40"
              />
              <p className="mt-1 text-[11px] text-ink-muted">
                Demo: files are not uploaded. Allowed:{" "}
                {meta.acceptedExtensions.join(", ")} · up to {meta.maxSizeMb} MB.
              </p>
              {fileError && (
                <p className="mt-1 text-xs font-semibold text-danger">
                  {fileError}
                </p>
              )}
              {file && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
                  <span className="min-w-0 flex-1 truncate text-xs text-ink">
                    {file.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tabular text-ink-muted">
                    {formatBytes(file.sizeBytes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label={`Remove ${file.name}`}
                    className="shrink-0 rounded p-0.5 text-ink-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <FieldError message={errors.file} />
            </div>
          )}

          {meta.needsUrl && (
            <div>
              <label
                htmlFor="upload-url"
                className="mb-1 block text-xs font-bold text-ink"
              >
                URL *
              </label>
              <Input
                id="upload-url"
                className="text-xs"
                placeholder="https://"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {type === "video" &&
                url.trim() !== "" &&
                isValidHttpUrl(url.trim()) &&
                videoProvider(url.trim()) === "youtube" && (
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <Badge tone="success" className="px-1.5 py-0 text-[9px]">
                      YouTube link detected
                    </Badge>
                  </p>
                )}
              <FieldError message={errors.url} />
            </div>
          )}

          {type === "pyq" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="upload-year"
                  className="mb-1 block text-xs font-bold text-ink"
                >
                  Year *
                </label>
                <Select
                  id="upload-year"
                  className="text-xs"
                  value={pyqYear === "" ? "" : String(pyqYear)}
                  onChange={(e) =>
                    setPyqYear(e.target.value === "" ? "" : Number(e.target.value))
                  }
                >
                  <option value="">Select…</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.pyqYear} />
              </div>
              <div>
                <label
                  htmlFor="upload-exam-type"
                  className="mb-1 block text-xs font-bold text-ink"
                >
                  Exam type *
                </label>
                <Select
                  id="upload-exam-type"
                  className="text-xs"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                >
                  <option value="">Select…</option>
                  {EXAM_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.examType} />
              </div>
            </div>
          )}

          {/* 5. Tags */}
          <div>
            <label
              htmlFor="upload-tags"
              className="mb-1 block text-xs font-bold text-ink"
            >
              Tags
            </label>
            <Input
              id="upload-tags"
              className="text-xs"
              placeholder="Type a tag and press Enter"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => addTag(tagDraft)}
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              Up to {MAX_TAGS} tags, {MAX_TAG_LENGTH} characters each. Enter or a
              comma adds one.
            </p>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded border border-border bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-ink"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setTags((current) => current.filter((t) => t !== tag))
                      }
                      aria-label={`Remove tag ${tag}`}
                      className="rounded text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <FieldError message={errors.tags} />
          </div>

          {/* 6. Visibility */}
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-ink">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-violet-600"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
            />
            Publish to students now
          </label>

          <p className="text-[11px] text-ink-muted">
            <Badge tone="neutral" className="mr-1.5 text-[10px]">
              Local
            </Badge>
            Saved in this browser only. Nothing is sent to students.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button type="button" size="sm" variant="outline" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={upload}>
            Upload
          </Button>
        </div>
      </aside>
    </div>
  );
}
