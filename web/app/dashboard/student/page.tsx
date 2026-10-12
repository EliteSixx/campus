import Link from "next/link";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { SkillProgress } from "@/components/shared/skill-progress";
import { SkillGapCard } from "@/components/shared/skill-gap-card";
import { OpportunityCard } from "@/components/shared/opportunity-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gauge, Radar, IdCard, CheckCircle2, Sparkles, Mic, ArrowRight } from "lucide-react";
import { getSkillTimeline } from "@/lib/api/students";
import { getTopSkillGaps } from "@/lib/api/skills";
import { getAllOpportunities, getOpportunityStatus } from "@/lib/api/opportunities";
import { getCompanyById } from "@/data/companies";
import { getSkillById } from "@/data/skills";
import { computeSkillMatch, currentStudent, CURRENT_STUDENT_ID } from "@/features/samir/data/current-student";
import {
  StudentGreeting,
  ApplicationsMetric,
  NextActions,
  NextActionOpportunity,
} from "@/features/samir/components/student-dashboard-widgets";

const DAY_MS = 1000 * 60 * 60 * 24;

export default async function StudentDashboardPage() {
  const student = currentStudent;
  const gaps = await getTopSkillGaps(CURRENT_STUDENT_ID);
  const allOpportunities = await getAllOpportunities();
  const timeline = await getSkillTimeline();

  const now = Date.now();
  const scored = allOpportunities.map((o) => {
    const match = computeSkillMatch(o.requiredSkills);
    const end = new Date(o.deadline);
    end.setHours(23, 59, 59, 999);
    return {
      ...o,
      ...match,
      status: getOpportunityStatus(o.deadline),
      daysLeft: Math.floor((end.getTime() - now) / DAY_MS),
      companyName: getCompanyById(o.companyId)?.name ?? "Company",
    };
  });
  const open = scored.filter((o) => o.status !== "Closed");
  const recommended = [...open].sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);

  const nextActionOpportunities: NextActionOpportunity[] = open.map((o) => ({
    id: o.id,
    title: o.title,
    companyName: o.companyName,
    matchScore: o.matchScore,
    deadline: o.deadline,
    daysLeft: o.daysLeft,
  }));
  const opportunityTitles = Object.fromEntries(scored.map((o) => [o.id, `${o.title} at ${o.companyName}`]));

  const featuredSkills = ["python", "react", "networking", "linux", "postgresql", "cloud-computing"];

  return (
    <DashboardShell title="Dashboard">
      <StudentGreeting />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/profile" className="block">
          <MetricCard
            label="Employability Score"
            value={`${student.employabilityScore}%`}
            icon={Gauge}
            trend="Based on skills, academics and evidence"
          />
        </Link>
        <Link href="/profile/skills" className="block">
          <MetricCard
            label="Skill Readiness"
            value={`${student.skillReadiness}%`}
            icon={Radar}
            trend={`${student.readiness} for ${student.careerGoal}`}
            tone="warning"
          />
        </Link>
        <Link href="/profile" className="block">
          <MetricCard
            label="Profile Strength"
            value={`${student.profileStrength}%`}
            icon={IdCard}
            trend="See your profile checklist"
            tone="success"
          />
        </Link>
        <ApplicationsMetric />
      </div>

      {/* Dedicated AI Mock Interview Banner */}
      <Card className="mt-6 overflow-hidden border border-accent/20 bg-gradient-to-r from-accent/10 via-purple-500/10 to-transparent p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-purple-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">AI-Assisted Mock Interview</h3>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">Question Bank &amp; Rule-Based Scoring</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                Practice with an AI-assisted mock interview using a curated question bank and rule-based scoring, tailored to your readiness and skill gaps.
              </p>
            </div>
          </div>
          <Link href="/profile/interview" className="shrink-0">
            <Button className="gap-2 bg-gradient-to-r from-accent to-purple-600 hover:opacity-95 text-white font-bold shadow-md">
              <Mic className="h-4 w-4" />
              Start Mock Interview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NextActions
            opportunities={nextActionOpportunities}
            gaps={gaps.map((g) => ({ name: g.name, current: g.current, target: g.target }))}
            opportunityTitles={opportunityTitles}
          />
        </div>

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
          <Link href="/opportunities" className="text-xs font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        {recommended.length === 0 ? (
          <Card className="p-6 text-center text-sm text-ink-muted">
            No roles are open right now. We&apos;ll show your best matches here as soon as new ones are posted.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recommended.map((o) => (
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
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Your skill profile</CardTitle>
            <CardDescription>Proficiency across your most active skills</CardDescription>
          </div>
          <Link href="/profile/skills" className="text-xs font-medium text-accent hover:underline">
            Full skill profile
          </Link>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          {featuredSkills.map((id) => {
            const s = student.skills.find((sk) => sk.skillId === id);
            const skill = getSkillById(id);
            if (!s || !skill) return null;
            return <SkillProgress key={id} name={skill.name} score={s.score} />;
          })}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Skill development timeline</CardTitle>
            <CardDescription>Where you are in your placement preparation</CardDescription>
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
