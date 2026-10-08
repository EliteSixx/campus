import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/components/faculty/announcements/utils";
import { headerLinkClass, initialsOf, type MessageRow } from "./utils";

// Row 5, right: the newest conversations with this browser's read state
// applied. The participant name and the thread link are siblings, never
// nested, so there is no link inside a link.

function Participant({ row }: { row: MessageRow }) {
  // Only cohort students have a detail page; anyone else stays plain text.
  if (row.participantStudentId) {
    return (
      <Link
        href={`/faculty/students/${row.participantStudentId}`}
        className="truncate rounded text-sm font-semibold text-ink hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {row.participantName}
      </Link>
    );
  }
  return (
    <span className="truncate text-sm font-semibold text-ink">
      {row.participantName}
    </span>
  );
}

export function RecentMessages({ rows }: { rows: MessageRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent messages</CardTitle>
          <CardDescription>Newest conversations first</CardDescription>
        </div>
        <Link href="/faculty/messages" className={headerLinkClass}>
          All messages
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <MessageSquare className="mx-auto h-5 w-5 text-ink-faint" />
            <p className="mt-2 text-sm text-ink-muted">No conversations yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => {
              const unread = row.unreadCount > 0;
              return (
                <li key={row.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent"
                  >
                    {initialsOf(row.participantName)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Participant row={row} />
                      <span className="shrink-0 text-xs text-ink-muted tabular">
                        {formatDateTime(row.lastMessageAt)}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-start gap-2">
                      <Link
                        href={`/faculty/messages/${row.id}`}
                        className="block min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <span
                          className={cn(
                            "block truncate text-xs hover:text-accent",
                            unread ? "font-semibold text-ink" : "text-ink",
                          )}
                        >
                          {row.subject}
                        </span>
                        <span className="block truncate text-xs text-ink-muted">
                          {row.preview}
                        </span>
                      </Link>
                      {unread && (
                        <Badge tone="accent" className="shrink-0 tabular">
                          {row.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
