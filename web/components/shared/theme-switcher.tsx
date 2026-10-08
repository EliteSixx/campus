"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Palette, Check, Sun, Moon, Search, Sparkles } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { THEME_DEFINITIONS, type ThemeId } from "@/data/theme/types";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, setTheme, mode, toggleMode, activeTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filteredThemes = useMemo(() => {
    if (!search.trim()) return THEME_DEFINITIONS;
    const query = search.toLowerCase();
    return THEME_DEFINITIONS.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.tagline.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Top Navbar Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-ink transition-all hover:bg-surface-raised",
          open && "border-accent ring-1 ring-accent/30"
        )}
        title="Switch Color Theme (20 Options)"
        aria-label="Theme selector"
      >
        <div className="flex items-center gap-1">
          {/* Swatch dots for current theme */}
          <span
            className="h-3 w-3 rounded-full border border-black/20 shadow-xs shrink-0"
            style={{ backgroundColor: activeTheme.colors.accent }}
          />
          <span
            className="h-3 w-3 rounded-full border border-black/20 shadow-xs shrink-0"
            style={{ backgroundColor: activeTheme.colors.neutralDark }}
          />
        </div>
        <span className="hidden md:inline font-semibold max-w-[130px] truncate">{activeTheme.name}</span>
        <Palette className="h-3.5 w-3.5 text-ink-muted" />
      </button>

      {/* Popover Menu */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 sm:w-88 rounded-xl border border-border bg-surface p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Mode Toggle */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent">
                <Palette className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-ink">Themes</span>
                  <span className="rounded-full bg-surface-raised px-1.5 py-0.2 text-[10px] font-semibold text-ink-muted">
                    {THEME_DEFINITIONS.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Dark / Light toggle */}
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface-raised/60 px-2 py-1 text-[11px] font-semibold text-ink hover:bg-surface-raised transition-colors"
              title={`Switch to ${mode === "dark" ? "Light" : "Dark"} mode`}
            >
              {mode === "dark" ? (
                <>
                  <Moon className="h-3 w-3 text-accent" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="h-3 w-3 text-amber-500" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 20 themes..."
              className="h-8 w-full rounded-lg border border-border bg-surface-raised/40 pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Themes List (Scrollable) */}
          <div className="max-h-[340px] space-y-1 overflow-y-auto pr-1 scrollbar-thin">
            {filteredThemes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg p-2 text-left transition-all duration-150",
                    isSelected
                      ? "bg-accent/10 border border-accent/40 text-ink shadow-xs"
                      : "hover:bg-surface-raised/70 border border-transparent text-ink-muted hover:text-ink"
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-ink truncate">{t.name}</span>
                      {t.isDarkOnly && (
                        <span className="rounded bg-slate-800 px-1 py-0.2 text-[9px] font-semibold text-slate-200">
                          Dark
                        </span>
                      )}
                      {isSelected && (
                        <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-ink-faint leading-tight line-clamp-1">{t.tagline}</p>

                    {/* Palette swatches preview */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs"
                        title={`Primary Dark: ${t.colors.neutralDark}`}
                        style={{ backgroundColor: t.colors.neutralDark }}
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs"
                        title={`Background: ${t.colors.neutralLight}`}
                        style={{ backgroundColor: t.colors.neutralLight }}
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs"
                        title={`Accent: ${t.colors.accent}`}
                        style={{ backgroundColor: t.colors.accent }}
                      />
                      {t.colors.secondary && (
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs"
                          title={`Secondary: ${t.colors.secondary}`}
                          style={{ backgroundColor: t.colors.secondary }}
                        />
                      )}
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs"
                        title={`Success: ${t.colors.success}`}
                        style={{ backgroundColor: t.colors.success }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredThemes.length === 0 && (
              <div className="py-6 text-center text-xs text-ink-faint">
                No themes found matching &quot;{search}&quot;
              </div>
            )}
          </div>

          <div className="mt-2.5 border-t border-border/50 pt-2 text-[10px] text-ink-faint text-center flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-accent" />
            <span>Theme applies across all institution dashboard views</span>
          </div>
        </div>
      )}
    </div>
  );
}
