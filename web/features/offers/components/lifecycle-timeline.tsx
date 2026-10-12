"use client";

import React from "react";
import type { LifecycleState, LifecycleTransitionRecord } from "../types";
import { STATE_METADATA } from "../state-machine";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Calendar,
  Building,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface LifecycleTimelineProps {
  currentState: LifecycleState;
  statusHistory?: LifecycleTransitionRecord[];
}

const LINEAR_STEPS: Array<{ state: LifecycleState; label: string; icon: React.ElementType }> = [
  { state: "OFFER_RECEIVED", label: "Offer Received", icon: Building },
  { state: "UNDER_REVIEW", label: "Under Review", icon: Clock },
  { state: "ACCEPTED", label: "Accepted", icon: CheckCircle2 },
  { state: "DOCS_PENDING", label: "Docs Pending", icon: FileCheck },
  { state: "DOCS_VERIFIED", label: "Docs Verified", icon: CheckCircle2 },
  { state: "JOINING_SCHEDULED", label: "Joining Scheduled", icon: Calendar },
  { state: "JOINED", label: "Joined", icon: Building },
];

export function LifecycleTimeline({
  currentState,
  statusHistory = [],
}: LifecycleTimelineProps) {
  const currentMeta = STATE_METADATA[currentState];
  const isBranchState =
    currentState === "DEFERRED" ||
    currentState === "REJECTED" ||
    currentState === "WITHDRAWN";

  const currentLinearIndex = LINEAR_STEPS.findIndex(
    (step) => step.state === currentState
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-border/60">
        <div>
          <h4 className="text-sm font-bold text-ink flex items-center gap-2">
            Post-Selection Lifecycle Timeline
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${currentMeta.badgeClass}`}
            >
              {currentMeta.label}
            </span>
          </h4>
          <p className="text-xs text-ink-muted mt-0.5">{currentMeta.description}</p>
        </div>

        {statusHistory.length > 0 && (
          <div className="text-[11px] text-ink-muted flex items-center gap-1.5 self-start sm:self-auto bg-surface-raised px-2.5 py-1 rounded-lg border border-border/50">
            <Clock className="w-3.5 h-3.5 text-accent" />
            Last updated:{" "}
            <span className="font-medium text-ink">
              {new Date(
                statusHistory[statusHistory.length - 1].timestamp
              ).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Kolkata",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Special Branch State Callout */}
      {isBranchState && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-semibold">
              Current Special State: {currentMeta.label}
            </p>
            <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80">
              {currentMeta.description}
            </p>
          </div>
        </div>
      )}

      {/* Responsive Horizontal Stepper */}
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {LINEAR_STEPS.map((step, idx) => {
            const Icon = step.icon;
            let status: "completed" | "current" | "upcoming" = "upcoming";

            if (currentState === step.state) {
              status = "current";
            } else if (currentLinearIndex > idx) {
              status = "completed";
            } else if (currentState === "JOINED") {
              status = "completed";
            }

            const stepHistory = statusHistory.find((h) => h.to === step.state);

            return (
              <div
                key={step.state}
                className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                  status === "current"
                    ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                    : status === "completed"
                    ? "border-emerald-500/30 bg-emerald-500/5 text-ink"
                    : "border-border/60 bg-surface-raised/40 text-ink-muted opacity-75"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 shadow-sm ${
                    status === "current"
                      ? "bg-accent text-white"
                      : status === "completed"
                      ? "bg-emerald-600 text-white"
                      : "bg-surface border border-border text-ink-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span
                  className={`text-xs font-semibold leading-tight line-clamp-1 ${
                    status === "current"
                      ? "text-accent font-bold"
                      : status === "completed"
                      ? "text-ink"
                      : "text-ink-muted"
                  }`}
                >
                  {step.label}
                </span>

                <span className="text-[10px] text-ink-faint mt-1">
                  Step {idx + 1}
                </span>

                {stepHistory && (
                  <span className="text-[9px] text-ink-muted mt-1 bg-surface px-1.5 py-0.5 rounded border border-border/50">
                    {new Date(stepHistory.timestamp).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
