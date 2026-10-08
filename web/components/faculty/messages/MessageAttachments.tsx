"use client";

import {
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Attachment } from "@/data/faculty-announcements";
import { formatBytes } from "@/components/faculty/announcements/utils";
import { cn } from "@/lib/utils";

// Copied from components/faculty/announcements/AnnouncementDetail.tsx, where it
// is a file-local helper rather than an export. Kept identical so a PDF looks
// the same in a message as it does on an announcement.
export function AttachmentIcon({
  mimeType,
  className,
}: {
  mimeType: string;
  className?: string;
}) {
  const classes = cn("h-4 w-4 shrink-0 text-ink-muted", className);
  if (mimeType.startsWith("image/")) return <ImageIcon className={classes} />;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className={classes} />;
  }
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) {
    return <FileText className={classes} />;
  }
  return <File className={classes} />;
}

// Attachments shown inside a sent message: nothing to remove, nothing to
// download, because no file was ever uploaded.
export function MessageAttachments({
  attachments,
  onBubble = false,
}: {
  attachments: Attachment[];
  // Bubbles sit on a coloured background, so the rows go translucent instead
  // of using the page's surface colours.
  onBubble?: boolean;
}) {
  if (attachments.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1.5">
      {attachments.map((file) => (
        <li
          key={file.id}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
            onBubble ? "border-white/30 bg-white/10" : "border-border",
          )}
        >
          <AttachmentIcon
            mimeType={file.mimeType}
            className={onBubble ? "text-white/80" : undefined}
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-xs",
              onBubble ? "text-white" : "text-ink",
            )}
          >
            {file.name}
          </span>
          <span
            className={cn(
              "shrink-0 font-mono text-[10px] tabular",
              onBubble ? "text-white/70" : "text-ink-muted",
            )}
          >
            {formatBytes(file.sizeBytes)}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled
            title="Demo file — not available"
            className="h-6 shrink-0 px-2 text-[10px]"
          >
            Download
          </Button>
        </li>
      ))}
    </ul>
  );
}

// Attachments staged in a compose box, which can still be taken back out.
export function PendingAttachments({
  attachments,
  onRemove,
}: {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1.5">
      {attachments.map((file) => (
        <li
          key={file.id}
          className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5"
        >
          <AttachmentIcon mimeType={file.mimeType} />
          <span className="min-w-0 flex-1 truncate text-xs text-ink">
            {file.name}
          </span>
          <span className="shrink-0 font-mono text-[10px] tabular text-ink-muted">
            {formatBytes(file.sizeBytes)}
          </span>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            aria-label={`Remove ${file.name}`}
            className="shrink-0 rounded p-0.5 text-ink-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-3 w-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
