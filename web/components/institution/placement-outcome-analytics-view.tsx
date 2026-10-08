"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ArrowDownRight,
  Filter,
  Flame,
  Info,
  Building2,
  Calendar,
  Layers,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InstitutionalPlacementOutcomeIntelligence } from "@/data/institution/types";
import { cn } from "@/lib/utils";

interface PlacementOutcomeAnalyticsViewProps {
  data: InstitutionalPlacementOutcomeIntelligence;
}

export function PlacementOutcomeAnalyticsView({ data }: PlacementOutcomeAnalyticsViewProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>("all");

  const filteredDepartments = data.readinessVsOutcomes.filter((dept) => {
    if (selectedQuadrant === "all") return true;
    return dept.quadrantClassification === selectedQuadrant;
  });

  return (
    <div className="space-y-6">
      {/* ─── Executive Scorecard Banner ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-surface p-3.5 text-center shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Award className="h-3 w-3 text-emerald-500" /> Placement Rate
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-500 tabular">
            {data.overallPlacementRate}%
          </p>
          <p className="text-[10px] text-ink-faint">
            {data.totalPlaced} of {data.totalGraduatingCohort} placed
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3 text-accent" /> Median CTC
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-accent tabular">
            {data.medianCTC}
          </p>
          <p className="text-[10px] text-ink-faint">Campus benchmark</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            Average CTC
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">
            {data.averageCTC}
          </p>
          <p className="text-[10px] text-ink-faint">Highest: {data.highestCTC}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Building2 className="h-3 w-3 text-ink-muted" /> Active Recruiters
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">
            {data.activeRecruiters}
          </p>
          <p className="text-[10px] text-ink-faint">Corporate hiring partners</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-sky-500" /> Funnel Yield
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-sky-500 tabular">
            82.4%
          </p>
          <p className="text-[10px] text-ink-faint">Eligible to placed conversion</p>
        </div>
      </div>

      {/* ─── Funnel Conversion & Bottleneck Detection ─── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                Institutional Recruitment Funnel &amp; Bottleneck Detection
              </CardTitle>
              <CardDescription>
                Step-by-step conversion velocity from eligible student cohort to confirmed placements
              </CardDescription>
            </div>
            <Badge tone="cyan" className="text-xs self-start sm:self-auto font-mono">
              Academic Session {data.academicYear}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Funnel Progress Steps */}
          <div className="space-y-3">
            {data.funnelStages.map((stage, idx) => {
              const isBottleneck =
                stage.stage.includes("Appeared") || stage.stage.includes("Shortlisted");

              return (
                <div key={stage.stage} className="rounded-xl border border-border bg-surface-raised/40 p-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ink">{stage.stage}</span>
                      {stage.lossCount > 0 && (
                        <span className="text-[10px] text-rose-500 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded">
                          -{stage.lossCount} candidates
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-ink-muted text-[11px]">
                        Step Conversion: <strong>{stage.conversionPercent}%</strong>
                      </span>
                      <span className="font-bold text-ink">
                        {stage.count} students ({stage.overallPercent}% of cohort)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        idx === 0
                          ? "bg-accent"
                          : idx === data.funnelStages.length - 1
                          ? "bg-emerald-500"
                          : isBottleneck
                          ? "bg-amber-500"
                          : "bg-sky-500"
                      )}
                      style={{ width: `${stage.overallPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Critical Bottleneck Alert Box */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Primary Funnel Bottleneck Identified
                </h4>
                <Badge tone="warning" className="text-[9px] uppercase font-mono">
                  {data.bottleneck.dropRatePercent}% Attrition
                </Badge>
              </div>
              <p className="text-xs font-semibold text-ink">
                Friction: {data.bottleneck.stageFrom} → {data.bottleneck.stageTo} ({data.bottleneck.candidatesLost} Candidates Lost)
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                {data.bottleneck.identifiedFriction}
              </p>
              <p className="text-xs text-accent font-medium pt-1">
                <strong>Remediation Strategy: </strong>
                {data.bottleneck.recommendedFocus}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Readiness vs. Placement Outcome Matrix ─── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                Readiness vs. Placement Outcome Diagnostic Matrix
              </CardTitle>
              <CardDescription>
                Cross-correlating department skill readiness benchmarks with actual placement conversions to diagnose conversion gaps
              </CardDescription>
            </div>

            {/* Quadrant Filter */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => setSelectedQuadrant("all")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
                  selectedQuadrant === "all"
                    ? "bg-surface-raised text-ink border-border shadow-xs"
                    : "text-ink-muted border-transparent hover:bg-surface-raised/50"
                )}
              >
                All Branches ({data.readinessVsOutcomes.length})
              </button>
              <button
                onClick={() => setSelectedQuadrant("Top Performer")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
                  selectedQuadrant === "Top Performer"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "text-emerald-500/80 border-transparent hover:bg-emerald-500/10"
                )}
              >
                Top Performers
              </button>
              <button
                onClick={() => setSelectedQuadrant("Strong Outcome")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
                  selectedQuadrant === "Strong Outcome"
                    ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
                    : "text-sky-500/80 border-transparent hover:bg-sky-500/10"
                )}
              >
                Strong Outcome
              </button>
              <button
                onClick={() => setSelectedQuadrant("Conversion Gap")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
                  selectedQuadrant === "Conversion Gap"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "text-amber-500/80 border-transparent hover:bg-amber-500/10"
                )}
              >
                Conversion Gap
              </button>
              <button
                onClick={() => setSelectedQuadrant("High Intervention Priority")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
                  selectedQuadrant === "High Intervention Priority"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    : "text-rose-500/80 border-transparent hover:bg-rose-500/10"
                )}
              >
                High Priority
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-raised/50 text-ink-muted">
                  <th className="px-3 py-2.5 text-left font-semibold">Department</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Cohort</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Placed</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Placement Rate</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Skill Readiness</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Quadrant Diagnosis</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Median CTC</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Average CTC</th>
                  <th className="px-3 py-2.5 text-center font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept) => {
                  const quadrantTone =
                    dept.quadrantClassification === "Top Performer"
                      ? "success"
                      : dept.quadrantClassification === "Strong Outcome"
                      ? "cyan"
                      : dept.quadrantClassification === "Conversion Gap"
                      ? "warning"
                      : "danger";

                  return (
                    <tr key={dept.deptId} className="border-b border-border/40 hover:bg-surface-raised/30 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-ink block">{dept.deptName}</span>
                        <span className="text-[10px] text-ink-muted">{dept.shortName} Cohort</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">{dept.totalStudents}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-500">
                        {dept.placedCount}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold">
                        <span className={dept.placementRate >= 85 ? "text-emerald-500" : dept.placementRate >= 75 ? "text-amber-500" : "text-rose-500"}>
                          {dept.placementRate}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        <span className="font-semibold text-ink">{dept.readinessScore}%</span>
                        <span className="text-[10px] text-ink-faint block">{dept.readinessTier}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={quadrantTone} className="text-[10px]">
                          {dept.quadrantClassification}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-accent">
                        {dept.medianCTC}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-ink-muted">
                        {dept.avgCTC}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[11px]">
                        {dept.trend === "improving" ? (
                          <span className="text-emerald-500 font-semibold">↑ Lift</span>
                        ) : (
                          <span className="text-ink-muted">→ Stable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Salary Tier & Recruitment Conversion Analysis ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4 text-accent" />
                Salary Tier &amp; Recruitment Velocity Comparison
              </CardTitle>
              <CardDescription>
                Breakdown of student participation and conversion rates across Super Dream, Dream, and Core/IT compensation bands
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.salaryTierOutcomes.map((tier) => (
              <div
                key={tier.tierName}
                className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-ink">{tier.tierName}</span>
                    <Badge tone="accent" className="text-[10px] font-mono">
                      {tier.drivesCount} Drives
                    </Badge>
                  </div>

                  <p className="text-xs text-ink-muted font-medium mb-3">
                    Package Range: <span className="font-mono text-ink font-semibold">{tier.range}</span> (Avg {tier.avgCTC})
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-surface-raised/60 p-2.5 rounded-lg border border-border/50 text-center mb-3">
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block font-semibold">Registered</span>
                      <span className="font-mono text-sm font-bold text-ink">{tier.registeredCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block font-semibold">Shortlisted</span>
                      <span className="font-mono text-sm font-bold text-sky-500">{tier.shortlistedCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block font-semibold">Offers</span>
                      <span className="font-mono text-sm font-bold text-emerald-500">{tier.offersCount}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-ink-muted">
                    <div className="flex items-center justify-between">
                      <span>Shortlist Rate:</span>
                      <strong className="font-mono text-ink">{tier.shortlistRate}%</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Shortlist-to-Offer Conversion:</span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                        {tier.offerConversionRate}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50">
                  <span className="text-[10px] text-ink-faint uppercase tracking-wider block mb-1">
                    Key Hiring Organizations:
                  </span>
                  <p className="text-xs text-ink-muted line-clamp-1 font-medium">
                    {tier.topRecruiters.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Multi-Year Historical Outcome Progression (2021–2025) ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                Multi-Year Longitudinal Placement Progression (2021–2025)
              </CardTitle>
              <CardDescription>
                Audited longitudinal tracking of cohort size, placement percentage, and compensation growth over 4 academic sessions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.historicalTrends.map((year) => (
              <div key={year.year} className="rounded-xl border border-border bg-surface p-3.5 text-center">
                <span className="text-xs font-bold text-ink block">{year.year}</span>
                <span className="font-mono text-xl font-bold text-emerald-500 mt-1 block">
                  {year.placementRate}%
                </span>
                <p className="text-[10px] text-ink-muted mt-0.5">
                  {year.placedCount} / {year.totalStudents} placed
                </p>
                <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-ink-muted flex items-center justify-between">
                  <span>Median CTC:</span>
                  <span className="font-mono font-bold text-ink">{year.medianCTC}</span>
                </div>
                <div className="text-[10px] text-ink-faint flex items-center justify-between mt-0.5">
                  <span>Recruiters:</span>
                  <span className="font-mono">{year.recruitersCount} cos</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Deterministic Actionable Institutional Insights ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                Institutional Decision-Support Insights &amp; Recommended Actions
              </CardTitle>
              <CardDescription>
                Deterministic findings derived from cross-correlating funnel attrition, department benchmarks, and readiness cutoffs
              </CardDescription>
            </div>
            <Badge tone="accent" className="text-xs">
              3 Active Findings
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.actionableInsights.map((ins) => (
              <div
                key={ins.id}
                className={cn(
                  "rounded-xl border p-4 flex flex-col justify-between shadow-xs",
                  ins.type === "warning"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-accent/30 bg-accent/5"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-ink">
                      {ins.departmentOrScope}
                    </span>
                    <Badge tone={ins.priority === "high" ? "danger" : "warning"} className="text-[9px] uppercase">
                      {ins.priority} Priority
                    </Badge>
                  </div>

                  <h4 className="font-bold text-sm text-ink mb-2">{ins.title}</h4>

                  <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                    <strong>Observation: </strong>
                    {ins.observation}
                  </p>

                  <div className="rounded-lg bg-surface/80 p-2 border border-border/50 text-[11px] text-ink-muted mb-3">
                    <strong>Evidence: </strong>
                    {ins.evidence}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 text-xs text-accent font-medium">
                  <strong>Action: </strong>
                  {ins.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
