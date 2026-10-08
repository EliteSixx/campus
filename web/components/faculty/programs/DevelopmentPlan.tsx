"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { joinNames } from "@/components/faculty/curriculum/utils";
import { useToday } from "@/components/faculty/students/useToday";
import {
  distinctGaps,
  timingText,
  type ProgramRow,
} from "@/lib/api/faculty-programs-meta";
import { STATUS_LABEL } from "./utils";
import { useSavedPrograms } from "./useSavedPrograms";

// The printable faculty development plan: the programmes shortlisted or applied
// for in this browser, what they close, and space to sign. Plain black on white
// when printed, readable in both themes on screen, like the student progress
// report. Saved choices and "Prepared on" are read after mount; until then the
// table is a skeleton and the date is blank.

const tableWrap =
  "mt-2 overflow-x-auto rounded-lg border border-border print:overflow-visible";
const th =
  "border-b border-border bg-surface-raised/60 px-3 py-2 text-left text-xs font-bold text-ink print:bg-white";
const td = "border-b border-border px-3 py-2 align-top text-xs text-ink";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="plan-keep mt-6">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function gapText(row: ProgramRow): string {
  if (row.gaps.length === 0) return "—";
  return row.gaps
    .map((g) =>
      g.subjects.length > 0
        ? `${g.name} (${g.subjects.map((s) => s.code).join(", ")})`
        : g.name,
    )
    .join("; ");
}

export function DevelopmentPlan({
  rows,
  faculty,
}: {
  // In impact order.
  rows: ProgramRow[];
  faculty: { name: string; department: string };
}) {
  const today = useToday();
  const { saved } = useSavedPrograms();

  const chosen =
    saved === null
      ? null
      : [
          ...rows.filter((r) => saved[r.id]?.status === "shortlisted"),
          ...rows.filter((r) => saved[r.id]?.status === "applied"),
        ];
  const gaps = chosen === null ? [] : distinctGaps(chosen);

  return (
    <Card className="dev-plan mt-6 p-6 print:mt-0 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none print:backdrop-blur-none">
      {/* Print only: black text, sections and rows that never split. */}
      <style>{`
        @media print {
          .dev-plan, .dev-plan * { color: black !important; }
          .dev-plan tr { break-inside: avoid; page-break-inside: avoid; }
          .dev-plan thead { display: table-header-group; }
          .dev-plan .plan-keep { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <header className="plan-keep border-b border-border pb-4">
        <h2 className="text-xl font-bold text-ink">Faculty development plan</h2>
        <p className="mt-1 text-base font-semibold text-ink">{faculty.name}</p>
        <p className="mt-1 text-xs text-ink-muted">
          Department of {faculty.department}
        </p>
        <p className="mt-1 min-h-[1rem] text-xs text-ink-muted">
          {today !== null && <>Prepared on {today.label}</>}
        </p>
      </header>

      <Section title="Chosen programmes">
        {chosen === null ? (
          <div
            className="mt-2 h-32 animate-pulse rounded-lg bg-surface-raised print:hidden"
            aria-hidden="true"
          />
        ) : chosen.length === 0 ? (
          <p className="mt-2 text-xs text-ink-muted">
            No programmes chosen yet. Shortlist or mark programmes as applied on
            the Development &amp; Research page, then come back to print this plan.
          </p>
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={th}>Programme</th>
                  <th scope="col" className={th}>Provider</th>
                  <th scope="col" className={th}>Type</th>
                  <th scope="col" className={th}>Weeks</th>
                  <th scope="col" className={th}>Starts / deadline</th>
                  <th scope="col" className={th}>Cost</th>
                  <th scope="col" className={th}>Gaps it closes</th>
                  <th scope="col" className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {chosen.map((row) => {
                  const status = saved?.[row.id]?.status;
                  return (
                    <tr key={row.id}>
                      <td className={`${td} font-semibold`}>{row.title}</td>
                      <td className={td}>{row.provider}</td>
                      <td className={td}>{row.type}</td>
                      <td className={`${td} tabular`}>{row.durationWeeks}</td>
                      <td className={`${td} tabular`}>{timingText(row)}</td>
                      <td className={td}>{row.costText}</td>
                      <td className={td}>{gapText(row)}</td>
                      <td className={td}>{status ? STATUS_LABEL[status] : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {chosen !== null && chosen.length > 0 && (
        <Section title="What the department gains">
          <p className="mt-2 text-xs text-ink tabular">
            {gaps.length === 0
              ? "None of these programmes closes a gap in the current syllabus."
              : `Together these close ${gaps.length} distinct syllabus ${
                  gaps.length === 1 ? "gap" : "gaps"
                }: ${joinNames(gaps.map((g) => g.name))}.`}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Start times are as listed by each provider when this plan was
            prepared.
          </p>
        </Section>
      )}

      <section className="plan-keep mt-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 print:grid-cols-2">
          {["Faculty", "Head of department"].map((label) => (
            <div key={label}>
              <div className="h-10 border-b border-ink-muted" aria-hidden="true" />
              <p className="mt-1 text-xs text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </Card>
  );
}
