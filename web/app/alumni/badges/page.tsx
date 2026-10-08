"use client";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  HeartHandshake,
  Flame,
  Trophy,
  ShieldCheck,
  HelpCircle,
  Network,
  GitBranch,
  Star,
  Linkedin,
  Lock,
  LucideIcon,
} from "lucide-react";
import { DEMO_BADGES } from "@/data/demo-alumni";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  "heart-handshake": HeartHandshake,
  flame: Flame,
  trophy: Trophy,
  "shield-check": ShieldCheck,
  "help-circle": HelpCircle,
  network: Network,
  "git-branch": GitBranch,
  star: Star,
};

export default function BadgeWallPage() {
  const earnedCount = DEMO_BADGES.filter((b) => b.earned).length;

  return (
    <DashboardShell title="Badge Wall">
      {/* Header Banner */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">
                Verified Badge Wall
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 max-w-2xl font-medium">
              Showcase your alumni contributions. Earn badges through mentoring,
              referrals, and community engagement. Share your achievements on
              LinkedIn.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge tone="accent" className="text-xs py-1 px-3 gap-1">
              <Award className="h-3.5 w-3.5" />
              {earnedCount}/{DEMO_BADGES.length} Earned
            </Badge>
          </div>
        </div>
      </Card>

      {/* Badge Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DEMO_BADGES.map((badge) => {
          const Icon = ICON_MAP[badge.iconName] || Award;
          return (
            <Card
              key={badge.id}
              className={cn(
                "p-5 border border-border bg-surface text-ink transition-all",
                !badge.earned && "opacity-60"
              )}
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full border mb-3",
                    badge.earned
                      ? "bg-accent-soft border-accent/30"
                      : "bg-surface-raised border-border"
                  )}
                >
                  {badge.earned ? (
                    <Icon className="h-6 w-6 text-accent" />
                  ) : (
                    <Lock className="h-5 w-5 text-ink-faint" />
                  )}
                </div>

                {/* Badge Name */}
                <h3
                  className={cn(
                    "text-sm font-bold",
                    badge.earned ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {badge.name}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-ink-muted font-medium mt-1 leading-snug">
                  {badge.description}
                </p>

                {/* Status */}
                <div className="mt-3 w-full">
                  {badge.earned ? (
                    <>
                      <div className="text-[10px] text-success font-bold">
                        ✓ Earned on {badge.earnedDate}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs w-full gap-1.5 font-bold"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                        Share to LinkedIn
                      </Button>
                    </>
                  ) : (
                    <div className="mt-1">
                      <Badge
                        tone="neutral"
                        className="text-[10px] gap-1"
                      >
                        <Lock className="h-3 w-3" />
                        {badge.lockedMessage}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
