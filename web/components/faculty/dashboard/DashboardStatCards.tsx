import Link from "next/link";
import {
  CalendarClock,
  ClipboardCheck,
  MessageSquare,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardTimetableSlot } from "@/lib/api/faculty-dashboard-meta";
import { plural, scoreTone, toneText, type Tone } from "./utils";

// Row 2: four headline numbers, each a link to the page it summarises.
//
// Built here rather than with MetricCard because that component sets
// font-mono on the value, and the dashboard keeps to one typeface.

export interface ClassesToday {
  // Lecture and Lab slots on today's weekday.
  count: number;
  // The first of those starting after now, or null.
  next: DashboardTimetableSlot | null;
}

function StatCard({
  href,
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <Card className="h-full p-5 group-hover:border-border-strong">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold text-ink-muted">{label}</p>
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <p
          className={cn(
            "mt-2 text-2xl font-extrabold tracking-tight tabular",
            tone ? toneText[tone] : "text-ink",
          )}
        >
          {value}
        </p>
        {/* A non-breaking space keeps the line's height while it is empty. */}
        <p className="mt-1 truncate text-xs font-medium text-ink-muted">
          {sub || " "}
        </p>
      </Card>
    </Link>
  );
}

function classesSubtext(classes: ClassesToday | null): string {
  if (classes === null) return "";
  if (classes.count === 0) return "No classes today";
  if (classes.next === null) return "No more classes today";
  const name = classes.next.subjectCode ?? classes.next.title;
  return `Next: ${name} at ${classes.next.startTime}`;
}

export function DashboardStatCards({
  classesToday,
  unreadMessages,
  pendingEvaluation,
  alignmentPct,
  subjectsCount,
}: {
  classesToday: ClassesToday | null;
  unreadMessages: number;
  pendingEvaluation: number;
  alignmentPct: number;
  subjectsCount: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        href="/faculty/timetable"
        label="Classes today"
        value={classesToday ? String(classesToday.count) : "—"}
        sub={classesSubtext(classesToday)}
        icon={CalendarClock}
      />
      <StatCard
        href="/faculty/messages"
        label="Unread messages"
        value={String(unreadMessages)}
        sub="from students"
        icon={MessageSquare}
      />
      <StatCard
        href="/faculty/assignments"
        label="To evaluate"
        value={String(pendingEvaluation)}
        sub="submissions waiting"
        icon={ClipboardCheck}
      />
      <StatCard
        href="/faculty/subjects"
        label="Curriculum alignment"
        value={`${alignmentPct}%`}
        sub={`Across ${plural(subjectsCount, "subject")}`}
        icon={Target}
        tone={scoreTone(alignmentPct)}
      />
    </div>
  );
}
