import { BarChart3, ClipboardList, Clock, UserX } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import {
  getAssignmentSubjects,
  getAssignmentsWithStats,
  getEvaluatedScorePercent,
} from "@/lib/api/assignments";
import { AssignmentList } from "./assignment-list";

export default async function FacultyAssignmentsPage() {
  const [assignments, subjects, score] = await Promise.all([
    getAssignmentsWithStats(),
    getAssignmentSubjects(),
    getEvaluatedScorePercent(),
  ]);

  const awaitingEvaluation = assignments.reduce(
    (sum, a) => sum + (a.submittedCount - a.evaluatedCount),
    0,
  );
  const notSubmitted = assignments.reduce(
    (sum, a) => sum + a.notSubmittedCount,
    0,
  );

  return (
    <DashboardShell title="Assignments">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Assignments" },
        ]}
      />

      <Card className="p-6">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold text-ink">Assignments</h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Every assignment you have set across your subjects, with how many
          students have submitted, how many were late, and how much is still
          waiting to be marked.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Assignments you create here are saved in this browser only. They are
          not sent to students, and they will not follow you to another device.
        </p>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Assignments"
          value={String(assignments.length)}
          icon={ClipboardList}
        />
        <MetricCard
          label="Awaiting evaluation"
          value={String(awaitingEvaluation)}
          icon={Clock}
          tone={awaitingEvaluation > 0 ? "warning" : "neutral"}
          trend="Submitted but not yet marked"
        />
        <MetricCard
          label="Not submitted"
          value={String(notSubmitted)}
          icon={UserX}
          tone={notSubmitted > 0 ? "danger" : "neutral"}
          trend="Across all assignments"
        />
        <MetricCard
          label="Average score"
          value={score.percent !== null ? `${score.percent}%` : "—"}
          icon={BarChart3}
          tone="accent"
          trend={`Of maximum marks, across ${score.count} evaluated submissions`}
        />
      </div>

      <AssignmentList assignments={assignments} subjects={subjects} />
    </DashboardShell>
  );
}
