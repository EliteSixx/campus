"use client";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { FacultyDirectory } from "@/components/institution/faculty-directory";
import { facultyAndStaffMembers, facultySummaryStats } from "@/data/institution/mock-faculty";
import { UserCheck, GraduationCap, Award, BookOpen, Building2, Users2 } from "lucide-react";

export default function FacultyPage() {
  const stats = facultySummaryStats;

  return (
    <DashboardShell title="Faculty & Staff Members">
      <InstitutionBreadcrumb />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white shadow-sm">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Faculty & Staff Members Directory</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Institutional academic governance, faculty qualifications, teaching workloads, research output, and technical lab staff.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Users2 className="h-3 w-3 text-ink-muted" /> Total Personnel
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{stats.totalCount}</p>
          <p className="text-[10px] text-ink-faint">on roll</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <GraduationCap className="h-3 w-3 text-accent" /> Teaching Faculty
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-accent tabular">{stats.teachingFaculty}</p>
          <p className="text-[10px] text-ink-faint">professors & lecturers</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Award className="h-3 w-3 text-emerald-500" /> Ph.D. Holders
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-500 tabular">{stats.phdHolders}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{stats.phdPercentage}% of faculty</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Faculty Ratio</p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{stats.studentFacultyRatio}</p>
          <p className="text-[10px] text-ink-faint">AICTE compliant</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Building2 className="h-3 w-3 text-ink-muted" /> Lab & Admin Staff
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{stats.technicalStaff + stats.administrativeStaff}</p>
          <p className="text-[10px] text-ink-faint">technical & operations</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <BookOpen className="h-3 w-3 text-accent" /> R&D Grants
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-accent tabular">{stats.activeConsultancyGrants}</p>
          <p className="text-[10px] text-ink-faint">sponsored research</p>
        </div>
      </div>

      {/* Directory Component */}
      <FacultyDirectory initialMembers={facultyAndStaffMembers} />
    </DashboardShell>
  );
}
