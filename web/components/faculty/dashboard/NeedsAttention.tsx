import Link from "next/link";
import {
  CalendarClock,
  CircleCheck,
  ClipboardCheck,
  FolderOpen,
  Megaphone,
  MessageSquare,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  daysBetweenISO,
  formatISODate,
  plural,
  type AttentionAssignment,
} from "./utils";

// Row 3, right: a short to-do list built from the other cards' figures. Only
// items with something in them are shown, in a fixed order of urgency.

const MAX_TO_EVALUATE = 3;

interface Item {
  key: string;
  href: string;
  icon: LucideIcon;
  text: string;
  badge: string;
  tone: "accent" | "warning" | "danger" | "neutral";
}

function dueBadge(dueDate: string, todayIST: string): string {
  const days = daysBetweenISO(todayIST, dueDate);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function NeedsAttention({
  attentionCount,
  unreadMessages,
  toEvaluate,
  dueSoon,
  todayIST,
  draftsCount,
  topicsWithoutMaterials,
}: {
  // Students with a warning, counted as the My Students page counts them.
  // null until the clock is known.
  attentionCount: number | null;
  unreadMessages: number;
  toEvaluate: AttentionAssignment[];
  // Empty until the clock is known.
  dueSoon: AttentionAssignment[];
  todayIST: string | null;
  draftsCount: number;
  topicsWithoutMaterials: number;
}) {
  const items: Item[] = [];

  // Students first: the most urgent thing on the list.
  if (attentionCount !== null && attentionCount > 0) {
    items.push({
      key: "students",
      href: "/faculty/students?tab=attention",
      icon: TriangleAlert,
      text: `${plural(attentionCount, "student")} ${
        attentionCount === 1 ? "needs" : "need"
      } attention`,
      badge: String(attentionCount),
      tone: "danger",
    });
  }

  if (unreadMessages > 0) {
    items.push({
      key: "messages",
      href: "/faculty/messages",
      icon: MessageSquare,
      text: plural(unreadMessages, "unread message"),
      badge: String(unreadMessages),
      tone: "accent",
    });
  }

  for (const a of toEvaluate.slice(0, MAX_TO_EVALUATE)) {
    items.push({
      key: `evaluate-${a.id}`,
      href: `/faculty/assignments/${a.id}`,
      icon: ClipboardCheck,
      text: `${plural(a.pendingEvaluation, "submission")} to evaluate — ${a.title} (${a.subjectCode})`,
      badge: String(a.pendingEvaluation),
      tone: "warning",
    });
  }

  if (todayIST !== null) {
    for (const a of dueSoon) {
      items.push({
        key: `due-${a.id}`,
        href: `/faculty/assignments/${a.id}`,
        icon: CalendarClock,
        text: `Due ${formatISODate(a.dueDate)} — ${a.title}`,
        badge: dueBadge(a.dueDate, todayIST),
        tone: "danger",
      });
    }
  }

  if (draftsCount > 0) {
    items.push({
      key: "drafts",
      href: "/faculty/announcements",
      icon: Megaphone,
      text: `${plural(draftsCount, "draft announcement")} not sent`,
      badge: String(draftsCount),
      tone: "neutral",
    });
  }

  if (topicsWithoutMaterials > 0) {
    items.push({
      key: "materials",
      href: "/faculty/materials",
      icon: FolderOpen,
      text: `${plural(topicsWithoutMaterials, "topic")} ${
        topicsWithoutMaterials === 1 ? "has" : "have"
      } no materials`,
      badge: String(topicsWithoutMaterials),
      tone: "neutral",
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Needs attention</CardTitle>
          <CardDescription>What is waiting on you across your courses</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 && attentionCount === null ? (
          // Nothing yet, but items that depend on today may still arrive, so
          // "all caught up" would be a guess. A skeleton until the clock is known.
          <div aria-hidden="true" className="space-y-2">
            <div className="h-11 animate-pulse rounded-lg bg-surface-raised" />
            <div className="h-11 animate-pulse rounded-lg bg-surface-raised" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <CircleCheck className="mx-auto h-5 w-5 text-success" />
            <p className="mt-2 text-sm font-semibold text-ink">
              You&apos;re all caught up
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map(({ key, href, icon: Icon, text, badge, tone }) => (
              <li key={key}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised/40 px-3.5 py-2.5 transition-colors hover:border-border-strong hover:bg-surface-raised/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Icon className="h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 flex-1 text-sm text-ink">
                    {text}
                  </span>
                  <Badge tone={tone} className="shrink-0 tabular">
                    {badge}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
