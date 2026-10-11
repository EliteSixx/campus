import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillComparison } from "@/components/shared/skill-comparison";
import { MatchScore } from "@/components/shared/match-score";
import { SkillRadarChart } from "@/components/shared/skill-radar-chart";
import { EvidenceCard } from "@/components/shared/evidence-card";
import { getProfessionalSkillProfile } from "../data/skill-profile-data";
import { InteractiveSkillGapSection } from "./interactive-skill-gap-section";
import {
  Target,
  Radar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  BookOpen,
  Award,
} from "lucide-react";
import Link from "next/link";

interface SkillIntelligenceViewProps {
  title?: string;
}

/**
 * SkillIntelligenceView Component
 * The definitive, unified Skill Profile & Competency Intelligence dashboard.
 * Powered by high-fidelity enterprise dataset strictly scoped within Samir's ownership.
 */
export async function SkillIntelligenceView({
  title = "Skill Profile",
}: SkillIntelligenceViewProps) {
  const data = await getProfessionalSkillProfile();

  const rows = data.comparison.map((c) => ({
    label: c.name,
    a: c.yourScore,
    b: c.industryScore,
  }));

  const avgRadarScore = data.radar.length
    ? Math.round(data.radar.reduce((acc, curr) => acc + curr.score, 0) / data.radar.length)
    : 0;

  const topCategory = data.radar.length
    ? [...data.radar].sort((a, b) => b.score - a.score)[0]
    : null;

  const verifiedProofsCount = data.evidenceRecords.reduce(
    (count, e) => count + e.evidence.filter((item) => item.verified).length,
    0
  );

  const avgConfidence = data.evidenceRecords.length
    ? Math.round(
        data.evidenceRecords.reduce((acc, curr) => acc + curr.confidence, 0) /
          data.evidenceRecords.length
      )
    : 0;

  return (
    <DashboardShell title={title}>
      {/* 1. Header Summary Banner */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
              <Radar className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink">
                My Skills
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Career Track:{" "}
                <span className="font-semibold text-ink">{data.careerGoal}</span>{" "}
                · How your skills compare with what employers ask for, and the proof behind each one.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2 shadow-sm">
            <MatchScore value={data.careerReadiness} size="md" />
            <div>
              <p className="text-[11px] font-medium text-ink-muted">Target Role Readiness</p>
              <p className="text-xs font-bold text-ink flex items-center gap-1">
                {data.readinessBucket}
                <Sparkles className="h-3 w-3 text-accent" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Profiled Skills</span>
            <Award className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono text-ink">{data.evidenceRecords.length} Core</div>
          <div className="text-[11px] text-ink-muted mt-0.5">Across {data.radar.length} technical domains</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Verified Proofs</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          </div>
          <div className="text-xl font-bold font-mono text-ink">{verifiedProofsCount}</div>
          <div className="text-[11px] text-ink-muted mt-0.5">Exams, labs & GitHub repos</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg. Confidence</span>
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono text-ink">{avgConfidence}%</div>
          <div className="text-[11px] text-ink-muted mt-0.5">How well your scores are backed by proof</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Top Competency</span>
            <Target className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono text-ink truncate">{topCategory?.category || "N/A"}</div>
          <div className="text-[11px] text-ink-muted mt-0.5">{topCategory?.score}% domain mastery</div>
        </div>
      </div>

      {/* 3. Career Intelligence Discovery Bridge */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-surface to-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              Compare yourself with top tech companies
            </h3>
            <p className="text-xs text-ink-muted">
              See what Google, Microsoft, Amazon, Meta and NVIDIA look for, and how close you are.
            </p>
          </div>
        </div>

        <Link
          href="/career-intelligence"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Explore Companies
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 4. PRIMARY ANALYTICS GRID: Left = Comparison | Right = Round Graph (Radar) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* LEFT (3 Cols): Skills vs Industry Requirements */}
        <Card className="lg:col-span-3 border border-border bg-surface text-ink shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  <div>
                    <CardTitle className="text-sm font-bold text-ink">
                      Skills vs. Industry Requirements
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-ink-muted">
                      Where you stand against {data.careerGoal} role benchmarks
                    </CardDescription>
                  </div>
                </div>
                <Badge tone="accent" className="text-[10px]">
                  {rows.length} Core Target Skills
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SkillComparison
                rows={rows}
                labelA="Your Verified Score"
                labelB="Industry Requirement"
              />
            </CardContent>
          </div>

          <div className="border-t border-border/70 bg-surface-raised/30 px-5 py-3 text-xs text-ink-muted flex items-center justify-between">
            <span>
              Target role: <strong className="text-ink">{data.careerGoal}</strong>
            </span>
            <span className="font-mono text-success font-semibold">
              Readiness: {data.careerReadiness}%
            </span>
          </div>
        </Card>

        {/* RIGHT (2 Cols): Round Graph (Skill Category Radar) */}
        <Card className="lg:col-span-2 border border-border bg-surface text-ink shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radar className="h-4 w-4 text-accent" />
                  <div>
                    <CardTitle className="text-sm font-bold text-ink">
                      Category Competency Radar
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-ink-muted">
                      Mastery spread across technical clusters
                    </CardDescription>
                  </div>
                </div>
                <Badge tone="neutral" className="text-[10px]">
                  {data.radar.length} Clusters
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-0 pb-2">
              <div className="w-full flex justify-center py-1">
                <SkillRadarChart data={data.radar} />
              </div>
            </CardContent>
          </div>

          {/* Quick Stats Strip below Round Radar Graph */}
          <div className="border-t border-border/70 bg-surface-raised/40 p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-surface p-2 text-center border border-border/60">
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                  Top Category
                </p>
                <p className="text-xs font-bold text-accent truncate mt-0.5">
                  {topCategory?.category || "N/A"}
                </p>
                <p className="text-[10px] font-mono text-ink-faint">
                  {topCategory?.score}% score
                </p>
              </div>
              <div className="rounded-lg bg-surface p-2 text-center border border-border/60">
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                  Overall Average
                </p>
                <p className="text-xs font-bold text-ink mt-0.5">{avgRadarScore}%</p>
                <p className="text-[10px] font-mono text-ink-faint">
                  Across all {data.radar.length} clusters
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. LIVE AI TARGET ROLE SKILL GAP ANALYZER (Merged from Skill Analysis) */}
      <InteractiveSkillGapSection />

      {/* 6. EVIDENCE-BASED SKILL CONFIDENCE PROOF */}
      <div className="mt-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-accent" />
              <h3 className="text-base font-bold text-ink">Evidence-Backed Skill Proofs</h3>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Each score is validated with verifiable project evidence, certifications, and institutional sign-offs.
            </p>
          </div>

          <Link href="/profile">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border">
              View Profile Credentials
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.evidenceRecords.map((e) => (
            <EvidenceCard
              key={e.skillId}
              name={e.name}
              score={e.score}
              confidence={e.confidence}
              evidence={e.evidence}
            />
          ))}
        </div>
      </div>

      {/* 6. RECOMMENDED TARGETED INTERVENTION / LEARNING PATH */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <div>
            <h3 className="text-sm font-bold text-ink">Targeted Skill Development Path</h3>
            <p className="text-xs text-ink-muted">
              A focused plan to close the gaps that matter most for your target role.
            </p>
          </div>
        </div>
        <Card className="border-accent/30 bg-accent-soft/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Recommended for you</p>
          <p className="mt-1 text-base font-semibold text-ink">{data.recommendedIntervention.title}</p>
          <p className="mt-1 text-xs text-ink-muted">{data.recommendedIntervention.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="font-mono text-lg font-semibold text-ink">{data.recommendedIntervention.durationWeeks} weeks</p>
              <p className="text-xs text-ink-muted">Duration</p>
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-ink">
                {data.recommendedIntervention.readinessBefore}% → {data.recommendedIntervention.readinessAfter}%
              </p>
              <p className="text-xs text-ink-muted">Expected readiness</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm font-medium text-ink">{data.recommendedIntervention.skillsDeveloped.join(" · ")}</p>
              <p className="text-xs text-ink-muted">Skills covered</p>
            </div>
          </div>
          <Link href="/career-intelligence?tab=roadmaps" className="mt-5 inline-block">
            <Button size="sm" className="gap-1.5">
              Start learning path
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* 7. QUICK ACTION FOOTER */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <Link href="/profile">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Back to Profile
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href="/profile/resume">
            <Button variant="secondary" size="sm">
              Resume Builder
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm" className="gap-1.5">
              Explore Matched Opportunities
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
