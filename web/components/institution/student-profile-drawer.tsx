"use client";

import { useState } from "react";
import { X, Award, Briefcase, Calendar, Mail, GraduationCap, CheckCircle2, BookmarkPlus, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InstitutionStudent, PlacementStatus } from "@/data/institution/types";
import { cn } from "@/lib/utils";

interface StudentProfileDrawerProps {
  student: InstitutionStudent | null;
  onClose: () => void;
}

const statusConfig: Record<PlacementStatus, { tone: "success" | "warning" | "neutral" | "danger" | "accent" | "cyan"; label: string }> = {
  placed: { tone: "success", label: "Placed" },
  interning: { tone: "cyan", label: "Interning" },
  seeking: { tone: "warning", label: "Seeking Placement" },
  "not-assessed": { tone: "neutral", label: "Not Assessed" },
};

export function StudentProfileDrawer({ student, onClose }: StudentProfileDrawerProps) {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!student) return null;

  const status = statusConfig[student.placementStatus];

  const handleAction = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const getScoreColor = (val: number) => {
    if (val >= 75) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (val >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface-raised/40">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white font-bold text-base shadow-md shadow-accent/20">
              {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">{student.name}</h3>
                <Badge tone={status.tone} className="text-[10px]">
                  {status.label}
                </Badge>
              </div>
              <p className="font-mono text-xs text-accent font-semibold">{student.regId} · {student.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action toast if triggered */}
        {actionFeedback && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-surface-raised/40 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Readiness</p>
              <p className={cn("mt-1 font-mono text-2xl font-bold tabular", student.skillReadiness >= 70 ? "text-emerald-500" : student.skillReadiness >= 45 ? "text-amber-500" : "text-rose-500")}>
                {student.skillReadiness}%
              </p>
              <p className="text-[10px] text-ink-faint">Industry benchmark</p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised/40 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Employability</p>
              <p className={cn("mt-1 font-mono text-2xl font-bold tabular", student.employabilityScore >= 70 ? "text-emerald-500" : student.employabilityScore >= 45 ? "text-amber-500" : "text-rose-500")}>
                {student.employabilityScore}
              </p>
              <p className="text-[10px] text-ink-faint">Score / 100</p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised/40 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Cohort Year</p>
              <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{student.year.split(" ")[0]}</p>
              <p className="text-[10px] text-ink-faint">Graduating 2026</p>
            </div>
          </div>

          {/* Core Profile Details */}
          <div className="rounded-xl border border-border p-4 space-y-3 bg-surface">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-accent" /> Student Academic Profile
            </h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-ink-faint block text-[10px]">Email Address</span>
                <span className="font-medium text-ink flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3 text-ink-faint" />
                  {student.email}
                </span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">Primary Department</span>
                <span className="font-medium text-ink mt-0.5 block">{student.department}</span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">Target Career Track</span>
                <span className="font-semibold text-accent mt-0.5 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {student.careerGoal}
                </span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">Assessment Timestamp</span>
                <span className="font-medium text-ink mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-ink-faint" />
                  {student.assessedDate ?? "Assessment Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Skill Competency Breakdown */}
          <div className="rounded-xl border border-border p-4 space-y-3 bg-surface">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Award className="h-4 w-4 text-accent" /> Competency Breakdown
              </h4>
              <span className="text-[10px] text-ink-faint">{student.topSkills.length} assessed skills</span>
            </div>

            <div className="space-y-2.5">
              {student.topSkills.map((skill) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink">{skill.name}</span>
                    <span className={cn("font-mono font-bold text-xs tabular", skill.score >= 75 ? "text-emerald-500" : skill.score >= 50 ? "text-amber-500" : "text-rose-500")}>
                      {skill.score}/100
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        skill.score >= 75 ? "bg-emerald-500" : skill.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intervention & Administrative Recommendations */}
          <div className="rounded-xl border border-dashed border-border p-4 space-y-3 bg-surface-raised/20">
            <h4 className="text-xs font-bold text-ink">Institutional Guidance & Next Steps</h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>
                  {student.skillReadiness >= 70
                    ? "Eligible for tier-1 campus hiring drives and high-stipend corporate internships."
                    : "Recommended for 3-week Cloud & System Architecture bridge workshop."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>Mentor match available in: {student.careerGoal}.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="border-t border-border p-4 bg-surface-raised/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction(`Dossier for ${student.name} downloaded.`)}
            >
              <Download className="h-3.5 w-3.5" />
              Download Dossier
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction(`${student.name} flagged for placement priority.`)}
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Flag for TPO
            </Button>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAction(`Bridge course assigned to ${student.name}.`)}
          >
            Assign Bridge Module
          </Button>
        </div>
      </div>
    </div>
  );
}
