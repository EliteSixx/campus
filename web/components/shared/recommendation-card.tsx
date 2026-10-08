import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RecommendationCard({
  title,
  stats,
  cta = "View intervention plan",
}: {
  title: string;
  stats: { label: string; value: string }[];
  cta?: string;
}) {
  return (
    <Card className="border-accent/30 bg-accent-soft/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-accent">
          Skill Intelligence Recommendation
        </p>
      </div>
      <p className="text-base font-semibold text-ink">{title}</p>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-mono text-lg font-semibold text-ink tabular">{s.value}</p>
            <p className="text-xs text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <Button size="sm" className="mt-5">
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}
