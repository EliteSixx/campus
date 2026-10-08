"use client";

import { useEffect, useId, useState } from "react";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NOTIFY_KEY } from "./storage";

// Which alerts a faculty member would like. Saved as a small object under
// "theplug-faculty-notify". Nothing reads it yet: no alert is sent or shown.

type NotifyId = "unreadMessages" | "toEvaluate" | "attendance" | "planBehind";

type NotifyPrefs = Record<NotifyId, boolean>;

const OPTIONS: { id: NotifyId; label: string; hint: string }[] = [
  {
    id: "unreadMessages",
    label: "Unread messages",
    hint: "When a student or colleague writes to you",
  },
  {
    id: "toEvaluate",
    label: "Assignments to evaluate",
    hint: "When submissions are waiting for marks",
  },
  {
    id: "attendance",
    label: "Attendance warnings",
    hint: "When a student falls below the attendance minimum",
  },
  {
    id: "planBehind",
    label: "Plan behind schedule",
    hint: "When a lecture plan falls behind the calendar",
  },
];

const DEFAULTS: NotifyPrefs = {
  unreadMessages: true,
  toEvaluate: true,
  attendance: true,
  planBehind: true,
};

// Anything missing or not a boolean falls back to the default.
function readPrefs(): NotifyPrefs {
  try {
    const raw = localStorage.getItem(NOTIFY_KEY);
    if (!raw) return DEFAULTS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULTS;
    const record = parsed as Record<string, unknown>;
    const prefs = { ...DEFAULTS };
    for (const { id } of OPTIONS) {
      const value = record[id];
      if (typeof value === "boolean") prefs[id] = value;
    }
    return prefs;
  } catch (e) {
    console.error(`Failed to read ${NOTIFY_KEY} from localStorage`, e);
    return DEFAULTS;
  }
}

function writePrefs(prefs: NotifyPrefs): void {
  try {
    localStorage.setItem(NOTIFY_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error(`Failed to save ${NOTIFY_KEY} to localStorage`, e);
  }
}

export function NotificationsCard() {
  const ids = useId();
  // null until this browser's saved choices have been read.
  const [prefs, setPrefs] = useState<NotifyPrefs | null>(null);

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  function toggle(id: NotifyId, value: boolean) {
    const next = { ...(prefs ?? DEFAULTS), [id]: value };
    setPrefs(next);
    writePrefs(next);
  }

  const shown = prefs ?? DEFAULTS;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>What you would like to be told about</CardDescription>
        </div>
        <Bell className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <fieldset disabled={prefs === null}>
          <legend className="sr-only">Alerts</legend>
          <ul className="space-y-3">
            {OPTIONS.map((option) => (
              <li key={option.id} className="flex items-start gap-3">
                <input
                  id={`${ids}-${option.id}`}
                  type="checkbox"
                  checked={shown[option.id]}
                  onChange={(e) => toggle(option.id, e.target.checked)}
                  aria-describedby={`${ids}-${option.id}-hint`}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-accent"
                />
                <div>
                  <label
                    htmlFor={`${ids}-${option.id}`}
                    className="text-sm font-semibold text-ink"
                  >
                    {option.label}
                  </label>
                  <p id={`${ids}-${option.id}-hint`} className="text-xs text-ink-muted">
                    {option.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </fieldset>
        <p className="mt-4 text-xs text-ink-faint">
          Demo only — these choices change nothing yet.
        </p>
      </CardContent>
    </Card>
  );
}
