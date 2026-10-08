"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  BookOpenCheck,
  Users,
  Briefcase,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Search,
  Filter,
  Download,
  Building2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AccreditationCategorySummary,
  AccreditationEvidenceItem,
  InstitutionalAuditReport,
} from "@/data/institution/types";
import { InstitutionalReportModal } from "@/components/institution/institutional-report-modal";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { cn } from "@/lib/utils";

interface AccreditationComplianceViewProps {
  categories: AccreditationCategorySummary[];
  fullReport: InstitutionalAuditReport;
}

export function AccreditationComplianceView({
  categories,
  fullReport,
}: AccreditationComplianceViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Flatten all items
  const allItems: AccreditationEvidenceItem[] = useMemo(() => {
    return categories.flatMap((c) => c.items);
  }, [categories]);

  // Filtered evidence items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;
      const matchesQuery =
        !searchQuery.trim() ||
        item.metric.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supportingContext.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceFeature.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesStatus && matchesQuery;
    });
  }, [allItems, selectedCategory, selectedStatus, searchQuery]);

  const compliantCount = allItems.filter((i) => i.status === "compliant").length;
  const attentionCount = allItems.filter((i) => i.status === "attention").length;
  const informationalCount = allItems.filter((i) => i.status === "informational").length;

  // CSV export rows
  const csvHeaders = [
    "Category",
    "Metric",
    "Current Value",
    "Target / Threshold",
    "Compliance Status",
    "Source Feature",
    "Supporting Evidence",
  ];
  const csvRows = allItems.map((i) => [
    i.category,
    i.metric,
    String(i.currentValue),
    i.targetThreshold || "No configured threshold",
    i.status.toUpperCase(),
    i.sourceFeature,
    i.supportingContext,
  ]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner: Accreditation Readiness & Audit Overview */}
      <Card className="border-accent/20 bg-surface shadow-xs">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-ink">
                  Institutional Accreditation &amp; Compliance Evidence Dossier
                </h3>
              </div>
              <p className="text-xs text-ink-muted max-w-2xl leading-relaxed">
                Aggregated institutional metrics mapped against academic, syllabus alignment, skill competency, and placement governance criteria.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Generate Official Audit Report</span>
              </Button>

              <ExportDropdown
                filename={`Accreditation_Evidence_Dossier_2024_25`}
                title="Institutional Accreditation Evidence Dataset (2024–25)"
                headers={csvHeaders}
                rows={csvRows}
                label="Export Dataset"
                variant="outline"
                size="sm"
                onExport={(fmt) => {
                  setToastMsg(`Exported Full Evidence Dossier (${fmt.toUpperCase()})`);
                  setTimeout(() => setToastMsg(null), 3500);
                }}
              />
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-border/50 pt-4">
            <div className="rounded-lg bg-surface-raised/40 p-3 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                Total Metrics Tracked
              </span>
              <span className="font-mono text-xl font-bold text-ink mt-0.5 block">
                {allItems.length}
              </span>
              <span className="text-[10px] text-ink-faint">across 6 categories</span>
            </div>

            <div className="rounded-lg bg-emerald-500/10 p-3 text-center border border-emerald-500/20">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Compliant Metrics
              </span>
              <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {compliantCount}
              </span>
              <span className="text-[10px] text-emerald-600/80">meeting target criteria</span>
            </div>

            <div className="rounded-lg bg-amber-500/10 p-3 text-center border border-amber-500/20">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Attention Required
              </span>
              <span className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {attentionCount}
              </span>
              <span className="text-[10px] text-amber-600/80">active bottlenecks</span>
            </div>

            <div className="rounded-lg bg-surface-raised/40 p-3 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                Informational Metrics
              </span>
              <span className="font-mono text-xl font-bold text-ink mt-0.5 block">
                {informationalCount}
              </span>
              <span className="text-[10px] text-ink-faint">no configured threshold</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Category Selection Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search metrics, evidence, sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
          />
        </div>

        {/* Category & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-ink focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="all">All Evidence Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.category} value={c.category}>
                {c.category} ({c.totalMetrics})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-ink focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="compliant">Compliant</option>
            <option value="attention">Attention Required</option>
            <option value="informational">Informational</option>
          </select>
        </div>
      </div>

      {/* Evidence Items Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => {
          const statusTone =
            item.status === "compliant"
              ? "success"
              : item.status === "attention"
              ? "warning"
              : item.status === "non-compliant"
              ? "danger"
              : "neutral";

          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col justify-between rounded-xl border bg-surface p-4 transition-all shadow-xs",
                item.status === "attention"
                  ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                  : "border-border hover:border-accent/40"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge tone="cyan" className="text-[10px] capitalize">
                    {item.category}
                  </Badge>
                  <Badge tone={statusTone} className="text-[9px] uppercase font-mono tracking-wider">
                    {item.status === "attention" ? "Attention Required" : item.status}
                  </Badge>
                </div>

                <h4 className="font-bold text-sm text-ink mb-2">{item.metric}</h4>

                {/* Values Comparison */}
                <div className="rounded-lg bg-surface-raised/60 p-2.5 mb-3 border border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-medium">
                      Current Value
                    </span>
                    <span className="font-mono text-sm font-bold text-ink">
                      {item.currentValue}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-medium">
                      Target / Threshold
                    </span>
                    <span className="font-mono text-xs text-ink-faint">
                      {item.targetThreshold || "No configured threshold"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed font-medium">
                  {item.supportingContext}
                </p>
              </div>

              {/* Traceability Link to Source Feature */}
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-[10px] text-ink-faint">Traceable Evidence</span>
                <Link
                  href={item.sourceHref}
                  className="inline-flex items-center gap-1 font-semibold text-accent hover:underline text-xs"
                >
                  <span>{item.sourceFeature}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-ink-muted">No evidence metrics found matching the selected filters.</p>
        </div>
      )}

      {/* Institutional Improvement Priorities Strip */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Institutional Improvement Priorities (Accreditation Action Plan)
              </CardTitle>
              <CardDescription>
                Identified remediation actions mapped to upcoming corporate placement drives and skill deficits
              </CardDescription>
            </div>
            <Link
              href="/dashboard/institution"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>View Simulator</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fullReport.improvementPriorities.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-surface-raised/40 p-3.5 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-ink">
                      {item.deptShortName}
                    </span>
                    <Badge tone={item.priority === "critical" ? "danger" : "warning"} className="text-[9px] uppercase">
                      {item.priority}
                    </Badge>
                  </div>
                  <h5 className="font-bold text-ink mb-1">{item.title}</h5>
                  <p className="text-ink-muted text-[11px] leading-relaxed font-medium">
                    {item.recommendedRemediation}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[10px] text-ink-faint">
                  <span>Target: {item.targetDrive}</span>
                  <span className="font-mono">{item.driveDate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Official Audit Report Modal */}
      <InstitutionalReportModal
        report={fullReport}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
