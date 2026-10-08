"use client";

import { useState } from "react";
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Briefcase,
  BookOpenCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DepartmentReadinessIntelligence } from "@/data/institution/types";
import { cn } from "@/lib/utils";

interface ReadinessDiagnosticDrawerProps {
  dept: DepartmentReadinessIntelligence | null;
  onClose: () => void;
  onSimulate: (dept: DepartmentReadinessIntelligence) => void;
}

export function ReadinessDiagnosticDrawer({ dept, onClose, onSimulate }: ReadinessDiagnosticDrawerProps) {
  if (!dept) return null;

  const statusBadgeTone =
    dept.status === "critical"
      ? "danger"
      : dept.status === "at-risk"
      ? "warning"
      : "success";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-border bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface-raised/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-ink">
                {dept.shortName}
              </span>
              <Badge tone={statusBadgeTone} className="text-[10px] uppercase font-mono tracking-wider">
                {dept.status === "critical"
                  ? "Critical Risk"
                  : dept.status === "at-risk"
                  ? "At Risk"
                  : "Placement Ready"}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-ink mt-1">{dept.deptName}</h3>
            <p className="text-xs text-ink-muted">
              {dept.totalStudents} students · {dept.placementReadyPercent}% placement ready (Benchmark: 60%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Executive Summary Diagnosis Banner */}
          <div className="rounded-xl border border-border bg-surface-raised/30 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              Executive Risk Diagnosis
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-surface p-2.5 border border-border/60">
                <p className="text-[10px] text-ink-muted">Placement Readiness</p>
                <p
                  className={cn(
                    "font-mono text-xl font-bold mt-0.5",
                    dept.status === "critical"
                      ? "text-rose-500"
                      : dept.status === "at-risk"
                      ? "text-amber-500"
                      : "text-emerald-500"
                  )}
                >
                  {dept.placementReadyPercent}%
                </p>
                <p className="text-[9px] text-ink-faint">{dept.assessedPercent}% assessed</p>
              </div>
              <div className="rounded-lg bg-surface p-2.5 border border-border/60">
                <p className="text-[10px] text-ink-muted">Policy Disqualification</p>
                <p className="font-mono text-xl font-bold text-rose-500 mt-0.5">
                  {dept.policyDisqualificationPercent}%
                </p>
                <p className="text-[9px] text-ink-faint">due to CGPA / backlogs</p>
              </div>
              <div className="rounded-lg bg-surface p-2.5 border border-border/60">
                <p className="text-[10px] text-ink-muted">Campus Drive Scope</p>
                <p className="font-mono text-xl font-bold text-accent mt-0.5">
                  {dept.drivesEligibleCount} / {dept.totalDrivesCount}
                </p>
                <p className="text-[9px] text-ink-faint">active opportunities</p>
              </div>
            </div>
          </div>

          {/* Key Contributing Risk Factors */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Root Risk Factors Contributing to Placement Lag
            </h4>
            <div className="space-y-2">
              {dept.keyRiskFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-xl border p-3.5 text-xs transition-all",
                    factor.severity === "critical"
                      ? "border-rose-500/30 bg-rose-500/5"
                      : factor.severity === "high"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-surface"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-ink flex items-center gap-1.5">
                      {factor.severity === "critical" ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                      ) : factor.severity === "high" ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      {factor.title}
                    </span>
                    <Badge
                      tone={factor.severity === "critical" ? "danger" : factor.severity === "high" ? "warning" : "neutral"}
                      className="text-[9px] uppercase"
                    >
                      {factor.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Placement Drives Impacted */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-accent" />
              Connected Campus Recruitment Drives &amp; Eligibility
            </h4>
            {dept.affectedActiveDrives.length === 0 ? (
              <p className="text-xs text-ink-faint">No active corporate drives currently target this department.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dept.affectedActiveDrives.map((drive) => (
                  <div key={drive.driveId} className="rounded-lg border border-border/80 bg-surface-raised/40 p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">{drive.companyName}</span>
                      <span className="text-[10px] font-mono text-ink-muted">{drive.driveDate}</span>
                    </div>
                    <p className="text-[11px] text-accent font-medium mt-0.5">{drive.role}</p>
                    <p className="text-[10px] text-ink-faint mt-1 capitalize">Status: {drive.status.replace("-", " ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected Curriculum Syllabus Gaps */}
          {dept.curriculumGaps.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <BookOpenCheck className="h-3.5 w-3.5 text-accent" />
                Underlying Curriculum Syllabus Enhancements Identified
              </h4>
              <p className="text-[11px] text-ink-muted">
                Cross-referenced with Curriculum–Industry Alignment Intelligence:
              </p>
              <ul className="space-y-1.5 text-xs">
                {dept.curriculumGaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink-muted">
                    <span className="text-accent font-bold">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Prioritized Action Plan */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Prescribed Institutional Action
            </h4>
            <p className="text-xs font-semibold text-ink">{dept.recommendedIntervention}</p>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Intervention Target: <strong>{dept.targetStudents} students</strong>. Expected to elevate placement readiness by +16%–22% upon module completion.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface flex items-center justify-between">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onSimulate(dept);
              onClose();
            }}
            className="h-8 text-xs font-semibold gap-1 bg-accent text-white"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Simulate Remediation For {dept.shortName}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
