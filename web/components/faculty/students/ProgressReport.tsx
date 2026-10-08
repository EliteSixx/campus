"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type { SemesterAcademics } from "@/lib/api/academics";
import type { StudentDetail } from "@/lib/api/faculty-roster";
import {
  getAttentionReasons,
  pickNextSteps,
  type CohortStudentRow,
} from "@/lib/api/faculty-students-meta";
import { isHandedIn } from "./detail-utils";
import { TaughtInLine } from "./TaughtInLine";
import { useToday } from "./useToday";

// A printable progress report for one student. Plain, black-on-white when
// printed, readable in both themes on screen. Private notes are never part of
// it. Warnings and the "Prepared on" date need today, which is read after
// mount; until then they are left blank.

const tableWrap =
  "mt-2 overflow-x-auto rounded-lg border border-border print:overflow-visible";
const th =
  "border-b border-border bg-surface-raised/60 px-3 py-2 text-left text-xs font-bold text-ink print:bg-white";
const td = "border-b border-border px-3 py-2 text-xs text-ink";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="report-keep mt-6">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised/40 px-3 py-2 print:bg-white">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className="mt-0.5 text-base font-bold text-ink tabular">{value}</p>
    </div>
  );
}

export function ProgressReport({
  row,
  detail,
  transcript,
}: {
  row: CohortStudentRow;
  detail: StudentDetail;
  transcript: SemesterAcademics;
}) {
  const today = useToday();
  const reasons = today === null ? null : getAttentionReasons(row, today.iso);
  const steps = pickNextSteps(detail.skillPlan);
  // Oldest first reads more naturally in a printed list.
  const completed = [...transcript.semesters]
    .filter((s) => s.status === "Completed")
    .sort((a, b) => a.semester - b.semester);

  const identity = [
    row.rollNumber,
    row.yearLabel,
    row.currentSemester !== null ? `Semester ${row.currentSemester}` : null,
    row.careerGoal,
    detail.student.department,
  ].filter((part): part is string => part !== null);

  return (
    <Card className="student-report mt-6 p-6 print:mt-0 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none print:backdrop-blur-none">
      {/* Print only: black text, sections and rows that never split. */}
      <style>{`
        @media print {
          .student-report, .student-report * { color: black !important; }
          .student-report tr { break-inside: avoid; page-break-inside: avoid; }
          .student-report thead { display: table-header-group; }
          .student-report .report-keep { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <header className="report-keep border-b border-border pb-4">
        <h2 className="text-xl font-bold text-ink">Student progress report</h2>
        <p className="mt-1 text-base font-semibold text-ink">{row.name}</p>
        <p className="mt-1 text-xs text-ink-muted tabular">{identity.join(" · ")}</p>
        <p className="mt-1 min-h-[1rem] text-xs text-ink-muted">
          {today !== null && <>Prepared on {today.label}</>}
        </p>
      </header>

      <Section title="Academic summary">
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 print:grid-cols-3">
          <Fact label="CGPA" value={row.cgpa !== null ? `${row.cgpa} / 10` : "—"} />
          <Fact
            label="Overall attendance"
            value={`${transcript.overallAttendance}%`}
          />
          <Fact
            label="Semesters completed"
            value={String(transcript.completedSemesters)}
          />
        </div>
        <p className="mt-2 text-xs text-ink-muted tabular">
          {completed.length === 0
            ? "No completed semesters yet."
            : `SGPA by semester: ${completed
                .map((s) => `Sem ${s.semester}: ${s.sgpa ?? "—"}`)
                .join(" · ")}`}
        </p>
      </Section>

      <Section title="My subjects this semester">
        {row.subjects.length === 0 ? (
          <p className="mt-2 text-xs text-ink-muted">
            Not taking any of my subjects this semester.
          </p>
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={th}>Subject</th>
                  <th scope="col" className={th}>Internal marks</th>
                  <th scope="col" className={th}>Attendance</th>
                  <th scope="col" className={th}>Assignments submitted</th>
                </tr>
              </thead>
              <tbody>
                {row.subjects.map((subject) => {
                  const work = row.assignments.filter(
                    (a) => a.subjectId === subject.subjectId,
                  );
                  const handedIn = work.filter((a) => isHandedIn(a.submissionStatus));
                  return (
                    <tr key={subject.subjectId}>
                      <td className={td}>
                        {subject.code} · {subject.name}
                      </td>
                      <td className={`${td} tabular`}>{subject.internalMarks}/100</td>
                      <td className={`${td} tabular`}>{subject.attendance}%</td>
                      <td className={`${td} tabular`}>
                        {handedIn.length} of {work.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Warnings">
        {reasons === null ? (
          <p className="mt-2 min-h-[1rem] text-xs text-ink-muted" aria-busy="true" />
        ) : reasons.length === 0 ? (
          <p className="mt-2 text-xs text-ink">No warnings</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {reasons.map((reason, i) => (
              <li
                key={`${reason.kind}-${reason.subjectId ?? ""}-${reason.assignmentId ?? ""}-${i}`}
                className="text-xs text-ink"
              >
                {reason.severity === "high" ? "Urgent: " : ""}
                {reason.text}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Skills">
        <p className="mt-2 text-xs text-ink tabular">
          {row.skillSummary.learnt} learnt · {row.skillSummary.developing} developing ·{" "}
          {row.skillSummary.toLearn} to learn · {row.skillSummary.notAssessed} not
          assessed · skill readiness {row.skillReadiness}%
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          Based on the skills that postings for {row.careerGoal} ask for.
        </p>
        <h4 className="mt-3 text-xs font-bold text-ink">Next steps</h4>
        {steps.length === 0 ? (
          <p className="mt-1 text-xs text-ink-muted">
            No skill gaps to work on right now.
          </p>
        ) : (
          <ul className="mt-1 space-y-2">
            {steps.map((step) => (
              <li key={step.skillId} className="report-keep">
                <p className="text-xs text-ink tabular">
                  <span className="font-semibold">{step.name}</span> — {step.status}
                  {step.score !== null && `, ${step.score}%`} · {step.demandCount} of{" "}
                  {detail.totalPostings} postings
                </p>
                <TaughtInLine refs={step.taughtIn} linked={false} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Internships">
        {detail.internships.length === 0 ? (
          <p className="mt-2 text-xs text-ink-muted">No internships yet.</p>
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[420px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={th}>Company</th>
                  <th scope="col" className={th}>Role</th>
                  <th scope="col" className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.internships.map((i) => (
                  <tr key={i.id}>
                    <td className={td}>{i.company}</td>
                    <td className={td}>{i.role}</td>
                    <td className={td}>{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Pre-placement offers">
        {detail.offers.length === 0 ? (
          <p className="mt-2 text-xs text-ink-muted">No pre-placement offers yet.</p>
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[420px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={th}>Company</th>
                  <th scope="col" className={th}>Role</th>
                  <th scope="col" className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.offers.map((o) => (
                  <tr key={o.id}>
                    <td className={td}>{o.company}</td>
                    <td className={td}>{o.role}</td>
                    <td className={td}>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <section className="report-keep mt-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 print:grid-cols-2">
          {["Faculty advisor", "Head of department"].map((label) => (
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
