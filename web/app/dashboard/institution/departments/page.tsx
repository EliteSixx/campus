"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { DepartmentTable } from "@/components/institution/department-table";
import { SearchFilterBar } from "@/components/institution/search-filter-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { departmentSummaryData } from "@/data/institution/mock-departments";
import type { DepartmentSummaryRow } from "@/data/institution/types";

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");

  const data = departmentSummaryData;

  const filtered = search
    ? data.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.shortName.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  // Summary stats
  const totalStudents = data.reduce((a, d) => a + d.totalStudents, 0);
  const avgReady = Math.round(data.reduce((a, d) => a + d.placementReadyPercent, 0) / data.length);
  const totalPlaced = data.reduce((a, d) => a + d.placedCount, 0);
  const avgSkill = Math.round(data.reduce((a, d) => a + d.avgSkillScore, 0) / data.length);

  return (
    <DashboardShell title="Departments">
      <InstitutionBreadcrumb />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-ink">Departmental Skill & Placement Benchmark</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Compare skill readiness, assessment coverage, and placement performance across departments.
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Students", value: totalStudents },
          { label: "Avg Placement Ready", value: `${avgReady}%` },
          { label: "Total Placed", value: totalPlaced },
          { label: "Avg Skill Score", value: avgSkill },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-surface-raised/30 p-4 text-center">
            <p className="font-mono text-xl font-bold text-ink tabular">{s.value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments…"
        className="mb-4"
      />

      <DepartmentTable data={filtered} />

      <p className="mt-3 text-xs text-ink-faint">
        Click a department row to view detailed skill radar, placement trends, and recruiter feedback.
      </p>
    </DashboardShell>
  );
}
