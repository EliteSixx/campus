"use client";

import { useState } from "react";
import type {
  InstitutionalResourceInterventionPlan,
  InstitutionalInterventionPlanItem,
  InterventionCategory,
  InstitutionalPlanPriority,
} from "@/data/institution/types";
import { Badge } from "@/components/ui/badge";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import {
  Sparkles,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  Layers,
  GraduationCap,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Wrench,
  Search,
  Filter,
  UserCheck,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstitutionalResourceInterventionPlanViewProps {
  plan: InstitutionalResourceInterventionPlan;
}

export function InstitutionalResourceInterventionPlanView({
  plan,
}: InstitutionalResourceInterventionPlanViewProps) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(plan.planItems.map((item) => item.category))),
  ];

  const filteredItems = plan.planItems.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.recommendedAction.toLowerCase().includes(search.toLowerCase()) ||
      item.relevantPlacementImpact.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesDept = deptFilter === "all" || item.targetDepartmentIds.includes(deptFilter);
    return matchesSearch && matchesPriority && matchesCategory && matchesDept;
  });

  const exportHeaders = [
    "Intervention Title",
    "Category",
    "Priority",
    "Target Departments",
    "Affected Students",
    "Timeframe",
    "Status",
    "Supporting Evidence",
    "Recommended Action",
    "Relevant Placement Impact",
  ];

  const exportRows = filteredItems.map((item) => [
    item.title,
    item.category,
    item.priority,
    item.targetDepartmentNames.join(", "),
    item.affectedStudentsCount,
    item.timeframe,
    item.operationalStatus,
    `${item.supportingEvidence.skillOrCurriculumGap} | Risk: ${item.supportingEvidence.funnelOrPlacementRisk}`,
    item.recommendedAction,
    item.relevantPlacementImpact,
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Top Executive Metrics Ribbon ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Planned Interventions</span>
            <Layers className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">{plan.totalInterventions}</p>
          <p className="mt-1 text-[11px] text-ink-muted">
            Across 7 institutional action categories
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Critical Interventions</span>
            <Flame className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-rose-500 tabular">
            {plan.criticalCount} Actions
          </p>
          <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            Cloud Bootcamp & Core Robotics Lab
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>High Priority Programs</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-500 tabular">
            {plan.highPriorityCount} Programs
          </p>
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Assessment Drills & CAD Certification
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Graduating Cohort Reach</span>
            <GraduationCap className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular">
            {plan.totalStudentsCovered} Students
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">
            100% of 2024–25 eligible candidates
          </p>
        </div>
      </div>

      {/* ── Resource Allocation & Urgency Guidance ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Resource Allocation & Operational Modality Guidance</h3>
              <p className="text-xs text-ink-muted">
                Synthesizes pedagogical mode, urgency, and institutional rationale supported by recruitment analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plan.resourceAllocationGuidance.slice(0, 4).map((guide, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-border bg-surface-raised/40 p-3.5 space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{guide.category}</span>
                  <Badge
                    tone={guide.urgency === "Immediate" ? "danger" : "warning"}
                    className="text-[10px]"
                  >
                    {guide.urgency}
                  </Badge>
                </div>
                <p className="mt-1.5 text-[11px] text-ink-muted leading-relaxed">
                  {guide.rationale}
                </p>
              </div>
              <div className="text-[10px] text-ink-faint font-mono pt-2 border-t border-border/60">
                {guide.count} active institutional initiative
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Master Institutional Intervention Action Plan ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <Flame className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-ink">Cross-Functional Intervention Action Plan</h3>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Evidence-grounded action items connecting Skill Demand + Curriculum Gaps + Readiness + Funnel Bottlenecks + Active Drives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ExportDropdown
              filename="institutional_resource_intervention_plan"
              title="Institutional Resource & Intervention Action Plan"
              headers={exportHeaders}
              rows={exportRows}
              label="Export Plan"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search interventions or impact…"
              className="h-8.5 w-full rounded-lg border border-border bg-surface pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
            className="h-8.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="h-8.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            aria-label="Filter by department"
            className="h-8.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="all">All Target Departments</option>
            <option value="cse">CSE (Computer Science)</option>
            <option value="it">IT (Information Tech)</option>
            <option value="ds">DS & AI</option>
            <option value="ece">ECE (Electronics & Comm)</option>
            <option value="me">ME (Mechanical)</option>
            <option value="ee">EE (Electrical)</option>
          </select>
        </div>

        {/* Action Items List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-ink-muted">
              No interventions match the selected search and filter criteria.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border p-4.5 transition-all space-y-3",
                  item.priority === "critical"
                    ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                    : item.priority === "high"
                    ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                    : "border-border bg-surface-raised/40 hover:border-border/80"
                )}
              >
                {/* Header Row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-ink">{item.title}</span>
                    <Badge
                      tone={
                        item.priority === "critical"
                          ? "danger"
                          : item.priority === "high"
                          ? "warning"
                          : "neutral"
                      }
                      className="text-[10px] capitalize"
                    >
                      {item.priority} Priority
                    </Badge>
                    <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink border border-border/60">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-ink-faint text-[11px]">{item.timeframe}</span>
                    <Badge
                      tone={
                        item.operationalStatus === "In Execution"
                          ? "success"
                          : item.operationalStatus === "Planned"
                          ? "accent"
                          : "neutral"
                      }
                      className="text-[10px]"
                    >
                      {item.operationalStatus}
                    </Badge>
                  </div>
                </div>

                {/* Supporting Context & Target */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs pt-1">
                  <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint block mb-0.5">
                      Target Departments & Cohort
                    </span>
                    <p className="font-semibold text-ink">
                      {item.targetDepartmentNames.join(", ")}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {item.affectedStudentsCount} students enrolled
                    </p>
                  </div>

                  <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint block mb-0.5">
                      Recruiter & Drive Linkage
                    </span>
                    <p className="font-semibold text-ink">
                      {item.supportingEvidence.targetRecruiterOrDrive || "General Campus Placement"}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      Baseline Readiness: <span className="font-mono text-ink font-semibold">{item.supportingEvidence.readinessScore}%</span>
                    </p>
                  </div>

                  <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
                      Identified Funnel Risk
                    </span>
                    <p className="text-[11px] text-ink leading-relaxed">
                      {item.supportingEvidence.funnelOrPlacementRisk}
                    </p>
                  </div>
                </div>

                {/* Recommended Action & Expected Impact */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1 text-xs">
                  <div className="rounded-lg bg-accent/5 p-3 border border-accent/20">
                    <span className="font-bold text-accent block mb-1">
                      Recommended Action:
                    </span>
                    <p className="text-ink-muted leading-relaxed">
                      {item.recommendedAction}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-500/5 p-3 border border-emerald-500/20">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      Expected Placement Impact:
                    </span>
                    <p className="text-ink-muted leading-relaxed">
                      {item.relevantPlacementImpact}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Departmental Coverage & Priority Summary ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Departmental Intervention Coverage Summary</h3>
              <p className="text-xs text-ink-muted">
                Assures balanced intervention distribution across computer science, electrical, mechanical, and semiconductor branches.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plan.departmentCoverageSummary.map((dept) => (
            <div
              key={dept.deptId}
              className="rounded-xl border border-border bg-surface-raised/40 p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ink">{dept.shortName} Engineering</span>
                <Badge
                  tone={dept.highestPriority === "critical" ? "danger" : "warning"}
                  className="text-[10px] capitalize"
                >
                  {dept.highestPriority} Priority
                </Badge>
              </div>
              <p className="text-[11px] text-ink-muted">
                <span className="font-semibold text-ink">{dept.interventionsCount} active interventions</span> scheduled
              </p>
              <div className="text-[11px] text-ink leading-snug pt-1 border-t border-border/50">
                <span className="font-semibold text-accent">Primary Focus: </span>
                <span className="text-ink-muted">{dept.primaryFocus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
