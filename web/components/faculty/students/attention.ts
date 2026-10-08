import {
  ATTENDANCE_MIN,
  INTERNAL_LOW,
  getAttentionReasons,
  type AttentionReason,
  type CohortStudentRow,
} from "@/lib/api/faculty-students-meta";

// Who needs attention, worked out once per render of the overview and shared by
// the stat card, the tab count, the tab itself and the roster. The rules live
// in lib/api/faculty-students-meta.ts; this only sorts and packages them.
// No clock is read here: today is an argument.

export interface AttentionEntry {
  row: CohortStudentRow;
  reasons: AttentionReason[];
}

export const ATTENTION_MIN_TEXT = `Checked against attendance (${ATTENDANCE_MIN}%), internal marks (${INTERNAL_LOW}), assignments and readiness.`;

// Students with at least one reason: most "high" reasons first, then most
// reasons in total, then by name.
export function buildAttentionEntries(
  students: CohortStudentRow[],
  todayISO: string,
): AttentionEntry[] {
  const highCount = (entry: AttentionEntry) =>
    entry.reasons.filter((r) => r.severity === "high").length;

  return students
    .map((row) => ({ row, reasons: getAttentionReasons(row, todayISO) }))
    .filter((entry) => entry.reasons.length > 0)
    .sort(
      (a, b) =>
        highCount(b) - highCount(a) ||
        b.reasons.length - a.reasons.length ||
        a.row.name.localeCompare(b.row.name, "en"),
    );
}
