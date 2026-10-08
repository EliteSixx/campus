import { DashboardShell } from "@/components/shared/dashboard-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { SkillProgress } from "@/components/shared/skill-progress";
import { SkillGapCard } from "@/components/shared/skill-gap-card";
import { OpportunityCard } from "@/components/shared/opportunity-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Gauge, Radar, IdCard, ClipboardList, CheckCircle2 } from "lucide-react";
import { getStudentProfile, getRecommendedOpportunities, getSkillTimeline } from "@/lib/api/students";
import { getTopSkillGaps } from "@/lib/api/skills";
import { getSkillById } from "@/data/skills";

export default async function StudentDashboardPage() {
  const student = await getStudentProfile("s1");
  const gaps = await getTopSkillGaps("s1");
  const opportunities = await getRecommendedOpportunities("s1");
  const timeline = await getSkillTimeline();

  const featuredSkills = ["python", "react", "networking", "linux", "postgresql", "cloud-computing"];

  return (
    <DashboardShell title="Student Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink">Good afternoon, {student.name.split(" ")[0]}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Here&apos;s where your profile stands against your goal of becoming a {student.careerGoal}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Employability Score" value={`${student.employabilityScore}%`} icon={Gauge} trend="+4 pts this month" />
        <MetricCard label="Skill Readiness" value={`${student.skillReadiness}%`} icon={Radar} trend="Near ready for target role" tone="warning" />
        <MetricCard label="Profile Strength" value={`${student.profileStrength}%`} icon={IdCard} trend="Strong evidence coverage" tone="success" />
        <MetricCard label="Applications" value={`${student.applications}`} icon={ClipboardList} trend="2 pending review" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div>
              <CardTitle>Your skill profile</CardTitle>
              <CardDescription>Proficiency across your most active skills</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredSkills.map((id) => {
              const s = student.skills.find((sk) => sk.skillId === id);
              const skill = getSkillById(id);
              if (!s || !skill) return null;
              return <SkillProgress key={id} name={skill.name} score={s.score} />;
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Top skill gaps</CardTitle>
              <CardDescription>Closing these moves you toward {student.careerGoal}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {gaps.map((g) => (
              <SkillGapCard key={g.skillId} name={g.name} current={g.current} target={g.target} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Recommended opportunities</h3>
          <a href="/opportunities" className="text-xs font-medium text-accent hover:underline">
            View all
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {opportunities.map((o) => (
            <OpportunityCard
              key={o.id}
              id={o.id}
              title={o.title}
              companyId={o.companyId}
              location={o.location}
              mode={o.mode}
              type={o.type}
              deadline={o.deadline}
              matchScore={o.matchScore}
              matchingSkills={o.matchingSkills}
              missingSkills={o.missingSkills}
            />
          ))}
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Skill development timeline</CardTitle>
            <CardDescription>Your current stage in the closed-loop program</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0 sm:flex-row sm:items-center">
            {timeline.stages.map((stage, i) => {
              const done = i < timeline.currentIndex;
              const current = i === timeline.currentIndex;
              return (
                <div key={stage} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center text-center sm:flex-1">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                        done
                          ? "border-success bg-success-soft text-success"
                          : current
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border bg-surface-raised text-ink-faint"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <p className={`mt-2 max-w-[110px] text-xs ${current ? "font-medium text-ink" : "text-ink-muted"}`}>
                      {stage}
                    </p>
                  </div>
                  {i < timeline.stages.length - 1 && (
                    <div className={`hidden h-px flex-1 sm:block ${done ? "bg-success" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
