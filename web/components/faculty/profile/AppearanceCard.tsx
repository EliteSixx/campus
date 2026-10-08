"use client";

import { useId } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import type { ThemeMode } from "@/data/theme/types";

// Theme colour and light/dark, through the shared theme context: the same
// options, and the same saved values, as the theme menu in the top bar.

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

const optionClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

export function AppearanceCard() {
  const ids = useId();
  const { theme, setTheme, mode, setMode, themes } = useTheme();

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Saved in this browser only, and shared with the theme menu in the
            top bar
          </CardDescription>
        </div>
        <Palette className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p id={`${ids}-mode`} className="text-xs font-bold text-ink">
          Light or dark
        </p>
        <div
          role="group"
          aria-labelledby={`${ids}-mode`}
          className="mt-2 inline-flex rounded-lg border border-border bg-surface-raised/40 p-1"
        >
          {MODES.map(({ id, label, icon: Icon }) => {
            const selected = mode === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(id)}
                className={cn(
                  optionClass,
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                  selected
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <p id={`${ids}-theme`} className="mt-5 text-xs font-bold text-ink">
          Colour theme
        </p>
        <div
          role="group"
          aria-labelledby={`${ids}-theme`}
          className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {themes.map((t) => {
            const selected = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTheme(t.id)}
                className={cn(
                  optionClass,
                  "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  selected
                    ? "border-accent/40 bg-accent-soft"
                    : "border-border bg-surface-raised/40 hover:border-border-strong",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-ink">
                    {t.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">
                    {t.tagline}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1" aria-hidden="true">
                    {[t.colors.neutralDark, t.colors.neutralLight, t.colors.accent].map(
                      (colour, i) => (
                        <span
                          key={i}
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: colour }}
                        />
                      ),
                    )}
                  </span>
                </span>
                {selected && (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="h-2.5 w-2.5" aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
