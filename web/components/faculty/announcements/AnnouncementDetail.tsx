"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Pin,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import type { Announcement, Attachment } from "@/data/faculty-announcements";
import { cn } from "@/lib/utils";
import {
  categoryLabel,
  categoryTone,
  effectiveStatus,
  formatBytes,
  formatDateTime,
  priorityLabel,
  priorityTone,
  readLocalAnnouncements,
  statusLabel,
  statusTone,
  type DetailRecipient,
  type LocalAnnouncement,
} from "./utils";

export interface AnnouncementDetailData {
  announcement: Announcement;
  audienceLabel: string;
  totalRecipients: number;
  readCount: number;
  unreadCount: number;
  readPercent: number;
  readStudents: DetailRecipient[];
  unreadStudents: DetailRecipient[];
}

function AttachmentIcon({ mimeType }: { mimeType: string }) {
  const className = "h-4 w-4 shrink-0 text-ink-muted";
  if (mimeType.startsWith("image/")) return <ImageIcon className={className} />;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className={className} />;
  }
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) {
    return <FileText className={className} />;
  }
  return <File className={className} />;
}

function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <h3 className="text-sm font-bold tracking-tight text-ink">
        Attachments{" "}
        <span className="font-mono tabular text-ink-muted">
          ({attachments.length})
        </span>
      </h3>
      <ul className="mt-2 space-y-1.5">
        {attachments.map((file) => (
          <li
            key={file.id}
            className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2"
          >
            <AttachmentIcon mimeType={file.mimeType} />
            <span className="min-w-0 flex-1 truncate text-xs text-ink">
              {file.name}
            </span>
            <span className="shrink-0 font-mono text-[10px] tabular text-ink-muted">
              {formatBytes(file.sizeBytes)}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled
              title="Demo file — not available"
              className="shrink-0"
            >
              Download
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecipientRow({ student }: { student: DetailRecipient }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0">
      {/* Only linked when that student really has a page — students outside
          this faculty member's cohort would 404. */}
      {student.hasDetailPage ? (
        <Link
          href={`/faculty/students/${student.id}`}
          className="min-w-0 truncate text-xs font-semibold text-accent hover:underline"
        >
          {student.name}
        </Link>
      ) : (
        <span className="min-w-0 truncate text-xs text-ink">{student.name}</span>
      )}
      <span className="shrink-0 font-mono text-[10px] tabular text-ink-muted">
        {student.rollNumber ?? "—"}
      </span>
    </li>
  );
}

function ReadStatusCard({ data }: { data: AnnouncementDetailData }) {
  const [listTab, setListTab] = useState<"read" | "unread">("read");
  const [reminderSent, setReminderSent] = useState(false);

  const shown = listTab === "read" ? data.readStudents : data.unreadStudents;

  return (
    <Card className="mt-5 p-5">
      <h3 className="text-sm font-bold tracking-tight text-ink">Read status</h3>

      <p className="mt-2 font-mono text-2xl font-extrabold tabular tracking-tight text-ink">
        {data.readCount} / {data.totalRecipients}
      </p>
      <p className="text-xs text-ink-muted">
        read <span className="font-mono tabular">({data.readPercent}%)</span>
      </p>

      <div className="mt-3">
        <Progress value={data.readPercent} />
      </div>

      <div
        role="tablist"
        aria-label="Read status"
        className="mt-4 flex gap-1.5 border-b border-border pb-3"
      >
        {(
          [
            { id: "read" as const, label: `Read (${data.readCount})` },
            { id: "unread" as const, label: `Unread (${data.unreadCount})` },
          ]
        ).map((item) => {
          const active = listTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setListTab(item.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="py-4 text-center text-xs text-ink-muted">
          {listTab === "read"
            ? "Nobody has opened this yet."
            : "Everyone has read this."}
        </p>
      ) : (
        <ul className="mt-2">
          {shown.map((student) => (
            <RecipientRow key={student.id} student={student} />
          ))}
        </ul>
      )}

      {data.unreadCount > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          {reminderSent ? (
            <p className="flex items-center gap-2 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Reminder sent to {data.unreadCount} student
              {data.unreadCount === 1 ? "" : "s"}
            </p>
          ) : (
            <Button size="sm" onClick={() => setReminderSent(true)}>
              <Send className="h-3.5 w-3.5" />
              Send reminder to unread
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

export function AnnouncementDetail({
  data,
  announcementId,
}: {
  // null for ids created in this browser, which the server knows nothing about.
  data: AnnouncementDetailData | null;
  announcementId: string;
}) {
  const [local, setLocal] = useState<LocalAnnouncement | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    if (data) return;
    setLocal(
      readLocalAnnouncements().find((a) => a.id === announcementId) ?? null,
    );
    setCheckedStorage(true);
  }, [data, announcementId]);

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  const nowISO = now ? now.toISOString() : null;

  const announcement: Announcement | null = useMemo(
    () => data?.announcement ?? local,
    [data, local],
  );

  const backLink = (
    <Link
      href="/faculty/announcements"
      className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to announcements
    </Link>
  );

  // Nothing from the server and storage not read yet: this is the one frame
  // between the server render and the effect, so it must match the server.
  if (!announcement && !checkedStorage) {
    return (
      <Card className="p-6">
        <p className="text-sm text-ink-muted">Loading announcement…</p>
      </Card>
    );
  }

  if (!announcement) {
    return (
      <Card className="p-8 text-center">
        <Megaphone className="mx-auto h-6 w-6 text-ink-faint" />
        <p className="mt-2 text-sm font-semibold text-ink">
          Announcement not found
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          It may have been created in another browser, or removed from this
          one&apos;s storage.
        </p>
        <Link
          href="/faculty/announcements"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to announcements
        </Link>
      </Card>
    );
  }

  const status = effectiveStatus(announcement, nowISO);
  const isLocal = data === null;
  const audienceLabel = data?.audienceLabel ?? local?.audienceLabel ?? "";
  const totalRecipients = data?.totalRecipients ?? local?.recipientCount ?? 0;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Announcements", href: "/faculty/announcements" },
          { label: announcement.title },
        ]}
      />

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Megaphone className="h-5 w-5 shrink-0 text-accent" />
          {announcement.pinned && (
            <Pin className="h-4 w-4 shrink-0 text-accent" aria-label="Pinned" />
          )}
          <h2 className="text-xl font-bold text-ink">{announcement.title}</h2>
          <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
          {isLocal && <Badge tone="neutral">Local</Badge>}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone={categoryTone[announcement.category]}>
            {categoryLabel(announcement.category)}
          </Badge>
          <Badge tone={priorityTone[announcement.priority]}>
            {priorityLabel(announcement.priority)}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          {audienceLabel && (
            <span>
              Posted to <span className="text-ink">{audienceLabel}</span>
            </span>
          )}
          {announcement.publishAt ? (
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              {status === "scheduled" ? "Scheduled for " : "Published "}
              <span className="text-ink">
                {formatDateTime(announcement.publishAt)}
              </span>
            </span>
          ) : (
            <span>Not published yet</span>
          )}
        </div>

        <p className="mt-4 max-w-3xl whitespace-pre-line text-sm text-ink-muted">
          {announcement.body}
        </p>

        <AttachmentList attachments={announcement.attachments} />
      </Card>

      {status === "scheduled" && announcement.publishAt && (
        <Card className="mt-5 border-accent/40 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
            Will be published on {formatDateTime(announcement.publishAt)}
          </h3>
          <p className="mt-1.5 text-xs text-ink-muted">
            It will reach{" "}
            <span className="font-mono tabular text-ink">
              {totalRecipients}
            </span>{" "}
            student{totalRecipients === 1 ? "" : "s"}. Read tracking starts once
            it goes out.
          </p>
        </Card>
      )}

      {status === "draft" && (
        <Card className="mt-5 p-5">
          <h3 className="text-sm font-bold text-ink">Draft</h3>
          <p className="mt-1.5 text-xs text-ink-muted">
            This has not been sent to anyone. Read tracking starts after
            publishing.
          </p>
        </Card>
      )}

      {status === "published" &&
        (data ? (
          <ReadStatusCard data={data} />
        ) : (
          <Card className="mt-5 p-5">
            <h3 className="text-sm font-bold tracking-tight text-ink">
              Read status
            </h3>
            <p className="mt-2 font-mono text-2xl font-extrabold tabular tracking-tight text-ink">
              0 / {totalRecipients}
            </p>
            <p className="text-xs text-ink-muted">read</p>
            <div className="mt-3">
              <Progress value={0} />
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              This announcement was created in this browser, so nothing has been
              delivered and no reads can be recorded.
            </p>
          </Card>
        ))}

      {backLink}
    </>
  );
}
