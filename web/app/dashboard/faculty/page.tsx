import { DashboardShell } from "@/components/shared/dashboard-shell";
import { AtRiskStudents } from "@/components/faculty/students/AtRiskStudents";

export default function MentorDashboardPage() {
  return (
    <DashboardShell title="Mentor Dashboard">
      <AtRiskStudents />
    </DashboardShell>
  );
}
