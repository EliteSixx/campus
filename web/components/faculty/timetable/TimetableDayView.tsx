"use client";

import type { Weekday } from "@/data/timetable";
import type { ResolvedSlot } from "@/lib/api/timetable";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TimetableSlotCard, type SlotState } from "./TimetableSlotCard";

export function TimetableDayView({
  days,
  slots,
  subjectIds,
  selectedDay,
  onSelectDay,
  today,
  nowSlotId,
  nextSlotId,
  selectedSlotId,
  onSelect,
}: {
  days: Weekday[];
  // Already filtered by the client.
  slots: ResolvedSlot[];
  subjectIds: string[];
  selectedDay: Weekday;
  onSelectDay: (day: Weekday) => void;
  today: Weekday | null;
  nowSlotId: string | null;
  nextSlotId: string | null;
  selectedSlotId: string | null;
  onSelect: (slot: ResolvedSlot) => void;
}) {
  const daySlots = slots
    .filter((s) => s.day === selectedDay)
    .sort((a, b) => a.start.localeCompare(b.start));

  const stateOf = (slot: ResolvedSlot): SlotState => {
    if (slot.id === nowSlotId) return "now";
    if (slot.id === nextSlotId) return "next";
    return null;
  };

  return (
    <Card className="mt-4 p-4">
      <div
        role="tablist"
        aria-label="Day"
        className="flex gap-1.5 overflow-x-auto scrollbar-thin border-b border-border pb-3"
      >
        {days.map((day) => {
          const active = day === selectedDay;
          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectDay(day)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink",
              )}
            >
              {day.slice(0, 3)}
              {day === today && (
                <span
                  className={cn(
                    "ml-1 text-[9px] uppercase tracking-wider",
                    active ? "text-white/70" : "text-accent",
                  )}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-2">
        {daySlots.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-muted">
            Nothing scheduled on {selectedDay} for this filter.
          </p>
        ) : (
          daySlots.map((slot) => (
            <TimetableSlotCard
              key={slot.id}
              slot={slot}
              subjectIds={subjectIds}
              state={stateOf(slot)}
              selected={slot.id === selectedSlotId}
              showTime
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </Card>
  );
}
