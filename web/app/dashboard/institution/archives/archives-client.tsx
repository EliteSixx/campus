"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HISTORICAL_YEARS,
  ARCHIVE_REPORTS,
  type ArchiveReportDefinition,
} from "@/data/institution/mock-archives";
import type {
  AccreditationCategorySummary,
  InstitutionalAuditReport,
} from "@/data/institution/types";
import { AccreditationComplianceView } from "@/components/institution/accreditation-compliance-view";
import {
  Archive,
  Download,
  Calendar,
  Building2,
  Users,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  X,
  Filter,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportDropdown } from "@/components/shared/export-dropdown";

interface ArchivesClientProps {
  initialCategories: AccreditationCategorySummary[];
  initialReport: InstitutionalAuditReport;
}

export function ArchivesClient({
  initialCategories,
  initialReport,
}: ArchivesClientProps) {
  // Top-level View Mode: Accreditation & Compliance vs Historical Cohort Archives
  const [activeTab, setActiveTab] = useState<"accreditation" | "historical">("accreditation");

  // Accreditation data
  const [accreditationCategories] = useState<AccreditationCategorySummary[]>(initialCategories);
  const [fullAuditReport] = useState<InstitutionalAuditReport>(initialReport);

  // Historical archives state
  const [selectedYear, setSelectedYear] = useState<string>("2024-25");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [previewReport, setPreviewReport] = useState<ArchiveReportDefinition | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Custom extractor form state
  const [customYear, setCustomYear] = useState<string>("2024-25");
  const [customDept, setCustomDept] = useState<string>("all");
  const [customScope, setCustomScope] = useState<string>("placements");

  const yearData = HISTORICAL_YEARS[selectedYear] || HISTORICAL_YEARS["2024-25"];

  const filteredDepartments = yearData.departments.filter(
    (d) => deptFilter === "all" || d.deptId === deptFilter
  );

  const filteredReports = ARCHIVE_REPORTS.filter(
    (r) => categoryFilter === "all" || r.category === categoryFilter
  );

  const triggerDownload = (report: ArchiveReportDefinition) => {
    const rows = report.generateRows(yearData.year);
    const csvContent = [
      report.headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedYear}_${report.fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setToastMsg(`Downloaded ${report.title} for ${yearData.year}`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <DashboardShell title="Archives & Compliance Intelligence">
      <InstitutionBreadcrumb />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
              {activeTab === "accreditation" ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <Archive className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">
                Accreditation &amp; Compliance Intelligence Center
              </h2>
              <p className="text-xs text-ink-muted">
                Synthesize audit-ready evidence, generate compliance reports, and inspect multi-year historical archives.
              </p>
            </div>
          </div>
        </div>

        {/* Primary View Toggle: Accreditation vs Historical Archives */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab("accreditation")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "accreditation"
                ? "bg-accent text-white shadow-xs"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink"
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Accreditation &amp; Compliance</span>
          </button>

          <button
            onClick={() => setActiveTab("historical")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "historical"
                ? "bg-accent text-white shadow-xs"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink"
            )}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Historical Archives (2021–2025)</span>
          </button>
        </div>
      </div>

      {/* Download Success Toast */}
      {toastMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─── TAB 1: Accreditation & Compliance Intelligence ─── */}
      {activeTab === "accreditation" && (
        <AccreditationComplianceView
          categories={accreditationCategories}
          fullReport={fullAuditReport}
        />
      )}

      {/* ─── TAB 2: Historical Cohort Archives & Raw Registers ─── */}
      {activeTab === "historical" && (
        <div className="space-y-6">
          {/* Year Selector Sub-header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-raised/40 p-3.5 rounded-xl border border-border">
            <div>
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                Select Academic Session for Historical Inspection
              </span>
              <span className="text-[11px] text-ink-muted">
                Access past cohort dossiers, placed rosters, and archived skill performance
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
              {Object.keys(HISTORICAL_YEARS).map((yKey) => {
                const isSelected = selectedYear === yKey;
                return (
                  <button
                    key={yKey}
                    onClick={() => setSelectedYear(yKey)}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                      isSelected
                        ? "bg-accent text-white shadow-xs"
                        : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                    )}
                  >
                    {HISTORICAL_YEARS[yKey].year}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year Overview KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
                <Users className="h-3 w-3 text-ink-muted" /> Total Cohort
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{yearData.totalStudents}</p>
              <p className="text-[10px] text-ink-faint">{yearData.assessedCount} assessed</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
                <Award className="h-3 w-3 text-emerald-500" /> Placed Count
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-emerald-500 tabular">{yearData.totalPlaced}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{yearData.placementRate}% rate</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3 text-accent" /> Average CTC
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-accent tabular">{yearData.averageCTC}</p>
              <p className="text-[10px] text-ink-faint">campus wide</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Highest CTC</p>
              <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{yearData.highestCTC}</p>
              <p className="text-[10px] text-ink-faint">Top offer</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
                <Building2 className="h-3 w-3 text-ink-muted" /> Recruiters
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{yearData.activeRecruiters}</p>
              <p className="text-[10px] text-ink-faint">companies visited</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Internships</p>
              <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{yearData.totalInternships}</p>
              <p className="text-[10px] text-ink-faint">sponsored projects</p>
            </div>
          </div>

          {/* Downloadable Official Reports Section */}
          <div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-accent" />
                  Download Official Archive Reports ({yearData.year})
                </h3>
                <p className="text-xs text-ink-muted">
                  Standardized administrative datasets prepared for statutory compliance, statutory audits, and placement reviews.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-ink-muted" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-ink focus:border-accent focus:outline-none cursor-pointer"
                >
                  <option value="all">All Report Types</option>
                  <option value="placements">Placements</option>
                  <option value="skills">Skill Audits</option>
                  <option value="internships">Internships</option>
                  <option value="partnerships">Corporate MoUs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-xs hover:border-accent/40 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Badge tone="cyan" className="text-[10px] capitalize">
                        {report.category}
                      </Badge>
                      <span className="font-mono text-[10px] text-ink-faint">{report.format}</span>
                    </div>
                    <h4 className="mt-2.5 text-sm font-bold text-ink leading-snug">{report.title}</h4>
                    <p className="mt-1.5 text-xs text-ink-muted leading-relaxed line-clamp-2">
                      {report.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewReport(report)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>

                    <ExportDropdown
                      filename={`${selectedYear}_${report.fileName}`}
                      title={`${report.title} (${yearData.year})`}
                      headers={report.headers}
                      rows={report.generateRows(yearData.year)}
                      label="Export Report"
                      variant="primary"
                      size="sm"
                      onExport={(fmt) => {
                        setToastMsg(`Exported ${report.title} (${fmt.toUpperCase()}) for ${yearData.year}`);
                        setTimeout(() => setToastMsg(null), 3500);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Breakdown Table for Selected Year */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Departmental Placement &amp; Skill Audit ({yearData.year})</CardTitle>
                      <CardDescription>Performance metrics broken down by individual branch</CardDescription>
                    </div>
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="h-8 rounded-lg border border-border bg-surface px-2 text-xs font-medium text-ink focus:border-accent focus:outline-none"
                    >
                      <option value="all">All Departments</option>
                      <option value="cse">CSE</option>
                      <option value="it">IT</option>
                      <option value="ece">ECE</option>
                      <option value="ds">DS &amp; AI</option>
                      <option value="me">Mechanical</option>
                      <option value="ee">Electrical</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-surface-raised/50 text-ink-muted">
                          <th className="px-3 py-2.5 text-left font-semibold">Department</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Cohort</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Placed</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Rate %</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Skill Score</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Key Recruiter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDepartments.map((dept) => (
                          <tr key={dept.deptId} className="border-b border-border/40 hover:bg-surface-raised/40 transition-colors">
                            <td className="px-3 py-2.5 font-semibold text-ink">{dept.deptName}</td>
                            <td className="px-3 py-2.5 text-right font-mono tabular">{dept.students}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-500 tabular">{dept.placed}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold tabular">
                              <span className={dept.placementRate >= 80 ? "text-emerald-500" : dept.placementRate >= 65 ? "text-amber-500" : "text-rose-500"}>
                                {dept.placementRate}%
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono tabular">{dept.avgScore}/100</td>
                            <td className="px-3 py-2.5 text-ink-muted">{dept.topHiringCompany}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Recruiting Companies That Year */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <div>
                    <CardTitle>Top Recruiters ({yearData.year})</CardTitle>
                    <CardDescription>Major industry hiring partners for this cohort</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {yearData.topRecruiters.map((rec) => (
                      <div
                        key={rec.name}
                        className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-raised/30 p-3 hover:bg-surface-raised/50 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-ink">{rec.name}</p>
                          <p className="text-[10px] text-ink-faint">{rec.domain}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-accent tabular">{rec.hiredCount} hired</span>
                          <span className="text-[10px] text-ink-faint block">{rec.avgPackage} avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Custom Dataset Builder & Extractor */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Custom Historical Data Extractor</CardTitle>
                  <CardDescription>Generate and download custom CSV extracts for any academic year and branch</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4 items-end">
                <div>
                  <label className="text-xs font-semibold text-ink">Academic Session</label>
                  <select
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="2024-25">2024–25 (Previous Cohort)</option>
                    <option value="2023-24">2023–24 Cohort</option>
                    <option value="2022-23">2022–23 Cohort</option>
                    <option value="2021-22">2021–22 Cohort</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Department Scope</label>
                  <select
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="all">All Departments Combined</option>
                    <option value="cse">Computer Science &amp; Engg</option>
                    <option value="it">Information Technology</option>
                    <option value="ece">Electronics &amp; Communication</option>
                    <option value="ds">Data Science &amp; AI</option>
                    <option value="me">Mechanical Engineering</option>
                    <option value="ee">Electrical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Report Category</label>
                  <select
                    value={customScope}
                    onChange={(e) => setCustomScope(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="placements">Placement Outcomes &amp; Salary Offers</option>
                    <option value="skills">Skill Competencies &amp; Benchmarks</option>
                    <option value="internships">Internship Stipends &amp; Durations</option>
                    <option value="partnerships">Corporate Agreements &amp; MoUs</option>
                  </select>
                </div>

                <ExportDropdown
                  filename={`${selectedYear}_custom_${customScope}_${customDept}`}
                  title={`Custom ${customScope.toUpperCase()} Extract (${selectedYear} - ${customDept.toUpperCase()})`}
                  headers={(ARCHIVE_REPORTS.find((r) => r.id.toLowerCase().includes(customScope.toLowerCase())) || ARCHIVE_REPORTS[0]).headers}
                  rows={(ARCHIVE_REPORTS.find((r) => r.id.toLowerCase().includes(customScope.toLowerCase())) || ARCHIVE_REPORTS[0]).generateRows(selectedYear)}
                  label="Generate &amp; Export"
                  variant="primary"
                  size="md"
                  className="w-full [&>button]:w-full"
                  onExport={(fmt) => {
                    setToastMsg(`Exported custom extract (${fmt.toUpperCase()}) for ${selectedYear}`);
                    setTimeout(() => setToastMsg(null), 3500);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Data Preview Modal (Historical) */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">{previewReport.title}</h3>
                <p className="text-xs text-ink-muted">Data Preview for Academic Year {yearData.year}</p>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="rounded-lg p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-raised/60 text-ink">
                    {previewReport.headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewReport.generateRows(yearData.year).slice(0, 8).map((row, idx) => (
                    <tr key={idx} className="border-b border-border/40 hover:bg-surface-raised/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-ink-muted font-mono">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-xs text-ink-faint">Showing first 8 records preview</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewReport(null)}>
                  Close
                </Button>
                <ExportDropdown
                  filename={`${selectedYear}_${previewReport.fileName}`}
                  title={`${previewReport.title} (${yearData.year})`}
                  headers={previewReport.headers}
                  rows={previewReport.generateRows(yearData.year)}
                  label="Export Dataset"
                  variant="primary"
                  size="sm"
                  onExport={(fmt) => {
                    setToastMsg(`Exported ${previewReport.title} (${fmt.toUpperCase()}) for ${yearData.year}`);
                    setTimeout(() => setToastMsg(null), 3500);
                    setPreviewReport(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
