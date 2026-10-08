"use client";

import { useEffect, useMemo, useState } from "react";
import type { Weekday } from "@/data/timetable";
import type { ResolvedSlot, TimetableView } from "@/lib/api/timetable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SlotDetailPanel } from "./SlotDetailPanel";
import { TimetableDayView } from "./TimetableDayView";
import { TimetableGrid } from "./TimetableGrid";
import { subjectSwatch, toMinutes, weekdayFromDate } from "./utils";

const ALL = "all";

export function TimetableClient({ view }: { view: TimetableView }) {
  const [section, setSection] = useState<string>(ALL);
  const [subject, setSubject] = useState<string>(ALL);
  const [mode, setMode] = useState<"week" | "day">("week");
  const [pickedDay, setPickedDay] = useState<Weekday | null>(null);
  const [selected, setSelected] = useState<ResolvedSlot | null>(null);

  // The clock is only read after mount and held in state, so the server render
  // and the first client render are identical and nothing can mismatch. It
  // ticks each minute so "Now" and "Next" stay honest.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // null at the weekend, which is exactly when nothing should be highlighted.
  const today = now ? weekdayFromDate(now, view.days) : null;

  // Outside class hours both of these stay null, so no false "Now" badge.
  const { nowSlotId, nextSlotId } = useMemo(() => {
    if (!now || !today) return { nowSlotId: null, nextSlotId: null };

    const minutes = now.getHours() * 60 + now.getMinutes();
    const todaySlots = view.slots
      .filter((s) => s.day === today)
      .sort((a, b) => a.start.localeCompare(b.start));

    const current = todaySlots.find(
      (s) => toMinutes(s.start) <= minutes && toMinutes(s.end) > minutes,
    );
    const upcoming = todaySlots.find((s) => toMinutes(s.start) > minutes);

    return {
      nowSlotId: current?.id ?? null,
      nextSlotId: upcoming?.id ?? null,
    };
  }, [now, today, view.slots]);

  const filtered = useMemo(
    () =>
      view.slots.filter(
        (slot) =>
          (section === ALL || slot.section === section) &&
          (subject === ALL || slot.subjectId === subject),
      ),
    [view.slots, section, subject],
  );

  const subjectIds = useMemo(
    () => view.subjects.map((s) => s.id),
    [view.subjects],
  );

  const filtersActive = section !== ALL || subject !== ALL;
  // Falls back to the first weekday until the clock has been read.
  const selectedDay = pickedDay ?? today ?? view.days[0];

  return (
    <>
      <Card className="mt-5 p-4 print:hidden">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-48">
            <label
              htmlFor="timetable-section"
              className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-muted"
            >
              Section
            </label>
            <Select
              id="timetable-section"
              className="text-xs"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value={ALL}>All sections</option>
              {view.sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-64">
            <label
              htmlFor="timetable-subject"
              className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-muted"
            >
              Subject
            </label>
            <Select
              id="timetable-subject"
              className="text-xs"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value={ALL}>All subjects</option>
              {view.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </Select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSection(ALL);
              setSubject(ALL);
            }}
            disabled={!filtersActive}
          >
            Clear
          </Button>

          {/* Below lg the week grid is never shown, so the toggle has nothing
              to switch between and is hidden with it. */}
          <div className="ml-auto hidden items-center gap-1.5 lg:flex">
            <Button
              size="sm"
              variant={mode === "week" ? "primary" : "outline"}
              onClick={() => setMode("week")}
            >
              Week view
            </Button>
            <Button
              size="sm"
              variant={mode === "day" ? "primary" : "outline"}
              onClick={() => setMode("day")}
            >
              Day view
            </Button>
          </div>
        </div>

        {view.subjects.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3">
            {view.subjects.map((s) => (
              <span
                key={s.id}
                className="flex items-center gap-1.5 text-[11px] text-ink-muted"
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    subjectSwatch(s.id, subjectIds),
                  )}
                />
                <span className="font-mono font-semibold text-ink">
                  {s.code}
                </span>
                {s.name}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Week grid on desktop only. On a phone the day view takes over, which
          is the mobile default asked for — done in CSS so there is no
          clientside width check and nothing to mismatch on hydration.
          Print is a third case: paper is neither, and the grid is the whole
          point of printing, so print:!block overrides both `hidden` and the
          `lg` breakpoint whichever view is on screen at the time. */}
      <div
        className={cn(
          mode === "week" ? "hidden lg:block" : "hidden",
          "print:!block",
        )}
      >
        <TimetableGrid
          days={view.days}
          periods={view.periods}
          slots={filtered}
          subjectIds={subjectIds}
          today={today}
          nowSlotId={nowSlotId}
          nextSlotId={nextSlotId}
          selectedSlotId={selected?.id ?? null}
          onSelect={setSelected}
        />
      </div>

      {/* Never printed: the grid above stands in for it on paper. */}
      <div
        className={cn(
          "print:!hidden",
          mode === "week" ? "lg:hidden" : undefined,
        )}
      >
        <TimetableDayView
          days={view.days}
          slots={filtered}
          subjectIds={subjectIds}
          selectedDay={selectedDay}
          onSelectDay={setPickedDay}
          today={today}
          nowSlotId={nowSlotId}
          nextSlotId={nextSlotId}
          selectedSlotId={selected?.id ?? null}
          onSelect={setSelected}
        />
      </div>

      {selected && (
        <SlotDetailPanel slot={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
