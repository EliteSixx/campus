"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ClipboardList, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/shared/match-score";
import { EmptyState } from "@/components/shared/state";
import { cn } from "@/lib/utils";
import {
  APPLICATION_STAGES,
  ApplicationStatus,
  StudentApplication,
  isActiveApplication,
  useApplications,
} from "../data/applications-store";

export interface TrackerOpportunity {
  id: string;
  title: string;
  companyName: string;
  companyInitials: string;
  location: string;
  type: string;
  matchScore: number;
}

type Filter = "all" | "active" | "interview" | "closed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "In progress" },
  { id: "interview", label: "Interview & offer" },
  { id: "closed", label: "Closed" },
];

function statusTone(status: ApplicationStatus) {
  switch (status) {
    case "Offer":
    case "Shortlisted":
      return "success" as const;
    case "Interview":
      return "accent" as const;
    case "Under Review":
      return "warning" as const;
    case "Rejected":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function matchesFilter(app: StudentApplication, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "active") return isActiveApplication(app);
  if (filter === "interview") return app.status === "Interview" || app.status === "Offer";
  return !isActiveApplication(app);
}

function StageStepper({ app }: { app: StudentApplication }) {
  const ended = app.status === "Rejected" || app.status === "Withdrawn";
  // Last real stage reached before the application ended (or the current stage).
  const reached = [...app.history]
    .reverse()
    .find((h) => (APPLICATION_STAGES as readonly string[]).includes(h.status))?.status;
  const reachedIndex = reached ? APPLICATION_STAGES.indexOf(reached as (typeof APPLICATION_STAGES)[number]) : 0;

  return (
    <ol className="flex items-center gap-1" aria-label="Application progress">
      {APPLICATION_STAGES.map((stage, i) => {
        const done = i < reachedIndex || (i === reachedIndex && (ended || stage === "Offer"));
        const current = i === reachedIndex && !ended && stage !== "Offer";
        const dateOf = app.history.find((h) => h.status === stage)?.date;
        return (
          <li key={stage} className="flex flex-1 flex-col items-start gap-1 min-w-0">
            <div
              className={cn(
                "h-1.5 w-full rounded-full",
                done ? "bg-success" : current ? "bg-accent" : "bg-border"
              )}
            />
            <span className={cn("truncate text-[10px]", current ? "font-semibold text-ink" : "text-ink-muted")}>
              {stage}
            </span>
            {dateOf && <span className="text-[10px] text-ink-faint">{dateOf}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function ApplicationsTracker({ opportunities }: { opportunities: TrackerOpportunity[] }) {
  const { applications, hydrated, withdraw } = useApplications();
  const [filter, setFilter] = useState<Filter>("all");
  const [confirming, setConfirming] = useState<string | null>(null);

  const byId = useMemo(() => new Map(opportunities.map((o) => [o.id, o])), [opportunities]);
  const rows = applications.filter((a) => byId.has(a.opportunityId));
  const visible = rows.filter((a) => matchesFilter(a, filter));

  const counts = {
    total: rows.length,
    active: rows.filter(isActiveApplication).length,
    interview: rows.filter((a) => a.status === "Interview" || a.status === "Offer").length,
  };

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-lg bg-surface-raised" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total applications", value: counts.total },
          { label: "In progress", value: counts.active },
          { label: "Interview or offer", value: counts.interview },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-ink-muted">{s.label}</p>
            <p className="mt-1 font-mono text-xl font-semibold text-ink">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.id
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-ink-muted hover:text-ink"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={rows.length === 0 ? "No applications yet" : "Nothing in this view"}
          description={
            rows.length === 0
              ? "Find a role that matches your skills and apply. It will show up here."
              : "Try another filter."
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((a) => {
            const o = byId.get(a.opportunityId)!;
            const canWithdraw = isActiveApplication(a) && a.status !== "Offer";
            return (
              <Card key={a.opportunityId} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-raised text-xs font-semibold text-ink-muted">
                      {o.companyInitials}
                    </div>
                    <div>
                      <Link href={`/opportunities/${o.id}`} className="text-sm font-medium text-ink hover:text-accent">
                        {o.title}
                      </Link>
                      <p className="text-xs text-ink-muted">
                        {o.companyName} · {o.location} · {o.type} · Applied {a.appliedOn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MatchScore value={o.matchScore} size="sm" />
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <StageStepper app={a} />
                </div>

                {canWithdraw && (
                  <div className="mt-3 flex justify-end gap-2">
                    {confirming === a.opportunityId ? (
                      <>
                        <span className="self-center text-xs text-ink-muted">Withdraw this application?</span>
                        <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                          Keep
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-danger/40 text-danger"
                          onClick={() => {
                            withdraw(a.opportunityId);
                            setConfirming(null);
                          }}
                        >
                          <X className="h-3.5 w-3.5" /> Withdraw
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setConfirming(a.opportunityId)}>
                        Withdraw
                      </Button>
                    )}
                  </div>
                )}
                {a.status === "Offer" && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-success">
                    <Check className="h-3.5 w-3.5" /> Offer received. Your placement cell will contact you with next steps.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
