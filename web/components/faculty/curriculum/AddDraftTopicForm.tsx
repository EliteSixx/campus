"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  addTopic,
  computeDraftAnalysis,
  type CurriculumDraft,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
} from "@/lib/api/curriculum-insights-meta";
import {
  counterClass,
  labelClass,
  MAX_DRAFT_NAME,
  MAX_REASON,
  skillNameOf,
  skillOf,
} from "./utils";

// Adds a new topic to the revision draft, with a live preview of the score it
// would give. Can be prefilled from "Add to revision draft" or ?addSkill=.

const DEFAULT_HOURS = "4";
const OTHER_SKILL_LIMIT = 12;

export interface AddPrefill {
  skillId: string;
}

export const nativeInputClass =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-ink placeholder:text-ink-faint shadow-sm focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

// ---------------------------------------------------------------------------
// Skill chips as checkboxes, in named groups. Shared with the added-topic
// editor in DraftEditor.tsx.

export function SkillPicker({
  subject,
  skills,
  selected,
  onChange,
  idPrefix,
}: {
  subject: InsightSubject;
  skills: Record<string, InsightSkill>;
  selected: string[];
  onChange: (next: string[]) => void;
  idPrefix: string;
}) {
  const groups = useMemo(() => {
    const missing = subject.missingSkillIds;
    const other = Object.values(skills)
      .filter((s) => s.demandCount > 0 && !subject.industrySkillIds.includes(s.id))
      .sort((a, b) => b.demandCount - a.demandCount || a.name.localeCompare(b.name, "en"))
      .slice(0, OTHER_SKILL_LIMIT)
      .map((s) => s.id);
    const shown = new Set([...missing, ...other]);
    // A selected skill in neither group (e.g. prefilled) is still shown.
    const extra = selected.filter((id) => !shown.has(id));
    return [
      { key: "missing", label: `Missing for ${subject.code}`, ids: missing },
      { key: "other", label: "Other in-demand skills", ids: other },
      { key: "extra", label: "Also selected", ids: extra },
    ].filter((g) => g.ids.length > 0);
  }, [subject, skills, selected]);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <fieldset key={group.key}>
          <legend className="mb-1.5 text-xs font-semibold text-ink-muted">
            {group.label}
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {group.ids.map((id) => {
              const checked = selected.includes(id);
              const inputId = `${idPrefix}-${group.key}-${id}`;
              return (
                <div key={id}>
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(id)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={inputId}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1",
                      checked
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-surface-raised text-ink-muted hover:border-border-strong hover:text-ink",
                    )}
                  >
                    {checked && <Check className="h-3 w-3" aria-hidden="true" />}
                    {skillNameOf(skills, id)}
                    <span className="tabular opacity-80">
                      · {skillOf(skills, id)?.demandCount ?? 0}
                      <span className="sr-only"> postings</span>
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

function introName(skills: Record<string, InsightSkill>, prefill: AddPrefill) {
  return `Introduction to ${skillNameOf(skills, prefill.skillId)}`.slice(0, MAX_DRAFT_NAME);
}

export function AddDraftTopicForm({
  subject,
  skills,
  postings,
  draft,
  currentScore,
  prefill,
  onSave,
  onPrefillDone,
}: {
  subject: InsightSubject;
  skills: Record<string, InsightSkill>;
  postings: InsightPosting[];
  draft: CurriculumDraft;
  // The draft's score as it stands (analysis.scoreAfter).
  currentScore: number;
  prefill: AddPrefill | null;
  onSave: (next: CurriculumDraft) => void;
  onPrefillDone: () => void;
}) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const appliedPrefill = useRef<AddPrefill | null>(null);

  // A prefill present at mount fills the first render too.
  const [name, setName] = useState(() => (prefill ? introName(skills, prefill) : ""));
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [skillIds, setSkillIds] = useState<string[]>(() =>
    prefill ? [prefill.skillId] : [],
  );
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Each new prefill is applied once: fields filled, form scrolled into view,
  // name focused.
  useEffect(() => {
    if (prefill === null || appliedPrefill.current === prefill) return;
    appliedPrefill.current = prefill;
    setName(introName(skills, prefill));
    setSkillIds([prefill.skillId]);
    setHours(DEFAULT_HOURS);
    setSuccess(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    nameRef.current?.focus({ preventScroll: true });
  }, [prefill, skills]);

  const trimmed = name.trim();
  const hoursValue = Number(hours);
  const nameError = trimmed === "" ? "Enter a topic name." : null;
  const hoursError =
    hours.trim() === "" || !Number.isInteger(hoursValue) || hoursValue < 1
      ? "Hours must be a whole number, at least 1."
      : null;

  // Preview with a stand-in name so the score shows before a name is typed.
  // Stamp 0 is fine here: the preview draft is never saved.
  const preview = useMemo(() => {
    if (hoursError !== null) return null;
    const wouldBe = addTopic(draft, 0, {
      name: trimmed || "New topic",
      hours: hoursValue,
      skillIds,
      reason: "",
    });
    if (wouldBe === draft) return null;
    return computeDraftAnalysis(subject, wouldBe, postings, skills).scoreAfter;
  }, [draft, trimmed, hoursValue, hoursError, skillIds, subject, postings, skills]);

  function clearSuccess() {
    if (success !== null) setSuccess(null);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (nameError !== null || hoursError !== null) return;

    const next = addTopic(draft, Date.now(), {
      name: trimmed,
      hours: hoursValue,
      skillIds,
      reason: reason.slice(0, MAX_REASON),
    });
    if (next === draft) return;

    onSave(next);
    setName("");
    setHours(DEFAULT_HOURS);
    setSkillIds([]);
    setReason("");
    setSubmitted(false);
    setSuccess(`Added '${trimmed}'`);
    onPrefillDone();
  }

  const nameErrorId = `${uid}-name-error`;
  const hoursErrorId = `${uid}-hours-error`;

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-labelledby={`${uid}-heading`}
      className="scroll-mt-4 rounded-lg border border-dashed border-border-strong p-4"
    >
      <h4 id={`${uid}-heading`} className="flex items-center gap-2 text-sm font-bold text-ink">
        <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
        Add a topic
      </h4>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7rem]">
        <div>
          <label htmlFor={`${uid}-name`} className={labelClass}>
            Topic name *
          </label>
          <input
            ref={nameRef}
            id={`${uid}-name`}
            className={nativeInputClass}
            value={name}
            maxLength={MAX_DRAFT_NAME}
            onChange={(e) => {
              setName(e.target.value);
              clearSuccess();
            }}
            aria-invalid={submitted && nameError !== null}
            aria-describedby={submitted && nameError ? nameErrorId : undefined}
          />
          <p className={counterClass}>
            {name.length} / {MAX_DRAFT_NAME}
          </p>
          {submitted && nameError && (
            <p id={nameErrorId} className="text-xs font-semibold text-danger">
              {nameError}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${uid}-hours`} className={labelClass}>
            Hours *
          </label>
          <input
            id={`${uid}-hours`}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className={cn(nativeInputClass, "tabular")}
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              clearSuccess();
            }}
            aria-invalid={submitted && hoursError !== null}
            aria-describedby={submitted && hoursError ? hoursErrorId : undefined}
          />
          {submitted && hoursError && (
            <p id={hoursErrorId} className="mt-1 text-xs font-semibold text-danger">
              {hoursError}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className={labelClass}>Skills this topic teaches</p>
        <SkillPicker
          subject={subject}
          skills={skills}
          selected={skillIds}
          onChange={(next) => {
            setSkillIds(next);
            clearSuccess();
          }}
          idPrefix={uid}
        />
      </div>

      <div className="mt-3">
        <label htmlFor={`${uid}-reason`} className={labelClass}>
          Reason (optional)
        </label>
        <Textarea
          id={`${uid}-reason`}
          rows={2}
          maxLength={MAX_REASON}
          value={reason}
          placeholder="Why add it? e.g. 4 postings ask for this"
          onChange={(e) => setReason(e.target.value)}
        />
        <p className={counterClass}>
          {reason.length} / {MAX_REASON}
        </p>
      </div>

      <p className="mt-2 text-xs text-ink-muted tabular" aria-live="polite">
        {preview === null
          ? "Enter valid hours to see the effect on the score."
          : `Adding this would change the score from ${currentScore}% to ${preview}%`}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add to draft
        </Button>
        <p role="status" className="text-xs font-semibold text-success">
          {success}
        </p>
      </div>
    </form>
  );
}
