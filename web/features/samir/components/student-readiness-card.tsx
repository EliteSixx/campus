"use client";

import type { ReadinessResponse } from "@/lib/ai/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Gauge,
  BarChart3,
  Cpu,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StudentReadinessCardProps {
  readinessData: ReadinessResponse | null;
  isLoading: boolean;
}

export function StudentReadinessCard({
  readinessData,
  isLoading,
}: StudentReadinessCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border bg-surface shadow-sm">
        <CardContent className="p-6" aria-busy="true" aria-label="Loading your readiness">
          <div className="flex animate-pulse items-center gap-5">
            <div className="h-20 w-20 shrink-0 rounded-full bg-surface-raised" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-1/3 rounded bg-surface-raised" />
              <div className="h-3 w-2/3 rounded bg-surface-raised" />
              <div className="h-3 w-1/2 rounded bg-surface-raised" />
            </div>
          </div>
          <div className="mt-6 grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-lg bg-surface-raised" />
            <div className="h-20 rounded-lg bg-surface-raised" />
            <div className="h-20 rounded-lg bg-surface-raised" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!readinessData) {
    return (
      <Card className="border-border bg-surface shadow-sm">
        <CardContent className="p-8 text-center text-xs text-ink-muted">
          No readiness data evaluated yet. Save your profile to trigger AI assessment.
        </CardContent>
      </Card>
    );
  }

  // Format level badge
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "HIGHLY_EMPLOYABLE":
        return (
          <Badge tone="success" className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
            Highly Employable
          </Badge>
        );
      case "READY":
        return (
          <Badge tone="accent" className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
            Placement Ready
          </Badge>
        );
      case "DEVELOPING":
        return (
          <Badge tone="warning" className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
            Developing
          </Badge>
        );
      case "NOT_READY":
      default:
        return (
          <Badge tone="danger" className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
            Critical Gap / Not Ready
          </Badge>
        );
    }
  };

  const formatComponentName = (raw: string) => {
    return raw
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const chartData = readinessData.breakdown.map((item) => ({
    name: formatComponentName(item.name),
    score: Math.round(item.score * 10) / 10,
    weight: Math.round(item.weight * 100),
  }));

  const barColors = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

  return (
    <Card className="border-border bg-surface text-ink shadow-sm overflow-hidden">
      {/* Header with Score and Level Badge */}
      <CardHeader className="border-b border-border/70 bg-surface-raised/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-ink">
                  AI Placement Readiness
                </CardTitle>
                {readinessData.meta?.stub && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    Stub Engine
                  </span>
                )}
              </div>
              <CardDescription className="text-xs text-ink-muted">
                Student {readinessData.student_id} · Model v{readinessData.meta?.engine_version ?? "0.2.0"}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-ink-muted uppercase">Readiness Score</p>
              <p className="text-2xl font-black font-mono text-ink">
                {readinessData.score}
                <span className="text-xs font-normal text-ink-muted"> / 100</span>
              </p>
            </div>
            {getLevelBadge(readinessData.level)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Breakdown Chart (Recharts) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-accent" />
              Explainability: Weighted Score Breakdown
            </h4>
            <span className="text-[11px] text-ink-muted">
              Weights dynamically redistributed for missing fields
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--ink-muted, #64748b)" }}
                  axisLine={{ stroke: "var(--border, #e2e8f0)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--ink-muted, #64748b)" }}
                  axisLine={{ stroke: "var(--border, #e2e8f0)" }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-surface p-2.5 text-xs shadow-md">
                          <p className="font-bold text-ink">{data.name}</p>
                          <p className="text-accent font-semibold mt-0.5">
                            Score: {data.score} / 100
                          </p>
                          <p className="text-ink-muted text-[11px]">
                            Weight Contribution: {data.weight}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Gaps Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
          {/* Strengths */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <h4 className="text-xs font-bold text-success flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="h-4 w-4" />
              Demonstrated Strengths ({readinessData.strengths.length})
            </h4>
            {readinessData.strengths.length === 0 ? (
              <p className="text-xs text-ink-muted italic">No distinct strengths identified yet.</p>
            ) : (
              <ul className="space-y-2">
                {readinessData.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-ink leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0 mt-1.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Gaps */}
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <h4 className="text-xs font-bold text-warning flex items-center gap-1.5 mb-2.5">
              <AlertCircle className="h-4 w-4" />
              Identified Skill & Profile Gaps ({readinessData.gaps.length})
            </h4>
            {readinessData.gaps.length === 0 ? (
              <p className="text-xs text-ink-muted italic">Zero critical gaps found!</p>
            ) : (
              <ul className="space-y-2">
                {readinessData.gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-ink leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <h4 className="text-xs font-bold text-accent flex items-center gap-1.5 mb-2.5">
            <Lightbulb className="h-4 w-4" />
            AI Prescriptive Recommendations ({readinessData.recommendations.length})
          </h4>
          {readinessData.recommendations.length === 0 ? (
            <p className="text-xs text-ink-muted italic">Continue maintaining current proficiency.</p>
          ) : (
            <div className="space-y-2">
              {readinessData.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-ink leading-relaxed bg-surface/70 rounded-lg p-2.5 border border-border/60"
                >
                  <Cpu className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
