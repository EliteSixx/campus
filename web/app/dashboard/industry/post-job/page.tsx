import { DashboardShell } from "@/components/shared/dashboard-shell";
import { IndustryPostJobClient } from "@/components/shared/industry-post-job";

export default function IndustryPostJobPage() {
  return (
    <DashboardShell title="Industry Post Job">
      <IndustryPostJobClient />
    </DashboardShell>
  );
}
