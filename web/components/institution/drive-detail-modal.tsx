"use client";

import { useState } from "react";
import { X, Building2, Calendar, MapPin, Award, CheckCircle2, Download, Users, ShieldAlert, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CampusPlacementDrive, DriveCandidate } from "@/data/institution/types";
import { DriveStageStepper } from "./drive-stage-stepper";
import { cn } from "@/lib/utils";

interface DriveDetailModalProps {
  drive: CampusPlacementDrive | null;
  onClose: () => void;
}

const candidateStatusMap: Record<DriveCandidate["status"], { tone: "success" | "warning" | "cyan" | "accent" | "danger" | "neutral"; label: string }> = {
  registered: { tone: "neutral", label: "Registered" },
  shortlisted: { tone: "cyan", label: "Shortlisted" },
  "in-review": { tone: "warning", label: "In Review" },
  cleared: { tone: "accent", label: "Cleared Round" },
  offered: { tone: "success", label: "Offer Accepted" },
  rejected: { tone: "danger", label: "Not Shortlisted" },
};

export function DriveDetailModal({ drive, onClose }: DriveDetailModalProps) {
  const [candidateSearch, setCandidateSearch] = useState("");
  const [downloadToast, setDownloadToast] = useState(false);

  if (!drive) return null;

  const filteredCandidates = drive.candidates.filter(
    (c) =>
      candidateSearch === "" ||
      c.studentName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.regId.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.department.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const handleExportShortlist = () => {
    const headers = ["Registration ID", "Student Name", "Department", "CGPA", "Current Round", "Status"];
    const rows = drive.candidates.map((c) => [
      c.regId,
      c.studentName,
      c.department,
      c.cgpa.toFixed(1),
      c.currentRound,
      c.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${drive.companyName.toLowerCase().replace(/\s+/g, "_")}_shortlist.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-border bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface-raised/40">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-base font-bold text-accent shadow-xs">
              {drive.companyInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">{drive.companyName}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-accent/10 text-accent border-accent/20">
                  {drive.packageDisplay}
                </span>
              </div>
              <p className="text-xs text-ink-muted font-medium">{drive.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Key Drive Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
              <p className="text-[10px] text-ink-muted">Registered Pool</p>
              <p className="font-mono text-lg font-bold text-ink">{drive.registeredCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
              <p className="text-[10px] text-ink-muted">Eligible Applicants</p>
              <p className="font-mono text-lg font-bold text-emerald-500">{drive.eligibleApplicantCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
              <p className="text-[10px] text-ink-muted">Current Shortlist</p>
              <p className="font-mono text-lg font-bold text-sky-500">{drive.shortlistedCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-raised/30 p-3 text-center">
              <p className="text-[10px] text-ink-muted">Final Offers</p>
              <p className="font-mono text-lg font-bold text-accent">{drive.offersReleased}</p>
            </div>
          </div>

          {/* Institutional Eligibility Constraints */}
          <div className="rounded-xl border border-border bg-surface-raised/20 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-accent" />
              Drive Eligibility & Policy Cutoffs
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div>
                <span className="text-ink-muted">Min CGPA: </span>
                <strong className="font-mono text-ink">{drive.minCgpa.toFixed(1)}</strong>
              </div>
              <div>
                <span className="text-ink-muted">Max Active Backlogs: </span>
                <strong className="font-mono text-ink">{drive.maxBacklogsAllowed}</strong>
              </div>
              <div>
                <span className="text-ink-muted">Drive Date: </span>
                <strong className="text-ink">{drive.driveDate}</strong>
              </div>
            </div>
            <div className="pt-1 text-xs">
              <span className="text-ink-muted">Eligible Disciplines: </span>
              <span className="font-medium text-ink">{drive.eligibleDeptNames.join(", ")}</span>
            </div>
          </div>

          {/* Drive Recruitment Stages Stepper */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Recruitment Round Progression
            </h4>
            <DriveStageStepper rounds={drive.rounds} currentRoundIndex={drive.currentRoundIndex} />
          </div>

          {/* Candidate Shortlist Roster */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Candidate Pipeline Roster ({drive.candidates.length})
                </h4>
                <p className="text-[11px] text-ink-faint">
                  Active applicants tracked across interview rounds
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportShortlist}
                  className="h-8 text-xs font-semibold gap-1 text-ink shrink-0"
                >
                  <Download className="h-3 w-3" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>

            {downloadToast && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>Shortlist CSV exported successfully for {drive.companyName}!</span>
              </div>
            )}

            {filteredCandidates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-ink-muted">
                No candidates found matching the query.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-raised/60 text-[11px] font-semibold text-ink-muted border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Dept</th>
                      <th className="py-2.5 px-3">CGPA</th>
                      <th className="py-2.5 px-3">Current Round</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredCandidates.map((c) => {
                      const cfg = candidateStatusMap[c.status];
                      return (
                        <tr key={c.regId} className="hover:bg-surface-raised/30 transition-colors">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-ink">{c.studentName}</p>
                            <p className="font-mono text-[10px] text-ink-muted">{c.regId}</p>
                          </td>
                          <td className="py-2.5 px-3 text-ink-muted">{c.department}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-ink">{c.cgpa.toFixed(1)}</td>
                          <td className="py-2.5 px-3 text-ink-muted">{c.currentRound}</td>
                          <td className="py-2.5 px-3">
                            <Badge tone={cfg.tone} className="text-[10px]">
                              {cfg.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface flex items-center justify-between">
          <p className="text-xs text-ink-faint">
            Institutional Placement Office · Drive ID: {drive.id}
          </p>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close Panel
          </Button>
        </div>
      </div>
    </div>
  );
}
