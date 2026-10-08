import { Fragment } from "react";
import {
  formatPlanDate,
  LECTURE_STATUS_LABEL,
  LECTURE_TYPE_LABEL,
  type PlannedLecture,
  type PlannerCalendar,
  type PlannerSubjectWorkspace,
  type PlanProgress,
  type SubjectPlan,
} from "@/lib/api/lecture-planner-meta";
import { WEEKDAY_SHORT, lectureLabel, unitHeadingRows, unitLabel } from "./utils";

// The plan as a printed document: never shown on screen (hidden print:block),
// laid out as a plain black-on-white table with signature lines.
//
// Dates come only from formatPlanDate, and no clock is read, so the printout is
// the same whichever browser produces it.

// Thin borders and small type for every table cell.
const cell = "border border-gray-400 px-1.5 py-1 text-left align-top";

export function PrintablePlan({
  plan,
  schedule,
  progress,
  subject,
  calendar,
  faculty,
  numbers,
}: {
  plan: SubjectPlan;
  schedule: Record<string, string | null>;
  progress: PlanProgress;
  subject: PlannerSubjectWorkspace;
  calendar: PlannerCalendar;
  faculty: { name: string; department: string };
  // The same numbering LectureList shows.
  numbers: Record<string, number>;
}) {
  const unitIds = new Set(subject.units.map((u) => u.id));
  const topicName = new Map(subject.topics.map((t) => [t.key, t.name]));
  // Same grouping rule as LectureList: an unknown unit reads as "Other".
  const groupOf = (lecture: PlannedLecture) =>
    lecture.unitId !== null && unitIds.has(lecture.unitId) ? lecture.unitId : null;
  // The same heading placement LectureList uses.
  const headings = unitHeadingRows(plan.lectures.map(groupOf));

  // Only the breaks that fall inside the plan's own dates.
  const holidays = calendar.holidays.filter(
    (h) => plan.startDate <= h.date && h.date <= plan.endDate,
  );
  const exams = calendar.examPeriods.filter(
    (p) => p.start <= plan.endDate && plan.startDate <= p.end,
  );
  const skipped = [
    ...exams.map((p) => `${formatPlanDate(p.start)} – ${formatPlanDate(p.end)} ${p.name}`),
    ...holidays.map((h) => `${formatPlanDate(h.date)} ${h.name}`),
  ];

  return (
    <div className="hidden bg-white text-[11px] leading-snug text-black print:block">
      {/* Rows never split across pages, and the header repeats on each. */}
      <style>{`
        @media print {
          .lecture-plan-print tr { break-inside: avoid; page-break-inside: avoid; }
          .lecture-plan-print thead { display: table-header-group; }
        }
      `}</style>

      {/* Header */}
      <header className="mb-3 border-b border-gray-400 pb-2">
        <h1 className="text-lg font-bold">Lecture Plan</h1>
        <p className="text-sm font-semibold">
          {subject.code} — {subject.name}
        </p>
        <p>
          {faculty.name} · {faculty.department} Department
        </p>
        <p>
          {calendar.semesterName} · Semester: {formatPlanDate(plan.startDate)} to{" "}
          {formatPlanDate(plan.endDate)}
        </p>
        <p>Lecture days: {plan.weekdays.map((d) => WEEKDAY_SHORT[d]).join(", ")}</p>
        <p className="mt-1 font-semibold">
          {progress.totalActive} lectures · {progress.delivered} delivered ·{" "}
          {progress.cancelled} cancelled ·{" "}
          {progress.overflowCount > 0
            ? `Does not fit — ${progress.overflowCount} ${
                progress.overflowCount === 1 ? "lecture" : "lectures"
              } beyond semester end`
            : progress.projectedFinish
              ? `Projected finish ${formatPlanDate(progress.projectedFinish)}`
              : "No lectures scheduled"}
        </p>
      </header>

      {/* Table */}
      <table className="lecture-plan-print w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className={`${cell} w-[5%]`}>No.</th>
            <th className={`${cell} w-[9%]`}>Planned date</th>
            <th className={`${cell} w-[10%]`}>Unit</th>
            <th className={`${cell} w-[22%]`}>Topic / Title</th>
            <th className={`${cell} w-[14%]`}>Sub-topic</th>
            <th className={`${cell} w-[8%]`}>Type</th>
            <th className={`${cell} w-[8%]`}>Status</th>
            <th className={`${cell} w-[9%]`}>Date taken</th>
            <th className={`${cell} w-[15%]`}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {plan.lectures.map((lecture, i) => {
            const { group, showHeading } = headings[i] ?? {
              group: groupOf(lecture),
              showHeading: i === 0,
            };
            const cancelled = lecture.status === "cancelled";
            const date = schedule[lecture.id] ?? null;
            const topic = lecture.topicKey ? topicName.get(lecture.topicKey) : undefined;
            // The Unit column shows the lecture's own unit, not the group it sits
            // under, so a no-unit lecture still reads "—".
            const ownUnitId = groupOf(lecture);
            const unit = subject.units.find((u) => u.id === ownUnitId);
            return (
              <Fragment key={lecture.id}>
                {showHeading && (
                  <tr>
                    <td colSpan={9} className={`${cell} bg-gray-50 font-bold`}>
                      {unitLabel(subject.units, group)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className={cell}>{cancelled ? "—" : lectureLabel(numbers, lecture.id)}</td>
                  <td className={cell}>
                    {cancelled ? "—" : date ? formatPlanDate(date) : "Beyond semester"}
                  </td>
                  <td className={cell}>{unit ? `Unit ${unit.number}` : "—"}</td>
                  <td className={cell}>
                    {topic && topic !== lecture.title && (
                      <span className="block text-gray-600">{topic}</span>
                    )}
                    <span className={cancelled ? "line-through" : undefined}>
                      {lecture.title}
                    </span>
                  </td>
                  <td className={cell}>{lecture.subtopic}</td>
                  <td className={cell}>{LECTURE_TYPE_LABEL[lecture.type]}</td>
                  <td className={cell}>{LECTURE_STATUS_LABEL[lecture.status]}</td>
                  <td className={cell}>
                    {lecture.actualDate ? formatPlanDate(lecture.actualDate) : ""}
                  </td>
                  <td className={cell} />
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <footer className="mt-8 [break-inside:avoid]">
        <div className="grid grid-cols-2 gap-12">
          <p className="border-t border-black pt-1">Faculty signature</p>
          <p className="border-t border-black pt-1">HOD signature</p>
        </div>
        {skipped.length > 0 && (
          <p className="mt-4 text-[10px] text-gray-700">
            Holidays and exam weeks skipped: {skipped.join("; ")}
          </p>
        )}
      </footer>
    </div>
  );
}
