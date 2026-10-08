import Link from "next/link";
import { Check, X, MapPin, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "./match-score";
import { getSkillById } from "@/data/skills";
import { getCompanyById } from "@/data/companies";
import { getOpportunityStatus, OpportunityStatus } from "@/lib/api/opportunities";
import { cn } from "@/lib/utils";

export function OpportunityCard({
  id,
  title,
  companyId,
  location,
  mode,
  type,
  matchScore,
  matchingSkills,
  missingSkills,
  deadline,
  status: statusProp,
}: {
  id: string;
  title: string;
  companyId: string;
  location: string;
  mode: string;
  type: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  deadline?: string;
  status?: OpportunityStatus;
}) {
  const company = getCompanyById(companyId);
  const status = statusProp ?? (deadline ? getOpportunityStatus(deadline) : undefined);

  return (
    <Card className={cn("flex flex-col p-5", status === "Closed" && "opacity-75")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-raised text-xs font-semibold text-ink-muted">
            {company?.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="text-xs text-ink-muted">{company?.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {location}
              </span>
              <span>·</span>
              <span>{mode}</span>
              <span>·</span>
              <span>{type}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <MatchScore value={matchScore} size="sm" />
          {status && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                status === "Open" && "bg-success-soft text-success border border-success/30",
                status === "Closing Soon" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
                status === "Closed" && "bg-surface-raised text-ink-faint border border-border"
              )}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-1.5">
        {matchingSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {matchingSkills.map((s) => (
              <Badge key={s} tone="success">
                <Check className="h-3 w-3" /> {getSkillById(s)?.name ?? s}
              </Badge>
            ))}
          </div>
        )}
        {missingSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {missingSkills.map((s) => (
              <Badge key={s} tone="danger">
                <X className="h-3 w-3" /> {getSkillById(s)?.name ?? s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {deadline && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-muted">
          <Calendar className="h-3 w-3 text-ink-faint" />
          <span>Deadline: {deadline}</span>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link href={`/opportunities/${id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            {status === "Closed" ? "View details (Closed)" : "View opportunity"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
