import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SkillRadarChart } from "@/components/shared/skill-radar-chart";
import { EvidenceCard } from "@/components/shared/evidence-card";
import { getSkillRadar } from "@/lib/api/skills";
import { getStudentProfile } from "@/lib/api/students";
import { getSkillById } from "@/data/skills";

export default async function SkillProfilePage() {
  const radar = await getSkillRadar("s1");
  const student = await getStudentProfile("s1");

  return (
    <DashboardShell title="Skill Profile">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink">Your skill profile</h2>
        <p className="mt-0.5 text-sm text-ink-muted">A category-level view of your proficiency, backed by evidence.</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Skill categories</CardTitle>
            <CardDescription>Average proficiency across each category</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SkillRadarChart data={radar} />
        </CardContent>
      </Card>

      <div className="mt-6">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-ink">Evidence-based skill confidence</h3>
          <p className="text-xs text-ink-muted">Each score is backed by verifiable evidence, not self-reporting</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {student.evidence?.map((e) => {
            const skill = getSkillById(e.skillId);
            const score = student.skills.find((s) => s.skillId === e.skillId)?.score ?? 0;
            return (
              <EvidenceCard
                key={e.skillId}
                name={skill?.name ?? e.skillId}
                score={score}
                confidence={e.confidence}
                evidence={e.evidence}
              />
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
