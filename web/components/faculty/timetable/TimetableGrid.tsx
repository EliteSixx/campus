"use client";

import type { Weekday } from "@/data/timetable";
import type { Period, ResolvedSlot } from "@/lib/api/timetable";
import { cn } from "@/lib/utils";
import { TimetableSlotCard, type SlotState } from "./TimetableSlotCard";

type Cell =
  | { kind: "slot"; slot: ResolvedSlot; rowSpan: number }
  // A row already taken by the tall card above it.
  | { kind: "covered" }
  | { kind: "free" }
  | { kind: "break" };

// One column per day. A slot covering several consecutive periods — a two-hour
// lab, say — is emitted once with a rowSpan, and the rows underneath it are
// marked "covered" so the renderer skips them. That is what makes a lab render
// as a single tall card rather than two stacked ones.
//
// Times are zero-padded "HH:MM", so plain string comparison is time order.
function buildColumn(periods: Period[], daySlots: ResolvedSlot[]): Cell[] {
  const cells: Cell[] = [];
  let covered = 0;

  for (const period of periods) {
    if (period.isBreak) {
      cells.push({ kind: "break" });
      continue;
    }
    if (covered > 0) {
      covered -= 1;
      cells.push({ kind: "covered" });
      continue;
    }

    const slot = daySlots.find(
      (s) => s.start <= period.start && s.end >= period.end,
    );
    if (!slot) {
      cells.push({ kind: "free" });
      continue;
    }

    // Periods tile the day end to end and a break row is never scheduled over,
    // so every period inside the slot's range is contiguous with this one.
    const rowSpan = periods.filter(
      (p) => !p.isBreak && p.start >= slot.start && p.end <= slot.end,
    ).length;

    cells.push({ kind: "slot", slot, rowSpan });
    covered = rowSpan - 1;
  }

  return cells;
}

export function TimetableGrid({
  days,
  periods,
  slots,
  subjectIds,
  today,
  nowSlotId,
  nextSlotId,
  selectedSlotId,
  onSelect,
}: {
  days: Weekday[];
  periods: Period[];
  // Already filtered by the client.
  slots: ResolvedSlot[];
  subjectIds: string[];
  today: Weekday | null;
  nowSlotId: string | null;
  nextSlotId: string | null;
  selectedSlotId: string | null;
  onSelect: (slot: ResolvedSlot) => void;
}) {
  const columns = new Map<Weekday, Cell[]>(
    days.map((day) => [
      day,
      buildColumn(
        periods,
        slots.filter((s) => s.day === day),
      ),
    ]),
  );

  const stateOf = (slot: ResolvedSlot): SlotState => {
    if (slot.id === nowSlotId) return "now";
    if (slot.id === nextSlotId) return "next";
    return null;
  };

  return (
    // The grid scrolls sideways on small screens; the page body never does.
    <div className="mt-4 overflow-x-auto scrollbar-thin print:overflow-visible">
      {/* On paper the 880px floor and the sideways scroll both go away, and
          table-fixed splits the page width evenly so no column is cut off. */}
      <table className="w-full min-w-[880px] border-separate border-spacing-1 print:min-w-0 print:w-full print:table-fixed print:border-spacing-0.5 print:text-[9px]">
        <caption className="sr-only">
          Weekly teaching timetable, periods down the side and days across the
          top
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-20 pb-1 text-left print:w-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Time
              </span>
            </th>
            {days.map((day) => (
              <th key={day} scope="col" className="pb-1">
                <div
                  className={cn(
                    "rounded-lg border px-2 py-1.5 text-xs font-bold",
                    day === today
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : "border-transparent text-ink",
                  )}
                >
                  {day}
                  {day === today && (
                    <span className="ml-1 text-[9px] font-bold uppercase tracking-wider print:hidden">
                      Today
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {periods.map((period, row) => {
            if (period.isBreak) {
              return (
                <tr key={period.start}>
                  <td
                    colSpan={days.length + 1}
                    className="rounded-md bg-surface-raised px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-ink-muted"
                  >
                    Break · {period.start}–{period.end}
                  </td>
                </tr>
              );
            }

            return (
              <tr key={period.start} className="print:break-inside-avoid">
                <th scope="row" className="align-top">
                  <div className="whitespace-nowrap pr-2 pt-2 text-right font-mono text-[10px] font-medium tabular leading-tight text-ink-muted">
                    {period.start}
                    <br />
                    {period.end}
                  </div>
                </th>

                {days.map((day) => {
                  const cell = columns.get(day)?.[row];
                  if (!cell || cell.kind === "covered") return null;

                  const isToday = day === today;

                  if (cell.kind === "slot") {
                    return (
                      <td
                        key={day}
                        rowSpan={cell.rowSpan}
                        className={cn(
                          "h-20 align-top",
                          isToday && "bg-accent-soft/40 print:bg-transparent",
                        )}
                      >
                        <TimetableSlotCard
                          slot={cell.slot}
                          subjectIds={subjectIds}
                          state={stateOf(cell.slot)}
                          selected={cell.slot.id === selectedSlotId}
                          onSelect={onSelect}
                        />
                      </td>
                    );
                  }

                  return (
                    <td
                      key={day}
                      className={cn(
                        "h-20 align-top",
                        isToday && "bg-accent-soft/40 print:bg-transparent",
                      )}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border/70 text-[10px] font-medium text-ink-faint">
                        Free
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
