"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

// A controlled, accessible tab strip for the student pages. The parent owns the
// active tab (so it can live in the URL) and renders the matching
// role="tabpanel" with id `${idPrefix}-panel-${tab}`. Arrow keys, Home and End
// move between tabs with a roving tabIndex.
//
// Same look as StudentsTabs on the overview, but generic over the tab ids.

export interface TabStripItem<T extends string> {
  id: T;
  label: string;
  // A number, "…" while still being worked out, or undefined for none.
  count?: string;
}

export const stripTabId = (idPrefix: string, tab: string) =>
  `${idPrefix}-tab-${tab}`;
export const stripPanelId = (idPrefix: string, tab: string) =>
  `${idPrefix}-panel-${tab}`;

export function TabStrip<T extends string>({
  tabs,
  active,
  onChange,
  idPrefix,
  label,
}: {
  tabs: TabStripItem<T>[];
  active: T;
  onChange: (tab: T) => void;
  idPrefix: string;
  // Accessible name for the tab list.
  label: string;
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
      aria-label={label}
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
            id={stripTabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={stripPanelId(idPrefix, tab.id)}
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
          </button>
        );
      })}
    </div>
  );
}
