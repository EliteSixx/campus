"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { PolicyConfigurator } from "@/components/institution/policy-configurator";
import { EligibilityMatrix } from "@/components/institution/eligibility-matrix";
import { getPlacementPolicies, getAllInstitutionStudents } from "@/lib/api/institution";
import type { PlacementPolicy, InstitutionStudent, EligibilityMatrixData, DepartmentEligibilityStats } from "@/data/institution/types";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export default function PoliciesPage() {
  const [policy, setPolicy] = useState<PlacementPolicy | null>(null);
  const [students, setStudents] = useState<InstitutionStudent[]>([]);

  useEffect(() => {
    async function load() {
      const [fetchedPolicy, fetchedStudents] = await Promise.all([
        getPlacementPolicies(),
        getAllInstitutionStudents(),
      ]);
      setPolicy(fetchedPolicy);
      setStudents(fetchedStudents);
    }
    load();
  }, []);

  const matrixData = useMemo<EligibilityMatrixData | null>(() => {
    if (!policy || students.length === 0) return null;

    const depts = new Map<string, DepartmentEligibilityStats>();

    let totalEligible = 0;
    let totalIneligible = 0;

    for (const student of students) {
      if (!depts.has(student.deptId)) {
        depts.set(student.deptId, {
          deptId: student.deptId,
          deptName: student.department,
          totalStudents: 0,
          eligibleCount: 0,
          ineligibleCount: 0,
          ineligibleDueToCgpa: 0,
          ineligibleDueToBacklogs: 0,
          ineligibleDueToOffers: 0,
        });
      }

      const stats = depts.get(student.deptId)!;
      stats.totalStudents++;

      const isCgpaIneligible = student.cgpa < policy.minCgpa;
      const isBacklogsIneligible = student.activeBacklogs > policy.maxActiveBacklogs;
      const isOffersIneligible = student.offerCount >= policy.maxOffersPerStudent;

      if (isCgpaIneligible || isBacklogsIneligible || isOffersIneligible) {
        stats.ineligibleCount++;
        totalIneligible++;
        if (isCgpaIneligible) stats.ineligibleDueToCgpa++;
        if (isBacklogsIneligible) stats.ineligibleDueToBacklogs++;
        if (isOffersIneligible) stats.ineligibleDueToOffers++;
      } else {
        stats.eligibleCount++;
        totalEligible++;
      }
    }

    return {
      policy,
      departments: Array.from(depts.values()),
      totalEligible,
      totalIneligible,
    };
  }, [policy, students]);

  if (!policy || !matrixData) {
    return (
      <DashboardShell title="Placement Policies">
        <InstitutionBreadcrumb />
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Placement Policies">
      <InstitutionBreadcrumb />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Placement Policy Monitoring</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Configure institutional eligibility rules and deterministically monitor student readiness across cohorts.
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-warning/30 bg-warning/5 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-warning-dark">Deterministic Evaluation Notice</h4>
          <p className="text-xs text-warning-dark mt-1">
            Eligibility calculations are purely deterministic based on the provided configuration. The matrix updates in real-time as you tweak parameters, helping you estimate placement pool sizes before finalizing official policies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <PolicyConfigurator policy={policy} onPolicyChange={setPolicy} />
        </div>
        <div className="xl:col-span-2">
          <EligibilityMatrix data={matrixData} />
        </div>
      </div>
    </DashboardShell>
  );
}
