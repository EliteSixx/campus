import { DashboardShell } from "@/components/shared/dashboard-shell";
import { getAllOpportunities } from "@/lib/api/opportunities";
import { computeSkillMatch } from "@/features/samir/data/current-student";
import { OpportunitiesClient } from "./opportunities-client";

export default async function OpportunitiesPage() {
  const opportunities = await getAllOpportunities();
  const withMatch = opportunities.map((o) => {
    const { matchScore, matchingSkills, missingSkills } = computeSkillMatch(o.requiredSkills);
    return {
      id: o.id,
      title: o.title,
      companyId: o.companyId,
      location: o.location,
      mode: o.mode,
      type: o.type,
      requiredSkills: o.requiredSkills,
      deadline: o.deadline,
      matchScore,
      matchingSkills,
      missingSkills,
    };
  });

  return (
    <DashboardShell title="Opportunities">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-ink">Internships & jobs matched to your profile</h2>
        <p className="mt-0.5 text-sm text-ink-muted">Ranked and filtered by skill fit, not just keywords.</p>
      </div>
      <OpportunitiesClient opportunities={withMatch} />
    </DashboardShell>
  );
}
