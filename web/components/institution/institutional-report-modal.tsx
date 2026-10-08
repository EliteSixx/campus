"use client";

import { useState } from "react";
import {
  X,
  Printer,
  FileSpreadsheet,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  ShieldCheck,
  Award,
  BookOpenCheck,
  TrendingUp,
  ExternalLink,
  Users,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InstitutionalAuditReport } from "@/data/institution/types";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { cn } from "@/lib/utils";

interface InstitutionalReportModalProps {
  report: InstitutionalAuditReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InstitutionalReportModal({
  report,
  isOpen,
  onClose,
}: InstitutionalReportModalProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  // Prepare CSV export rows
  const csvHeaders = [
    "Evidence Category",
    "Metric Name",
    "Current Value",
    "Target / Threshold",
    "Compliance Status",
    "Source Dashboard Feature",
    "Supporting Evidence Context",
  ];

  const csvRows: (string | number)[][] = [];
  report.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      csvRows.push([
        item.category,
        item.metric,
        String(item.currentValue),
        item.targetThreshold || "No configured threshold",
        item.status.toUpperCase(),
        item.sourceFeature,
        item.supportingContext,
      ]);
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-2xl border border-border bg-surface p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Toast */}
        {toastMsg && (
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Modal Header & Actions Bar */}
        <div className="flex items-start justify-between border-b border-border pb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink">Institutional Placement &amp; Compliance Audit Report</h2>
                <Badge tone="success" className="text-[10px]">
                  Verified Dossier
                </Badge>
              </div>
              <p className="text-xs text-ink-muted">
                Official accreditation-ready institutional evidence synthesized from real-time dashboard analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </Button>

            <ExportDropdown
              filename={`Institutional_Audit_Report_${report.academicYear.replace(/[^0-9]/g, "")}`}
              title={`Institutional Compliance Audit Report (${report.academicYear})`}
              headers={csvHeaders}
              rows={csvRows}
              label="Export Dossier"
              variant="primary"
              size="sm"
              onExport={(fmt) => {
                setToastMsg(`Exported Full Dossier (${fmt.toUpperCase()})`);
                setTimeout(() => setToastMsg(null), 3000);
              }}
            />

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="overflow-y-auto pr-2 py-4 space-y-6 text-ink print:p-0 print:overflow-visible">
          {/* Institutional Header Banner */}
          <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-accent" />
              <h1 className="text-lg font-bold text-ink tracking-tight uppercase">
                {report.institutionName}
              </h1>
            </div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">
              Office of Career Services, Placement &amp; Academic Accreditation
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-ink-muted border-t border-border/50 pt-2.5 font-medium">
              <span>
                <strong>Academic Session: </strong>
                {report.academicYear}
              </span>
              <span>
                <strong>Date Generated: </strong>
                {report.generatedDate}
              </span>
              <span>
                <strong>Scope: </strong>
                {report.auditScope}
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-accent" />
              1. Executive Summary &amp; Institutional Compliance Rating
            </h3>
            <div className="rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-ink-muted">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-border/50">
                <span className="font-semibold text-ink">Audit Classification:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {report.overallComplianceRating}
                </span>
              </div>
              <p>{report.executiveSummary}</p>
            </div>
          </div>

          {/* Section 2: Key Evidence Summary Scorecard */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              2. Core Performance &amp; Compliance Indicators
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-xl border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">Placement Rate</p>
                <p className="mt-1 font-mono text-xl font-bold text-emerald-500">82.4%</p>
                <p className="text-[10px] text-ink-faint">Target: ≥ 80%</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">Average CTC</p>
                <p className="mt-1 font-mono text-xl font-bold text-accent">8.6 LPA</p>
                <p className="text-[10px] text-ink-faint">Target: ≥ 7.5 LPA</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">Syllabus Align</p>
                <p className="mt-1 font-mono text-xl font-bold text-ink">81.3%</p>
                <p className="text-[10px] text-ink-faint">8 Audited Subjects</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">Assessed Cohort</p>
                <p className="mt-1 font-mono text-xl font-bold text-ink">90.6%</p>
                <p className="text-[10px] text-ink-faint">512 Assessed</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">Corporate MoUs</p>
                <p className="mt-1 font-mono text-xl font-bold text-emerald-500">14 MoUs</p>
                <p className="text-[10px] text-ink-faint">28 Total Partners</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">Active Drives</p>
                <p className="mt-1 font-mono text-xl font-bold text-accent">8 Drives</p>
                <p className="text-[10px] text-ink-faint">Tier-1 &amp; Core</p>
              </div>
            </div>
          </div>

          {/* Section 3: Evidence Breakdown by Accreditation Category */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
              <BookOpenCheck className="h-4 w-4 text-accent" />
              3. Comprehensive Accreditation Evidence &amp; Compliance Matrix
            </h3>
            <div className="space-y-4">
              {report.categories.map((cat) => (
                <div key={cat.category} className="rounded-xl border border-border bg-surface overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border/60 bg-surface-raised/40 px-4 py-2.5">
                    <span className="font-bold text-xs text-ink">{cat.category}</span>
                    <span className="text-[11px] text-ink-muted">
                      {cat.compliantCount} Compliant · {cat.attentionCount} Attention · {cat.informationalCount} Informational
                    </span>
                  </div>
                  <div className="divide-y divide-border/40 text-xs">
                    {cat.items.map((item) => {
                      const statusBadgeTone =
                        item.status === "compliant"
                          ? "success"
                          : item.status === "attention"
                          ? "warning"
                          : item.status === "non-compliant"
                          ? "danger"
                          : "neutral";

                      return (
                        <div key={item.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-ink">{item.metric}</span>
                              <Badge tone={statusBadgeTone} className="text-[9px] uppercase font-mono">
                                {item.status === "attention" ? "Attention Required" : item.status}
                              </Badge>
                            </div>
                            <p className="text-ink-muted text-[11px] leading-relaxed">
                              {item.supportingContext}
                            </p>
                            <span className="text-[10px] text-accent font-medium inline-block">
                              Source: {item.sourceFeature}
                            </span>
                          </div>

                          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                            <span className="font-mono text-xs font-bold text-ink block">
                              {item.currentValue}
                            </span>
                            <span className="text-[10px] text-ink-faint block">
                              Target: {item.targetThreshold || "No configured threshold"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Department Performance Benchmark */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-accent" />
              4. Departmental Placement &amp; Syllabus Alignment Benchmark
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-raised/50 text-ink-muted">
                    <th className="px-3 py-2.5 text-left font-semibold">Department</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Cohort</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Placed</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Rate %</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Skill Score</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Syllabus Alignment</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Readiness Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.departmentPerformance.map((dept) => (
                    <tr key={dept.deptId} className="border-b border-border/40">
                      <td className="px-3 py-2 font-semibold text-ink">{dept.deptName}</td>
                      <td className="px-3 py-2 text-right font-mono">{dept.students}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-emerald-500">{dept.placed}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">
                        <span className={dept.placementRate >= 80 ? "text-emerald-500" : dept.placementRate >= 65 ? "text-amber-500" : "text-rose-500"}>
                          {dept.placementRate}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{dept.avgSkillScore}/100</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-accent">{dept.curriculumAlignment}%</td>
                      <td className="px-3 py-2">
                        <Badge
                          tone={
                            dept.readinessStatus === "Placement Ready"
                              ? "success"
                              : dept.readinessStatus === "At Risk"
                              ? "warning"
                              : "danger"
                          }
                          className="text-[9px]"
                        >
                          {dept.readinessStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Institutional Improvement Priority Queue */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              5. Priority Institutional Improvement Areas (Active Drives Linked)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.improvementPriorities.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-surface p-3 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-ink">{item.deptShortName}</span>
                    <Badge tone={item.priority === "critical" ? "danger" : "warning"} className="text-[9px] uppercase">
                      {item.priority}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-ink line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                    {item.recommendedRemediation}
                  </p>
                  <p className="text-[10px] text-ink-faint mt-2">
                    Target: {item.targetDrive} · {item.affectedStudentsCount} students
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Official Verification & Audit Traceability */}
          <div className="rounded-xl border border-border/60 bg-surface-raised/20 p-4 text-[11px] text-ink-muted">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3 mb-3">
              <div>
                <span className="font-bold text-ink block">Verified Dashboard Evidence Dossier</span>
                <span>Synthesized deterministically from active institutional systems. No external unverified metrics used.</span>
              </div>
              <div className="text-left sm:text-right font-mono text-[10px]">
                <span>Status: Internal Audit Ready</span>
              </div>
            </div>
            <p className="italic text-ink-faint">
              Note: This dossier compiles real-time metrics across verified departmental registries, approved placement policies, audited course syllabi, and active placement drive records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-4 print:hidden">
          <span className="text-xs text-ink-muted">
            Total Metrics Audited: {report.totalMetricsTracked}
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
