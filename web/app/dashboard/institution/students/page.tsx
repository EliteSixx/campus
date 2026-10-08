"use client";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { StudentDirectory } from "@/components/institution/student-directory";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { institutionStudents } from "@/data/institution/mock-students";

export default function StudentsPage() {
  const students = institutionStudents;

  // Summary stats
  const placed = students.filter(s => s.placementStatus === "placed").length;
  const interning = students.filter(s => s.placementStatus === "interning").length;
  const seeking = students.filter(s => s.placementStatus === "seeking").length;
  const notAssessed = students.filter(s => s.placementStatus === "not-assessed").length;
  const avgReadiness = Math.round(students.reduce((a, s) => a + s.skillReadiness, 0) / students.length);

  return (
    <DashboardShell title="Student Directory">
      <InstitutionBreadcrumb />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-ink">Placement Cell Student Directory</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          All {students.length} students across departments — search by name or registration ID, filter, sort, and export.
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
          <p className="font-mono text-lg font-bold text-ink tabular">{students.length}</p>
          <p className="text-[10px] text-ink-muted">Total</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
          <p className="font-mono text-lg font-bold text-emerald-500 tabular">{placed}</p>
          <p className="text-[10px] text-ink-muted">Placed</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
          <p className="font-mono text-lg font-bold text-sky-500 tabular">{interning}</p>
          <p className="text-[10px] text-ink-muted">Interning</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
          <p className="font-mono text-lg font-bold text-amber-500 tabular">{seeking}</p>
          <p className="text-[10px] text-ink-muted">Seeking</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
          <p className="font-mono text-lg font-bold text-ink-faint tabular">{notAssessed}</p>
          <p className="text-[10px] text-ink-muted">Not Assessed</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
          <p className="font-mono text-lg font-bold text-accent tabular">{avgReadiness}</p>
          <p className="text-[10px] text-ink-muted">Avg Readiness</p>
        </div>
      </div>

      {/* Student Directory */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              Search by registration ID or name · Filter by placement status, year · Export to CSV
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <StudentDirectory
            students={students}
            showDeptColumn={true}
            pageSize={20}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
