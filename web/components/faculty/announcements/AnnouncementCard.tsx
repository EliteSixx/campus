"use client";

import Link from "next/link";
import { Megaphone, Paperclip, Pin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AnnouncementStatus } from "@/data/faculty-announcements";
import {
  categoryLabel,
  categoryTone,
  dateLine,
  priorityLabel,
  priorityTone,
  statusLabel,
  statusTone,
  truncate,
  type AnnouncementListEntry,
} from "./utils";

export function AnnouncementCard({
  entry,
  status,
}: {
  entry: AnnouncementListEntry;
  // The effective status, which may differ from the stored one once a
  // scheduled announcement's time has passed.
  status: AnnouncementStatus;
}) {
  const { announcement, audienceLabel, totalRecipients, readCount, readPercent } =
    entry;

  return (
    <Link
      href={`/faculty/announcements/${announcement.id}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Card className="p-5 hover:border-accent/40">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {announcement.pinned && (
                <Pin
                  className="h-3.5 w-3.5 shrink-0 text-accent"
                  aria-label="Pinned"
                />
              )}
              <h3 className="text-base font-bold text-ink">
                {announcement.title}
              </h3>
              <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
              {entry.isLocal && <Badge tone="neutral">Local</Badge>}
            </div>

            <p className="mt-1.5 text-sm text-ink-muted">
              {truncate(announcement.body, 140)}
            </p>

            <p className="mt-2 text-xs text-ink-muted">
              Posted to <span className="text-ink">{audienceLabel}</span>
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Badge
                tone={categoryTone[announcement.category]}
                className="text-[10px]"
              >
                {categoryLabel(announcement.category)}
              </Badge>
              <Badge
                tone={priorityTone[announcement.priority]}
                className="text-[10px]"
              >
                {priorityLabel(announcement.priority)}
              </Badge>

              {announcement.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  <Paperclip className="h-3 w-3" />
                  <span className="font-mono tabular">
                    {announcement.attachments.length}
                  </span>
                </span>
              )}

              <span className="text-xs text-ink-muted">
                {dateLine(announcement, status)}
              </span>
            </div>

            {status === "published" && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-xs text-ink-muted">
                  <span className="font-mono tabular text-ink">
                    {readCount} of {totalRecipients}
                  </span>{" "}
                  read{" "}
                  <span className="font-mono tabular">({readPercent}%)</span>
                </p>
                <div className="mt-1.5">
                  <Progress value={readPercent} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
