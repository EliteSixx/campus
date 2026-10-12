import { DashboardShell } from "@/components/shared/dashboard-shell";
import { CareerIntelligenceDashboard } from "@/features/samir";

export const metadata = {
  title: "Career Intelligence & Company Skill Benchmark — CampusLink",
  description:
    "Explore major technology companies (Google, Microsoft, Amazon, Meta, NVIDIA, etc.), evaluate skill gaps, view roadmaps, and compare hiring requirements.",
};

export default function CareerIntelligencePage() {
  return (
    <DashboardShell title="Career Intelligence">
      <CareerIntelligenceDashboard />
    </DashboardShell>
  );
}
