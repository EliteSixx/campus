"use client";

import { CalendarDays, List, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Switches the plan between the lecture list and the month calendar.

export type PlanView = "list" | "calendar";

const OPTIONS: { value: PlanView; label: string; icon: LucideIcon }[] = [
  { value: "list", label: "List", icon: List },
  { value: "calendar", label: "Calendar", icon: CalendarDays },
];

export function ViewToggle({
  view,
  onChange,
}: {
  view: PlanView;
  onChange: (view: PlanView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Plan view"
      className="inline-flex rounded-lg border border-border bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const on = view === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              on ? "bg-accent-soft text-accent" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
