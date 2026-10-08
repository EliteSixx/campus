"use client";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/shared/metric-card";
import { Trophy, Flame, Hash, Info } from "lucide-react";
import {
  DEMO_IMPACT_SCORES,
  PRIMARY_DEMO_ALUMNI_ID,
} from "@/data/demo-alumni";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ImpactLeaderboardPage() {
  const [showFormula, setShowFormula] = useState(false);

  const currentUser = DEMO_IMPACT_SCORES.find(
    (s) => s.alumniId === PRIMARY_DEMO_ALUMNI_ID
  )!;

  return (
    <DashboardShell title="Impact Score & Leaderboard">
      {/* Header Banner */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">
                Impact Score & Leaderboard
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 max-w-2xl font-medium">
              Your alumni contributions quantified. Earn points through
              mentoring, referrals, and knowledge sharing across the platform.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge tone="accent" className="text-xs py-1 px-3 gap-1">
              <Trophy className="h-3.5 w-3.5" />
              #{currentUser.rank} Overall
            </Badge>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Impact Score"
          value={`${currentUser.score}`}
          icon={Trophy}
          tone="accent"
          trend="(sessions×2) + (referrals_hired×10) + (guidance×3)"
        />
        <MetricCard
          label="Rank"
          value={`#${currentUser.rank}`}
          icon={Hash}
          tone="success"
          trend={`Out of ${DEMO_IMPACT_SCORES.length} active alumni`}
        />
        <MetricCard
          label="Streak (weeks)"
          value={`${currentUser.streak} weeks`}
          icon={Flame}
          tone="warning"
          trend="Consecutive weeks with activity"
        />
      </div>

      {/* Score Formula */}
      <div className="mt-5">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
        >
          <Info className="h-3.5 w-3.5" />
          How is the Impact Score calculated?
        </button>
        {showFormula && (
          <Card className="mt-2 p-4 border border-accent/20 bg-accent-soft/30">
            <p className="text-xs text-ink font-semibold">
              Impact Score ={" "}
              <code className="font-mono bg-surface-raised px-1.5 py-0.5 rounded text-accent border border-border">
                (sessions × 2) + (referrals_hired × 10) + (guidance_resolved ×
                3)
              </code>
            </p>
            <p className="text-[11px] text-ink-muted mt-1.5 font-medium">
              Each completed session earns 2 points. Each student you referred
              that gets hired earns 10 points. Each guidance question you
              resolve earns 3 points. Streak is the number of consecutive weeks
              with at least one contribution.
            </p>
          </Card>
        )}
      </div>

      {/* Leaderboard Table */}
      <Card className="mt-5 border border-border bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-bold text-ink">Alumni Leaderboard</h3>
          <p className="text-[11px] text-ink-muted font-medium mt-0.5">
            Top contributors across the alumni network
          </p>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[60px_1fr_100px_100px_80px_80px] gap-3 px-5 py-2.5 bg-surface-raised border-b border-border text-[10px] font-bold text-ink-muted uppercase tracking-wide">
          <span>Rank</span>
          <span>Alumni</span>
          <span className="text-right">Mentees Helped</span>
          <span className="text-right">Referrals Hired</span>
          <span className="text-right">Sessions</span>
          <span className="text-right">Score</span>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {DEMO_IMPACT_SCORES.map((entry) => {
            const isCurrentUser =
              entry.alumniId === PRIMARY_DEMO_ALUMNI_ID;
            return (
              <div
                key={entry.alumniId}
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-[60px_1fr_100px_100px_80px_80px] gap-3 px-5 py-3.5 items-center transition-colors",
                  isCurrentUser
                    ? "bg-accent-soft/50 border-l-2 border-l-accent"
                    : "hover:bg-surface-raised"
                )}
              >
                {/* Rank */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-extrabold tabular",
                      entry.rank <= 3 ? "text-accent" : "text-ink-muted"
                    )}
                  >
                    #{entry.rank}
                  </span>
                  {entry.rank === 1 && (
                    <span className="text-xs">🥇</span>
                  )}
                  {entry.rank === 2 && (
                    <span className="text-xs">🥈</span>
                  )}
                  {entry.rank === 3 && (
                    <span className="text-xs">🥉</span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border",
                      isCurrentUser
                        ? "bg-accent text-white border-accent"
                        : "bg-accent-soft text-accent border-accent/20"
                    )}
                  >
                    {entry.avatarInitials}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink">
                      {entry.name}
                    </span>
                    {isCurrentUser && (
                      <span className="ml-1.5 text-[10px] text-accent font-bold">
                        (You)
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats (responsive) */}
                <div className="flex sm:justify-end">
                  <span className="sm:hidden text-[10px] text-ink-muted font-bold mr-1">
                    Mentees:{" "}
                  </span>
                  <span className="text-xs font-semibold text-ink tabular">
                    {entry.menteesHelped}
                  </span>
                </div>
                <div className="flex sm:justify-end">
                  <span className="sm:hidden text-[10px] text-ink-muted font-bold mr-1">
                    Referrals:{" "}
                  </span>
                  <span className="text-xs font-semibold text-ink tabular">
                    {entry.referralsHired}
                  </span>
                </div>
                <div className="flex sm:justify-end">
                  <span className="sm:hidden text-[10px] text-ink-muted font-bold mr-1">
                    Sessions:{" "}
                  </span>
                  <span className="text-xs font-semibold text-ink tabular">
                    {entry.sessions}
                  </span>
                </div>
                <div className="flex sm:justify-end">
                  <span className="sm:hidden text-[10px] text-ink-muted font-bold mr-1">
                    Score:{" "}
                  </span>
                  <Badge
                    tone={isCurrentUser ? "accent" : "neutral"}
                    className="text-xs font-bold tabular"
                  >
                    {entry.score}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </DashboardShell>
  );
}
