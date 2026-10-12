"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, Bot, Briefcase, CheckCircle2, Clock, History, Loader2, Play, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { predictPlacement, readiness, skillGap } from "@/lib/ai/client";
import { demoJobs } from "@/data/demo/jobs";
import { cn } from "@/lib/utils";
import { currentStudent } from "../../data/current-student";
import {
  AnswerEvaluation,
  InterviewPlan,
  InterviewReport as Report,
  buildInterviewPlan,
  summariseInterview,
} from "../../data/interview-engine";
import {
  InterviewAttempt,
  loadAiStudent,
  loadInterviewHistory,
  saveInterviewAttempt,
  saveMockInterviewScore,
} from "../../data/interview-history";
import { useCamera } from "./camera-preview";
import { DeviceCheck } from "./device-check";
import { InterviewSession } from "./interview-session";
import { InterviewReport } from "./interview-report";
import { useSpeechRecognition } from "./use-speech";

type Stage = "devices" | "setup" | "analyzing" | "plan" | "interview" | "report";

const STEPS: { stage: Stage[]; label: string }[] = [
  { stage: ["devices"], label: "Mic & camera" },
  { stage: ["setup", "analyzing"], label: "Choose role" },
  { stage: ["plan"], label: "Your plan" },
  { stage: ["interview"], label: "Interview" },
  { stage: ["report"], label: "Feedback" },
];

function defaultRole() {
  const goal = currentStudent.careerGoal.toLowerCase();
  const keyword = goal.split(" ")[0]; // "backend", "frontend", "data", ...
  return demoJobs.find((j) => j.role.toLowerCase().includes(keyword))?.role ?? demoJobs[0].role;
}

const LEVEL_LABEL: Record<InterviewPlan["readinessLevel"], string> = {
  NOT_READY: "Not ready yet",
  DEVELOPING: "Developing",
  READY: "Ready",
  HIGHLY_EMPLOYABLE: "Highly employable",
};

export function MockInterview() {
  const camera = useCamera();
  const { supported: sttSupported } = useSpeechRecognition();
  const [stage, setStage] = useState<Stage>("devices");
  const [voice, setVoice] = useState(true);
  const [role, setRole] = useState(defaultRole);
  const [plan, setPlan] = useState<InterviewPlan | null>(null);
  const [analysisError, setAnalysisError] = useState(false);
  const [history, setHistory] = useState<InterviewAttempt[]>([]);
  const [evaluations, setEvaluations] = useState<AnswerEvaluation[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [readinessAfter, setReadinessAfter] = useState<number | null>(null);
  const [readinessError, setReadinessError] = useState(false);

  useEffect(() => setHistory(loadInterviewHistory()), []);

  const analyze = async () => {
    setStage("analyzing");
    setAnalysisError(false);
    const student = loadAiStudent();
    const job = demoJobs.find((j) => j.role === role) ?? demoJobs[0];
    try {
      // The local AI service analyses the student; its output drives the plan.
      const [r, g, p] = await Promise.all([
        readiness({ student }),
        skillGap({
          student,
          target: { role: job.role, required_skills: job.required_skills ?? [], preferred_skills: job.preferred_skills ?? [] },
        }),
        predictPlacement({ student }).catch((err) => {
          console.warn("Placement risk call skipped/failed", err);
          return null;
        }),
      ]);
      setPlan(buildInterviewPlan({ student, role: job.role, readiness: r, skillGap: g, placementRisk: p }));
      setStage("plan");
    } catch (e) {
      console.error("Mock interview analysis failed", e);
      setAnalysisError(true);
      setStage("setup");
    }
  };

  const finish = async (evals: AnswerEvaluation[]) => {
    if (!plan) return;
    const summary = summariseInterview(plan, evals);
    setEvaluations(evals);
    setReport(summary);
    setReadinessAfter(null);
    setReadinessError(false);
    setStage("report");
    camera.stop();

    const updatedStudent = saveMockInterviewScore(summary.overall);
    let after: number | null = null;
    try {
      after = (await readiness({ student: updatedStudent })).score;
      setReadinessAfter(after);
    } catch (e) {
      console.error("Readiness refresh failed", e);
      setReadinessError(true);
    }
    const attempt: InterviewAttempt = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      role: plan.role,
      overall: summary.overall,
      communication: summary.communication,
      questionCount: plan.questions.length,
      readinessBefore: plan.readinessScore,
      readinessAfter: after,
    };
    saveInterviewAttempt(attempt);
    setHistory(loadInterviewHistory());
  };

  const restart = () => {
    setPlan(null);
    setReport(null);
    setEvaluations([]);
    setStage("devices");
  };

  const activeStep = STEPS.findIndex((s) => s.stage.includes(stage));

  return (
    <div className="space-y-6">
      {/* Header + stepper */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-ink">AI-Assisted Mock Interview</h2>
            <p className="text-sm text-ink-muted">
              Spoken practice interview using a curated question bank and rule-based scoring, planned from your AI readiness and skill gaps.
            </p>
          </div>
        </div>
        <ol className="flex flex-wrap items-center gap-1.5 text-[11px]" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li
              key={s.label}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-1",
                i < activeStep && "border-success/30 bg-success-soft text-success",
                i === activeStep && "border-accent bg-accent-soft font-semibold text-accent",
                i > activeStep && "border-border text-ink-muted"
              )}
              aria-current={i === activeStep ? "step" : undefined}
            >
              {i < activeStep && <CheckCircle2 className="h-3 w-3" />}
              {s.label}
            </li>
          ))}
        </ol>
      </div>

      {stage === "devices" && (
        <DeviceCheck
          camera={camera}
          sttSupported={sttSupported}
          onContinue={({ voice: v }) => {
            setVoice(v);
            setStage("setup");
          }}
        />
      )}

      {(stage === "setup" || stage === "analyzing") && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" />
                <div>
                  <CardTitle>Which role are you preparing for?</CardTitle>
                  <CardDescription>
                    The AI service analyses your profile against this role to select questions from our question bank matching your strengths and gaps.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {demoJobs.map((j) => (
                  <button
                    key={j.job_id}
                    onClick={() => setRole(j.role)}
                    disabled={stage === "analyzing"}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      role === j.role ? "border-accent bg-accent-soft" : "border-border hover:border-accent/40"
                    )}
                    aria-pressed={role === j.role}
                  >
                    <p className="text-sm font-medium text-ink">{j.role}</p>
                    <p className="text-[11px] text-ink-muted">{(j.required_skills ?? []).join(" · ")}</p>
                  </button>
                ))}
              </div>

              {analysisError && (
                <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
                  <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    We couldn&apos;t reach the AI service to analyse your profile. Make sure it&apos;s running, then try again.
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-ink-muted">
                  Answers by {voice ? "voice" : "typing"} · camera {camera.on ? "on" : "off"}
                </p>
                <Button onClick={analyze} disabled={stage === "analyzing"} className="gap-1.5">
                  {stage === "analyzing" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analysing your profile…
                    </>
                  ) : (
                    <>
                      <Target className="h-3.5 w-3.5" /> Analyse my profile and plan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-accent" />
                <CardTitle>Past attempts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-ink-muted">No mock interviews yet. Your first one sets your baseline.</p>
              ) : (
                <ul className="space-y-2">
                  {history.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                      <div>
                        <p className="text-sm text-ink">{a.role}</p>
                        <p className="text-[11px] text-ink-muted">{new Date(a.date).toLocaleDateString()}</p>
                      </div>
                      <Badge tone={a.overall >= 75 ? "success" : a.overall >= 50 ? "warning" : "danger"}>{a.overall}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {stage === "plan" && plan && (
        <div className="space-y-5">
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-accent">AI analysis of your profile</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-ink-muted">Placement readiness</p>
                <p className="font-mono text-2xl font-semibold text-ink">{plan.readinessScore}</p>
                <p className="text-xs text-ink-muted">{LEVEL_LABEL[plan.readinessLevel]}</p>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-ink-muted">You have ({plan.role})</p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.matchedSkills.length ? (
                    plan.matchedSkills.map((s) => <Badge key={s} tone="success">{s}</Badge>)
                  ) : (
                    <span className="text-xs text-ink-muted">None of the required skills yet</span>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-ink-muted">Gaps the AI flagged</p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.missingSkills.length ? (
                    plan.missingSkills.map((m) => (
                      <Badge key={m.skill} tone={m.priority === "HIGH" ? "danger" : m.priority === "MEDIUM" ? "warning" : "neutral"}>
                        {m.skill} · {m.priority.toLowerCase()}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-ink-muted">No gaps for this role</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Your interview plan</CardTitle>
                <CardDescription>
                  {plan.questions.length} questions · about {plan.estimatedMinutes} minutes · each one chosen from your analysis
                </CardDescription>
              </div>
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <Clock className="h-3.5 w-3.5" /> ~{plan.estimatedMinutes} min
              </span>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {plan.questions.map((q, i) => (
                  <li key={q.id} className="flex gap-3 rounded-lg border border-border p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-ink">{q.section}</span>
                        {q.skill && <Badge tone="neutral">{q.skill}</Badge>}
                        <Badge tone="neutral" className="capitalize">{q.difficulty}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">{q.reason}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-ink-muted">
                The questions themselves stay hidden until the interviewer asks them, just like a real interview.
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="ghost" onClick={() => setStage("setup")}>Change role</Button>
                <Button onClick={() => setStage("interview")} className="gap-1.5">
                  <Play className="h-3.5 w-3.5" /> Start interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {stage === "interview" && plan && (
        <InterviewSession
          plan={plan}
          voice={voice}
          camera={camera}
          onFinish={finish}
          onQuit={() => setStage("plan")}
        />
      )}

      {stage === "report" && plan && report && (
        <InterviewReport
          plan={plan}
          evaluations={evaluations}
          report={report}
          readinessAfter={readinessAfter}
          readinessError={readinessError}
          onRetry={restart}
        />
      )}
    </div>
  );
}
