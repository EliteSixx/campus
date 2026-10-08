import type { CorporatePartner, MoUStatus, EngagementLevel } from "@/data/institution/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calendar, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const mouTone: Record<MoUStatus, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  "expiring-soon": "warning",
  expired: "danger",
  pending: "neutral",
};

const mouLabel: Record<MoUStatus, string> = {
  active: "Active",
  "expiring-soon": "Expiring Soon",
  expired: "Expired",
  pending: "Pending",
};

const engagementColor: Record<EngagementLevel, string> = {
  high: "text-emerald-500",
  moderate: "text-amber-500",
  low: "text-rose-400",
};

export function PartnerCard({ partner }: { partner: CorporatePartner }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-sm font-bold text-accent">
            {partner.initials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">{partner.name}</h3>
            <p className="text-xs text-ink-muted">{partner.industry} · {partner.hq}</p>
          </div>
        </div>
        <Badge tone={mouTone[partner.mouStatus]}>{mouLabel[partner.mouStatus]}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-surface-raised/60 p-2.5 text-center">
          <p className="font-mono text-lg font-bold text-ink tabular">{partner.studentsHired}</p>
          <p className="text-[10px] text-ink-muted">Hired</p>
        </div>
        <div className="rounded-lg bg-surface-raised/60 p-2.5 text-center">
          <p className="font-mono text-lg font-bold text-ink tabular">{partner.activePrograms}</p>
          <p className="text-[10px] text-ink-muted">Programs</p>
        </div>
        <div className="rounded-lg bg-surface-raised/60 p-2.5 text-center">
          <p className={cn("font-mono text-lg font-bold tabular", engagementColor[partner.engagementLevel])}>
            {partner.engagementScore}
          </p>
          <p className="text-[10px] text-ink-muted">Score</p>
        </div>
      </div>

      {partner.programs.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Recent Programs</p>
          {partner.programs.slice(0, 2).map((prog) => (
            <div key={prog.name} className="flex items-center justify-between text-xs">
              <span className="text-ink-muted truncate mr-2">{prog.name}</span>
              <Badge tone="neutral" className="shrink-0 text-[10px]">{prog.type}</Badge>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-ink-faint">
        <Mail className="h-3 w-3" />
        <span className="truncate">{partner.contactPerson} · {partner.contactEmail}</span>
      </div>
    </Card>
  );
}
