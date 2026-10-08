"use client";

import { useEffect, useId, useState } from "react";
import { CircleX, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  setTopicAction,
  setTopicReason,
  TOPIC_ACTIONS,
  type CurriculumDraft,
  type InsightSkill,
  type InsightSubject,
  type InsightTopic,
  type TopicAction,
} from "@/lib/api/curriculum-insights-meta";
import {
  counterClass,
  joinNames,
  labelClass,
  MAX_REASON,
  skillOf,
  TOPIC_STATUS_TONE,
} from "./utils";

// One original topic in the revision draft: keep it, cut its hours, or remove
// it, with a reason. Every change is saved straight away through onSave; the
// reason is saved when the field loses focus.

const ACTION_LABEL: Record<TopicAction, string> = {
  keep: "Keep",
  reduce: "Reduce",
  remove: "Remove",
};

const REASON_PLACEHOLDER: Record<TopicAction, string> = {
  keep: "Optional note",
  reduce: "Why fewer hours?",
  remove: "Why remove it? e.g. no posting asks for this",
};

export function DraftTopicRow({
  subject,
  topic,
  draft,
  newlyMissing,
  skills,
  onSave,
}: {
  subject: InsightSubject;
  topic: InsightTopic;
  draft: CurriculumDraft;
  // From computeDraftAnalysis: skills the draft as a whole stops teaching.
  newlyMissing: string[];
  skills: Record<string, InsightSkill>;
  onSave: (next: CurriculumDraft) => void;
}) {
  const uid = useId();
  const change = draft.changes.find((c) => c.topicId === topic.id);
  const action: TopicAction = change?.action ?? "keep";
  const savedHours = change?.hours ?? topic.hours;
  const savedReason = change?.reason ?? "";
  const maxReduced = topic.hours - 1;
  const canReduce = topic.hours > 1;

  // Text fields keep their own value while typing, and follow the draft when it
  // changes elsewhere (reset, another tab).
  const [hoursText, setHoursText] = useState(String(savedHours));
  const [reason, setReason] = useState(savedReason);
  useEffect(() => setHoursText(String(savedHours)), [savedHours]);
  useEffect(() => setReason(savedReason), [savedReason]);

  function chooseAction(next: TopicAction) {
    onSave(setTopicAction(subject, draft, topic.id, next));
  }

  function commitHours(text: string) {
    const value = Number(text);
    if (text.trim() === "" || !Number.isFinite(value)) {
      setHoursText(String(savedHours));
      return;
    }
    // Out-of-range values are clamped; nothing to save when that lands on the
    // hours already saved, so the field just shows them again.
    const next = setTopicAction(subject, draft, topic.id, "reduce", value);
    const nextHours = next.changes.find((c) => c.topicId === topic.id)?.hours;
    if (next === draft || (action === "reduce" && nextHours === savedHours)) {
      setHoursText(String(savedHours));
      return;
    }
    onSave(next);
  }

  function commitReason() {
    const trimmedToLimit = reason.slice(0, MAX_REASON);
    if (trimmedToLimit === savedReason) return;
    onSave(setTopicReason(draft, topic.id, trimmedToLimit));
  }

  const removed = action === "remove";
  const lostSkills = removed
    ? topic.skillIds.filter((id) => newlyMissing.includes(id))
    : [];
  const lostHasDemand = lostSkills.some(
    (id) => (skillOf(skills, id)?.demandCount ?? 0) > 0,
  );
  const lostNames = joinNames(lostSkills.map((id) => skillOf(skills, id)?.name ?? id));

  return (
    <li
      className={cn(
        "rounded-lg border p-3.5",
        removed ? "border-border bg-surface-raised/40" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            "text-sm font-semibold",
            removed ? "text-ink-muted line-through" : "text-ink",
          )}
        >
          {topic.name}
        </span>
        <span className="text-xs text-ink-muted tabular">{topic.hours}h</span>
        <Badge tone={TOPIC_STATUS_TONE[topic.status]}>{topic.status}</Badge>
        {removed && <span className="sr-only">(removed in draft)</span>}
      </div>

      {topic.skillNames.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills">
          {topic.skillIds.map((id, i) => (
            <li
              key={id}
              className="rounded border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-ink"
            >
              {topic.skillNames[i] ?? id}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <fieldset>
          <legend className="sr-only">What to do with {topic.name}</legend>
          <div className="inline-flex overflow-hidden rounded-lg border border-border">
            {TOPIC_ACTIONS.map((option) => {
              const disabled = option === "reduce" && !canReduce;
              return (
                <label
                  key={option}
                  title={disabled ? "Only 1 hour — keep or remove" : undefined}
                  className={cn(
                    "relative border-r border-border last:border-r-0",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  )}
                >
                  <input
                    type="radio"
                    name={`${uid}-action`}
                    value={option}
                    checked={action === option}
                    disabled={disabled}
                    onChange={() => chooseAction(option)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "block px-3 py-1.5 text-xs font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-accent",
                      action === option
                        ? option === "remove"
                          ? "bg-danger text-white"
                          : "bg-accent text-white"
                        : "bg-surface text-ink-muted hover:bg-surface-raised hover:text-ink",
                    )}
                  >
                    {ACTION_LABEL[option]}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {action === "reduce" && (
          <div>
            <label htmlFor={`${uid}-hours`} className="sr-only">
              Hours for {topic.name} (1 to {maxReduced})
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id={`${uid}-hours`}
                type="number"
                inputMode="numeric"
                min={1}
                max={maxReduced}
                step={1}
                value={hoursText}
                onChange={(e) => {
                  setHoursText(e.target.value);
                  const value = Number(e.target.value);
                  // Steppers and complete numbers in range save at once.
                  if (Number.isInteger(value) && value >= 1 && value <= maxReduced) {
                    onSave(setTopicAction(subject, draft, topic.id, "reduce", value));
                  }
                }}
                onBlur={(e) => commitHours(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitHours(e.currentTarget.value);
                }}
                className="h-8 w-20 rounded-md border border-border bg-surface px-2 text-sm font-medium text-ink tabular shadow-sm focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              <span className="text-xs text-ink-muted tabular">
                of {topic.hours}h
              </span>
            </div>
          </div>
        )}
      </div>

      {removed && lostSkills.length > 0 && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-danger">
          <CircleX className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Removing this stops teaching {lostNames}.
            {lostHasDemand && " Score drops."}
          </span>
        </p>
      )}
      {removed && topic.foundational && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-warning">
          <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>This is a foundational topic.</span>
        </p>
      )}

      <div className="mt-3">
        <label htmlFor={`${uid}-reason`} className={labelClass}>
          Reason{action === "keep" ? " (optional)" : ""}
        </label>
        <Textarea
          id={`${uid}-reason`}
          rows={2}
          maxLength={MAX_REASON}
          value={reason}
          placeholder={REASON_PLACEHOLDER[action]}
          onChange={(e) => setReason(e.target.value)}
          onBlur={commitReason}
        />
        <p className={counterClass}>
          {reason.length} / {MAX_REASON}
        </p>
      </div>
    </li>
  );
}
