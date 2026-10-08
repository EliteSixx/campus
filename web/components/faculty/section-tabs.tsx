"use client";

import { useState, type ReactNode } from "react";

// A tab strip for the long faculty pages, so the summary at the top stays
// visible while the detail below is split into panels. Styling matches the
// filter tabs on app/alumni/mentorship/page.tsx.
//
// Panels are passed in as a map keyed by tab id. The server components that
// use this render every panel's JSX, but only the active one is mounted here.

export interface SectionTab {
  id: string;
  label: string;
  count?: number;
}

export function SectionTabs({
  tabs,
  children,
}: {
  tabs: SectionTab[];
  children: Record<string, ReactNode>;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <>
      <div className="mt-6 flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              active === tab.id
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 font-mono text-[11px] font-semibold tabular ${
                  active === tab.id ? "text-white/70" : "text-ink-faint"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {children[active]}
    </>
  );
}
