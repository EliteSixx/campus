"use client";

import type { CampusPlacementDrive, DriveStatus, DriveTier } from "@/data/institution/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, MapPin, Users, Award, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<DriveStatus, { tone: "success" | "warning" | "cyan" | "accent" | "neutral"; label: string }> = {
  "upcoming": { tone: "neutral", label: "Upcoming" },
  "registration-open": { tone: "cyan", label: "Registration Open" },
  "assessment-ongoing": { tone: "accent", label: "Assessment In Progress" },
  "interviews-ongoing": { tone: "warning", label: "Interviews Ongoing" },
  "completed": { tone: "success", label: "Drive Completed" },
};

const tierConfig: Record<DriveTier, { label: string; badgeClass: string }> = {
  "super-dream": { label: "Super Dream (>15 LPA)", badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  "dream": { label: "Dream (8–14 LPA)", badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  "core-it": { label: "Core & IT (5–7 LPA)", badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  "mass-recruitment": { label: "Mass (<5 LPA)", badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
};

interface DriveCardProps {
  drive: CampusPlacementDrive;
  onSelect: (drive: CampusPlacementDrive) => void;
}

export function DriveCard({ drive, onSelect }: DriveCardProps) {
  const status = statusConfig[drive.status];
  const tier = tierConfig[drive.tier];

  const appToShortlistRate =
    drive.registeredCount > 0
      ? Math.round((drive.shortlistedCount / drive.registeredCount) * 100)
      : 0;

  return (
    <Card className="flex flex-col p-5 hover:border-accent/40 transition-colors">
      {/* Header: Company, Role, Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-sm font-bold text-accent shadow-xs">
            {drive.companyInitials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-ink">{drive.companyName}</h3>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", tier.badgeClass)}>
                {tier.label}
              </span>
            </div>
            <p className="text-xs font-medium text-ink-muted mt-0.5">{drive.role}</p>
          </div>
        </div>
        <Badge tone={status.tone} className="text-[10px] shrink-0">
          {status.label}
        </Badge>
      </div>

      {/* Package, Location, Date Banner */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted border-y border-border/50 py-2.5">
        <div className="flex items-center gap-1 font-semibold text-accent">
          <Award className="h-3.5 w-3.5" />
          <span>{drive.packageDisplay}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-ink-faint" />
          <span>{drive.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-ink-faint" />
          <span>Drive: {drive.driveDate}</span>
        </div>
      </div>

      {/* Conversion & Funnel Metrics Row */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-surface-raised/60 p-2">
          <p className="font-mono text-base font-bold text-ink tabular">{drive.registeredCount}</p>
          <p className="text-[10px] text-ink-muted">Registered</p>
        </div>
        <div className="rounded-lg bg-surface-raised/60 p-2">
          <p className="font-mono text-base font-bold text-emerald-500 tabular">{drive.eligibleApplicantCount}</p>
          <p className="text-[10px] text-ink-muted">Eligible</p>
        </div>
        <div className="rounded-lg bg-surface-raised/60 p-2">
          <p className="font-mono text-base font-bold text-sky-500 tabular">{drive.shortlistedCount}</p>
          <p className="text-[10px] text-ink-muted">Shortlisted</p>
        </div>
        <div className="rounded-lg bg-surface-raised/60 p-2">
          <p className="font-mono text-base font-bold text-accent tabular">{drive.offersReleased}</p>
          <p className="text-[10px] text-ink-muted">Offers</p>
        </div>
      </div>

      {/* Active Round Indicator & Branch Eligibility */}
      <div className="mt-3.5 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-ink-muted flex items-center gap-1">
            <Clock className="h-3 w-3 text-accent" />
            Current Stage:
          </span>
          <span className="font-medium text-ink font-mono">
            Round {drive.rounds[drive.currentRoundIndex]?.roundNumber || 1}: {drive.rounds[drive.currentRoundIndex]?.name.split("(")[0]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 mt-1">
          <span className="text-[10px] text-ink-muted mr-1">Eligible:</span>
          {drive.eligibleDeptNames.slice(0, 3).map((dept) => (
            <span key={dept} className="rounded bg-surface-raised px-1.5 py-0.5 text-[9px] font-medium text-ink-muted border border-border/60">
              {dept}
            </span>
          ))}
          {drive.eligibleDeptNames.length > 3 && (
            <span className="text-[9px] text-ink-faint">+{drive.eligibleDeptNames.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-[11px] text-ink-muted">
          Shortlist Conversion: <strong className="font-mono text-ink">{appToShortlistRate}%</strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(drive)}
          className="h-8 text-xs font-medium gap-1 text-accent border-accent/30 hover:bg-accent/10"
        >
          <span>View Rounds & Shortlist</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
