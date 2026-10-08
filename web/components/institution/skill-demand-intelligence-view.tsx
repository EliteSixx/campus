"use client";

import { useState } from "react";
import type { InstitutionalSkillDemandIntelligence, IndustrySkillDemandItem } from "@/data/institution/types";
import { Badge } from "@/components/ui/badge";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Cpu,
  Layers,
  GraduationCap,
  ArrowUpRight,
  ShieldAlert,
  Search,
  BookOpen,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SkillDemandIntelligenceViewProps {
  intelligence: InstitutionalSkillDemandIntelligence;
}

export function SkillDemandIntelligenceView({ intelligence }: SkillDemandIntelligenceViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const categories = [
    "all",
    ...Array.from(new Set(intelligence.demandItems.map((item) => item.category))),
  ];

  const filteredItems = intelligence.demandItems.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.skillName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.targetJobRoles.some((r) => r.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesCoverage = coverageFilter === "all" || item.curriculumCoverage === coverageFilter;
    const matchesDept = deptFilter === "all" || item.targetDepartmentIds.includes(deptFilter);
    return matchesSearch && matchesCategory && matchesCoverage && matchesDept;
  });

  const exportHeaders = [
    "Skill Name",
    "Category",
    "Demanding Corporate Partners",
    "Target Job Roles",
    "Target Departments",
    "Curriculum Coverage",
    "Coverage %",
    "Placement Impact",
    "Avg Associated CTC",
    "Emerging Status",
    "Recommended Upskilling Action",
  ];

  const exportRows = filteredItems.map((item) => [
    item.skillName,
    item.category,
    item.demandingPartners.join("; "),
    item.targetJobRoles.join(", "),
    item.targetDepartmentIds.map((d) => d.toUpperCase()).join(", "),
    item.curriculumCoverage,
    `${item.curriculumCoveragePercent}%`,
    item.placementImpact,
    item.averageAssociatedCTC,
    item.isEmerging ? "Yes (Emerging)" : "Standard Demand",
    item.recommendedUpskillingAction,
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Top Metrics Ribbon ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Tracked Industry Skills</span>
            <Layers className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">{intelligence.totalTrackedSkills}</p>
          <p className="mt-1 text-[11px] text-ink-muted">
            Across 10 corporate recruiters & 8 drives
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>High-Demand Skills</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular">
            {intelligence.highDemandSkillsCount} Skills
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Demanded by ≥3 corporate partners
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Emerging Skills</span>
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-accent tabular">
            {intelligence.emergingSkillsCount} Verified
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">
            Cloud Containers & Embedded Robotics
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Curriculum Deficits</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-rose-500 tabular">
            {intelligence.curriculumDeficitSkillsCount} Critical
          </p>
          <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            &lt;30% syllabus coverage
          </p>
        </div>
      </div>

      {/* ── Priority Upskilling Areas (Strategic Action Plan) ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Institutional Upskilling & Curriculum Action Roadmap</h3>
              <p className="text-xs text-ink-muted">
                Immediate and academic-year priorities driven by corporate recruitment volume and curriculum coverage gaps.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {intelligence.priorityUpskillingAreas.map((area, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-border bg-surface-raised/40 p-4 transition-all hover:border-accent/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                    {area.category}
                  </span>
                  <Badge
                    tone={area.urgency.includes("Immediate") ? "danger" : "neutral"}
                    className="text-[10px]"
                  >
                    {area.urgency}
                  </Badge>
                </div>

                <h4 className="mt-2 text-xs font-bold text-ink">{area.skillName}</h4>
                <p className="mt-1 text-[11px] text-ink-muted leading-relaxed">
                  {area.placementRelevance}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-[10px] text-ink-faint">
                  <span>Impacted Depts:</span>
                  <span className="font-semibold text-ink">{area.impactedDepartments.join(", ")}</span>
                </div>
                <div className="mt-2 rounded-md bg-accent/10 p-2 text-[11px] font-semibold text-accent text-center">
                  {area.recommendedMethod}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Demand & Placement Impact Matrix ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Building2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-ink">Corporate Skill Demand & Placement Impact Matrix</h3>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Connects Corporate Partners → Job Roles → Required Skills → Departments → Curriculum Coverage → Placement Impact.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ExportDropdown
              filename="institutional_skill_demand_matrix"
              title="Corporate Skill Demand & Placement Impact Matrix"
              headers={exportHeaders}
              rows={exportRows}
              label="Export Demand Data"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skill, role, or category…"
              className="h-8.5 w-full rounded-lg border border-border bg-surface pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            aria-label="Filter by department"
            className="h-8.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="cse">CSE (Computer Science)</option>
            <option value="it">IT (Information Tech)</option>
            <option value="ds">DS & AI</option>
            <option value="ece">ECE (Electronics & Comm)</option>
            <option value="me">ME (Mechanical)</option>
            <option value="ee">EE (Electrical)</option>
          </select>

          <select
            value={coverageFilter}
            onChange={(e) => setCoverageFilter(e.target.value)}
            aria-label="Filter by curriculum coverage"
            className="h-8.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="all">All Curriculum Coverage</option>
            <option value="adequate">Adequate Coverage (≥70%)</option>
            <option value="partial">Partial Coverage (30–69%)</option>
            <option value="minimal">Minimal / None (&lt;30%)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-8.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Skill Categories" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Matrix Rows */}
        <div className="divide-y divide-border/60">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-ink-muted">
              No industry skills match your search and filter criteria.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  {/* Skill Identity & Category */}
                  <div className="space-y-1 lg:w-1/3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-ink">{item.skillName}</span>
                      {item.isEmerging && (
                        <Badge tone="accent" className="text-[10px] gap-1">
                          <Sparkles className="h-2.5 w-2.5" />
                          Emerging
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted">{item.category}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.targetDepartmentIds.map((dept) => (
                        <span
                          key={dept}
                          className="rounded bg-accent/10 px-1.5 py-0.2 text-[10px] font-semibold text-accent"
                        >
                          {dept.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    {item.emergingRationale && (
                      <p className="text-[10px] text-accent/90 italic pt-1">
                        &quot;{item.emergingRationale}&quot;
                      </p>
                    )}
                  </div>

                  {/* Recruiter Demand & Job Roles */}
                  <div className="space-y-1.5 lg:w-1/3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                        Demanding Partners
                      </span>
                      <p className="text-xs font-medium text-ink">
                        {item.demandingPartners.join(", ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                        Target Recruiter Roles
                      </span>
                      <p className="text-xs text-ink-muted">{item.targetJobRoles.join(", ")}</p>
                    </div>
                  </div>

                  {/* Curriculum Coverage & Placement Impact */}
                  <div className="space-y-2 lg:w-1/3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-ink">Syllabus Coverage:</span>
                        <Badge
                          tone={
                            item.curriculumCoverage === "adequate"
                              ? "success"
                              : item.curriculumCoverage === "partial"
                              ? "warning"
                              : "danger"
                          }
                          className="text-[10px] capitalize"
                        >
                          {item.curriculumCoverage} ({item.curriculumCoveragePercent}%)
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {item.averageAssociatedCTC}
                        </span>
                        <span className="text-[10px] text-ink-faint block">Avg CTC</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-surface-raised/50 p-2.5 text-[11px]">
                      <span className="font-semibold text-accent">Recommended Action: </span>
                      <span className="text-ink-muted">{item.recommendedUpskillingAction}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Departmental Skill Demand & Curriculum Health Diagnostic ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Departmental Skill Demand & Curriculum Alignment Diagnostic</h3>
              <p className="text-xs text-ink-muted">
                Branch-by-branch summary of current recruiter demands, high-impact gaps, and targeted upskilling focus.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/institution/departments"
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <span>Department Benchmarks</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {intelligence.departmentSummaries.map((dept) => (
            <div
              key={dept.deptId}
              className="rounded-xl border border-border bg-surface-raised/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-ink">{dept.deptName}</h4>
                  <span className="text-[10px] text-ink-muted font-mono">{dept.shortName}</span>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "font-mono text-sm font-bold",
                      dept.overallCurriculumAlignmentPercent >= 70
                        ? "text-emerald-500"
                        : dept.overallCurriculumAlignmentPercent >= 55
                        ? "text-amber-500"
                        : "text-rose-500"
                    )}
                  >
                    {dept.overallCurriculumAlignmentPercent}%
                  </span>
                  <span className="text-[10px] text-ink-faint block">Alignment</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint block mb-1">
                  Top Recruiter Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {dept.topDemandedSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-surface px-2 py-0.5 text-[10px] font-medium text-ink border border-border/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {dept.highImpactDeficitSkills.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                    High-Impact Deficits
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dept.highImpactDeficitSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border/60 text-[11px]">
                <span className="font-semibold text-accent">Upskilling Focus: </span>
                <span className="text-ink-muted">{dept.priorityUpskillingFocus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actionable Strategic Recommendations ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {intelligence.actionableRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={cn(
              "rounded-xl border p-4.5 space-y-2.5",
              rec.type === "critical"
                ? "border-rose-500/30 bg-rose-500/5 text-ink"
                : "border-amber-500/30 bg-amber-500/5 text-ink"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {rec.scope}
              </span>
              <Badge
                tone={rec.type === "critical" ? "danger" : "warning"}
                className="text-[10px]"
              >
                {rec.type} priority
              </Badge>
            </div>
            <h4 className="text-xs font-bold text-ink">{rec.title}</h4>
            <p className="text-xs text-ink-muted leading-relaxed">{rec.evidence}</p>
            <div className="rounded-lg border border-border/60 bg-surface/80 p-2.5 text-[11px]">
              <span className="font-semibold text-accent">Action: </span>
              <span className="text-ink">{rec.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
