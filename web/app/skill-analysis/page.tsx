import Link from "next/link";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillComparison } from "@/components/shared/skill-comparison";
import { RecommendationCard } from "@/components/shared/recommendation-card";
import { MatchScore } from "@/components/shared/match-score";
import { getSkillGapAnalysis } from "@/lib/api/skills";
import { ArrowRight, Sparkles, Target } from "lucide-react";

export default async function SkillAnalysisPage() {
  const analysis = await getSkillGapAnalysis("s1");

  const rows = analysis.comparison.map((c) => ({
    label: c.name,
    a: c.yourScore,
    b: c.industryScore,
  }));

  return (
    <DashboardShell title="Skill Analysis">
      {/* Header Summary */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Your Skill Intelligence Report</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Career goal: <span className="font-medium text-ink">{analysis.careerGoal}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5">
          <MatchScore value={analysis.careerReadiness} size="md" />
          <div>
            <p className="text-xs text-ink-muted">Career readiness</p>
            <p className="text-sm font-medium text-ink">Near ready</p>
          </div>
        </div>
      </div>

      {/* Career Intelligence Discovery Bridge */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 via-surface to-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white shadow-sm shrink-0">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              Career Intelligence & Company Benchmarks
              <span className="rounded-full bg-accent/20 text-accent px-2 py-0.5 text-[10px] font-bold">Recommended Next</span>
            </h3>
            <p className="text-xs text-ink-muted">
              Deep dive into Google, Microsoft, Amazon, Meta, and NVIDIA hiring criteria with the interactive Skill Gap Analyzer.
            </p>
          </div>
        </div>

        <Link
          href="/career-intelligence"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Explore Career Intelligence
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Your skills vs. industry requirements</CardTitle>
            <CardDescription>Where you stand against what {analysis.careerGoal} roles expect</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SkillComparison rows={rows} labelA="Your skills" labelB="Industry requirements" />
        </CardContent>
      </Card>

      <div className="mt-6">
        <RecommendationCard
          title={analysis.recommendedIntervention.title}
          stats={[
            { label: "Duration", value: `${analysis.recommendedIntervention.durationWeeks} weeks` },
            {
              label: "Readiness improvement",
              value: `${analysis.recommendedIntervention.readinessBefore}% → ${analysis.recommendedIntervention.readinessAfter}%`,
            },
            { label: "Skills developed", value: analysis.recommendedIntervention.skillsDeveloped.join(", ") },
          ]}
          cta="Start learning path"
        />
      </div>

      {/* Action navigation linking the student journey */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <Link href="/profile/skills">
          <Button variant="outline" size="sm">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Review Skill Profile
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href="/career-intelligence">
            <Button variant="secondary" size="sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Career Intelligence
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm">
              Explore Matched Opportunities
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
