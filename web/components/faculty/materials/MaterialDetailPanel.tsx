"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Material } from "@/lib/api/faculty-materials-meta";
import {
  MATERIAL_TYPE_META,
  videoProvider,
} from "@/lib/api/faculty-materials-meta";
import {
  formatBytes,
  formatDateTime,
} from "@/components/faculty/announcements/utils";
import {
  isLocalMaterial,
  isSearchUrl,
  levelLabel,
  TYPE_ICON,
} from "./utils";

export function MaterialDetailPanel({
  material,
  pathLabel,
  onClose,
  onToggleVisibility,
  onDelete,
}: {
  material: Material;
  pathLabel: string;
  onClose: () => void;
  onToggleVisibility: (material: Material) => void;
  onDelete: (material: Material) => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const Icon = TYPE_ICON[material.type];
  const meta = MATERIAL_TYPE_META[material.type];
  const hidden = material.visibility === "hidden";
  const isLocal = isLocalMaterial(material);

  useEffect(() => {
    panelRef.current
      ?.querySelector<HTMLButtonElement>("#material-panel-close")
      ?.focus();
  }, [material.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Reset the transient states when a different material opens in the panel.
  useEffect(() => {
    setCopied(false);
    setConfirmingDelete(false);
  }, [material.id]);

  async function copyLink() {
    if (!material.url) return;
    try {
      await navigator.clipboard.writeText(material.url);
      setCopied(true);
    } catch (e) {
      console.error("Failed to copy link to clipboard", e);
    }
  }

  const isVideoSearch =
    material.type === "video" &&
    material.url !== null &&
    videoProvider(material.url) === "youtube" &&
    isSearchUrl(material.url);

  const linkLabel =
    material.type === "video"
      ? isVideoSearch
        ? "Search on YouTube"
        : "Watch video"
      : "Open link";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Full screen on a phone, a side panel from sm up. */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-panel-heading"
        className="relative ml-auto flex h-full w-full flex-col border-border bg-surface shadow-lg dark:bg-slate-950 sm:max-w-lg sm:border-l"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-accent" />
              <h2
                id="material-panel-heading"
                className="text-base font-bold text-ink"
              >
                {material.title}
              </h2>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone="accent" className="text-[10px]">
                {meta.label}
              </Badge>
              <Badge tone="neutral" className="text-[10px]">
                {levelLabel(material)}
              </Badge>
              {hidden && (
                <Badge tone="warning" className="text-[10px]">
                  Hidden
                </Badge>
              )}
              {isLocal && (
                <Badge tone="neutral" className="text-[10px]">
                  Local
                </Badge>
              )}
            </div>
          </div>
          <button
            id="material-panel-close"
            type="button"
            onClick={onClose}
            aria-label="Close material details"
            className="shrink-0 rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Location
            </p>
            <p className="mt-0.5 text-xs font-semibold text-ink">{pathLabel}</p>
          </div>

          {material.description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Description
              </p>
              <p className="mt-0.5 whitespace-pre-line text-xs text-ink-muted">
                {material.description}
              </p>
            </div>
          )}

          {material.pyq && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Past paper
              </p>
              <p className="mt-0.5 text-xs font-semibold text-ink">
                {material.pyq.year} ·{" "}
                {material.pyq.examType === "mid-sem"
                  ? "Mid-sem"
                  : material.pyq.examType === "end-sem"
                    ? "End-sem"
                    : "Quiz"}
              </p>
            </div>
          )}

          {material.file && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                File
              </p>
              <div className="mt-1 flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                <Icon className="h-4 w-4 shrink-0 text-ink-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs text-ink">
                    {material.file.name}
                  </span>
                  <span className="block font-mono text-[10px] tabular text-ink-muted">
                    {formatBytes(material.file.sizeBytes)} ·{" "}
                    {material.file.mimeType}
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  title="Demo file — not available"
                  className="shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {material.url && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {material.type === "video" ? "Video" : "Link"}
              </p>
              <p className="mt-1 break-all font-mono text-[11px] text-ink-muted">
                {material.url}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* A real anchor, opened in a new tab, with the opener severed. */}
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-white shadow-md shadow-accent/20 transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {linkLabel}
                </a>
                <Button size="sm" variant="outline" onClick={copyLink}>
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy link
                    </>
                  )}
                </Button>
              </div>
              {isVideoSearch && (
                <p className="mt-1.5 text-[11px] text-ink-muted">
                  This opens a YouTube search rather than one fixed video, so it
                  cannot rot.
                </p>
              )}
            </div>
          )}

          {material.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Tags
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {material.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Uploaded by
              </p>
              <p className="mt-0.5 text-ink">{material.uploadedBy}</p>
              <p className="font-mono text-[10px] tabular text-ink-muted">
                {formatDateTime(material.uploadedAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Engagement
              </p>
              <p className="mt-0.5 flex items-center gap-3 text-ink">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-ink-muted" />
                  <span className="font-mono tabular">{material.views}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3.5 w-3.5 text-ink-muted" />
                  <span className="font-mono tabular">{material.downloads}</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-4">
          <Button
            size="sm"
            variant={hidden ? "primary" : "outline"}
            onClick={() => onToggleVisibility(material)}
          >
            {hidden ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                Show to students
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Hide from students
              </>
            )}
          </Button>

          {/* Only an upload made in this browser can be deleted; the seed
              material has nowhere to be deleted from. */}
          {isLocal &&
            (confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-danger">
                  Delete this upload?
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={() => onDelete(material)}>
                  Delete
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            ))}
        </div>
      </aside>
    </div>
  );
}
