"use client";

import { useState, type ReactNode } from "react";

// The vertical sibling of components/faculty/section-tabs.tsx, for pages with
// enough sections that a horizontal strip would crowd. Same contract: panels
// come in keyed by section id and only the active one is mounted.
//
// Below lg the rail turns back into a scrollable horizontal row above the
// panel, which is the only shape that fits a phone.
//
// Spacing note: the rail carries the top margin and the panel wrapper carries
// none, because the panels are Cards that already bring their own `mt-6`. That
// is what lines the top of the rail up with the top of the card beside it.

export interface NavSection {
  id: string;
  label: string;
  count?: number;
}

export function SectionNav({
  sections,
  children,
}: {
  sections: NavSection[];
  children: Record<string, ReactNode>;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
      <nav
        aria-label="Sections"
        className="mt-6 flex shrink-0 gap-2 overflow-x-auto border-b border-border pb-3 lg:sticky lg:top-20 lg:w-[200px] lg:flex-col lg:gap-1 lg:border-b-0 lg:pb-0"
      >
        {sections.map((section) => {
          const isActive = active === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActive(section.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all lg:w-full lg:py-2 ${
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink"
              }`}
            >
              {section.label}
              {section.count !== undefined && (
                <span
                  className={`font-mono text-[11px] font-semibold tabular ${
                    isActive ? "text-white/70" : "text-ink-faint"
                  }`}
                >
                  {section.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">{children[active]}</div>
    </div>
  );
}
