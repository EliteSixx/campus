import { DashboardShell } from "@/components/shared/dashboard-shell";
import { AddJobsWorkspace } from "../add-jobs-workspace";

export default function IndustryPostJobPage() {
  return (
    <DashboardShell title="Add Jobs">
      <AddJobsWorkspace />
    </DashboardShell>
  );
}
