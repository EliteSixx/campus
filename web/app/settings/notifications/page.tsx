"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bell, MessageSquare, CalendarDays, HelpCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

function Switch({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-accent" : "bg-ink-muted/30"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState({
    mentorship: true,
    sessions: true,
    guidance: false,
    badges: true,
  });

  return (
    <DashboardShell title="Settings / Notification Preferences">
      <Card className="border border-border bg-surface text-ink shadow-sm max-w-2xl mt-4">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-accent" />
            <div>
              <CardTitle className="text-base font-bold text-ink">Notification Preferences</CardTitle>
              <CardDescription className="text-xs font-medium text-ink-muted">
                Control what events trigger email and in-app notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-1">
            {/* Setting 1 */}
            <div className="flex items-center justify-between p-4 hover:bg-surface-raised transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent border border-accent/20">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Mentorship Requests</h4>
                  <p className="text-[11px] text-ink-muted font-medium mt-0.5">
                    When someone sends you a mentorship request or replies.
                  </p>
                </div>
              </div>
              <Switch checked={prefs.mentorship} onChange={(c) => setPrefs({ ...prefs, mentorship: c })} />
            </div>

            {/* Setting 2 */}
            <div className="flex items-center justify-between p-4 hover:bg-surface-raised transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning border border-warning/20">
                  <CalendarDays className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Session Reminders</h4>
                  <p className="text-[11px] text-ink-muted font-medium mt-0.5">
                    Alerts for upcoming 1:1 sessions and event RSVPs.
                  </p>
                </div>
              </div>
              <Switch checked={prefs.sessions} onChange={(c) => setPrefs({ ...prefs, sessions: c })} />
            </div>

            {/* Setting 3 */}
            <div className="flex items-center justify-between p-4 hover:bg-surface-raised transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success border border-success/20">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Guidance Hub Replies</h4>
                  <p className="text-[11px] text-ink-muted font-medium mt-0.5">
                    When alumni reply to your questions in the guidance hub.
                  </p>
                </div>
              </div>
              <Switch checked={prefs.guidance} onChange={(c) => setPrefs({ ...prefs, guidance: c })} />
            </div>

            {/* Setting 4 */}
            <div className="flex items-center justify-between p-4 hover:bg-surface-raised transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent border border-accent/20">
                  <Trophy className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Badge Unlocks & Impact</h4>
                  <p className="text-[11px] text-ink-muted font-medium mt-0.5">
                    Notifications about your leaderboard rank and new badges.
                  </p>
                </div>
              </div>
              <Switch checked={prefs.badges} onChange={(c) => setPrefs({ ...prefs, badges: c })} />
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
