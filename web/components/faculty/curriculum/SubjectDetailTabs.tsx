"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { DetailTab } from "./utils";

// A controlled tab strip for the subject detail page. Looks like
// components/faculty/section-tabs.tsx, but the parent owns the active tab so it
// can come from the URL. Arrow keys, Home and End move between tabs (roving
// tabIndex); the parent renders the matching role="tabpanel".

export interface DetailTabItem {
  id: DetailTab;
  label: string;
  count?: number;
  // Shows a small "Changed" dot.
  changed?: boolean;
}

export const tabId = (id: DetailTab) => `subject-tab-${id}`;
export const panelId = (id: DetailTab) => `subject-panel-${id}`;

export function SubjectDetailTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: DetailTabItem[];
  active: DetailTab;
  onChange: (tab: DetailTab) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    onChange(tab.id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Subject sections"
      className="mt-6 flex items-center gap-2 overflow-x-auto border-b border-border pb-3"
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(tab.id)}
            aria-selected={selected}
            aria-controls={panelId(tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => move(e, i)}
            className={cn(
              "inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              selected
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1.5 text-[11px] font-semibold tabular",
                  selected ? "text-white/70" : "text-ink-faint",
                )}
              >
                {tab.count}
              </span>
            )}
            {tab.changed && (
              <span className="ml-1.5 inline-flex items-center gap-1">
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    selected ? "bg-white" : "bg-warning",
                  )}
                />
                <span className="sr-only">Changed</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
