import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillComparison } from "@/components/shared/skill-comparison";
import { RecommendationCard } from "@/components/shared/recommendation-card";
import { MatchScore } from "@/components/shared/match-score";
import { SkillRadarChart } from "@/components/shared/skill-radar-chart";
import { EvidenceCard } from "@/components/shared/evidence-card";
import { getSkillGapAnalysis, getSkillRadar } from "@/lib/api/skills";
import { getStudentProfile } from "@/lib/api/students";
import { getSkillById } from "@/data/skills";
import { Target, Radar, ShieldCheck, ArrowRight, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";

/**
 * SkillIntelligenceView Component
 * Merges skill gap analysis and skill category radar profile into one unified view
 * Strictly scoped within features/samir
 */
export async function SkillIntelligenceView() {
  const [analysis, radar, student] = await Promise.all([
    getSkillGapAnalysis("s1"),
    getSkillRadar("s1"),
    getStudentProfile("s1"),
  ]);

  const rows = analysis.comparison.map((c) => ({
    label: c.name,
    a: c.yourScore,
    b: c.industryScore,
  }));

  return (
    <DashboardShell title="Skill Analysis & Intelligence">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
              <Target className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-ink">Skill Intelligence & Gap Analysis</h2>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Target Role: <span className="font-semibold text-ink">{analysis.careerGoal}</span> · Comprehensive category breakdown, industry telemetry & proof verification.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
          <MatchScore value={analysis.careerReadiness} size="md" />
          <div>
            <p className="text-[11px] font-medium text-ink-muted">Role Readiness</p>
            <p className="text-xs font-bold text-ink flex items-center gap-1">
              Near Ready
              <Sparkles className="h-3 w-3 text-accent" />
            </p>
          </div>
        </div>
      </div>

      {/* Career Intelligence Discovery Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-surface to-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              Career Intelligence Database: 10 Tech Giants
              <span className="rounded-full bg-accent/20 text-accent px-2 py-0.5 text-[10px] font-bold">New</span>
            </h3>
            <p className="text-xs text-ink-muted">
              Deep dive into Google, Microsoft, Amazon, Meta, NVIDIA, and compare required skills, how employees work, and test the interactive Skill Gap Analyzer.
            </p>
          </div>
        </div>

        <Link
          href="/career-intelligence"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Open Career Intelligence
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Primary Analytics Grid: Comparison vs. Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Industry Gap Comparison */}
        <Card className="lg:col-span-3 border border-border bg-surface text-ink shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              <div>
                <CardTitle className="text-sm font-bold text-ink">Skills vs. Industry Requirements</CardTitle>
                <CardDescription className="text-xs font-medium text-ink-muted">
                  Where you stand against what {analysis.careerGoal} hiring managers benchmark
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SkillComparison rows={rows} labelA="Your Verified Skills" labelB="Industry Benchmark" />
          </CardContent>
        </Card>

        {/* Skill Category Distribution Radar */}
        <Card className="lg:col-span-2 border border-border bg-surface text-ink shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-accent" />
              <div>
                <CardTitle className="text-sm font-bold text-ink">Category Competency Radar</CardTitle>
                <CardDescription className="text-xs font-medium text-ink-muted">
                  Average mastery across technical and domain clusters
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-2">
            <SkillRadarChart data={radar} />
          </CardContent>
        </Card>
      </div>

      {/* Evidence-Based Skill Confidence Grid */}
      <div className="mt-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-accent" />
              <h3 className="text-base font-bold text-ink">Evidence-Backed Skill Proof</h3>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Each proficiency benchmark is validated by cryptographic proof, code repositories, or institutional verification.
            </p>
          </div>

          <Link href="/profile">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border">
              Manage Credentials in Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      {/* Recommended Targeted Intervention */}
      <div className="mt-8">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-ink">Targeted Skill Development Path</h3>
          <p className="text-xs text-ink-muted">Personalized closed-loop program to bridge high-impact skill gaps.</p>
        </div>
        <RecommendationCard
          title={analysis.recommendedIntervention.title}
          stats={[
            { label: "Duration", value: `${analysis.recommendedIntervention.durationWeeks} weeks` },
            {
              label: "Readiness gain",
              value: `+${analysis.recommendedIntervention.readinessAfter - analysis.recommendedIntervention.readinessBefore} pts`,
            },
            {
              label: "Target readiness",
              value: `${analysis.recommendedIntervention.readinessAfter}%`,
            },
            {
              label: "Skills targeted",
              value: `${analysis.recommendedIntervention.skillsDeveloped.length} skills`,
            },
          ]}
          cta="Start learning path"
        />
      </div>
    </DashboardShell>
  );
}
