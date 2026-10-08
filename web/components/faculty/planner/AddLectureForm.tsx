"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  LECTURE_TYPE_LABEL,
  type LectureType,
  type PlannerSubjectWorkspace,
  type SubjectPlan,
} from "@/lib/api/lecture-planner-meta";
import { MAX_SUBTOPIC, MAX_TITLE, labelClass } from "./utils";

// Side panel for adding a custom lecture — a revision class, a class test, a
// guest lecture — at a chosen place in the plan. The lecture itself is built
// by the caller, which is where the id stamp is taken.

export const AT_END = "__end";

export interface NewLectureFields {
  title: string;
  type: LectureType;
  unitId: string | null;
  topicKey: string | null;
  subtopic: string;
}

// Starting values for the form, e.g. a lecture for a missing industry skill.
export interface AddLecturePrefill {
  title: string;
  type: LectureType;
  subtopic?: string;
}

const LECTURE_TYPES = Object.keys(LECTURE_TYPE_LABEL) as LectureType[];

const TEMPLATES: { label: string; type: LectureType }[] = [
  { label: "Revision class", type: "revision" },
  { label: "Class test", type: "class-test" },
  { label: "Guest lecture", type: "guest" },
  { label: "Doubt clearing", type: "tutorial" },
];

export function AddLectureForm({
  subject,
  plan,
  numbers,
  insertAfterId,
  prefill,
  onClose,
  onAdd,
}: {
  subject: PlannerSubjectWorkspace;
  plan: SubjectPlan;
  numbers: Record<string, number>;
  insertAfterId: string | null;
  prefill?: AddLecturePrefill;
  onClose: () => void;
  // position is AT_END or the id of the lecture to insert after.
  onAdd: (fields: NewLectureFields, position: string) => void;
}) {
  const initialTitle = prefill?.title ?? "";
  const initialSubtopic = prefill?.subtopic ?? "";
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState<LectureType>(prefill?.type ?? "revision");
  const [unitId, setUnitId] = useState("");
  const [topicKey, setTopicKey] = useState("");
  const [subtopic, setSubtopic] = useState(initialSubtopic);
  const [position, setPosition] = useState(
    insertAfterId !== null && plan.lectures.some((l) => l.id === insertAfterId)
      ? insertAfterId
      : AT_END,
  );
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  const topics = unitId === "" ? subject.topics : subject.topics.filter((t) => t.unitId === unitId);
  const trimmed = title.trim();
  const error =
    trimmed === ""
      ? "Enter a title."
      : trimmed.length > MAX_TITLE
        ? `Keep the title under ${MAX_TITLE} characters.`
        : null;
  // Only what the user typed counts; an untouched prefill closes without asking.
  const hasContent =
    (title.trim() !== "" && title !== initialTitle) ||
    (subtopic.trim() !== "" && subtopic !== initialSubtopic);

  function requestClose() {
    if (hasContent && !window.confirm("Discard this lecture?")) return;
    onClose();
  }

  // Changing the unit clears a topic that is not in it.
  function changeUnit(next: string) {
    setUnitId(next);
    const topic = subject.topics.find((t) => t.key === topicKey);
    if (topic && next !== "" && topic.unitId !== next) setTopicKey("");
  }

  // Picking a topic fills in its unit when none is chosen.
  function changeTopic(next: string) {
    setTopicKey(next);
    const topic = subject.topics.find((t) => t.key === next);
    if (topic && unitId === "" && topic.unitId !== null) setUnitId(topic.unitId);
  }

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    setTitle(template.label);
    setType(template.type);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (error !== null) return;
    onAdd(
      {
        title: trimmed,
        type,
        unitId: unitId === "" ? null : unitId,
        topicKey: topicKey === "" ? null : topicKey,
        subtopic: subtopic.trim().slice(0, MAX_SUBTOPIC),
      },
      position,
    );
  }

  useEffect(() => {
    panelRef.current?.querySelector<HTMLInputElement>("#add-lecture-title")?.focus();
  }, []);

  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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
        aria-labelledby="add-lecture-heading"
        className="relative ml-auto flex h-full w-full flex-col border-border bg-surface shadow-lg dark:bg-slate-950 sm:max-w-lg sm:border-l"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border p-5">
          <h2 id="add-lecture-heading" className="text-base font-bold text-ink">
            Add lecture to {subject.code}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close add lecture panel"
            className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin">
            {/* Templates */}
            <div>
              <span className={labelClass}>Quick templates</span>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <Button
                    key={t.label}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => applyTemplate(t)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="add-lecture-title" className={labelClass}>
                Title *
              </label>
              <Input
                id="add-lecture-title"
                value={title}
                maxLength={MAX_TITLE}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={submitted && error !== null}
                aria-describedby={submitted && error ? "add-lecture-error" : undefined}
              />
              {submitted && error && (
                <p id="add-lecture-error" className="mt-1 text-xs font-medium text-danger">
                  {error}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="add-lecture-type" className={labelClass}>
                Type
              </label>
              <Select
                id="add-lecture-type"
                value={type}
                onChange={(e) => setType(e.target.value as LectureType)}
              >
                {LECTURE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LECTURE_TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="add-lecture-unit" className={labelClass}>
                  Unit (optional)
                </label>
                <Select
                  id="add-lecture-unit"
                  value={unitId}
                  onChange={(e) => changeUnit(e.target.value)}
                >
                  <option value="">No unit</option>
                  {subject.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.number} · {u.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="add-lecture-topic" className={labelClass}>
                  Topic (optional)
                </label>
                <Select
                  id="add-lecture-topic"
                  value={topicKey}
                  onChange={(e) => changeTopic(e.target.value)}
                >
                  <option value="">No topic</option>
                  {topics.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="add-lecture-subtopic" className={labelClass}>
                Sub-topic (optional)
              </label>
              <Input
                id="add-lecture-subtopic"
                value={subtopic}
                maxLength={MAX_SUBTOPIC}
                onChange={(e) => setSubtopic(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="add-lecture-position" className={labelClass}>
                Position
              </label>
              <Select
                id="add-lecture-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value={AT_END}>At the end</option>
                {plan.lectures.map((l) => (
                  <option key={l.id} value={l.id}>
                    After {numbers[l.id] !== undefined ? `L${numbers[l.id]}` : "(cancelled)"} —{" "}
                    {l.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border p-5">
            <Button type="submit" size="sm">
              Add lecture
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={requestClose}>
              Cancel
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
