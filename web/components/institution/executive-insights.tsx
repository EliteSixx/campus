"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, TrendingUp, Users, ChevronRight, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InsightItem {
  id: string;
  type: "critical" | "warning" | "success" | "info";
  title: string;
  description: string;
  metric: string;
  actionText: string;
  actionHref: string;
}

const INSIGHTS: InsightItem[] = [
  {
    id: "cloud-gap",
    type: "critical",
    title: "Critical Skill Shortage",
    description: "Cloud Computing & Containerization show a 40-point deficit across CSE & IT relative to active recruiter demands.",
    metric: "-40 pt gap",
    actionText: "Analyze Skill Gaps",
    actionHref: "/dashboard/institution/skills",
  },
  {
    id: "mou-expiry",
    type: "warning",
    title: "MoU Renewal Action",
    description: "Corporate partnerships with Tata Consultancy Services and Infosys are up for renewal within 60 days.",
    metric: "2 MoUs Expiring",
    actionText: "Manage MoUs",
    actionHref: "/dashboard/institution/partners",
  },
  {
    id: "ds-surge",
    type: "success",
    title: "Cohort Outperformer",
    description: "Data Science & AI leads institutional placement readiness at 68%, outperforming the campus median by +17%.",
    metric: "+17% over median",
    actionText: "View DS Benchmark",
    actionHref: "/dashboard/institution/departments/ds",
  },
  {
    id: "unassessed-batch",
    type: "info",
    title: "Assessment Backlog",
    description: "84 eligible students in 2nd Year Mechanical & Electrical have yet to complete mandatory industry baseline tests.",
    metric: "84 Pending",
    actionText: "View Student List",
    actionHref: "/dashboard/institution/students",
  },
];

export function ExecutiveInsights() {
  const [items, setItems] = useState<InsightItem[]>(INSIGHTS);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const activeItems = items.filter((item) => !dismissed[item.id]);

  if (activeItems.length === 0) return null;

  const getIcon = (type: InsightItem["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case "warning":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "success":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "info":
        return <Users className="h-4 w-4 text-sky-500" />;
    }
  };

  const getBadgeTone = (type: InsightItem["type"]): "danger" | "warning" | "success" | "cyan" => {
    switch (type) {
      case "critical":
        return "danger";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "info":
        return "cyan";
    }
  };

  const getCardBorder = (type: InsightItem["type"]) => {
    switch (type) {
      case "critical":
        return "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50";
      case "warning":
        return "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50";
      case "success":
        return "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50";
      case "info":
        return "border-sky-500/30 bg-sky-500/5 hover:border-sky-500/50";
    }
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Executive Intelligence & Outlier Callouts
          </span>
          <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
            {activeItems.length} active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-150",
              getCardBorder(item.type)
            )}
          >
            {/* Dismiss button */}
            <button
              onClick={() => setDismissed((prev) => ({ ...prev, [item.id]: true }))}
              className="absolute right-2.5 top-2.5 rounded p-1 text-ink-faint opacity-0 transition-opacity hover:bg-surface-raised hover:text-ink group-hover:opacity-100"
              title="Dismiss alert"
            >
              <X className="h-3 w-3" />
            </button>

            <div>
              <div className="flex items-center gap-2 pr-5">
                {getIcon(item.type)}
                <span className="text-xs font-bold text-ink">{item.title}</span>
              </div>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">{item.description}</p>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
              <Badge tone={getBadgeTone(item.type)} className="text-[10px] font-mono">
                {item.metric}
              </Badge>
              <Link
                href={item.actionHref}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
              >
                {item.actionText}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
