"use client";

import { Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Material } from "@/lib/api/faculty-materials-meta";
import { MATERIAL_TYPE_META } from "@/lib/api/faculty-materials-meta";
import {
  formatBytes,
  formatDateTime,
} from "@/components/faculty/announcements/utils";
import { cn } from "@/lib/utils";
import { domainOf, isLocalMaterial, TYPE_ICON } from "./utils";

const MAX_VISIBLE_TAGS = 3;

export function MaterialRow({
  material,
  pathLabel,
  onOpen,
}: {
  material: Material;
  // "CS303 › Unit 3 › Deadlocks", shown on the library list where rows come
  // from several courses. Omitted inside the course tree, where the
  // surrounding section already says where you are.
  pathLabel?: string;
  onOpen: (material: Material) => void;
}) {
  const Icon = TYPE_ICON[material.type];
  const meta = MATERIAL_TYPE_META[material.type];
  const hidden = material.visibility === "hidden";
  const extraTags = material.tags.length - MAX_VISIBLE_TAGS;

  return (
    <button
      type="button"
      onClick={() => onOpen(material)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors",
        "hover:border-accent/40 hover:bg-surface-raised",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        hidden && "opacity-70",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-ink">{material.title}</span>
          <Badge tone="neutral" className="px-1.5 py-0 text-[9px]">
            {meta.label}
          </Badge>
          {hidden && (
            <Badge tone="warning" className="px-1.5 py-0 text-[9px]">
              Hidden
            </Badge>
          )}
          {isLocalMaterial(material) && (
            <Badge tone="neutral" className="px-1.5 py-0 text-[9px]">
              Local
            </Badge>
          )}
        </span>

        {pathLabel && (
          <span className="mt-0.5 block truncate text-[11px] text-ink-muted">
            {pathLabel}
          </span>
        )}

        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted">
          <span className="font-mono tabular">
            {/* A link has no size, so its host stands in for one. */}
            {material.file
              ? formatBytes(material.file.sizeBytes)
              : material.url
                ? domainOf(material.url)
                : "—"}
          </span>
          <span className="font-mono tabular">
            {formatDateTime(material.uploadedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span className="font-mono tabular">{material.views}</span>
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span className="font-mono tabular">{material.downloads}</span>
          </span>
        </span>

        {material.tags.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-1">
            {material.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
              <span
                key={tag}
                className="rounded border border-border bg-surface-raised px-1.5 py-0.5 text-[9px] font-medium text-ink-muted"
              >
                {tag}
              </span>
            ))}
            {extraTags > 0 && (
              <span className="px-1 py-0.5 text-[9px] font-semibold text-ink-faint">
                +{extraTags}
              </span>
            )}
          </span>
        )}
      </span>
    </button>
  );
}
