import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  postingsForSkill,
  programsForSkill,
  STRUGGLING_BELOW,
  type CurriculumDraft,
  type DraftAnalysis,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
  type ProgramMatch,
  type SubjectStudentImpact,
} from "@/lib/api/curriculum-insights-meta";
import { formatSavedAt, joinNames, plural, skillNameOf } from "./utils";

// The syllabus revision proposal as a document: the same markup on screen and
// on paper. Plain props, no hooks. Every figure comes from computeDraftAnalysis
// and the workspace; the only date is the draft's own updatedAt, formatted by
// formatSavedAt, so no clock is ever read.

const EVIDENCE_POSTINGS = 3;
const PREP_PROGRAMS = 3;

const CHANGE_LABEL = { keep: "Keep", reduce: "Reduced", remove: "Removed" } as const;

// Table cells, and a wrapper that scrolls on a phone but not on paper.
const th = "border-b border-border px-2.5 py-2 text-left text-xs font-bold text-ink-muted";
const td = "border-b border-border px-2.5 py-2 align-top text-xs text-ink";
const tableWrap = "overflow-x-auto rounded-lg border border-border print:overflow-visible";

function Section({
  title,
  keepTogether = false,
  children,
}: {
  title: string;
  // For short sections only; a long table must be allowed to break.
  keepTogether?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={cn("mt-6", keepTogether && "proposal-keep")}>
      <h3 className="mb-2 text-sm font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised/60 p-3 print:bg-white">
      <p className="text-xs font-bold text-ink-muted">{label}</p>
      <p className="mt-1 text-lg font-extrabold tracking-tight text-ink tabular">{value}</p>
      {sub && <p className="text-xs text-ink-muted tabular">{sub}</p>}
    </div>
  );
}

// "+22", "−5" or "±0".
function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "±0";
}

// "A, B, and C" — the summary sentence keeps the serial comma.
function listClauses(parts: string[]): string {
  if (parts.length <= 2) return parts.join(" and ");
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

export function summarySentence(
  draft: CurriculumDraft,
  analysis: DraftAnalysis,
  skills: Record<string, InsightSkill>,
): string {
  const removed = draft.changes.filter((c) => c.action === "remove").length;
  const reduced = draft.changes.filter((c) => c.action === "reduce").length;
  const names = (ids: string[]) => joinNames(ids.map((id) => skillNameOf(skills, id)));

  const parts = [
    `removes ${plural(removed, "topic")}`,
    `reduces ${reduced}`,
    `adds ${plural(draft.added.length, "new topic")}`,
  ];
  if (analysis.newlyCovered.length > 0) {
    parts.push(`starts teaching ${names(analysis.newlyCovered)}`);
  }
  if (analysis.newlyMissing.length > 0) {
    parts.push(`stops teaching ${names(analysis.newlyMissing)}`);
  }
  return `This proposal ${listClauses(parts)}.`;
}

export function ProposalDocument({
  subject,
  faculty,
  totalPostings,
  trackedStudents,
  postings,
  skills,
  programs,
  studentImpact,
  draft,
  analysis,
}: {
  subject: InsightSubject;
  faculty: { name: string; department: string };
  totalPostings: number;
  trackedStudents: number;
  postings: InsightPosting[];
  skills: Record<string, InsightSkill>;
  programs: ProgramMatch[];
  studentImpact: SubjectStudentImpact | null;
  draft: CurriculumDraft;
  analysis: DraftAnalysis;
}) {
  const savedText = draft.updatedAt ? formatSavedAt(draft.updatedAt) : null;
  const name = (id: string) => skillNameOf(skills, id);

  // Existing topics that changed, or that carry a reason.
  const topicById = new Map(subject.topics.map((t) => [t.id, t]));
  const changedRows = draft.changes.flatMap((change) => {
    const topic = topicById.get(change.topicId);
    if (!topic || (change.action === "keep" && change.reason.trim() === "")) return [];
    return [{ change, topic }];
  });

  const analysisRow = new Map(analysis.topics.map((t) => [t.id, t]));
  const addedRows = draft.added.map((added) => ({ added, row: analysisRow.get(added.id) }));

  const impactFor = new Map((studentImpact?.skills ?? []).map((s) => [s.skillId, s]));

  const warnings: string[] = [];
  if (analysis.newlyMissing.length > 0) {
    warnings.push(
      `After this change, the syllabus no longer teaches ${joinNames(analysis.newlyMissing.map(name))}.`,
    );
  }
  if (analysis.hoursAfter > analysis.hoursBefore) {
    warnings.push(
      `The revised syllabus needs ${plural(analysis.hoursAfter - analysis.hoursBefore, "more hour", "more hours")} than today.`,
    );
  }

  // Programs covering the newly taught skills, in skill order, each once.
  const prepPrograms = [
    ...new Map(
      analysis.newlyCovered
        .flatMap((id) => programsForSkill(id, programs))
        .map((program) => [program.id, program]),
    ).values(),
  ].slice(0, PREP_PROGRAMS);

  return (
    <Card className="proposal-doc mt-6 p-6 print:mt-0 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none print:backdrop-blur-none">
      {/* Print only: black text, rows that never split, headers on every page. */}
      <style>{`
        @media print {
          .proposal-doc, .proposal-doc * { color: black !important; }
          .proposal-doc tr { break-inside: avoid; page-break-inside: avoid; }
          .proposal-doc thead { display: table-header-group; }
          .proposal-doc .proposal-keep { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      {/* 1. Header */}
      <header className="proposal-keep border-b border-border pb-4">
        <h2 className="text-xl font-bold text-ink">Syllabus Revision Proposal</h2>
        <p className="mt-1 text-base font-semibold text-ink">
          {subject.code} — {subject.name}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          Semester {subject.semester} · {subject.credits} credits · {subject.enrolled} students
          enrolled
        </p>
        <p className="text-xs text-ink-muted">
          Proposed by {faculty.name}, {faculty.department} Department
        </p>
        <p className="text-xs text-ink-muted tabular">
          Draft last saved: {savedText ?? "Not saved yet"}
        </p>
      </header>

      {/* 2. Summary */}
      <Section title="Summary" keepTogether>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 print:grid-cols-3">
          <StatBox
            label="Industry alignment"
            value={`${analysis.scoreBefore}% → ${analysis.scoreAfter}%`}
            sub={`${signed(analysis.delta)} points`}
          />
          <StatBox
            label="Teaching hours"
            value={`${analysis.hoursBefore}h → ${analysis.hoursAfter}h`}
          />
          <StatBox
            label="Hours on outdated topics"
            value={`${analysis.outdatedHoursBefore}h → ${analysis.outdatedHoursAfter}h`}
          />
        </div>
        <p className="mt-3 text-sm text-ink">{summarySentence(draft, analysis, skills)}</p>
      </Section>

      {/* 3. Changes to existing topics */}
      <Section title="Changes to existing topics">
        {changedRows.length === 0 ? (
          <p className="text-sm text-ink-muted">No existing topics changed.</p>
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[36rem] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={th}>Topic</th>
                  <th scope="col" className={th}>Status</th>
                  <th scope="col" className={th}>Hours (before → after)</th>
                  <th scope="col" className={th}>Change</th>
                  <th scope="col" className={th}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {changedRows.map(({ change, topic }) => (
                  <tr key={topic.key}>
                    <th
                      scope="row"
                      className={cn(td, "font-semibold", change.action === "remove" && "line-through")}
                    >
                      {topic.name}
                    </th>
                    <td className={td}>{topic.status}</td>
                    <td className={cn(td, "tabular")}>
                      {topic.hours}h → {change.hours}h
                    </td>
                    <td className={td}>{CHANGE_LABEL[change.action]}</td>
                    <td className={td}>{change.reason.trim() || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 4. New topics */}
      <Section title="New topics">
        {addedRows.length === 0 ? (
          <p className="text-sm text-ink-muted">No new topics added.</p>
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[36rem] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={th}>Topic</th>
                  <th scope="col" className={th}>Hours</th>
                  <th scope="col" className={th}>Skills taught</th>
                  <th scope="col" className={th}>Postings asking</th>
                  <th scope="col" className={th}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {addedRows.map(({ added, row }) => (
                  <tr key={added.id}>
                    <th scope="row" className={cn(td, "font-semibold")}>
                      {added.name}
                    </th>
                    <td className={cn(td, "tabular")}>{added.hours}h</td>
                    <td className={td}>
                      {added.skillIds.length > 0 ? added.skillIds.map(name).join(", ") : "—"}
                    </td>
                    <td className={cn(td, "tabular")}>
                      {row ? `${row.demandCount} of ${totalPostings}` : "—"}
                    </td>
                    <td className={td}>{added.reason.trim() || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 5. Evidence from industry */}
      {analysis.newlyCovered.length > 0 && (
        <Section title="Evidence from industry">
          <ul className="space-y-3">
            {analysis.newlyCovered.map((skillId) => {
              const asking = postingsForSkill(skillId, postings);
              return (
                <li key={skillId} className="proposal-keep">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{name(skillId)}</span>{" "}
                    <span className="text-ink-muted tabular">
                      — {asking.length} of {totalPostings} postings
                    </span>
                  </p>
                  {asking.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-ink-muted">
                      {asking.slice(0, EVIDENCE_POSTINGS).map((p) => (
                        <li key={p.id}>
                          {p.title}, {p.company} ({p.type})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* 6. Evidence from students */}
      {studentImpact !== null && analysis.newlyCovered.length > 0 && (
        <Section title="Evidence from students" keepTogether>
          <p className="mb-1.5 text-xs text-ink-muted tabular">
            From {trackedStudents} students tracked on The Plug.
          </p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink">
            {analysis.newlyCovered.map((skillId) => {
              const row = impactFor.get(skillId);
              return (
                <li key={skillId} className="tabular">
                  {row && row.averageScore !== null
                    ? `Students average ${row.averageScore} in ${name(skillId)} (${row.strugglingCount} of ${studentImpact.cohortSize} below ${STRUGGLING_BELOW})`
                    : `No student data for ${name(skillId)} yet.`}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* 7. Warnings */}
      {warnings.length > 0 && (
        <Section title="Warnings" keepTogether>
          <ul className="list-disc space-y-0.5 pl-5 text-sm font-medium text-danger">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* 8. Faculty preparation */}
      {prepPrograms.length > 0 && (
        <Section title="Faculty preparation" keepTogether>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink">
            {prepPrograms.map((p) => (
              <li key={p.id} className="tabular">
                {p.title} · {p.provider} · {p.type} · {plural(p.durationWeeks, "week")}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 9. Approval */}
      <Section title="Approval" keepTogether>
        <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3 print:grid-cols-3">
          {["Proposed by (Faculty)", "Reviewed by (HOD)", "Date"].map((label) => (
            <div key={label}>
              <div className="h-10 border-b border-ink-muted" aria-hidden="true" />
              <p className="mt-1 text-xs text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[11px] text-ink-muted tabular">
          Scores are calculated from {totalPostings} live postings on The Plug.
        </p>
      </Section>
    </Card>
  );
}
