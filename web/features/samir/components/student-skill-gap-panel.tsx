"use client";

import { useId } from "react";
import type { SkillGapResponse } from "@/lib/ai/client";
import type { DemoJob } from "@/data/demo/types";
import { demoJobs } from "@/data/demo/jobs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";

interface StudentSkillGapPanelProps {
  skillGapData: SkillGapResponse | null;
  selectedRole: string;
  onSelectRole: (role: string) => void;
  isLoading: boolean;
}

export function StudentSkillGapPanel({
  skillGapData,
  selectedRole,
  onSelectRole,
  isLoading,
}: StudentSkillGapPanelProps) {
  const roleSelectId = useId();

  // Selected job info from demoJobs
  const currentJob = demoJobs.find((j) => j.role === selectedRole) ?? demoJobs[0];

  const getPriorityBadge = (priority: "HIGH" | "MEDIUM" | "LOW") => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            HIGH Priority
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            MEDIUM Priority
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            LOW Priority
          </span>
        );
    }
  };

  return (
    <Card className="border-border bg-surface text-ink shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-surface-raised/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                Target Role Skill Gap Analyzer
              </CardTitle>
              <CardDescription className="text-xs text-ink-muted">
                Select industry job profiles from campus drives to calculate real-time skill alignment.
              </CardDescription>
            </div>
          </div>

          {/* Role Picker from web/data/demo/jobs */}
          <div className="flex items-center gap-2">
            <label htmlFor={roleSelectId} className="text-xs font-semibold text-ink-muted shrink-0">
              Target Role:
            </label>
            <select
              id={roleSelectId}
              value={selectedRole}
              onChange={(e) => onSelectRole(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {demoJobs.map((job) => (
                <option key={job.job_id} value={job.role}>
                  {job.role} ({job.company})
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Target Job Quick Context */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-raised/40 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-accent" />
            <span className="font-bold text-ink">{currentJob.role}</span>
            <span className="text-ink-muted">at {currentJob.company}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-ink-muted">
            <span>Min CGPA: <strong className="text-ink">{currentJob.min_cgpa}</strong></span>
            <span>Max Backlogs: <strong className="text-ink">{currentJob.max_backlogs ?? "None"}</strong></span>
            {currentJob.ctc_lpa && (
              <span>CTC: <strong className="text-success">{currentJob.ctc_lpa} LPA</strong></span>
            )}
          </div>
        </div>

        {/* Coverage Progress Bar */}
        {isLoading ? (
          <div className="p-6 text-center text-xs text-ink-muted space-y-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto" />
            <p>Evaluating skill gaps against {selectedRole} requirements...</p>
          </div>
        ) : !skillGapData ? (
          <p className="p-4 text-center text-xs text-ink-muted">
            No skill gap data returned. Update profile to re-evaluate.
          </p>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    Required Skill Coverage
                  </span>
                  <Badge
                    tone={
                      skillGapData.coverage_pct >= 75
                        ? "success"
                        : skillGapData.coverage_pct >= 50
                        ? "warning"
                        : "danger"
                    }
                    className="text-[11px] font-bold"
                  >
                    {skillGapData.coverage_pct}% Match
                  </Badge>
                </div>
                <span className="text-xs font-mono font-bold text-ink">
                  {skillGapData.matched_skills.length} of{" "}
                  {skillGapData.matched_skills.length + skillGapData.missing_skills.length} skills
                </span>
              </div>

              <Progress
                value={skillGapData.coverage_pct}
                barClassName={
                  skillGapData.coverage_pct >= 75
                    ? "bg-success"
                    : skillGapData.coverage_pct >= 50
                    ? "bg-warning"
                    : "bg-danger"
                }
                className="h-3"
              />
            </div>

            {/* Matched Skills */}
            <div className="rounded-xl border border-success/30 bg-success/5 p-4">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-success flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Matched Verified Skills ({skillGapData.matched_skills.length})
                </h4>
                <span className="text-[11px] text-ink-muted">
                  Skills possessed by student matching this role
                </span>
              </div>

              {skillGapData.matched_skills.length === 0 ? (
                <p className="text-xs text-ink-muted italic">
                  No matching skills detected for this profile.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skillGapData.matched_skills.map((skill) => (
                    <Badge
                      key={skill}
                      tone="success"
                      className="gap-1.5 px-3 py-1 text-xs font-bold shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills with Priority Colours */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Missing Skills & Actionable Priority ({skillGapData.missing_skills.length})
                </h4>
                <span className="text-[11px] text-ink-muted">
                  Prioritized by recruiter hiring thresholds
                </span>
              </div>

              {skillGapData.missing_skills.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-success font-semibold p-2">
                  <Sparkles className="h-4 w-4 text-success" />
                  Complete coverage! You meet all required and preferred skills for {selectedRole}.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {skillGapData.missing_skills.map((item) => (
                    <div
                      key={item.skill}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised/40 p-2.5 text-xs transition-colors hover:border-accent/40"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-ink-muted" />
                        <span className="font-bold text-ink">{item.skill}</span>
                      </div>
                      {getPriorityBadge(item.priority)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
