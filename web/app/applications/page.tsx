import Link from "next/link";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { getAllOpportunities } from "@/lib/api/opportunities";
import { getCompanyById } from "@/data/companies";
import { computeSkillMatch } from "@/features/samir/data/current-student";
import { ApplicationsTracker, TrackerOpportunity } from "@/features/samir/components/applications-tracker";

export default async function ApplicationsPage() {
  const opportunities = await getAllOpportunities();

  // Match scores come from the same function the Opportunities pages use.
  const tracked: TrackerOpportunity[] = opportunities.map((o) => {
    const company = getCompanyById(o.companyId);
    return {
      id: o.id,
      title: o.title,
      companyName: company?.name ?? "Company",
      companyInitials: company?.initials ?? "--",
      location: o.location,
      type: o.type,
      matchScore: computeSkillMatch(o.requiredSkills).matchScore,
    };
  });

  return (
    <DashboardShell title="My Applications">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">My applications</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Track every role you&apos;ve applied to, from submission to offer.</p>
        </div>
        <Link href="/opportunities" className="text-xs font-medium text-accent hover:underline">
          Find more opportunities
        </Link>
      </div>
      <ApplicationsTracker opportunities={tracked} />
    </DashboardShell>
  );
}
