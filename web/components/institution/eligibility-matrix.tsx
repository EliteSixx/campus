"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EligibilityMatrixData } from "@/data/institution/types";
import { Users, XCircle, AlertCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface EligibilityMatrixProps {
  data: EligibilityMatrixData;
}

export function EligibilityMatrix({ data }: EligibilityMatrixProps) {
  return (
    <div className="space-y-4">
      {/* Top Level Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-ink-muted font-medium mb-1">Total Students</p>
          <p className="text-2xl font-bold text-ink">{data.totalEligible + data.totalIneligible}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-ink-muted font-medium mb-1">Eligible</p>
          <p className="text-2xl font-bold text-success">{data.totalEligible}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-ink-muted font-medium mb-1">Ineligible</p>
          <p className="text-2xl font-bold text-error">{data.totalIneligible}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-ink-muted font-medium mb-1">Eligibility Rate</p>
          <p className="text-2xl font-bold text-ink">
            {Math.round((data.totalEligible / (data.totalEligible + data.totalIneligible || 1)) * 100)}%
          </p>
        </div>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department Eligibility Matrix</CardTitle>
          <CardDescription>Breakdown of eligible vs ineligible students based on active policies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="py-3 px-2 font-medium">Department</th>
                  <th className="py-3 px-2 font-medium">Total</th>
                  <th className="py-3 px-2 font-medium">Eligible</th>
                  <th className="py-3 px-2 font-medium">Ineligible</th>
                  <th className="py-3 px-2 font-medium">CGPA &lt; {data.policy.minCgpa}</th>
                  <th className="py-3 px-2 font-medium">Backlogs &gt; {data.policy.maxActiveBacklogs}</th>
                  <th className="py-3 px-2 font-medium">Offers &gt;= {data.policy.maxOffersPerStudent}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.departments.map((dept) => (
                  <tr key={dept.deptId} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3 px-2 font-medium text-ink">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent-soft text-[10px] font-bold text-accent">
                          {dept.deptName.split(' ').map(w => w[0]).join('').substring(0, 2)}
                        </div>
                        {dept.deptName}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-ink">{dept.totalStudents}</td>
                    <td className="py-3 px-2 font-semibold text-success">{dept.eligibleCount}</td>
                    <td className="py-3 px-2 font-semibold text-error">{dept.ineligibleCount}</td>
                    <td className="py-3 px-2 text-ink-muted">{dept.ineligibleDueToCgpa}</td>
                    <td className="py-3 px-2 text-ink-muted">{dept.ineligibleDueToBacklogs}</td>
                    <td className="py-3 px-2 text-ink-muted">{dept.ineligibleDueToOffers}</td>
                  </tr>
                ))}
                {data.departments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-ink-muted">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
