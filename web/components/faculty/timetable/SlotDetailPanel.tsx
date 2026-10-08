"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Target, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ResolvedSlot } from "@/lib/api/timetable";
import { slotLabel, slotTypeTone } from "./utils";

export function SlotDetailPanel({
  slot,
  onClose,
}: {
  slot: ResolvedSlot;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, [slot.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="print:hidden">
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="slot-detail-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-surface shadow-lg dark:bg-slate-950"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <h2
              id="slot-detail-title"
              className="text-base font-bold text-ink"
            >
              {slotLabel(slot)}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {slot.subjectCode && (
                <Badge tone="neutral" className="font-mono text-[10px]">
                  {slot.subjectCode}
                </Badge>
              )}
              <Badge tone={slotTypeTone(slot.type)} className="text-[10px]">
                {slot.type}
              </Badge>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5 scrollbar-thin">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Clock className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              {slot.day} ·{" "}
              <span className="font-mono tabular text-ink">
                {slot.start}–{slot.end}
              </span>
            </span>
          </div>

          {slot.section && (
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Users className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="font-semibold text-ink">{slot.section}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-ink">{slot.room}</span>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/faculty/planner"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-raised"
            >
              <CalendarDays className="h-3.5 w-3.5 text-accent" />
              Open in Lecture Planner
            </Link>

            {/* Only rendered when data/curriculum.ts really has this subject,
                so the link can never 404. */}
            {slot.subjectInCurriculum && slot.subjectId && (
              <Link
                href={`/faculty/subjects/${slot.subjectId}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-raised"
              >
                <Target className="h-3.5 w-3.5 text-accent" />
                View subject analysis
              </Link>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
