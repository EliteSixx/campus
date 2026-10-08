"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { panelId, tabId, type StudentsTab } from "./utils";

// The tab strip for the My Students overview. Controlled, so the parent can
// keep the active tab in the URL. Arrow keys, Home and End move between tabs
// (roving tabIndex); the parent renders the matching role="tabpanel".
//
// Same look as the subject detail tabs, built here because SectionTabs uses a
// monospace font for its counts.

export interface StudentsTabItem {
  id: StudentsTab;
  label: string;
  // A number, "…" while it is still being worked out, or undefined for none.
  count?: string;
}

export function StudentsTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: StudentsTabItem[];
  active: StudentsTab;
  onChange: (tab: StudentsTab) => void;
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
      aria-label="My Students sections"
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
          </button>
        );
      })}
    </div>
  );
}
