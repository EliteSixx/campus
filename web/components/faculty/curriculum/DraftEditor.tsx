"use client";

import { useId, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  isDraftChanged,
  removeAddedTopic,
  updateAddedTopic,
  type CurriculumDraft,
  type DraftAddedTopic,
  type DraftAnalysis,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
} from "@/lib/api/curriculum-insights-meta";
import {
  AddDraftTopicForm,
  nativeInputClass,
  SkillPicker,
  type AddPrefill,
} from "./AddDraftTopicForm";
import { DraftScorePanel } from "./DraftScorePanel";
import { DraftTopicRow } from "./DraftTopicRow";
import type { DraftStore } from "./useDraftStore";
import {
  counterClass,
  labelClass,
  MAX_DRAFT_NAME,
  MAX_REASON,
  plural,
  skillNameOf,
  TOPIC_STATUS_TONE,
} from "./utils";

// The syllabus revision draft: every original topic with keep / reduce /
// remove, the topics added so far, a form to add another, and the live score
// panel. Saved to localStorage on every change.

function EditorSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3" aria-busy="true">
      <p className="sr-only" role="status">
        Loading your draft…
      </p>
      <div className="space-y-3 lg:col-span-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-raised" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-surface-raised" aria-hidden="true" />
    </div>
  );
}

function AddedTopicItem({
  subject,
  topic,
  draft,
  row,
  skills,
  totalPostings,
  onSave,
}: {
  subject: InsightSubject;
  topic: DraftAddedTopic;
  draft: CurriculumDraft;
  row: DraftAnalysis["topics"][number] | undefined;
  skills: Record<string, InsightSkill>;
  totalPostings: number;
  onSave: (next: CurriculumDraft) => void;
}) {
  const uid = useId();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(topic.name);
  const [hours, setHours] = useState(String(topic.hours));
  const [skillIds, setSkillIds] = useState(topic.skillIds);
  const [reason, setReason] = useState(topic.reason);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setName(topic.name);
    setHours(String(topic.hours));
    setSkillIds(topic.skillIds);
    setReason(topic.reason);
    setError(null);
    setEditing(true);
  }

  function saveEdit() {
    const hoursValue = Number(hours);
    if (name.trim() === "") {
      setError("Enter a topic name.");
      return;
    }
    if (hours.trim() === "" || !Number.isInteger(hoursValue) || hoursValue < 1) {
      setError("Hours must be a whole number, at least 1.");
      return;
    }
    const next = updateAddedTopic(draft, topic.id, {
      name,
      hours: hoursValue,
      skillIds,
      reason: reason.slice(0, MAX_REASON),
    });
    // Invalid input leaves the draft as it was; keep the saved values.
    if (next === draft) {
      setError("That change could not be saved.");
      return;
    }
    onSave(next);
    setEditing(false);
  }

  function remove() {
    if (window.confirm(`Remove '${topic.name}' from the draft?`)) {
      onSave(removeAddedTopic(draft, topic.id));
    }
  }

  if (editing) {
    return (
      <li className="rounded-lg border border-accent/40 p-3.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7rem]">
          <div>
            <label htmlFor={`${uid}-name`} className={labelClass}>
              Topic name *
            </label>
            <input
              id={`${uid}-name`}
              className={nativeInputClass}
              value={name}
              maxLength={MAX_DRAFT_NAME}
              onChange={(e) => setName(e.target.value)}
            />
            <p className={counterClass}>
              {name.length} / {MAX_DRAFT_NAME}
            </p>
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
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3">
          <p className={labelClass}>Skills this topic teaches</p>
          <SkillPicker
            subject={subject}
            skills={skills}
            selected={skillIds}
            onChange={setSkillIds}
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
            onChange={(e) => setReason(e.target.value)}
          />
          <p className={counterClass}>
            {reason.length} / {MAX_REASON}
          </p>
        </div>
        {error && (
          <p role="alert" className="mt-1 text-xs font-semibold text-danger">
            {error}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={saveEdit}>
            Save
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-border p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone="accent">New</Badge>
          <span className="text-sm font-semibold text-ink">{topic.name}</span>
          <span className="text-xs text-ink-muted tabular">{topic.hours}h</span>
          {row && <Badge tone={TOPIC_STATUS_TONE[row.status]}>{row.status}</Badge>}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={startEdit}
            aria-label={`Edit ${topic.name}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={remove}
            aria-label={`Remove ${topic.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>

      {topic.skillIds.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills">
          {topic.skillIds.map((id) => (
            <li
              key={id}
              className="rounded border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-ink"
            >
              {skillNameOf(skills, id)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-ink-faint">No skills chosen</p>
      )}

      {row && (
        <p className="mt-2 text-xs text-ink-muted tabular">
          {row.demandCount > 0
            ? `asked for in ${row.demandCount} of ${totalPostings} postings`
            : "No posting asks for these skills"}
        </p>
      )}
      {topic.reason.trim() !== "" && (
        <p className="mt-1 text-xs text-ink-muted">
          <span className="font-semibold text-ink">Reason:</span> {topic.reason}
        </p>
      )}
    </li>
  );
}

export function DraftEditor({
  subject,
  skills,
  postings,
  totalPostings,
  store,
  analysis,
  prefill,
  onPrefillDone,
}: {
  subject: InsightSubject;
  skills: Record<string, InsightSkill>;
  postings: InsightPosting[];
  totalPostings: number;
  store: DraftStore;
  analysis: DraftAnalysis;
  prefill: AddPrefill | null;
  onPrefillDone: () => void;
}) {
  // Never show the editor over an empty draft while a saved one may exist.
  if (!store.loaded) return <EditorSkeleton />;

  const { draft, save } = store;
  const rowFor = new Map(analysis.topics.map((t) => [t.id, t]));

  return (
    <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revision draft for {subject.code}</CardTitle>
              <CardDescription>
                Keep, reduce or remove each topic. Changes are saved in this
                browser as you make them.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {subject.topics.map((topic) => (
                <DraftTopicRow
                  key={topic.key}
                  subject={subject}
                  topic={topic}
                  draft={draft}
                  newlyMissing={analysis.newlyMissing}
                  skills={skills}
                  onSave={save}
                />
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>New topics</CardTitle>
              <CardDescription>
                {draft.added.length === 0
                  ? "Nothing added yet."
                  : `${plural(draft.added.length, "topic")} added to the draft`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {draft.added.length > 0 && (
              <ul className="space-y-3">
                {draft.added.map((topic) => (
                  <AddedTopicItem
                    key={topic.id}
                    subject={subject}
                    topic={topic}
                    draft={draft}
                    row={rowFor.get(topic.id)}
                    skills={skills}
                    totalPostings={totalPostings}
                    onSave={save}
                  />
                ))}
              </ul>
            )}
            <AddDraftTopicForm
              subject={subject}
              skills={skills}
              postings={postings}
              draft={draft}
              currentScore={analysis.scoreAfter}
              prefill={prefill}
              onSave={save}
              onPrefillDone={onPrefillDone}
            />
          </CardContent>
        </Card>
      </div>

      <DraftScorePanel
        subject={subject}
        draft={draft}
        analysis={analysis}
        skills={skills}
        savedAt={store.savedAt}
        changed={isDraftChanged(draft)}
        onReset={store.reset}
      />
    </div>
  );
}
