"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bot, ChevronDown, RotateCcw, ThumbsUp, TrendingUp, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/shared/match-score";
import { cn } from "@/lib/utils";
import type { AnswerEvaluation, InterviewPlan, InterviewReport as Report } from "../../data/interview-engine";

function scoreTone(score: number) {
  return score >= 75 ? "success" : score >= 50 ? "warning" : "danger";
}

export function InterviewReport({
  plan,
  evaluations,
  report,
  readinessAfter,
  readinessError,
  onRetry,
}: {
  plan: InterviewPlan;
  evaluations: AnswerEvaluation[];
  report: Report;
  /** null while the AI service is re-scoring readiness */
  readinessAfter: number | null;
  readinessError: boolean;
  onRetry: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const byId = new Map(evaluations.map((e) => [e.questionId, e]));
  const delta = readinessAfter === null ? null : readinessAfter - plan.readinessScore;

  return (
    <div className="space-y-5">
      {/* Headline */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <MatchScore value={report.overall} size="lg" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Interview score</p>
              <p className="text-lg font-semibold text-ink">{plan.role}</p>
              <p className="text-xs text-ink-muted">
                {evaluations.filter((e) => !e.skipped).length} of {plan.questions.length} answered · communication{" "}
                {report.communication}/100
              </p>
            </div>
          </div>

          <div className="flex-1 rounded-lg border border-border bg-surface-raised/40 p-4 sm:ml-auto sm:max-w-xs">
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <TrendingUp className="h-3.5 w-3.5" /> Placement readiness (AI)
            </p>
            {readinessError ? (
              <p className="mt-1 text-xs text-ink-muted">
                Your score was saved. Readiness will update the next time the AI service is reachable.
              </p>
            ) : readinessAfter === null ? (
              <div className="mt-2 h-6 w-32 animate-pulse rounded bg-surface-raised" />
            ) : (
              <p className="mt-1 font-mono text-xl font-semibold text-ink">
                {plan.readinessScore} → {readinessAfter}
                <span
                  className={cn(
                    "ml-2 text-sm",
                    delta! > 0 ? "text-success" : delta! < 0 ? "text-danger" : "text-ink-muted"
                  )}
                >
                  {delta! > 0 ? `+${delta}` : delta}
                </span>
              </p>
            )}
            <p className="mt-1 text-[11px] text-ink-faint">Your interview score now counts toward readiness.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {report.bySection.map((s) => (
            <div key={s.section} className="rounded-lg border border-border p-3">
              <p className="text-[11px] text-ink-muted">{s.section}</p>
              <p className="font-mono text-lg font-semibold text-ink">{s.score}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-raised">
                <div
                  className={cn(
                    "h-full rounded-full",
                    s.score >= 75 ? "bg-success" : s.score >= 50 ? "bg-warning" : "bg-danger"
                  )}
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths & improvements */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-success" />
              <CardTitle>What went well</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {report.strengths.length ? (
              <ul className="space-y-1.5 text-sm text-ink">
                {report.strengths.map((s) => (
                  <li key={s}>• Strong answer on {s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">No answers reached 70 yet. The tips on the right will get you there.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-warning" />
              <CardTitle>Work on next</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {report.improvements.length ? (
              <ul className="space-y-1.5 text-sm text-ink">
                {report.improvements.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">Nothing major. Practise again with a harder role to keep improving.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-question feedback */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Answer-by-answer feedback</CardTitle>
            <CardDescription>Open a question to see your transcript and specific tips</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {plan.questions.map((q, i) => {
            const e = byId.get(q.id);
            const open = openId === q.id;
            const score = e?.score ?? 0;
            return (
              <div key={q.id} className="rounded-lg border border-border">
                <button
                  onClick={() => setOpenId(open ? null : q.id)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                  aria-expanded={open}
                >
                  <span className="font-mono text-xs text-ink-faint">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{q.prompt}</p>
                    <p className="text-[11px] text-ink-muted">
                      {q.section}
                      {q.skill ? ` · ${q.skill}` : ""}
                    </p>
                  </div>
                  <Badge tone={e?.skipped ? "neutral" : scoreTone(score)}>{e?.skipped ? "Skipped" : score}</Badge>
                  <ChevronDown className={cn("h-4 w-4 text-ink-muted transition-transform", open && "rotate-180")} />
                </button>
                {open && e && (
                  <div className="space-y-3 border-t border-border p-3 text-sm">
                    {e.transcript && (
                      <blockquote className="rounded-md bg-surface-raised/60 p-3 text-xs leading-relaxed text-ink-muted">
                        “{e.transcript}”
                      </blockquote>
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px] text-ink-muted">
                      <span>{e.wordCount} words</span>
                      {e.wordsPerMinute !== null && <span>{e.wordsPerMinute} words/min</span>}
                      <span>{e.fillerCount} filler words</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {e.covered.map((c) => (
                        <Badge key={c} tone="success">{c}</Badge>
                      ))}
                      {e.missed.map((c) => (
                        <Badge key={c} tone="neutral" className="opacity-70">{c}</Badge>
                      ))}
                    </div>
                    <ul className="space-y-1 text-xs text-ink">
                      {e.feedback.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Model Architecture & Scoring Methodology */}
      <Card className="border border-border/80 bg-surface-raised/20 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-accent" /> AI-Assisted Architecture &amp; Methodology
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Powered by live Python AI models: Gradient-Boosting Classifier (ROC-AUC 0.857) + all-MiniLM-L6-v2 embeddings + deterministic readiness engine. Transparent, explainable rule-based evaluation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <Badge tone="accent" className="text-[10px]">No LLM Hallucinations</Badge>
            <Badge tone="success" className="text-[10px]">100% Explainable</Badge>
            <Badge tone="neutral" className="text-[10px]">Local Models</Badge>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Link href="/profile">
          <Button variant="outline" size="sm">Back to profile</Button>
        </Link>
        {report.practiceSkills.length > 0 && (
          <Link href="/career-intelligence?tab=roadmaps">
            <Button variant="secondary" size="sm" className="gap-1.5">
              Study plan for {report.practiceSkills[0]} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
        <Button size="sm" onClick={onRetry} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" /> Practice again
        </Button>
      </div>
    </div>
  );
}
