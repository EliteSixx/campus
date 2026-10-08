import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight } from "lucide-react";

export function SkillGapCard({
  name,
  current,
  target,
}: {
  name: string;
  current: number;
  target: number;
}) {
  const gap = Math.max(0, target - current);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">{name}</p>
        <span className="rounded-full bg-danger-soft px-2 py-0.5 font-mono text-xs font-semibold text-danger tabular">
          −{gap} pts
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-xs text-ink-muted">
            <span>Current</span>
            <span className="font-mono tabular">{current}%</span>
          </div>
          <Progress value={current} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-ink-muted">
            <span>Target</span>
            <span className="font-mono tabular">{target}%</span>
          </div>
          <Progress value={target} barClassName="bg-ink-faint" />
        </div>
      </div>

      <Button variant="secondary" size="sm" className="mt-4 w-full">
        Recommended learning path
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}
