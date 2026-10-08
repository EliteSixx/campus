import type { AssignmentStatus } from "@/data/assignments";

// Whether an assignment is overdue: still open for submissions and past its due
// date. Pure and client-safe (only a type is imported), so it runs in the
// browser once today's date is known.
//
// Dates are "YYYY-MM-DD" and compare correctly as strings, which avoids the
// UTC-midnight shift that `new Date("2026-09-15")` introduces.
export function isAssignmentOverdue(
  status: AssignmentStatus,
  dueDate: string,
  todayISO: string,
): boolean {
  return status === "Published" && dueDate < todayISO;
}
