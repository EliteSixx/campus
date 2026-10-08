"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  Users,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
  Briefcase,
  ChevronRight,
  Clock,
  Flame,
  HelpCircle,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { simulateIntervention } from "@/lib/api/analytics";
import {
  getDepartmentReadinessIntelligence,
  getPriorityInterventionActions,
  getInstitutionalResourceInterventionPlan,
} from "@/lib/api/institution";
import type {
  DepartmentReadinessIntelligence,
  PriorityInterventionAction,
  InstitutionalResourceInterventionPlan,
} from "@/data/institution/types";
import { ReadinessDiagnosticDrawer } from "@/components/institution/readiness-diagnostic-drawer";
import { InstitutionalResourceInterventionPlanView } from "@/components/institution/institutional-resource-intervention-plan-view";
import { cn } from "@/lib/utils";

interface Program {
  id: string;
  name: string;
  skillFocus: string;
  baseline: number;
}

export function InterventionSimulator({
  programs,
  initialReadinessData,
  initialPriorityActions,
}: {
  programs: Program[];
  initialReadinessData?: DepartmentReadinessIntelligence[];
  initialPriorityActions?: PriorityInterventionAction[];
}) {
  const [viewTab, setViewTab] = useState<"action-plan" | "diagnostic-sim">("action-plan");
  const [interventionPlan, setInterventionPlan] = useState<InstitutionalResourceInterventionPlan | null>(null);
  const [readinessData, setReadinessData] = useState<DepartmentReadinessIntelligence[]>(
    initialReadinessData || []
  );
  const [priorityActions, setPriorityActions] = useState<PriorityInterventionAction[]>(
    initialPriorityActions || []
  );
  const [activeDiagnosticDept, setActiveDiagnosticDept] = useState<DepartmentReadinessIntelligence | null>(null);

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [programId, setProgramId] = useState(programs[0]?.id || "p1");
  const [duration, setDuration] = useState("6");
  const [target, setTarget] = useState("143");
  const [baselineReadiness, setBaselineReadiness] = useState<number>(
    programs[0]?.baseline || 48
  );
  const [result, setResult] = useState<{
    before: number;
    after: number;
    increase: number;
    studentsImproved: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load readiness data, priority actions & intervention plan
  useEffect(() => {
    getInstitutionalResourceInterventionPlan().then(setInterventionPlan);
    if (!initialReadinessData || initialReadinessData.length === 0) {
      getDepartmentReadinessIntelligence().then((data) => {
        setReadinessData(data);
      });
    }
    if (!initialPriorityActions || initialPriorityActions.length === 0) {
      getPriorityInterventionActions().then((actions) => {
        setPriorityActions(actions);
      });
    }
  }, [initialReadinessData, initialPriorityActions]);

  const program = programs.find((p) => p.id === programId) ?? programs[0];

  // When a department is selected from the matrix or queue, load its parameters into simulator
  const handleSelectDepartment = (dept: DepartmentReadinessIntelligence) => {
    setSelectedDeptId(dept.deptId);
    setBaselineReadiness(dept.baselineReadiness);
    setTarget(String(dept.targetStudents));

    // Match or approximate suggested program
    const matchedProgram = programs.find(
      (p) =>
        p.name.toLowerCase().includes(dept.suggestedProgramName.toLowerCase()) ||
        dept.suggestedProgramName.toLowerCase().includes(p.skillFocus.toLowerCase())
    );
    if (matchedProgram) {
      setProgramId(matchedProgram.id);
    }
  };

  useEffect(() => {
    startTransition(async () => {
      const res = await simulateIntervention({
        baselineReadiness,
        targetStudents: Number(target) || 0,
        durationWeeks: Number(duration) || 1,
      });
      setResult(res);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId, duration, target, baselineReadiness]);

  // Filter departments for matrix
  const filteredDepartments = useMemo(() => {
    if (statusFilter === "all") return readinessData;
    return readinessData.filter((d) => d.status === statusFilter);
  }, [readinessData, statusFilter]);

  const criticalCount = readinessData.filter((d) => d.status === "critical").length;
  const atRiskCount = readinessData.filter((d) => d.status === "at-risk").length;
  const readyCount = readinessData.filter((d) => d.status === "ready").length;

  const selectedDepartment = readinessData.find((d) => d.deptId === selectedDeptId);

  return (
    <div className="space-y-6">
      {/* ─── Mode Switcher: Institutional Resource & Action Plan vs Diagnostic Matrix & Simulator ─── */}
      <div className="flex border-b border-border/80">
        <button
          onClick={() => setViewTab("action-plan")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all",
            viewTab === "action-plan"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:border-border hover:text-ink"
          )}
        >
          <Flame className="h-4 w-4 text-rose-500" />
          <span>Institutional Resource &amp; Intervention Plan</span>
          <Badge tone="accent" className="ml-1 text-[10px] px-1.5 py-0">Executive</Badge>
        </button>
        <button
          onClick={() => setViewTab("diagnostic-sim")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all",
            viewTab === "diagnostic-sim"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:border-border hover:text-ink"
          )}
        >
          <Activity className="h-4 w-4" />
          <span>Department Readiness Diagnostic &amp; Simulator</span>
        </button>
      </div>

      {viewTab === "action-plan" ? (
        interventionPlan ? (
          <InstitutionalResourceInterventionPlanView plan={interventionPlan} />
        ) : (
          <div className="py-20 text-center text-xs text-ink-muted animate-pulse">
            Loading Institutional Resource &amp; Intervention Plan...
          </div>
        )
      ) : (
        <>
      {/* ─── Institutional Priority Action Queue ─── */}
      {priorityActions.length > 0 && (
        <Card className="border-accent/20 bg-surface shadow-xs">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-500" />
                  Institutional Priority Action Queue
                </CardTitle>
                <CardDescription>
                  Urgent interventions mapped directly to upcoming placement drives, skill bottlenecks, and affected cohorts
                </CardDescription>
              </div>
              <Badge tone="danger" className="text-xs self-start sm:self-auto">
                {priorityActions.length} Actions Requiring Attention
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {priorityActions.map((action) => {
                const actionDept = readinessData.find((d) => d.deptId === action.deptId);
                return (
                  <div
                    key={action.id}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 transition-all duration-150",
                      action.priority === "critical"
                        ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                        : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-ink">
                            {action.deptShortName}
                          </span>
                          <span className="text-xs text-ink-muted font-normal">
                            · {action.affectedStudentsCount} students
                          </span>
                        </div>
                        <Badge
                          tone={action.priority === "critical" ? "danger" : "warning"}
                          className="text-[10px] uppercase font-mono tracking-wider shrink-0"
                        >
                          {action.priority === "critical" ? "Critical" : "High Priority"}
                        </Badge>
                      </div>

                      <h4 className="font-bold text-sm text-ink mb-2">{action.title}</h4>

                      <div className="space-y-1.5 text-xs text-ink-muted mb-3">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span>
                            Target Drive: <strong className="text-ink">{action.targetDrive}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>
                            Date: <span className="font-mono text-ink">{action.driveDate}</span> ({action.suggestedDuration})
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-ink-muted bg-surface/90 rounded-lg p-2.5 border border-border/50 leading-relaxed font-medium">
                        {action.recommendedRemediation}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                      {actionDept && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveDiagnosticDept(actionDept)}
                          className="h-7 text-xs font-semibold text-ink-muted hover:text-ink gap-1"
                        >
                          <HelpCircle className="h-3 w-3" />
                          <span>Why At Risk?</span>
                        </Button>
                      )}
                      {actionDept && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSelectDepartment(actionDept)}
                          className="h-7 text-xs font-semibold text-accent gap-1 ml-auto"
                        >
                          <span>Simulate Impact</span>
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Department Readiness & At-Risk Diagnostic Matrix ─── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Placement Readiness &amp; Cohort Risk Intelligence
              </CardTitle>
              <CardDescription>
                Deterministic risk classification identifying departments at risk, root causes, active drives, and prioritized interventions
              </CardDescription>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
                  statusFilter === "all"
                    ? "bg-surface-raised text-ink border-border shadow-xs"
                    : "text-ink-muted border-transparent hover:bg-surface-raised/50"
                )}
              >
                All ({readinessData.length})
              </button>
              <button
                onClick={() => setStatusFilter("critical")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1",
                  statusFilter === "critical"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    : "text-rose-500/80 border-transparent hover:bg-rose-500/10"
                )}
              >
                <span>Critical</span>
                <span className="font-mono text-[10px] bg-rose-500/20 px-1 rounded">{criticalCount}</span>
              </button>
              <button
                onClick={() => setStatusFilter("at-risk")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1",
                  statusFilter === "at-risk"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "text-amber-500/80 border-transparent hover:bg-amber-500/10"
                )}
              >
                <span>At Risk</span>
                <span className="font-mono text-[10px] bg-amber-500/20 px-1 rounded">{atRiskCount}</span>
              </button>
              <button
                onClick={() => setStatusFilter("ready")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1",
                  statusFilter === "ready"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "text-emerald-500/80 border-transparent hover:bg-emerald-500/10"
                )}
              >
                <span>Ready</span>
                <span className="font-mono text-[10px] bg-emerald-500/20 px-1 rounded">{readyCount}</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map((dept) => {
              const isSelected = selectedDeptId === dept.deptId;

              const statusBadgeTone =
                dept.status === "critical"
                  ? "danger"
                  : dept.status === "at-risk"
                  ? "warning"
                  : "success";

              const priorityTone =
                dept.priority === "high"
                  ? "danger"
                  : dept.priority === "medium"
                  ? "warning"
                  : "neutral";

              return (
                <div
                  key={dept.deptId}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-4 transition-all duration-150",
                    isSelected
                      ? "border-accent bg-accent/5 ring-2 ring-accent/20 shadow-xs"
                      : "border-border bg-surface hover:border-border/80"
                  )}
                >
                  <div>
                    {/* Dept header + Status badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-ink">{dept.shortName}</span>
                          <span className="text-xs text-ink-muted font-normal">· {dept.totalStudents} students</span>
                        </div>
                        <p className="text-xs text-ink-muted line-clamp-1">{dept.deptName}</p>
                      </div>
                      <Badge tone={statusBadgeTone} className="text-[10px] uppercase font-mono tracking-wider shrink-0">
                        {dept.status === "critical"
                          ? "Critical"
                          : dept.status === "at-risk"
                          ? "At Risk"
                          : "Ready"}
                      </Badge>
                    </div>

                    {/* Progress Bar & Readiness Metric */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-ink-muted">Placement Ready</span>
                        <strong className="font-mono text-ink">{dept.placementReadyPercent}%</strong>
                      </div>
                      <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            dept.status === "critical"
                              ? "bg-rose-500"
                              : dept.status === "at-risk"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          )}
                          style={{ width: `${dept.placementReadyPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Diagnostic Readiness Factors */}
                    <div className="mt-3.5 space-y-1.5 border-t border-border/50 pt-2.5 text-[11px]">
                      <div className="flex items-start gap-1.5 text-ink-muted">
                        <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-ink">Deficit: </strong>
                          {dept.primarySkillDeficit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-ink-muted">
                        <ShieldAlert className="h-3 w-3 text-amber-400 shrink-0" />
                        <span>
                          <strong className="text-ink">Policy Block: </strong>
                          {dept.policyDisqualificationPercent}% ineligible (CGPA / backlogs)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-ink-muted">
                        <Briefcase className="h-3 w-3 text-sky-400 shrink-0" />
                        <span>
                          <strong className="text-ink">Drive Scope: </strong>
                          {dept.drivesEligibleCount} of {dept.totalDrivesCount} drives open
                        </span>
                      </div>

                      {/* Connected Active Drives Summary */}
                      {dept.affectedActiveDrives && dept.affectedActiveDrives.length > 0 && (
                        <div className="flex items-center gap-1.5 text-ink-muted">
                          <Clock className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span className="truncate">
                            <strong className="text-ink">Active Drives: </strong>
                            {dept.affectedActiveDrives.slice(0, 2).map((d) => d.companyName).join(", ")}
                            {dept.affectedActiveDrives.length > 2 ? ` +${dept.affectedActiveDrives.length - 2}` : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Recommended Intervention */}
                    <div className="mt-3 rounded-lg bg-surface-raised/60 p-2.5 text-[11px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-ink-muted font-medium text-[10px] uppercase tracking-wider">
                          Recommended Action
                        </span>
                        <Badge tone={priorityTone} className="text-[9px]">
                          {dept.priority === "high"
                            ? "High Priority"
                            : dept.priority === "medium"
                            ? "Medium Priority"
                            : "Routine"}
                        </Badge>
                      </div>
                      <p className="text-ink-muted leading-relaxed font-medium">
                        {dept.recommendedIntervention}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Why At Risk? Drawer + Simulate Remediation */}
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveDiagnosticDept(dept)}
                      className="h-7 text-xs font-semibold text-ink-muted hover:text-ink gap-1"
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>Why At Risk?</span>
                    </Button>
                    <Button
                      variant={isSelected ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleSelectDepartment(dept)}
                      className={cn(
                        "h-7 text-xs font-semibold gap-1",
                        isSelected ? "bg-accent text-white" : "text-accent border-accent/30 hover:bg-accent/10"
                      )}
                    >
                      <span>{isSelected ? "Selected" : "Simulate"}</span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Interactive Intervention Simulator ─── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Intervention Simulator &amp; Remediation Modeler
              </CardTitle>
              <CardDescription>
                Model the projected impact of targeted skill bootcamps before deploying institutional resources
              </CardDescription>
            </div>
            {selectedDepartment && (
              <Badge tone="accent" className="text-xs px-2.5 py-1 shrink-0 self-start sm:self-auto">
                Loaded: {selectedDepartment.shortName} ({selectedDepartment.placementReadyPercent}% baseline)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">Program</label>
              <Select value={programId} onChange={(e) => setProgramId(e.target.value)}>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">Duration</label>
              <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="4">4 Weeks</option>
                <option value="6">6 Weeks</option>
                <option value="8">8 Weeks</option>
                <option value="12">12 Weeks</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">Target students</label>
              <Select value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="35">35 students</option>
                <option value="52">52 students (ME Cohort)</option>
                <option value="75">75 students</option>
                <option value="143">143 students (Campus Pool)</option>
                <option value="220">220 students</option>
                <option value="300">300 students</option>
              </Select>
            </div>
          </div>

          <p className="mt-3 text-xs text-ink-faint">
            Focus skills: <span className="text-ink-muted">{program?.skillFocus || "General Placement Readiness"}</span>
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface-raised/60 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-ink-muted">Current Baseline</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink tabular">
                {result ? `${result.before}%` : "—"}
              </p>
              <p className="text-xs text-ink-faint">Placement ready</p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-ink-faint" />
            </div>

            <div>
              <p className="text-xs text-ink-muted">After Intervention</p>
              <p className={`mt-1 font-mono text-2xl font-semibold tabular ${isPending ? "text-ink-faint" : "text-success"}`}>
                {result ? `${result.after}%` : "—"}
              </p>
              <p className="text-xs text-ink-faint">Estimated placement ready</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 rounded-md border border-border p-3">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <p className="font-mono text-sm font-semibold text-success tabular">
                  +{result ? result.increase : 0}%
                </p>
                <p className="text-xs text-ink-muted">Projected readiness lift</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-md border border-border p-3">
              <Users className="h-4 w-4 text-accent" />
              <div>
                <p className="font-mono text-sm font-semibold text-ink tabular">
                  {result ? result.studentsImproved : 0}
                </p>
                <p className="text-xs text-ink-muted">Students elevated to ready</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* ─── Slide-over Readiness & Risk Diagnostic Drawer ─── */}
      <ReadinessDiagnosticDrawer
        dept={activeDiagnosticDept}
        onClose={() => setActiveDiagnosticDept(null)}
        onSimulate={(dept) => {
          setActiveDiagnosticDept(null);
          handleSelectDepartment(dept);
        }}
      />
    </div>
  );
}
