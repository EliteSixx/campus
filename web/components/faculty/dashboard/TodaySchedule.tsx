import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getCurrentAndNextSlot,
  getMinutesFromDate,
  getTodaySlots,
  timeToMinutes,
  type DashboardTimetableSlot,
} from "@/lib/api/faculty-dashboard-meta";
import {
  firstSlotOfNextWorkingDay,
  headerLinkClass,
  slotLabel,
  slotTypeTone,
} from "./utils";

// Row 3, left: today's slots in time order, with the one in progress and the
// one coming up marked. Nothing is shown until the clock is known, because
// which day "today" is cannot be decided on the server.

function SkeletonRows() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-raised" />
      ))}
    </div>
  );
}

function SlotRow({
  slot,
  isCurrent,
  isNext,
  isPast,
}: {
  slot: DashboardTimetableSlot;
  isCurrent: boolean;
  isNext: boolean;
  isPast: boolean;
}) {
  return (
    <li
      className={cn(
        "rounded-lg border px-3.5 py-3",
        isCurrent
          ? "border-accent bg-accent-soft/60"
          : "border-border bg-surface-raised/40",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            "text-xs font-semibold tabular",
            isPast ? "text-ink-faint" : "text-ink",
          )}
        >
          {slot.startTime}–{slot.endTime}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {isCurrent && <Badge tone="accent">Now</Badge>}
          {isNext && <Badge tone="neutral">Next</Badge>}
          <Badge tone={slotTypeTone[slot.type]}>{slot.type}</Badge>
        </div>
      </div>
      <p
        className={cn(
          "mt-1 text-sm font-semibold",
          isPast ? "text-ink-muted" : "text-ink",
        )}
      >
        {slotLabel(slot)}
      </p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {slot.room}
        </span>
        {slot.className && <span>{slot.className}</span>}
      </p>
    </li>
  );
}

function EmptyToday({
  slots,
  now,
}: {
  slots: DashboardTimetableSlot[];
  now: Date;
}) {
  const upcoming = firstSlotOfNextWorkingDay(slots, now);
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
      <CalendarDays className="mx-auto h-5 w-5 text-ink-faint" />
      <p className="mt-2 text-sm font-semibold text-ink">No classes today</p>
      {upcoming && (
        <p className="mt-1 text-xs text-ink-muted">
          Next class: {upcoming.day}{" "}
          <span className="tabular">{upcoming.startTime}</span> —{" "}
          {slotLabel(upcoming)}
        </p>
      )}
    </div>
  );
}

export function TodaySchedule({
  slots,
  now,
}: {
  slots: DashboardTimetableSlot[];
  now: Date | null;
}) {
  const today = now ? getTodaySlots(slots, now) : [];
  const { current, next } = now
    ? getCurrentAndNextSlot(slots, now)
    : { current: null, next: null };
  const minutes = now ? getMinutesFromDate(now) : null;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Today&apos;s schedule</CardTitle>
          <CardDescription>Times shown in IST</CardDescription>
        </div>
        <Link href="/faculty/timetable" className={headerLinkClass}>
          Full timetable
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {now === null ? (
          <SkeletonRows />
        ) : today.length === 0 ? (
          <EmptyToday slots={slots} now={now} />
        ) : (
          <ul className="space-y-2">
            {today.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                isCurrent={slot.id === current?.id}
                isNext={slot.id === next?.id}
                isPast={minutes !== null && timeToMinutes(slot.endTime) <= minutes}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
