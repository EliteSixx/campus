"use client";

import { useState } from "react";
import type { IndustryEngagementIntelligence, PartnerSkillRoleMapping } from "@/data/institution/types";
import { Badge } from "@/components/ui/badge";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import {
  Building2,
  Handshake,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Cpu,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface IndustryEngagementIntelligenceViewProps {
  intelligence: IndustryEngagementIntelligence;
}

export function IndustryEngagementIntelligenceView({ intelligence }: IndustryEngagementIntelligenceViewProps) {
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const filteredPartners = intelligence.partnerMappings.filter((p) => {
    const matchesHealth = healthFilter === "all" || p.relationshipHealth === healthFilter;
    const matchesDept = deptFilter === "all" || p.targetDepartments.some((d) => d.deptId === deptFilter);
    return matchesHealth && matchesDept;
  });

  // Export dataset preparation
  const exportHeaders = [
    "Partner Name",
    "Industry Sector",
    "Engagement Score",
    "Relationship Health",
    "Target Departments",
    "Demanded Skills",
    "Key Roles",
    "Total Hired",
    "Active Drive",
    "MoU Status",
  ];

  const exportRows = intelligence.partnerMappings.map((p) => [
    p.partnerName,
    p.industry,
    `${p.engagementScore}/100`,
    p.relationshipHealth,
    p.targetDepartments.map((d) => d.shortName).join(", "),
    p.demandedSkills.join("; "),
    p.keyRoles.join(", "),
    p.totalHired,
    p.activeDriveTitle || "None Scheduled",
    p.mouStatus,
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Top Ribbon Overview ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Corporate Network</span>
            <Building2 className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">{intelligence.totalPartners}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="font-semibold text-emerald-500">{intelligence.activeMoUsCount} Active MoUs</span>
            <span>·</span>
            <span>{intelligence.expiringMoUsCount} Attention</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Top Hiring Recruiter</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {intelligence.topPartnersByHiring[0]?.name ?? "N/A"}
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">
            {intelligence.topPartnersByHiring[0]?.hired ?? 0} students hired · {intelligence.topPartnersByHiring[0]?.engagementScore}/100 score
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Core Branch Coverage</span>
            <Cpu className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-500 tabular">2 Branches</p>
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            ME & EE under-represented
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Curriculum Skill Deficits</span>
            <Sparkles className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-rose-500 tabular">2 High Priority</p>
          <p className="mt-1 text-[11px] text-ink-muted">
            Cloud Containers & Embedded C++
          </p>
        </div>
      </div>

      {/* ── Actionable Strategic Insights ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Actionable Industry Relationship Insights</h3>
              <p className="text-xs text-ink-muted">
                Evidence-based intelligence linking corporate demand, curriculum deficits, and departmental outreach.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {intelligence.actionableInsights.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "rounded-xl border p-4 transition-all",
                insight.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/5 text-ink"
                  : "border-blue-500/30 bg-blue-500/5 text-ink"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {insight.partnerOrScope}
                </span>
                <Badge
                  tone={insight.priority === "high" ? "danger" : "warning"}
                  className="text-[10px]"
                >
                  {insight.priority} priority
                </Badge>
              </div>
              <h4 className="mt-2 text-xs font-bold text-ink">{insight.title}</h4>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">{insight.observation}</p>
              <div className="mt-3 rounded-lg border border-border/60 bg-surface/80 p-2.5 text-[11px] text-ink">
                <span className="font-semibold text-accent">Recommended Action: </span>
                <span className="text-ink-muted">{insight.recommendedAction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Corporate Partner Demand & Recruitment Relationship Mapping ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Handshake className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-ink">Recruitment Relationship & Demand Matrix</h3>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Connects Corporate Partner → Demanded Skills → Target Departments → Placement Drives → Outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Health Filter */}
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              aria-label="Filter by relationship health"
              className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">All Health Statuses</option>
              <option value="thriving">Thriving</option>
              <option value="needs-attention">Needs Attention</option>
              <option value="dormant">Dormant</option>
            </select>

            {/* Dept Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              aria-label="Filter by target department"
              className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">All Target Departments</option>
              <option value="cse">CSE</option>
              <option value="it">IT</option>
              <option value="ds">DS & AI</option>
              <option value="ece">ECE</option>
              <option value="me">Mechanical</option>
              <option value="ee">Electrical</option>
            </select>

            <ExportDropdown
              filename="industry_engagement_recruitment_matrix"
              title="Industry Engagement & Recruitment Matrix"
              headers={exportHeaders}
              rows={exportRows}
              label="Export Matrix"
            />
          </div>
        </div>

        {/* Matrix List / Cards */}
        <div className="divide-y divide-border/60">
          {filteredPartners.length === 0 ? (
            <div className="py-12 text-center text-xs text-ink-muted">
              No partners match the selected relationship or department criteria.
            </div>
          ) : (
            filteredPartners.map((mapping) => (
              <div key={mapping.partnerId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  {/* Partner Identity & Status */}
                  <div className="space-y-1.5 md:w-1/4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">{mapping.partnerName}</span>
                      <Badge
                        tone={
                          mapping.relationshipHealth === "thriving"
                            ? "success"
                            : mapping.relationshipHealth === "needs-attention"
                            ? "warning"
                            : "danger"
                        }
                        className="text-[10px] capitalize"
                      >
                        {mapping.relationshipHealth.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-muted">{mapping.industry}</p>
                    <div className="flex items-center gap-2 text-[11px] text-ink-muted font-mono">
                      <span>Engagement: {mapping.engagementScore}/100</span>
                      <span>·</span>
                      <span className="font-semibold text-accent">{mapping.totalHired} hired</span>
                    </div>
                  </div>

                  {/* Skills & Roles */}
                  <div className="space-y-1.5 md:w-2/5">
                    <div className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                      Demanded Skills & Key Roles
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mapping.demandedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-ink border border-border/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-ink-muted">
                      Roles: <span className="text-ink font-medium">{mapping.keyRoles.join(", ")}</span>
                    </p>
                  </div>

                  {/* Target Departments & Active Drive */}
                  <div className="space-y-2 md:w-1/3">
                    <div>
                      <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block mb-1">
                        Target Departments
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {mapping.targetDepartments.map((dept) => (
                          <span
                            key={dept.deptId}
                            className="rounded-md bg-accent/10 text-accent font-semibold px-2 py-0.5 text-[10px]"
                          >
                            {dept.shortName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {mapping.activeDriveTitle ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <Link
                          href="/dashboard/institution/drives"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>Drive: {mapping.activeDriveTitle}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : (
                      <p className="text-[11px] text-ink-muted">
                        No active campus drive currently in progress
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Departmental Engagement Gaps & Industry Demand vs Syllabus ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Departmental Industry Engagement Gaps */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-ink">Departmental Engagement Gap Diagnostic</h3>
            </div>
            <Link
              href="/dashboard/institution/departments"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <span>View Depts</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-ink-muted mb-4">
            Highlights uneven recruiter density and branch-specific core corporate coverage.
          </p>

          <div className="space-y-3">
            {intelligence.departmentEngagementGaps.map((dept) => (
              <div
                key={dept.deptId}
                className={cn(
                  "rounded-xl border p-3.5 transition-colors",
                  dept.engagementCoverage === "Under-Represented"
                    ? "border-rose-500/30 bg-rose-500/5"
                    : dept.engagementCoverage === "Adequate"
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-border bg-surface-raised/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-ink">{dept.deptName}</span>
                    <span className="text-[11px] text-ink-muted">({dept.shortName})</span>
                  </div>
                  <Badge
                    tone={
                      dept.engagementCoverage === "Strong"
                        ? "success"
                        : dept.engagementCoverage === "Adequate"
                        ? "neutral"
                        : "danger"
                    }
                    className="text-[10px]"
                  >
                    {dept.engagementCoverage}
                  </Badge>
                </div>

                <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-muted font-mono">
                  <span>{dept.activePartnersCount} Active Partners</span>
                  <span>·</span>
                  <span>{dept.activeDrivesCount} Drives</span>
                  <span>·</span>
                  <span className="text-ink truncate max-w-[180px]">
                    {dept.corePartnerNames.slice(0, 2).join(", ")}
                    {dept.corePartnerNames.length > 2 ? ` +${dept.corePartnerNames.length - 2}` : ""}
                  </span>
                </div>

                <p className="mt-2 text-xs text-ink leading-relaxed">
                  <span className="font-semibold text-rose-500 dark:text-rose-400">Identified Gap: </span>
                  <span className="text-ink-muted">{dept.identifiedGap}</span>
                </p>

                <div className="mt-2 text-[11px] text-accent leading-snug">
                  <span className="font-semibold">Action: </span>
                  <span className="text-ink-muted">{dept.recommendedAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Industry Demand vs Campus Syllabus Alignment */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-ink">Industry Skill Demand vs Syllabus Health</h3>
            </div>
            <Link
              href="/dashboard/institution/curriculum"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <span>Curriculum Audit</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-ink-muted mb-4">
            Most frequently demanded skills across corporate partners cross-referenced with academic curriculum status.
          </p>

          <div className="divide-y divide-border/60">
            {intelligence.topDemandedSkills.map((skill) => (
              <div key={skill.skillName} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-xs text-ink">{skill.skillName}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Demanded by: <span className="text-ink">{skill.demandingPartnerNames.join(", ")}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      tone={
                        skill.curriculumCoverageStatus === "Aligned"
                          ? "success"
                          : skill.curriculumCoverageStatus === "Emerging Gap"
                          ? "warning"
                          : "danger"
                      }
                      className="text-[10px]"
                    >
                      {skill.curriculumCoverageStatus}
                    </Badge>
                    <span className="text-[10px] text-ink-faint font-mono">
                      {skill.demandingPartnersCount} partners
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-ink">
            <p className="font-semibold text-accent flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Proactive Curriculum Alignment Intervention
            </p>
            <p className="mt-1 text-ink-muted text-[11px] leading-relaxed">
              Partner with TechNova and Orbital Cloud to incorporate containerization into CSE semester 6 Cloud Architecture, and collaborate with Vertex Robotics on embedded robotics labs for Mechanical & Electrical cohorts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
