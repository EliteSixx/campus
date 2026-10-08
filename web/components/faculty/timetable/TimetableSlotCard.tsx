"use client";

import { Badge } from "@/components/ui/badge";
import type { ResolvedSlot } from "@/lib/api/timetable";
import { cn } from "@/lib/utils";
import { slotLabel, slotStyle, slotTypeTone } from "./utils";

// Whether this slot is running right now or is the next one up today. null
// whenever the clock has not been read yet, at the weekend, or outside hours.
export type SlotState = "now" | "next" | null;

export function TimetableSlotCard({
  slot,
  subjectIds,
  state = null,
  selected = false,
  showTime = false,
  onSelect,
  className,
}: {
  slot: ResolvedSlot;
  subjectIds: string[];
  state?: SlotState;
  selected?: boolean;
  showTime?: boolean;
  onSelect: (slot: ResolvedSlot) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      aria-label={`${slotLabel(slot)}, ${slot.day} ${slot.start} to ${slot.end}, ${slot.room}`}
      className={cn(
        "flex h-full w-full flex-col gap-1 rounded-lg border border-l-4 p-2 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
        "print:border print:bg-white print:hover:bg-white",
        slotStyle(slot, subjectIds),
        selected && "ring-2 ring-accent",
        state === "now" && "ring-2 ring-accent",
        className,
      )}
    >
      <div className="flex w-full items-start justify-between gap-1">
        <span className="min-w-0 font-mono text-[11px] font-bold tabular text-ink">
          {slot.subjectCode ?? (showTime ? `${slot.start}–${slot.end}` : slot.type)}
        </span>
        {state && (
          <Badge
            tone={state === "now" ? "accent" : "neutral"}
            className="shrink-0 px-1.5 py-0 text-[9px] uppercase tracking-wider print:hidden"
          >
            {state === "now" ? "Now" : "Next"}
          </Badge>
        )}
      </div>

      <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-ink">
        {slotLabel(slot)}
      </span>

      {showTime && slot.subjectCode && (
        <span className="font-mono text-[10px] tabular text-ink-muted">
          {slot.start}–{slot.end}
        </span>
      )}

      <span className="truncate text-[10px] text-ink-muted">
        {slot.section ? `${slot.section} · ` : ""}
        {slot.room}
      </span>

      <Badge
        tone={slotTypeTone(slot.type)}
        className="w-fit px-1.5 py-0 text-[9px]"
      >
        {slot.type}
      </Badge>
    </button>
  );
}
