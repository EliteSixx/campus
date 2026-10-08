import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { statusForScore, statusColor } from "@/lib/utils";

export function SkillProgress({ name, score }: { name: string; score: number }) {
  const status = statusForScore(score);
  const colors = statusColor(status);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm text-ink">{name}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-ink-muted tabular">{score}%</span>
          <Badge tone={status === "Strong" ? "success" : status === "Developing" ? "warning" : "danger"}>
            {status}
          </Badge>
        </div>
      </div>
      <Progress value={score} barClassName={colors.bar} />
    </div>
  );
}

export function SkillBadge({ name }: { name: string }) {
  return <Badge tone="neutral">{name}</Badge>;
}
