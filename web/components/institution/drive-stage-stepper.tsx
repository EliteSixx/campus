"use client";

import { CheckCircle2, Clock, CircleDot, AlertCircle } from "lucide-react";
import type { DriveRound } from "@/data/institution/types";
import { cn } from "@/lib/utils";

interface DriveStageStepperProps {
  rounds: DriveRound[];
  currentRoundIndex: number;
}

export function DriveStageStepper({ rounds, currentRoundIndex }: DriveStageStepperProps) {
  return (
    <div className="w-full py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative">
        {rounds.map((round, idx) => {
          const isCompleted = round.status === "completed";
          const isInProgress = round.status === "in-progress";
          const isPending = round.status === "pending";

          const passRate =
            round.totalAppeared > 0
              ? Math.round((round.clearedCount / round.totalAppeared) * 100)
              : null;

          return (
            <div key={round.id} className="flex-1 flex flex-col items-start md:items-center relative group">
              {/* Connector line on desktop */}
              {idx > 0 && (
                <div
                  className={cn(
                    "hidden md:block absolute top-4 -left-1/2 w-full h-0.5 -z-10",
                    isCompleted || isInProgress
                      ? "bg-emerald-500/50"
                      : "bg-border"
                  )}
                />
              )}

              {/* Icon / Status indicator */}
              <div className="flex items-center gap-2 md:flex-col md:gap-1.5 text-center">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                    isCompleted && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
                    isInProgress && "bg-accent/15 text-accent border border-accent/40 ring-4 ring-accent/10 animate-pulse",
                    isPending && "bg-surface-raised text-ink-muted border border-border"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : isInProgress ? (
                    <CircleDot className="h-4 w-4 text-accent" />
                  ) : (
                    <span>{round.roundNumber}</span>
                  )}
                </div>

                <div className="text-left md:text-center">
                  <p className="text-xs font-semibold text-ink line-clamp-1">
                    {round.name}
                  </p>
                  <p className="text-[10px] text-ink-muted">
                    {round.date}
                  </p>
                </div>
              </div>

              {/* Metric tag */}
              <div className="mt-1 md:mt-2 text-[10px] font-mono pl-10 md:pl-0">
                {isCompleted && (
                  <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {round.clearedCount} cleared ({passRate}%)
                  </span>
                )}
                {isInProgress && (
                  <span className="text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                    {round.totalAppeared} evaluated
                  </span>
                )}
                {isPending && (
                  <span className="text-ink-faint">
                    Scheduled
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
