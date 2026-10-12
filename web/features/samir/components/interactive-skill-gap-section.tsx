"use client";

import { useState, useEffect, useId } from "react";
import { skillGap, type SkillGapResponse } from "@/lib/ai/client";
import type { components } from "@/lib/ai/types";
import { demoJobs } from "@/data/demo/jobs";
import { getCurrentStudentAiRecord } from "../data/current-student";

type Student = components["schemas"]["Student"];
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
  RefreshCw,
} from "lucide-react";

export function InteractiveSkillGapSection() {
  const roleSelectId = useId();
  const [selectedRole, setSelectedRole] = useState<string>(demoJobs[0].role);
  const [skillGapData, setSkillGapData] = useState<SkillGapResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkillGap = async (roleName: string) => {
    setIsLoading(true);
    setError(null);

    const job = demoJobs.find((j) => j.role === roleName) ?? demoJobs[0];

    // Use the student's saved profile edits if present, else the shared student record.
    let student: Student = getCurrentStudentAiRecord();
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("demo_student_ST001");
      if (stored) {
        try {
          student = JSON.parse(stored);
        } catch {
          // fallback
        }
      }
    }

    try {
      const res = await skillGap({
        student,
        target: {
          role: job.role,
          required_skills: job.required_skills ?? [],
          preferred_skills: job.preferred_skills ?? [],
        },
      });
      setSkillGapData(res);
    } catch (e) {
      console.error("Skill gap request failed", e);
      setError("We couldn't load your skill gap right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGap(selectedRole);
  }, [selectedRole]);

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
    <Card className="border-border bg-surface text-ink shadow-sm overflow-hidden mt-8">
      <CardHeader className="border-b border-border/70 bg-surface-raised/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
                Role gap analysis
                <span className="rounded-full bg-accent/20 text-accent px-2 py-0.5 text-[10px] font-bold">
                  AI
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-ink-muted">
                Pick a campus hiring role to see which skills you already have and which to learn next.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor={roleSelectId} className="text-xs font-semibold text-ink-muted shrink-0">
              Switch Role:
            </label>
            <select
              id={roleSelectId}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
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

      <CardContent className="p-5 space-y-5">
        {/* Job Metadata Strip */}
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
              <span>Offered CTC: <strong className="text-success">{currentJob.ctc_lpa} LPA</strong></span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-xs text-ink-muted space-y-2">
            <RefreshCw className="h-4 w-4 animate-spin text-accent mx-auto" />
            <p>Comparing your skills with the {selectedRole} role...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchSkillGap(selectedRole)}
              className="font-bold hover:underline"
            >
              Retry
            </button>
          </div>
        ) : skillGapData ? (
          <>
            {/* Coverage Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    Role Skill Coverage
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
                  {skillGapData.matched_skills.length} matched /{" "}
                  {skillGapData.matched_skills.length + skillGapData.missing_skills.length} total
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
                className="h-2.5"
              />
            </div>

            {/* Matched and Missing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="rounded-xl border border-success/30 bg-success/5 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-success flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Matched Verified Skills ({skillGapData.matched_skills.length})
                  </h5>
                </div>
                {skillGapData.matched_skills.length === 0 ? (
                  <p className="text-xs text-ink-muted italic">No matching skills detected.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skillGapData.matched_skills.map((s) => (
                      <Badge key={s} tone="success" className="gap-1 px-2.5 py-0.5 text-xs font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills with Priority Colors */}
              <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Missing Skills ({skillGapData.missing_skills.length})
                  </h5>
                </div>
                {skillGapData.missing_skills.length === 0 ? (
                  <p className="text-xs text-success font-semibold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-success" />
                    100% matched for this role!
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {skillGapData.missing_skills.map((item) => (
                      <div
                        key={item.skill}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-raised/40 px-2.5 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3 w-3 text-ink-muted" />
                          <span className="font-semibold text-ink">{item.skill}</span>
                        </div>
                        {getPriorityBadge(item.priority)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
