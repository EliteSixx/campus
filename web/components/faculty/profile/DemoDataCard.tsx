"use client";

import { useEffect, useState } from "react";
import { Database, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  STORAGE_GROUPS,
  TEACHING_ROW_LABELS,
  clearAllAppData,
  clearTeachingData,
  readStorageSnapshot,
  type StorageSnapshot,
} from "./storage";

// Everything The Plug has saved in this browser, by feature, with two ways to
// start the demo again. Storage is read after mount; both buttons confirm
// first, clear, then reload so every page picks up the change.

function RowSummary({ summary }: { summary: string | null }) {
  if (summary === null) {
    return (
      <span
        className="block h-4 w-14 animate-pulse rounded bg-surface-raised"
        aria-hidden="true"
      />
    );
  }
  const empty = summary === "Empty";
  return (
    <span
      className={cn(
        "text-xs font-semibold tabular",
        empty ? "text-ink-faint" : "text-ink",
      )}
    >
      {summary}
    </span>
  );
}

export function DemoDataCard() {
  // null until this browser's storage has been read.
  const [snapshot, setSnapshot] = useState<StorageSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(readStorageSnapshot());
  }, []);

  function onClearTeaching() {
    const ok = window.confirm(
      `Remove the teaching data saved in this browser?\n\n` +
        `${TEACHING_ROW_LABELS.join(", ")}.\n\n` +
        `Your theme, layout, role and profile details are kept. This cannot be undone.`,
    );
    if (!ok) return;
    clearTeachingData();
    window.location.reload();
  }

  function onClearAll() {
    const ok = window.confirm(
      `Remove everything The Plug has saved in this browser?\n\n` +
        `All teaching data, your theme and layout, your profile details for every role, ` +
        `your alert choices, and saved student resumes and skill scores.\n\n` +
        `You will be switched back to the default role (Student). This cannot be undone.`,
    );
    if (!ok) return;
    clearAllAppData();
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Demo data</CardTitle>
          <CardDescription>
            What The Plug has saved in this browser. Nothing here is sent
            anywhere.
          </CardDescription>
        </div>
        <Database className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p className="sr-only" role="status">
          {snapshot === null ? "Checking saved data…" : ""}
        </p>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {STORAGE_GROUPS.map((group) => (
            <section key={group.id}>
              <h4 className="text-xs font-bold text-ink-muted">{group.title}</h4>
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                {group.rows.map((row) => {
                  const keys = [
                    ...row.keys,
                    ...(row.prefixes ?? []).map((p) => `${p}…`),
                  ];
                  return (
                    <li
                      key={row.label}
                      className="flex items-start justify-between gap-3 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink">
                          {row.label}
                        </p>
                        <p className="break-all text-[11px] text-ink-faint">
                          {keys.join(", ")}
                        </p>
                      </div>
                      <RowSummary
                        summary={snapshot?.rows[row.label]?.summary ?? null}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {snapshot !== null && snapshot.otherKeys.length > 0 && (
          <p className="mt-3 break-all text-xs text-ink-muted">
            Other saved items:{" "}
            <span className="text-ink">{snapshot.otherKeys.join(", ")}</span>.
            Only &ldquo;Clear everything&rdquo; removes these.
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button type="button" size="sm" variant="outline" onClick={onClearTeaching}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear teaching data
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClearAll}
            className="border-danger/40 text-danger hover:border-danger hover:bg-danger-soft"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear everything saved in this browser
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Both ask first, then reload the page. Keys from other sites or apps
          are never touched.
        </p>
      </CardContent>
    </Card>
  );
}
