import { notFound } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  Clock,
  Inbox,
  Paperclip,
  UserX,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getAssignmentDetail } from "@/lib/api/assignments";
import { OverdueBadge } from "../overdue-badge";
import { Evaluator } from "./evaluator";

const statusTone = {
  Published: "accent",
  Draft: "neutral",
  Closed: "success",
} as const;

// Parsed as a local date on purpose: `new Date("2026-09-15")` is UTC midnight,
// which lands on the previous day west of Greenwich.
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function FacultyAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAssignmentDetail(id);
  if (!detail) notFound();

  const { assignment, submissions } = detail;
  const rubricTotal = assignment.rubric.reduce((sum, c) => sum + c.maxMarks, 0);

  return (
    <DashboardShell title="Assignment">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Assignments", href: "/faculty/assignments" },
          { label: assignment.title },
        ]}
      />

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ClipboardList className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold text-ink">{assignment.title}</h2>
          <Badge tone="neutral">
            {assignment.subjectCode}
          </Badge>
          <Badge tone={statusTone[assignment.status]}>{assignment.status}</Badge>
          {/* Overdue depends on today, so it is decided in the browser. */}
          <OverdueBadge status={assignment.status} dueDate={assignment.dueDate} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span>{assignment.subjectName}</span>
          <span>
            Due{" "}
            <span className="text-ink">{formatDate(assignment.dueDate)}</span>
          </span>
          <span>
            <span className="tabular text-ink">
              {assignment.maxMarks}
            </span>{" "}
            marks
          </span>
          {assignment.submissionFormat && (
            <span>{assignment.submissionFormat}</span>
          )}
        </div>

        {assignment.description && (
          <p className="mt-3 max-w-3xl text-sm text-ink-muted">
            {assignment.description}
          </p>
        )}

        {assignment.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {assignment.attachments.map((name) => (
              <Badge key={name} tone="neutral" className="text-[11px]">
                <Paperclip className="h-3 w-3" />
                {name}
              </Badge>
            ))}
          </div>
        )}

        {assignment.rubric.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <h3 className="text-sm font-bold tracking-tight text-ink">Rubric</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-muted">
              {assignment.rubric.map((criterion) => (
                <li key={criterion.label}>
                  {criterion.label} —{" "}
                  <span className="tabular text-ink">
                    {criterion.maxMarks}
                  </span>{" "}
                  marks
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-muted">
              Total{" "}
              <span className="tabular text-ink">{rubricTotal}</span>{" "}
              of{" "}
              <span className="tabular text-ink">
                {assignment.maxMarks}
              </span>{" "}
              marks
            </p>
          </div>
        )}
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Submitted"
          value={`${assignment.submittedCount} of ${assignment.totalStudents}`}
          icon={Inbox}
          tone="accent"
        />
        <MetricCard
          label="Late"
          value={String(assignment.lateCount)}
          icon={Clock}
          tone={assignment.lateCount > 0 ? "warning" : "neutral"}
        />
        <MetricCard
          label="Not submitted"
          value={String(assignment.notSubmittedCount)}
          icon={UserX}
          tone={assignment.notSubmittedCount > 0 ? "danger" : "neutral"}
        />
        <MetricCard
          label="Average marks"
          value={
            assignment.averageMarks !== null
              ? `${assignment.averageMarks} / ${assignment.maxMarks}`
              : "—"
          }
          icon={BarChart3}
        />
      </div>

      <Evaluator assignment={assignment} submissions={submissions} />
    </DashboardShell>
  );
}
