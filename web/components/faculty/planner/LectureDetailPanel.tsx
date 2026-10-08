"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  formatPlanDate,
  isValidISODate,
  LECTURE_STATUS_LABEL,
  LECTURE_TYPE_LABEL,
  TEACHING_METHOD_LABEL,
  type LecturePatch,
  type LectureStatus,
  type LectureType,
  type PlannedLecture,
  type PlannerMaterialRef,
  type PlannerSubjectWorkspace,
  type TeachingMethod,
} from "@/lib/api/lecture-planner-meta";
import { MATERIAL_TYPE_META } from "@/lib/api/faculty-materials-meta";
import {
  MAX_SUBTOPIC,
  MAX_TEXT,
  MAX_TITLE,
  deliveredDateFor,
  labelClass,
  nativeDateClass,
  unitLabel,
} from "./utils";

// Side panel for one lecture. Edits a local draft; nothing reaches the plan
// until "Save changes", and closing with unsaved edits asks first. Same shell
// as the course-materials panels: overlay, Escape to close, focus on open,
// full width on a phone.

interface Draft {
  title: string;
  subtopic: string;
  type: LectureType;
  method: TeachingMethod | "";
  status: LectureStatus;
  actualDate: string;
  learningOutcome: string;
  homework: string;
  notes: string;
  materialIds: string[];
}

const LECTURE_TYPES = Object.keys(LECTURE_TYPE_LABEL) as LectureType[];
const METHODS = Object.keys(TEACHING_METHOD_LABEL) as TeachingMethod[];
const STATUSES = Object.keys(LECTURE_STATUS_LABEL) as LectureStatus[];

function draftOf(lecture: PlannedLecture): Draft {
  return {
    title: lecture.title,
    subtopic: lecture.subtopic,
    type: lecture.type,
    method: lecture.method ?? "",
    status: lecture.status,
    actualDate: lecture.actualDate ?? "",
    learningOutcome: lecture.learningOutcome,
    homework: lecture.homework,
    notes: lecture.notes,
    materialIds: [...lecture.materialIds].sort(),
  };
}

const sameDraft = (a: Draft, b: Draft) => JSON.stringify(a) === JSON.stringify(b);

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span
      className={`text-[11px] tabular ${value.length > max ? "text-danger" : "text-ink-faint"}`}
    >
      {value.length}/{max}
    </span>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <Counter value={value} max={MAX_TEXT} />
      </div>
      <Textarea
        id={id}
        rows={3}
        value={value}
        maxLength={MAX_TEXT}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MaterialCheckbox({
  material,
  checked,
  onToggle,
}: {
  material: PlannerMaterialRef;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-surface-raised/60">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
      />
      <span className="min-w-0 flex-1 text-sm text-ink">{material.title}</span>
      <Badge tone="neutral" className="shrink-0 text-[10px]">
        {MATERIAL_TYPE_META[material.type].label}
      </Badge>
      {material.visibility === "hidden" && (
        <Badge tone="warning" className="shrink-0 text-[10px]">
          Hidden
        </Badge>
      )}
    </label>
  );
}

export function LectureDetailPanel({
  lecture,
  number,
  date,
  subject,
  todayISO,
  onClose,
  onSave,
  onDelete,
}: {
  lecture: PlannedLecture;
  number: number | null;
  date: string | null;
  subject: PlannerSubjectWorkspace;
  todayISO: string | null;
  onClose: () => void;
  onSave: (
    lectureId: string,
    patch: LecturePatch,
    status: LectureStatus,
    actualDate: string | null,
  ) => void;
  onDelete: (lecture: PlannedLecture) => void;
}) {
  const initial = useMemo(() => draftOf(lecture), [lecture]);
  const [draft, setDraft] = useState<Draft>(initial);
  const panelRef = useRef<HTMLElement>(null);

  const dirty = !sameDraft(draft, initial);
  const topic = subject.topics.find((t) => t.key === lecture.topicKey) ?? null;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // Materials: this topic's, or every topic's grouped by name when the lecture
  // is not tied to a topic.
  const groups = useMemo(() => {
    if (lecture.topicKey !== null) {
      return [
        {
          name: null,
          materials: subject.materials.filter((m) => m.topicKey === lecture.topicKey),
        },
      ];
    }
    return subject.topics
      .map((t) => ({
        name: t.name,
        materials: subject.materials.filter((m) => m.topicKey === t.key),
      }))
      .filter((g) => g.materials.length > 0);
  }, [lecture.topicKey, subject]);

  const knownMaterialIds = useMemo(
    () => new Set(subject.materials.map((m) => m.id)),
    [subject.materials],
  );

  function toggleMaterial(id: string) {
    set(
      "materialIds",
      draft.materialIds.includes(id)
        ? draft.materialIds.filter((m) => m !== id)
        : [...draft.materialIds, id].sort(),
    );
  }

  function changeStatus(status: LectureStatus) {
    setDraft((d) => ({
      ...d,
      status,
      actualDate:
        status === "delivered" && d.actualDate === ""
          ? (deliveredDateFor(date, todayISO) ?? "")
          : d.actualDate,
    }));
  }

  // --- Validation
  const errors: string[] = [];
  const title = draft.title.trim();
  if (title === "") errors.push("Enter a title.");
  if (title.length > MAX_TITLE) errors.push(`Keep the title under ${MAX_TITLE} characters.`);
  if (draft.subtopic.trim().length > MAX_SUBTOPIC) {
    errors.push(`Keep the sub-topic under ${MAX_SUBTOPIC} characters.`);
  }
  for (const [label, value] of [
    ["Learning outcome", draft.learningOutcome],
    ["Homework", draft.homework],
    ["Notes", draft.notes],
  ] as const) {
    if (value.length > MAX_TEXT) errors.push(`${label} is over ${MAX_TEXT} characters.`);
  }
  if (draft.status === "delivered") {
    if (!isValidISODate(draft.actualDate)) {
      errors.push("Enter the date the lecture was taken.");
    } else if (todayISO !== null && draft.actualDate > todayISO) {
      errors.push("The date taken cannot be in the future.");
    }
  }

  function requestClose() {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    onClose();
  }

  function save() {
    if (errors.length > 0) return;
    onSave(
      lecture.id,
      {
        title,
        subtopic: draft.subtopic.trim(),
        type: draft.type,
        method: draft.method === "" ? null : draft.method,
        learningOutcome: draft.learningOutcome,
        homework: draft.homework,
        notes: draft.notes,
        // Ids no longer in the subject's materials are dropped.
        materialIds: draft.materialIds.filter((id) => knownMaterialIds.has(id)),
      },
      draft.status,
      draft.status === "delivered" ? draft.actualDate : null,
    );
  }

  useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>("#lecture-panel-close")?.focus();
  }, []);

  // Escape follows the same unsaved-changes rule as the close button.
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const heading = `${number !== null ? `L${number}` : "Cancelled"} · ${
    date !== null ? formatPlanDate(date) : "No date"
  }`;

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
        aria-labelledby="lecture-panel-heading"
        className="relative ml-auto flex h-full w-full flex-col border-border bg-surface shadow-lg dark:bg-slate-950 sm:max-w-lg sm:border-l"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <h2 id="lecture-panel-heading" className="text-base font-bold text-ink tabular">
              {heading}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {lecture.unitId !== null && `${unitLabel(subject.units, lecture.unitId)} — `}
              {topic ? topic.name : lecture.title}
            </p>
            {topic && topic.skillNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {topic.skillNames.map((skill) => (
                  <Badge key={skill} tone="cyan" className="text-[10px]">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <button
            id="lecture-panel-close"
            type="button"
            onClick={requestClose}
            aria-label="Close lecture details"
            className="shrink-0 rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="lecture-title" className={labelClass}>
                Title *
              </label>
              <Counter value={draft.title} max={MAX_TITLE} />
            </div>
            <Input
              id="lecture-title"
              value={draft.title}
              maxLength={MAX_TITLE}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="lecture-subtopic" className={labelClass}>
                Sub-topic
              </label>
              <Counter value={draft.subtopic} max={MAX_SUBTOPIC} />
            </div>
            <Input
              id="lecture-subtopic"
              value={draft.subtopic}
              maxLength={MAX_SUBTOPIC}
              placeholder="e.g. Second normal form with examples"
              onChange={(e) => set("subtopic", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="lecture-type" className={labelClass}>
                Type
              </label>
              <Select
                id="lecture-type"
                value={draft.type}
                onChange={(e) => set("type", e.target.value as LectureType)}
              >
                {LECTURE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LECTURE_TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="lecture-method" className={labelClass}>
                Teaching method
              </label>
              <Select
                id="lecture-method"
                value={draft.method}
                onChange={(e) => set("method", e.target.value as TeachingMethod | "")}
              >
                <option value="">Not set</option>
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {TEACHING_METHOD_LABEL[m]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="lecture-status" className={labelClass}>
                Status
              </label>
              <Select
                id="lecture-status"
                value={draft.status}
                onChange={(e) => changeStatus(e.target.value as LectureStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LECTURE_STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {draft.status === "delivered" && (
            <div className="sm:w-1/2">
              <label htmlFor="lecture-date-taken" className={labelClass}>
                Date taken
              </label>
              <input
                id="lecture-date-taken"
                type="date"
                value={draft.actualDate}
                max={todayISO ?? undefined}
                onChange={(e) => set("actualDate", e.target.value)}
                className={nativeDateClass}
              />
            </div>
          )}

          <TextField
            id="lecture-outcome"
            label="Learning outcome"
            value={draft.learningOutcome}
            onChange={(v) => set("learningOutcome", v)}
          />
          <TextField
            id="lecture-homework"
            label="Homework"
            value={draft.homework}
            onChange={(v) => set("homework", v)}
          />
          <TextField
            id="lecture-notes"
            label="Notes"
            value={draft.notes}
            onChange={(v) => set("notes", v)}
          />

          {/* Linked materials */}
          <fieldset>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <legend className={labelClass}>Linked materials</legend>
              <Link
                href={`/faculty/materials/${subject.id}`}
                className="inline-flex items-center gap-1 rounded text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Open in Course Materials
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            {groups.every((g) => g.materials.length === 0) ? (
              <p className="mt-1 text-xs text-ink-muted">
                No materials for this topic yet.
              </p>
            ) : (
              <div className="mt-1 space-y-2">
                {groups.map((g) => (
                  <div key={g.name ?? "topic"}>
                    {g.name && (
                      <p className="px-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                        {g.name}
                      </p>
                    )}
                    {g.materials.map((m) => (
                      <MaterialCheckbox
                        key={m.id}
                        material={m}
                        checked={draft.materialIds.includes(m.id)}
                        onToggle={() => toggleMaterial(m.id)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-ink-faint">
              Only the course&apos;s saved materials are listed, not uploads made in
              this browser.
            </p>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-5">
          {dirty && errors.length > 0 && (
            <ul role="alert" className="mb-3 space-y-0.5 text-xs font-medium text-danger">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={save} disabled={!dirty || errors.length > 0}>
              Save changes
            </Button>
            <Button size="sm" variant="secondary" onClick={requestClose}>
              Cancel
            </Button>
            {lecture.isCustom && (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-danger hover:text-danger"
                onClick={() => onDelete(lecture)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
