"use client";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/metric-card";
import {
  CalendarDays,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  DEMO_SESSIONS,
  getStudentById,
  PRIMARY_DEMO_ALUMNI_ID,
} from "@/data/demo-alumni";

export default function AlumniSessionsPage() {
  const mySessions = DEMO_SESSIONS.filter((s) => s.alumniId === PRIMARY_DEMO_ALUMNI_ID);
  const upcoming = mySessions.filter((s) => s.status === "upcoming");
  const completed = mySessions.filter((s) => s.status === "completed");

  return (
    <DashboardShell title="Sessions & Schedule">
      {/* Header */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold text-ink">Sessions & Schedule</h2>
        </div>
        <p className="text-xs text-ink-muted mt-1 font-medium max-w-xl">
          Manage your upcoming and past mentorship sessions. All times are shown in IST.
        </p>
      </Card>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Upcoming Sessions" value={`${upcoming.length}`} icon={CalendarDays} tone="accent" />
        <MetricCard label="Completed Sessions" value={`${completed.length}`} icon={CheckCircle2} tone="success" />
        <MetricCard label="Total Sessions" value={`${mySessions.length}`} icon={Clock} tone="neutral" />
      </div>

      {/* Upcoming */}
      <h3 className="mt-6 text-sm font-bold text-ink flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-accent" /> Upcoming Sessions
      </h3>
      <div className="mt-3 space-y-3">
        {upcoming.map((session) => {
          const student = getStudentById(session.studentId);
          return (
            <Card key={session.id} className="p-4 border border-border bg-surface text-ink">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-ink">{session.topic}</div>
                  <div className="text-[11px] text-ink-muted font-medium mt-0.5">
                    with <strong className="text-ink">{student?.name}</strong> · {session.date} · {session.time}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="success" className="text-[10px]">{session.duration}</Badge>
                  <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="text-xs h-7 gap-1 font-bold text-white bg-accent">
                      Join <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Completed */}
      <h3 className="mt-8 text-sm font-bold text-ink flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success" /> Past Sessions
      </h3>
      <div className="mt-3 space-y-3">
        {completed.map((session) => {
          const student = getStudentById(session.studentId);
          return (
            <Card key={session.id} className="p-4 border border-border bg-surface text-ink opacity-80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-ink">{session.topic}</div>
                  <div className="text-[11px] text-ink-muted font-medium mt-0.5">
                    with <strong>{student?.name}</strong> · {session.date} · {session.time} · {session.duration}
                  </div>
                  {session.feedback && (
                    <p className="text-[11px] text-ink-muted mt-1 italic border-l-2 border-accent/30 pl-2">
                      &ldquo;{session.feedback}&rdquo;
                    </p>
                  )}
                </div>
                <Badge tone="neutral" className="text-[10px] shrink-0">Completed</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
