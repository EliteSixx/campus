"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { SkillHeatmap } from "@/components/institution/skill-heatmap";
import { DepartmentSkillView } from "@/components/institution/department-skill-view";
import { SearchFilterBar } from "@/components/institution/search-filter-bar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import {
  skillMatrixData,
  cohortAnalytics,
  commonCrossDeptSkills,
  departmentProfiles,
  departmentSkillMap,
} from "@/data/institution/mock-skills";
import type { InstitutionalSkillDemandIntelligence } from "@/data/institution/types";
import { getInstitutionalSkillDemandIntelligence } from "@/lib/api/institution";
import { SkillDemandIntelligenceView } from "@/components/institution/skill-demand-intelligence-view";
import {
  Layers,
  Building2,
  CheckCircle2,
  Cpu,
  Wrench,
  Zap,
  Code2,
  Database,
  Terminal,
  Compass,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const departmentTabs = [
  { id: "all", label: "All Departments (Cross-Dept)", icon: Layers },
  { id: "me", label: "Mechanical (ME)", icon: Wrench },
  { id: "ee", label: "Electrical (EE)", icon: Zap },
  { id: "ece", label: "Electronics & Comm (ECE)", icon: Cpu },
  { id: "cse", label: "Computer Science (CSE)", icon: Code2 },
  { id: "it", label: "Information Tech (IT)", icon: Terminal },
  { id: "ds", label: "Data Science & AI (DS)", icon: Database },
];

export default function SkillMatrixPage() {
  const [mainTab, setMainTab] = useState<"demand" | "heatmap">("demand");
  const [demandIntelligence, setDemandIntelligence] = useState<InstitutionalSkillDemandIntelligence | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [allViewScope, setAllViewScope] = useState<"common" | "full">("common");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    getInstitutionalSkillDemandIntelligence().then(setDemandIntelligence);
  }, []);

  // Filter for 'all' mode
  const baseData = allViewScope === "common" ? commonCrossDeptSkills : skillMatrixData;

  const filtered = baseData.filter((row) => {
    const matchesSearch =
      search === "" ||
      row.skillName.toLowerCase().includes(search.toLowerCase()) ||
      row.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || row.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const sorted = [...filtered].sort((a, b) => b.gap - a.gap);

  // Available categories for current view
  const currentCategories = [
    "All",
    ...Array.from(new Set(baseData.map((d) => d.category))),
  ];

  // Prepare export for cross-dept table
  const crossDeptHeaders = [
    "Skill Name",
    "Category",
    "CSE",
    "IT",
    "ECE",
    "DS",
    "ME",
    "EE",
    "Industry Demand",
    "Overall Gap",
  ];
  const crossDeptRows = sorted.map((r) => [
    r.skillName,
    r.category,
    r.departments.find((d) => d.deptId === "cse")?.avgScore ?? "N/A",
    r.departments.find((d) => d.deptId === "it")?.avgScore ?? "N/A",
    r.departments.find((d) => d.deptId === "ece")?.avgScore ?? "N/A",
    r.departments.find((d) => d.deptId === "ds")?.avgScore ?? "N/A",
    r.departments.find((d) => d.deptId === "me")?.avgScore ?? "N/A",
    r.departments.find((d) => d.deptId === "ee")?.avgScore ?? "N/A",
    r.industryDemand,
    r.gap > 0 ? `-${r.gap}` : `+${Math.abs(r.gap)}`,
  ]);

  return (
    <DashboardShell title="Skill Matrix">
      <InstitutionBreadcrumb />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Department-Scoped Skill Intelligence</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Curriculum-relevant competencies and job-oriented readiness mappings tailored for each engineering branch.
          </p>
        </div>

        {selectedDept === "all" && mainTab === "heatmap" && (
          <div className="flex items-center gap-2">
            <ExportDropdown
              filename="institutional_skill_matrix"
              title="Institutional Skill & Competency Heatmap"
              headers={crossDeptHeaders}
              rows={crossDeptRows}
              label="Export Matrix"
            />
          </div>
        )}
      </div>

      {/* Top View Toggle: Skill Demand & Emerging Intelligence vs Competency Heatmap */}
      <div className="mb-6 flex border-b border-border/80">
        <button
          onClick={() => setMainTab("demand")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all",
            mainTab === "demand"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:border-border hover:text-ink"
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>Skill Demand &amp; Emerging Skills Intelligence</span>
          <Badge tone="accent" className="ml-1 text-[10px] px-1.5 py-0">New</Badge>
        </button>
        <button
          onClick={() => setMainTab("heatmap")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all",
            mainTab === "heatmap"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:border-border hover:text-ink"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Department Competency Heatmap &amp; Gap Matrix</span>
        </button>
      </div>

      {mainTab === "demand" ? (
        demandIntelligence ? (
          <SkillDemandIntelligenceView intelligence={demandIntelligence} />
        ) : (
          <div className="py-20 text-center text-xs text-ink-muted animate-pulse">
            Loading Skill Demand &amp; Emerging Skills Intelligence...
          </div>
        )
      ) : (
        <>
          {/* Department Scoping Tabs */}
          <div className="mb-6 flex overflow-x-auto pb-1 scrollbar-thin">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1.5 shadow-2xs">
              {departmentTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedDept === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedDept(tab.id);
                      setSearch("");
                      setCategoryFilter("All");
                    }}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                      isActive
                        ? "bg-accent text-white shadow-xs"
                        : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

      {/* ─── Department Specific View ─────────────────────────────────── */}
      {selectedDept !== "all" && departmentProfiles[selectedDept] && (
        <DepartmentSkillView profile={departmentProfiles[selectedDept]} />
      )}

      {/* ─── Cross-Department View ────────────────────────────────────── */}
      {selectedDept === "all" && (
        <div className="space-y-6">
          {/* Cohort summary cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Batch Readiness Progression</CardTitle>
                  <CardDescription>Employability readiness and assessment coverage by year</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cohortAnalytics.batchComparison.map((batch) => (
                    <div key={batch.batch}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-ink">{batch.batch}</span>
                        <span className="font-mono text-ink-muted tabular">
                          {batch.avgReadiness}% ready · {batch.assessedPercent}% assessed
                        </span>
                      </div>
                      <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-surface-raised">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            batch.avgReadiness >= 65
                              ? "bg-emerald-500"
                              : batch.avgReadiness >= 45
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          )}
                          style={{ width: `${batch.avgReadiness}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Technical Domain Benchmarks</CardTitle>
                  <CardDescription>Average performance across department-scoped curriculum clusters</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cohortAnalytics.categoryBreakdown.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-ink">{cat.category}</span>
                        <span className="font-mono text-ink-muted tabular">
                          {cat.avgScore} avg score · {cat.skillCount} modules
                        </span>
                      </div>
                      <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-surface-raised">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            cat.avgScore >= 60
                              ? "bg-accent"
                              : cat.avgScore >= 45
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          )}
                          style={{ width: `${cat.avgScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Curriculum Relevance Guide Banner */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 font-bold text-xs text-ink">
              <Compass className="h-4 w-4 text-accent" />
              <span>Department Curriculum Scope Directory</span>
            </div>
            <p className="text-[11px] text-ink-muted mb-3">
              Each department is evaluated strictly against its curriculum & target recruiter roles. Irrelevant skills are omitted (`—`) rather than tested with artificial scores:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {Object.entries(departmentSkillMap).map(([id, info]) => (
                <div key={id} className="rounded-lg bg-surface-raised/50 p-2.5 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-ink">{info.shortName}</span>
                    <span className="text-[10px] text-ink-faint">{info.name}</span>
                  </div>
                  <p className="text-[10px] text-ink-muted leading-relaxed">
                    {info.categories.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Table View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 bg-surface-raised/60 p-1 rounded-lg border border-border w-fit">
              <button
                onClick={() => setAllViewScope("common")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                  allViewScope === "common"
                    ? "bg-surface text-ink shadow-xs border border-border"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Universal Engineering Competencies
              </button>
              <button
                onClick={() => setAllViewScope("full")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                  allViewScope === "full"
                    ? "bg-surface text-ink shadow-xs border border-border"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Comprehensive Matrix (With Out-of-Scope Omissions)
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills…"
                className="h-9 w-44 sm:w-56 rounded-lg border border-border bg-surface px-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
              >
                {currentCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {allViewScope === "common" && (
            <div className="rounded-lg bg-accent-soft/40 border border-accent/20 px-3 py-2 text-xs text-ink-muted flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span>
                Comparing foundational skills assessed universally across all branches: Problem Solving, Technical Communication, Math, Basic Coding & Git.
              </span>
            </div>
          )}

          {allViewScope === "full" && (
            <div className="rounded-lg bg-surface-raised border border-border px-3 py-2 text-xs text-ink-muted flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-ink-muted">—</span>
              <span>
                Dashes indicate the skill is not in that department&apos;s curriculum (e.g. CAD/CAM is omitted for CSE/IT; Docker and Cybersecurity are omitted for ME/EE).
              </span>
            </div>
          )}

          {/* Heatmap */}
          <SkillHeatmap data={sorted} />

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] text-ink-faint">
            <div className="flex items-center gap-3">
              <span>Proficiency Score Scale:</span>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-5 rounded bg-rose-100 border border-rose-200" /> <span>&lt;25</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-5 rounded bg-orange-100 border border-orange-200" /> <span>25-39</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-5 rounded bg-amber-100 border border-amber-200" /> <span>40-54</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-5 rounded bg-emerald-50 border border-emerald-200" /> <span>55-69</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-5 rounded bg-emerald-100 border border-emerald-300" /> <span>70+</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="h-3 w-5 rounded bg-surface-raised border border-dashed border-border" /> <span>— Omitted</span>
              </div>
            </div>

            <span>
              Showing {sorted.length} competencies · Click individual department tabs above for subject & job-role breakdowns
            </span>
          </div>
        </div>
      )}
        </>
      )}
    </DashboardShell>
  );
}
