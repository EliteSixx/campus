"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function EvidenceCard({
  name,
  score,
  confidence,
  evidence,
}: {
  name: string;
  score: number;
  confidence: number;
  evidence: { label: string; verified: boolean }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{name}</p>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 flex justify-between text-xs text-ink-muted">
                <span>Skill score</span>
                <span className="font-mono tabular">{score}%</span>
              </div>
              <Progress value={score} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-ink-muted">
                <span>Confidence</span>
                <span className="font-mono tabular">{confidence}%</span>
              </div>
              <Progress value={confidence} barClassName="bg-accent" />
            </div>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-border bg-surface-raised/60 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-ink-muted">Evidence</p>
          <ul className="space-y-1.5">
            {evidence.map((e) => (
              <li key={e.label} className="flex items-center gap-2 text-sm">
                {e.verified ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-ink-faint" />
                )}
                <span className={e.verified ? "text-ink" : "text-ink-faint"}>{e.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
