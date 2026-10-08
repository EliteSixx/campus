"use client";

import { useState } from "react";
import type { DepartmentSkillProfile } from "@/data/institution/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import {
  BookOpen,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Users,
  Target,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DepartmentSkillView({ profile }: { profile: DepartmentSkillProfile }) {
  const [activeTab, setActiveTab] = useState<"curriculum" | "jobRoles">("curriculum");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredSkills = profile.skills.filter(
    (s) => selectedCategory === "All" || s.category === selectedCategory
  );

  const avgDeptScore = Math.round(
    profile.skills.reduce((acc, s) => acc + s.studentAvg, 0) / profile.skills.length
  );
  const criticalGaps = profile.skills.filter((s) => s.gap >= 15);
  const metBenchmarks = profile.skills.filter((s) => s.benchmarkMet);

  // Prepare export data
  const exportHeaders = [
    "Skill Name",
    "Category",
    "Curriculum Subject",
    "Subject Code",
    "Semester",
    "Student Avg",
    "Industry Demand",
    "Gap",
    "Students Assessed",
    "Status",
  ];
  const exportRows = filteredSkills.map((s) => [
    s.name,
    s.category,
    s.curriculumSubject,
    s.subjectCode,
    s.semester,
    s.studentAvg,
    s.industryDemand,
    s.gap > 0 ? `-${s.gap}` : `+${Math.abs(s.gap)}`,
    s.studentsAssessed,
    s.benchmarkMet ? "Benchmark Met" : "Gap Identified",
  ]);

  return (
    <div className="space-y-5">
      {/* Department Summary Header Banner */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent border border-accent/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">{profile.deptName}</h3>
                <span className="rounded-md bg-surface-raised px-2 py-0.5 text-xs font-bold text-ink-muted border border-border">
                  {profile.deptShortName}
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Curriculum-mapped technical skill tracking & industry job role alignment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportDropdown
              filename={`${profile.deptId}_department_skill_matrix`}
              title={`${profile.deptName} Skill & Job Role Matrix`}
              headers={exportHeaders}
              rows={exportRows}
              label={`Export ${profile.deptShortName} Data`}
            />
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-border/60 pt-4">
          <div className="rounded-lg bg-surface-raised/40 p-2.5 border border-border/40">
            <p className="text-[11px] font-medium text-ink-muted">Domain Competencies</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-ink">{profile.skills.length}</p>
          </div>
          <div className="rounded-lg bg-surface-raised/40 p-2.5 border border-border/40">
            <p className="text-[11px] font-medium text-ink-muted">Dept Average Score</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-ink">{avgDeptScore}/100</p>
          </div>
          <div className="rounded-lg bg-surface-raised/40 p-2.5 border border-border/40">
            <p className="text-[11px] font-medium text-ink-muted">Critical Curricular Gaps</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-danger">{criticalGaps.length}</p>
          </div>
          <div className="rounded-lg bg-surface-raised/40 p-2.5 border border-border/40">
            <p className="text-[11px] font-medium text-ink-muted">Target Industry Roles</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-accent">{profile.jobRoles.length}</p>
          </div>
        </div>
      </div>

      {/* View Switcher: Curriculum vs Job Roles */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1.5 bg-surface-raised/60 p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab("curriculum")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "curriculum"
                ? "bg-surface text-ink shadow-xs border border-border"
                : "text-ink-muted hover:text-ink"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Subject-Oriented Skill Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("jobRoles")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "jobRoles"
                ? "bg-surface text-ink shadow-xs border border-border"
                : "text-ink-muted hover:text-ink"
            )}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Job-Oriented Role Readiness</span>
            <span className="ml-1 rounded-full bg-accent/15 px-1.5 py-0.2 text-[10px] font-bold text-accent">
              {profile.jobRoles.length}
            </span>
          </button>
        </div>

        {activeTab === "curriculum" && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-muted hidden sm:inline">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
            >
              <option value="All">All Categories</option>
              {profile.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ─── View 1: Subject-Oriented Curriculum Skill Matrix ─────────── */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-raised/60 text-ink-muted font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3 text-left min-w-[200px]">Curriculum Subject & Code</th>
                  <th className="px-3 py-3 text-left min-w-[180px]">Assessed Competency</th>
                  <th className="px-3 py-3 text-center min-w-[100px]">Category</th>
                  <th className="px-3 py-3 text-center min-w-[70px]">Sem</th>
                  <th className="px-3 py-3 text-center min-w-[85px]">Student Avg</th>
                  <th className="px-3 py-3 text-center min-w-[85px]">Demand</th>
                  <th className="px-3 py-3 text-center min-w-[90px]">Gap</th>
                  <th className="px-3 py-3 text-center min-w-[120px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSkills.map((skill) => {
                  return (
                    <tr key={skill.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink text-xs">{skill.curriculumSubject}</p>
                        <p className="text-[11px] font-mono text-ink-muted">{skill.subjectCode}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-ink">{skill.name}</span>
                        <p className="text-[10px] text-ink-faint">{skill.studentsAssessed} assessed</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded-md bg-surface-raised px-2 py-1 text-[10px] font-medium text-ink-muted border border-border/50">
                          {skill.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-ink-muted font-medium">
                        {skill.semester}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex h-7 w-12 items-center justify-center rounded font-mono font-bold tabular text-xs",
                            skill.studentAvg >= 70
                              ? "bg-emerald-100 text-emerald-800"
                              : skill.studentAvg >= 55
                              ? "bg-emerald-50 text-emerald-700"
                              : skill.studentAvg >= 40
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          )}
                        >
                          {skill.studentAvg}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-semibold text-ink tabular">
                        {skill.industryDemand}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {skill.gap > 0 ? (
                          <span
                            className={cn(
                              "font-mono font-bold tabular",
                              skill.gap >= 20 ? "text-danger" : "text-warning"
                            )}
                          >
                            -{skill.gap}
                          </span>
                        ) : (
                          <span className="font-mono font-semibold text-success tabular">
                            +{Math.abs(skill.gap)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {skill.benchmarkMet ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Benchmark Met
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                            <AlertTriangle className="h-3 w-3" />
                            Gap Identified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Curriculum Gap Action Advisory */}
          {criticalGaps.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Curricular Action Advisory for {profile.deptShortName} HOD
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {criticalGaps.map((g) => g.name).join(", ")} show substantial deficits (&gt;15
                    pts) against active recruiter benchmarks. Integrating practical laboratory modules
                    and vendor workshops in {profile.deptShortName} is recommended prior to campus
                    placement drives.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── View 2: Job-Oriented Role Readiness Matrix ───────────────── */}
      {activeTab === "jobRoles" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {profile.jobRoles.map((role) => (
            <Card key={role.roleId} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-ink">{role.title}</CardTitle>
                    <CardDescription className="text-xs text-ink-muted">
                      Targeted recruitment profile for {profile.deptShortName} graduates
                    </CardDescription>
                  </div>
                  <Badge
                    tone={
                      role.studentReadinessPercent >= 60
                        ? "success"
                        : role.studentReadinessPercent >= 45
                        ? "warning"
                        : "danger"
                    }
                  >
                    {role.studentReadinessPercent}% Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                {/* Readiness Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium text-ink-muted">Cohort Placement Readiness</span>
                    <span className="font-mono font-bold text-ink">
                      {role.studentReadinessPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        role.studentReadinessPercent >= 60
                          ? "bg-emerald-500"
                          : role.studentReadinessPercent >= 45
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      )}
                      style={{ width: `${role.studentReadinessPercent}%` }}
                    />
                  </div>
                </div>

                {/* Required Skills Chips */}
                <div>
                  <span className="text-[11px] font-semibold text-ink">Required Domain Skills:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {role.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="rounded-md bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-ink-muted border border-border"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Recruiters */}
                <div>
                  <span className="text-[11px] font-semibold text-ink">Active Hiring Partners:</span>
                  <p className="text-xs text-ink-muted mt-0.5">{role.topRecruiters.join(" · ")}</p>
                </div>

                {/* Metadata Footprint */}
                <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-ink-muted">
                  <span>Est. Annual Hiring: ~{role.annualOpeningsEstimate} openings</span>
                  <span className="font-semibold text-ink">{role.avgPackageLPA}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
