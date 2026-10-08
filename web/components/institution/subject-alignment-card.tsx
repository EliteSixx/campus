"use client";

import type { SubjectCurriculumAlignment, AlignmentStatus } from "@/data/institution/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, UserCheck, Award, ChevronRight, AlertTriangle, CheckCircle2, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<AlignmentStatus, { tone: "success" | "warning" | "danger"; label: string; ringColor: string; barColor: string }> = {
  strong: {
    tone: "success",
    label: "Strong Alignment",
    ringColor: "text-emerald-500",
    barColor: "bg-emerald-500",
  },
  moderate: {
    tone: "warning",
    label: "Moderate Alignment",
    ringColor: "text-amber-500",
    barColor: "bg-amber-500",
  },
  "needs-improvement": {
    tone: "danger",
    label: "Needs Improvement",
    ringColor: "text-rose-500",
    barColor: "bg-rose-500",
  },
};

interface SubjectAlignmentCardProps {
  subject: SubjectCurriculumAlignment;
  onSelect: (subject: SubjectCurriculumAlignment) => void;
}

export function SubjectAlignmentCard({ subject, onSelect }: SubjectAlignmentCardProps) {
  const status = statusConfig[subject.alignmentStatus];

  return (
    <Card className="flex flex-col justify-between p-5 hover:border-accent/40 transition-colors">
      <div>
        {/* Header: Code, Title, Status */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-raised border border-border text-ink">
                {subject.code}
              </span>
              <span className="text-[11px] font-medium text-ink-muted">{subject.semester}</span>
            </div>
            <h3 className="text-sm font-bold text-ink mt-1.5 line-clamp-1">{subject.title}</h3>
          </div>
          <Badge tone={status.tone} className="text-[10px] shrink-0">
            {status.label}
          </Badge>
        </div>

        {/* Assigned Faculty */}
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted border-y border-border/50 py-2">
          <UserCheck className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="font-semibold text-ink">{subject.primaryFacultyName}</span>
          <span className="text-[10px] text-ink-faint">({subject.department.split("&")[0].trim()})</span>
        </div>

        {/* Industry Alignment Meter */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-ink-muted flex items-center gap-1 font-medium">
              <Sparkles className="h-3 w-3 text-accent" />
              Industry Standard Alignment
            </span>
            <strong className={cn("font-mono text-sm font-bold", status.ringColor)}>
              {subject.alignmentScore}%
            </strong>
          </div>
          <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300", status.barColor)}
              style={{ width: `${subject.alignmentScore}%` }}
            />
          </div>
        </div>

        {/* Topic Breakdown Pills */}
        <div className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[10px]">
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2">
            <p className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {subject.foundationalCount}
            </p>
            <p className="text-ink-muted line-clamp-1">Foundational</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
            <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {subject.industryRelevantCount}
            </p>
            <p className="text-ink-muted line-clamp-1">Industry</p>
          </div>
          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2">
            <p className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400">
              {subject.industryAdvancedCount}
            </p>
            <p className="text-ink-muted line-clamp-1">Advanced</p>
          </div>
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
            <p className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
              {subject.missingRecommendedCount}
            </p>
            <p className="text-ink-muted line-clamp-1">Missing</p>
          </div>
        </div>

        {/* Recommended Additions Snippet */}
        {subject.recommendedAdditions.length > 0 && (
          <div className="mt-3.5 rounded-lg bg-surface-raised/40 p-2.5 text-[11px] border border-border/50">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              Recommended Addition
            </p>
            <p className="text-xs font-medium text-ink mt-0.5 line-clamp-1">
              {subject.recommendedAdditions[0].topic}
            </p>
            <p className="text-[10px] text-ink-muted mt-0.5 line-clamp-1">
              {subject.recommendedAdditions[0].reason}
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-[11px] text-ink-muted">
          {subject.totalTopicsCount} topics cataloged
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(subject)}
          className="h-8 text-xs font-semibold gap-1 text-accent border-accent/30 hover:bg-accent/10"
        >
          <span>Inspect Curriculum</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
