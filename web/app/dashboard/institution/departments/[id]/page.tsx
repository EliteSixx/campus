import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { DeptSkillRadar } from "@/components/institution/dept-skill-radar";
import { PlacementTrendChart } from "@/components/institution/placement-trend-chart";
import { ReadinessDonut } from "@/components/institution/readiness-donut";
import { RecruiterFeedbackList } from "@/components/institution/recruiter-feedback-list";
import { StudentDirectory } from "@/components/institution/student-directory";
import { FacultyDirectory } from "@/components/institution/faculty-directory";
import { DeptSwitcher } from "@/components/institution/dept-switcher";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDepartmentDetail, getDepartmentStudents, getDepartmentList } from "@/lib/api/institution";
import { getFacultyByDepartment } from "@/data/institution/mock-faculty";
import { notFound } from "next/navigation";
import { Users, Award, Target, TrendingUp, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [dept, students, allDepts] = await Promise.all([
    getDepartmentDetail(id),
    getDepartmentStudents(id),
    getDepartmentList(),
  ]);
  if (!dept) return notFound();
  const deptFaculty = getFacultyByDepartment(id);

  return (
    <DashboardShell title={dept.name}>
      <InstitutionBreadcrumb />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-lg font-bold text-accent">
            {dept.shortName}
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">{dept.name}</h2>
            <p className="text-sm text-ink-muted">Head of Department: {dept.hod}</p>
          </div>
        </div>

        <DeptSwitcher
          currentDeptId={id}
          departments={allDepts.map((d) => ({ id: d.id, name: d.name, shortName: d.shortName }))}
        />
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-xs text-ink-muted"><Users className="h-3.5 w-3.5" /> Total Students</div>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{dept.totalStudents}</p>
          <p className="text-xs text-ink-faint">{dept.assessedPercent}% assessed</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-xs text-ink-muted"><Award className="h-3.5 w-3.5" /> Placement Ready</div>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-500 tabular">{dept.placementReadyPercent}%</p>
          <p className="text-xs text-ink-faint">{dept.placedCount} placed this year</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-xs text-ink-muted"><Target className="h-3.5 w-3.5" /> Avg Skill Score</div>
          <p className={cn("mt-1 font-mono text-2xl font-bold tabular", dept.avgSkillScore >= 65 ? "text-emerald-500" : dept.avgSkillScore >= 45 ? "text-amber-500" : "text-rose-500")}>
            {dept.avgSkillScore}
          </p>
          <p className="text-xs text-ink-faint">out of 100</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-xs text-ink-muted"><TrendingUp className="h-3.5 w-3.5" /> Placement Trend</div>
          <p className="mt-1 font-mono text-2xl font-bold text-accent tabular">
            {dept.placementTrend[dept.placementTrend.length - 1]?.rate ?? 0}%
          </p>
          <p className="text-xs text-ink-faint">current year rate</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Skill Radar — Dept vs Industry</CardTitle>
              <CardDescription>Department average scores against industry benchmarks</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DeptSkillRadar data={dept.skillRadar} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Placement Trend</CardTitle>
              <CardDescription>Year-over-year placement count and rate</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <PlacementTrendChart data={dept.placementTrend} />
          </CardContent>
        </Card>
      </div>

      {/* Competencies + Readiness */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Competencies & Gaps</CardTitle>
              <CardDescription>Student avg vs industry demand per skill</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {dept.topCompetencies.map((comp) => {
                const maxVal = Math.max(comp.avgScore, comp.industryDemand, 100);
                const gapColor = comp.gap > 20 ? "text-danger" : comp.gap > 5 ? "text-warning" : comp.gap <= 0 ? "text-success" : "text-ink-muted";
                return (
                  <div key={comp.skill}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">{comp.skill}</span>
                      <span className={cn("font-mono font-bold tabular", gapColor)}>
                        {comp.gap > 0 ? `-${comp.gap}` : `+${Math.abs(comp.gap)}`}
                      </span>
                    </div>
                    <div className="mt-1 relative h-4 w-full overflow-hidden rounded bg-surface-raised">
                      <div className="absolute inset-y-0 left-0 rounded bg-ink-faint/20" style={{ width: `${(comp.industryDemand / maxVal) * 100}%` }} />
                      <div className={cn("absolute inset-y-0 left-0 rounded", comp.gap > 20 ? "bg-danger/60" : comp.gap > 5 ? "bg-warning/60" : "bg-success/60")} style={{ width: `${(comp.avgScore / maxVal) * 100}%` }} />
                      <div className="absolute inset-y-0 w-0.5 bg-ink/50" style={{ left: `${(comp.industryDemand / maxVal) * 100}%` }} />
                    </div>
                    <div className="mt-0.5 flex justify-between text-[10px] text-ink-faint">
                      <span>Student: {comp.avgScore}</span>
                      <span>Demand: {comp.industryDemand}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Readiness Distribution</CardTitle>
              <CardDescription>Student cohort readiness breakdown</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ReadinessDonut data={dept.readinessDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* ─── Student Directory ────────────────────────────────────────── */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>
                Search by name or registration ID · Filter by status or year · Export to CSV
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <StudentDirectory
              students={students}
              departmentName={dept.shortName}
            />
          </CardContent>
        </Card>
      </div>

      {/* ─── Department Faculty & Technical Staff ─────────────────────── */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Department Faculty & Technical Staff</CardTitle>
              <CardDescription>
                Academic mentors, researchers, and lab technical officers in {dept.name}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FacultyDirectory
              initialMembers={deptFaculty}
              departmentFilterDefault={id}
              hideDeptFilter={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recruiter Feedback */}
      <div className="mt-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recruiter Feedback</CardTitle>
              <CardDescription>What industry partners say about students from this department</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <RecruiterFeedbackList feedback={dept.recruiterFeedback} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
