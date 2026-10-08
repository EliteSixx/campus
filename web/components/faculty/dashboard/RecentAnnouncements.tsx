import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDateTime,
  statusLabel,
  statusTone,
} from "@/components/faculty/announcements/utils";
import { headerLinkClass, type AnnouncementRow } from "./utils";

// Row 5, left: the latest published or scheduled announcements, including any
// written in this browser. Drafts are counted in "Needs attention" instead.

export function RecentAnnouncements({ rows }: { rows: AnnouncementRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent announcements</CardTitle>
          <CardDescription>Published and scheduled</CardDescription>
        </div>
        <Link href="/faculty/announcements" className={headerLinkClass}>
          All announcements
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <Megaphone className="mx-auto h-5 w-5 text-ink-faint" />
            <p className="mt-2 text-sm text-ink-muted">
              No announcements sent yet.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/faculty/announcements/${row.id}`}
                    className="min-w-0 rounded text-sm font-semibold text-ink hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {row.title}
                  </Link>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {row.isLocal && <Badge tone="neutral">Local</Badge>}
                    <Badge tone={statusTone[row.status]}>
                      {statusLabel[row.status]}
                    </Badge>
                  </div>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{row.audienceLabel}</p>
                <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-ink-muted tabular">
                  <span>
                    {row.status === "scheduled"
                      ? `Scheduled for ${formatDateTime(row.at)}`
                      : formatDateTime(row.at)}
                  </span>
                  {row.status === "published" && (
                    <span>
                      {row.readCount} of {row.totalRecipients} read
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
