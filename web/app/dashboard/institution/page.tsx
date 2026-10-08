import { DashboardShell } from "@/components/shared/dashboard-shell";
import { KPICard } from "@/components/institution/kpi-card";
import { SummaryWidget } from "@/components/institution/summary-widget";
import { DepartmentTable } from "@/components/institution/department-table";
import { GapAnalysisBar } from "@/components/institution/gap-analysis-bar";
import { PipelineFunnel } from "@/components/institution/pipeline-funnel";
import { ExecutiveInsights } from "@/components/institution/executive-insights";
import { InterventionSimulator } from "./intervention-simulator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInstitutionDashboard, getDepartmentReadinessIntelligence, getPriorityInterventionActions } from "@/lib/api/institution";
import { getInstitutionAnalytics } from "@/lib/api/analytics";
import { Users, CheckCircle2, Briefcase, Award, Building2, BarChart3, Handshake, GraduationCap, Sparkles, Calendar, Archive, UserCheck, ShieldCheck, BookOpenCheck } from "lucide-react";
import Link from "next/link";

export default async function InstitutionDashboardPage() {
  const overview = await getInstitutionDashboard();
  const oldAnalytics = await getInstitutionAnalytics();
  const readinessData = await getDepartmentReadinessIntelligence();
  const priorityActions = await getPriorityInterventionActions();
  const k = overview.kpis;

  const findTrend = (metric: string) => overview.trends.find((t) => t.metric === metric);

  return (
    <DashboardShell title="Institution Dashboard">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Institution Command Center</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Comprehensive intelligence across departments, skills, placements, and industry partnerships.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/institution/faculty"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5 text-accent" />
            Faculty & Staff
          </Link>
          <Link
            href="/dashboard/institution/curriculum"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
          >
            <BookOpenCheck className="h-3.5 w-3.5 text-accent" />
            Curriculum Alignment
          </Link>
          <Link
            href="/dashboard/institution/archives"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Accreditation &amp; Archives
          </Link>
          <Link
            href="/dashboard/institution/students"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-ink-muted" />
            Student Directory
          </Link>
          <Link
            href="/dashboard/institution/policies"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-ink-muted" />
            Placement Policies
          </Link>
          <Link
            href="/dashboard/institution/drives"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
          >
            <Briefcase className="h-3.5 w-3.5 text-accent" />
            Placement Drives
          </Link>
          <Link
            href="/dashboard/institution/skills"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Skill Gap Matrix
          </Link>
        </div>
      </div>

      {/* Executive Intelligence & Outlier Callouts Banner */}
      <ExecutiveInsights />

      {/* KPI Row — each card links to its detail page */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard label="Total Students" value={k.totalStudents} icon={Users} trend={findTrend("Assessed Students")} href="/dashboard/institution/students" />
        <KPICard label="Assessed" value={`${k.assessedPercent}%`} icon={CheckCircle2} trend={findTrend("Assessed Students")} href="/dashboard/institution/students" />
        <KPICard label="Placement Ready" value={`${k.placementReadyPercent}%`} icon={Award} trend={findTrend("Placement Ready")} href="/dashboard/institution/students" />
        <KPICard label="Active Internships" value={k.activeInternships} icon={Briefcase} trend={findTrend("Active Internships")} href="/dashboard/institution/internships" />
        <KPICard label="Students Placed" value={k.studentsPlaced} icon={GraduationCap} trend={findTrend("Students Placed")} href="/dashboard/institution/students" />
        <KPICard label="Partners" value={k.totalPartners} icon={Handshake} trend={findTrend("Partner Count")} href="/dashboard/institution/partners" />
      </div>

      {/* Summary Widgets — 2×2 grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Department Summary */}
        <SummaryWidget
          title="Departmental Benchmark"
          description="Skill scores & placement readiness by department"
          icon={Building2}
          href="/dashboard/institution/departments"
        >
          <DepartmentTable data={overview.departmentSummary} />
        </SummaryWidget>

        {/* Top Skill Gaps */}
        <SummaryWidget
          title="Critical Skill Gaps"
          description="Biggest gaps between industry demand and student readiness"
          icon={BarChart3}
          href="/dashboard/institution/skills"
        >
          <GapAnalysisBar data={overview.topSkillGaps} />
        </SummaryWidget>

        {/* Internship Pipeline */}
        <SummaryWidget
          title="Internship & Placement Pipeline"
          description="Current pipeline across all departments"
          icon={Briefcase}
          href="/dashboard/institution/internships"
        >
          <PipelineFunnel data={overview.internshipPipeline} />
        </SummaryWidget>

        {/* Partner Highlights */}
        <SummaryWidget
          title="Corporate Partners"
          description="Top industry partners by engagement"
          icon={Handshake}
          href="/dashboard/institution/partners"
        >
          <div className="space-y-2">
            {overview.partnerHighlights.map((p) => {
              const mouTone = p.mouStatus === "active" ? "success" : p.mouStatus === "expiring-soon" ? "warning" : "neutral";
              return (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-surface-raised/30 px-3 py-2.5 transition-colors hover:bg-surface-raised/50">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-xs font-bold text-accent">
                      {p.initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink">{p.name}</p>
                      <p className="text-[10px] text-ink-faint">{p.studentsHired} hired</p>
                    </div>
                  </div>
                  <Badge tone={mouTone} className="text-[10px]">
                    {p.mouStatus === "active" ? "Active" : p.mouStatus === "expiring-soon" ? "Expiring" : p.mouStatus}
                  </Badge>
                </div>
              );
            })}
          </div>
        </SummaryWidget>
      </div>

      {/* Accreditation Evidence & Compliance Archives Card */}
      <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Accreditation Evidence &amp; Compliance Archives</h3>
              <p className="text-xs text-ink-muted">
                Synthesize audit-ready institutional reports across 6 evidence categories, inspect compliance indicators, and access longitudinal archives (2021–2025).
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/institution/archives"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-opacity shrink-0 self-start sm:self-auto"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Accreditation &amp; Compliance Center
          </Link>
        </div>
      </div>

      {/* Intervention Simulator & Readiness Intelligence */}
      <div className="mt-6">
        <InterventionSimulator
          programs={oldAnalytics.interventionPrograms}
          initialReadinessData={readinessData}
          initialPriorityActions={priorityActions}
        />
      </div>
    </DashboardShell>
  );
}
