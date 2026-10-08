"use client";

import { useId, useMemo, useState } from "react";
import { Select } from "@/components/ui/select";
import {
  computeDraftAnalysis,
  isDraftChanged,
  reconcileDraft,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
} from "@/lib/api/curriculum-insights-meta";
import { SubjectOverviewCard, type DraftSummary } from "./SubjectOverviewCard";
import { useCurriculumDrafts } from "./useCurriculumDrafts";

// Every subject as a card, with sort and semester controls. Saved drafts are
// read here (after mount) and handed to each card as a summary, so the cards
// themselves never touch storage.

type SortKey = "lowest" | "highest" | "name" | "outdated" | "semester";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "lowest", label: "Lowest score first" },
  { value: "highest", label: "Highest score first" },
  { value: "name", label: "Name A–Z" },
  { value: "outdated", label: "Most outdated hours" },
  { value: "semester", label: "Semester" },
];

const ALL = "all";

const isSortKey = (v: string): v is SortKey =>
  SORT_OPTIONS.some((o) => o.value === v);

function compare(a: InsightSubject, b: InsightSubject, key: SortKey): number {
  switch (key) {
    case "lowest":
      return a.alignmentScore - b.alignmentScore;
    case "highest":
      return b.alignmentScore - a.alignmentScore;
    case "name":
      return a.name.localeCompare(b.name, "en");
    case "outdated":
      return b.outdatedHours - a.outdatedHours;
    case "semester":
      return a.semester - b.semester;
  }
}

export function SubjectOverviewList({
  subjects,
  skills,
  postings,
  totalPostings,
}: {
  subjects: InsightSubject[];
  skills: Record<string, InsightSkill>;
  postings: InsightPosting[];
  totalPostings: number;
}) {
  const { drafts, loaded } = useCurriculumDrafts();
  const [sort, setSort] = useState<SortKey>("lowest");
  const [semester, setSemester] = useState<string>(ALL);
  const sortId = useId();
  const semesterId = useId();

  const semesters = useMemo(
    () => [...new Set(subjects.map((s) => s.semester))].sort((a, b) => a - b),
    [subjects],
  );

  // Ties fall back to the subject code, so the order never depends on input.
  const shown = useMemo(
    () =>
      subjects
        .filter((s) => semester === ALL || String(s.semester) === semester)
        .sort(
          (a, b) =>
            compare(a, b, sort) || a.code.localeCompare(b.code, "en"),
        ),
    [subjects, sort, semester],
  );

  // Only a draft that actually changes something earns a summary.
  const draftSummaries = useMemo(() => {
    const summaries: Record<string, DraftSummary> = {};
    if (!loaded) return summaries;
    for (const subject of subjects) {
      if (!Object.prototype.hasOwnProperty.call(drafts, subject.id)) continue;
      const draft = reconcileDraft(subject, drafts[subject.id]);
      if (!isDraftChanged(draft)) continue;
      const analysis = computeDraftAnalysis(subject, draft, postings, skills);
      summaries[subject.id] = {
        scoreBefore: analysis.scoreBefore,
        scoreAfter: analysis.scoreAfter,
      };
    }
    return summaries;
  }, [loaded, drafts, subjects, postings, skills]);

  return (
    <section className="mt-6" aria-labelledby={`${sortId}-heading`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3
            id={`${sortId}-heading`}
            className="text-sm font-bold tracking-tight text-ink"
          >
            Your subjects
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted tabular" aria-live="polite">
            Showing {shown.length} of {subjects.length} subjects
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
          <div>
            <label
              htmlFor={sortId}
              className="mb-1 block text-xs font-semibold text-ink-muted"
            >
              Sort
            </label>
            <Select
              id={sortId}
              value={sort}
              onChange={(e) => {
                if (isSortKey(e.target.value)) setSort(e.target.value);
              }}
              className="focus-visible:ring-2 focus-visible:ring-accent"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label
              htmlFor={semesterId}
              className="mb-1 block text-xs font-semibold text-ink-muted"
            >
              Semester
            </label>
            <Select
              id={semesterId}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value={ALL}>All semesters</option>
              {semesters.map((s) => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">
          No subjects match this semester.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {shown.map((subject) => (
            <SubjectOverviewCard
              key={subject.id}
              subject={subject}
              skills={skills}
              totalPostings={totalPostings}
              draft={draftSummaries[subject.id] ?? null}
            />
          ))}
        </div>
      )}
    </section>
  );
}
