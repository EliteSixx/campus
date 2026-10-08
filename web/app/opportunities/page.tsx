import { DashboardShell } from "@/components/shared/dashboard-shell";
import { getAllOpportunities } from "@/lib/api/opportunities";
import { getStudentProfile } from "@/lib/api/students";
import { OpportunitiesClient } from "./opportunities-client";

export default async function OpportunitiesPage() {
  const opportunities = await getAllOpportunities();
  const student = await getStudentProfile("s1");
  const studentSkillIds = new Set(student.skills.filter((s) => s.score >= 50).map((s) => s.skillId));

  const withMatch = opportunities.map((o) => {
    const matchingSkills = o.requiredSkills.filter((id) => studentSkillIds.has(id));
    const missingSkills = o.requiredSkills.filter((id) => !studentSkillIds.has(id));
    const matchScore = Math.round((matchingSkills.length / o.requiredSkills.length) * 100);
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
