"use client";

import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  ArrowRight,
  Info,
  CalendarX2,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { demoPlacementDrives } from "@/data/demo/drives";
import type {
  BputAcademicCalendar,
  CalendarOverride,
  DriveSchedule,
  FreeSlotSuggestion,
  SchedulerConflict,
} from "./types";
import { detectConflicts, checkCandidateDriveConflicts } from "./conflict-detector";
import { evaluateDateInCalendar, getApplicableEvents } from "./calendar-evaluator";
import { suggestFreeSlots } from "./free-slots";

// Import normalized BPUT Academic Calendar directly from authorized institution data folder
import rawCalendar from "@/data/institution/bput_calendar_normalized_2026_2027.json";
const bputCalendar = rawCalendar as unknown as BputAcademicCalendar;

export function SchedulerView() {
  // Drives state: initialized with read-only demo drives
  const [drives, setDrives] = useState<DriveSchedule[]>(() =>
    demoPlacementDrives.map((d) => ({ ...d })),
  );

  const [selectedDriveId, setSelectedDriveId] = useState<string>(
    demoPlacementDrives[1].drive_id, // Default to Northstar drive (clashing)
  );

  // Calendar overrides map: date ("YYYY-MM-DD") -> override reason
  const [overrides, setOverrides] = useState<Record<string, CalendarOverride>>({});

  // Override dialog/modal state
  const [overrideModalDate, setOverrideModalDate] = useState<string | null>(null);
  const [overrideInputReason, setOverrideInputReason] = useState("");
  const [pendingRescheduleSlot, setPendingRescheduleSlot] = useState<FreeSlotSuggestion | null>(null);

  // Success message state for local reschedule
  const [lastRescheduledDrive, setLastRescheduledDrive] = useState<{
    title: string;
    oldSlot: string;
    newSlot: string;
  } | null>(null);

  // Conflict calculation across current drives state
  const conflicts = useMemo(() => detectConflicts(drives), [drives]);

  const selectedDrive = useMemo(
    () => drives.find((d) => d.drive_id === selectedDriveId) || drives[0],
    [drives, selectedDriveId],
  );

  // Academic calendar evaluation for selected drive's current date
  const selectedDriveCalendarEval = useMemo(
    () => (selectedDrive ? evaluateDateInCalendar(selectedDrive.date, bputCalendar) : null),
    [selectedDrive],
  );

  // Convert overrides to simple map for slot suggester
  const allowedOverridesMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [date, ov] of Object.entries(overrides)) {
      map[date] = ov.reason;
    }
    return map;
  }, [overrides]);

  // Suggested free slots for the selected drive
  const suggestedSlots = useMemo(() => {
    if (!selectedDrive) return [];
    return suggestFreeSlots(selectedDrive, drives, bputCalendar, {
      searchStartDate: selectedDrive.date,
      searchDays: 14,
      maxSuggestions: 8,
      allowedOverrides: allowedOverridesMap,
    });
  }, [selectedDrive, drives, allowedOverridesMap]);

  // Handle slot click: validate and propose reschedule
  function handleSelectSlot(slot: FreeSlotSuggestion) {
    if (!selectedDrive) return;

    // Check if slot date falls under a calendar block without an existing override
    if (slot.calendar_status.is_blocked && !overrides[slot.date]) {
      setOverrideModalDate(slot.date);
      setOverrideInputReason("");
      setPendingRescheduleSlot(slot);
      return;
    }

    applyReschedule(slot);
  }

  // Final apply of rescheduling with runtime revalidation
  function applyReschedule(slot: FreeSlotSuggestion, explicitOverrideReason?: string) {
    if (!selectedDrive) return;

    // Revalidate candidate slot
    const candidate: DriveSchedule = {
      ...selectedDrive,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
    };

    const revalidatedConflicts = checkCandidateDriveConflicts(candidate, drives);
    if (revalidatedConflicts.length > 0) {
      alert("Scheduling error: Revalidation detected unexpected hard resource conflict!");
      return;
    }

    // Save override reason if provided
    if (explicitOverrideReason && slot.calendar_status.is_blocked) {
      setOverrides((prev) => ({
        ...prev,
        [slot.date]: {
          date: slot.date,
          reason: explicitOverrideReason,
          overriddenAt: new Date().toISOString(),
          user: "Sinu (Placement Cell Officer)",
        },
      }));
    }

    const oldSlotStr = `${selectedDrive.date} (${selectedDrive.start_time} - ${selectedDrive.end_time})`;
    const newSlotStr = `${slot.date} (${slot.start_time} - ${slot.end_time})`;

    // Update local drives state
    setDrives((prev) =>
      prev.map((d) => (d.drive_id === selectedDrive.drive_id ? candidate : d)),
    );

    setLastRescheduledDrive({
      title: selectedDrive.title,
      oldSlot: oldSlotStr,
      newSlot: newSlotStr,
    });

    setPendingRescheduleSlot(null);
    setOverrideModalDate(null);
  }

  function handleConfirmOverride() {
    if (!overrideInputReason.trim()) {
      alert("An explicit override reason is required to schedule during an academic block period.");
      return;
    }
    if (pendingRescheduleSlot) {
      applyReschedule(pendingRescheduleSlot, overrideInputReason.trim());
    }
  }

  function handleResetDemoDrives() {
    setDrives(demoPlacementDrives.map((d) => ({ ...d })));
    setSelectedDriveId(demoPlacementDrives[1].drive_id);
    setOverrides({});
    setLastRescheduledDrive(null);
  }

  // Key academic calendar events to display in the overview banner
  const upcomingCalendarEvents = useMemo(() => {
    return getApplicableEvents(bputCalendar).slice(0, 6);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-ink">Conflict-Aware Placement Drive Scheduler</h2>
            <Badge tone="accent" className="text-xs">
              Half-Open Intervals [start, end)
            </Badge>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Automated conflict resolution across student groups, interview venues, and assessment panels with BPUT academic calendar synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemoDrives}
            className="text-xs flex items-center gap-1.5 h-8"
          >
            <RotateCcw className="h-3.5 w-3.5 text-ink-muted" />
            Reset Clashing Demo Drives
          </Button>
        </div>
      </div>

      {/* BPUT Academic Calendar Status Notice Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink flex items-center gap-2">
                <span>{bputCalendar.title}</span>
                <Badge tone="neutral" className="text-[10px] uppercase font-mono">
                  {bputCalendar.status}
                </Badge>
                <span className="text-[11px] text-ink-muted font-normal">
                  ({bputCalendar.timezone} timezone)
                </span>
              </p>
              <p className="mt-1 text-ink-muted">
                <strong>Cohort Scope:</strong> Filtered for final-year candidates (
                <code className="bg-surface px-1 py-0.5 rounded text-[11px]">5_7_9_sem</code> &amp;{" "}
                <code className="bg-surface px-1 py-0.5 rounded text-[11px]">all</code>).
                Calendar warnings are advisory; student, venue, and panel conflicts are hard blocks.
              </p>
            </div>
          </div>
          <Badge tone="warning" className="shrink-0 text-[11px]">
            Strict Severity: Block &gt; Warn &gt; Info
          </Badge>
        </div>
      </div>

      {/* Reschedule Success Callout */}
      {lastRescheduledDrive && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold">
                Drive Rescheduled Locally: {lastRescheduledDrive.title}
              </p>
              <p className="text-[11px] text-ink-muted">
                Shifted from <span className="line-through">{lastRescheduledDrive.oldSlot}</span> to{" "}
                <strong className="text-emerald-700 dark:text-emerald-300 font-mono">
                  {lastRescheduledDrive.newSlot}
                </strong>
                . (Local simulation state, zero backend mutation).
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLastRescheduledDrive(null)}
            className="text-[11px] h-7"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Grid: Scheduled Drives & Active Conflicts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Drive Schedule Cards & Conflict Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Drives List */}
          <Card className="border-border bg-surface">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-ink">Scheduled Placement Drives</CardTitle>
                  <CardDescription className="text-xs text-ink-muted">
                    Click a drive to inspect resource allocations and find alternative conflict-free slots.
                  </CardDescription>
                </div>
                <Badge tone={conflicts.length > 0 ? "danger" : "success"} className="text-xs">
                  {conflicts.length > 0 ? `${conflicts.length} Active Conflicts` : "All Conflict Free"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {drives.map((d) => {
                const isSelected = d.drive_id === selectedDriveId;
                const driveConflicts = conflicts.filter(
                  (c) => c.driveA.drive_id === d.drive_id || c.driveB.drive_id === d.drive_id,
                );
                const calendarEval = evaluateDateInCalendar(d.date, bputCalendar);

                return (
                  <div
                    key={d.drive_id}
                    onClick={() => setSelectedDriveId(d.drive_id)}
                    className={cn(
                      "cursor-pointer rounded-xl border p-4 transition-all",
                      isSelected
                        ? "border-accent bg-accent/5 ring-1 ring-accent"
                        : "border-border/70 bg-surface hover:border-border hover:bg-surface-raised/40",
                      driveConflicts.length > 0 && "border-rose-400/50 dark:border-rose-800/60",
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-ink">{d.title}</p>
                          <span className="font-mono text-[10px] text-ink-faint">({d.drive_id})</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-ink font-semibold">
                            <Clock className="h-3 w-3 text-accent" />
                            {d.date} • {d.start_time}–{d.end_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-ink-muted" />
                            {d.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-ink-muted" />
                            {d.panel}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                        {driveConflicts.length > 0 ? (
                          <Badge tone="danger" className="text-[10px]">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {driveConflicts.length} Collision{driveConflicts.length > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge tone="success" className="text-[10px]">
                            Valid Slot
                          </Badge>
                        )}

                        {calendarEval.isBlocked && (
                          <Badge tone="danger" className="text-[10px]">
                            Calendar Block
                          </Badge>
                        )}
                        {calendarEval.hasWarning && (
                          <Badge tone="warning" className="text-[10px]">
                            Calendar Warn
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Student Cohort Tag List */}
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <span className="text-ink-faint flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Cohort:{" "}
                        <span className="font-mono text-ink">
                          {d.student_ids.join(", ")}
                        </span>
                      </span>
                      <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
                        {isSelected ? "Selected" : "Select drive →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Hard Resource Conflicts Inspector Panel */}
          <Card className="border-border bg-surface">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <CardTitle className="text-base font-bold text-ink">
                  Hard Resource Conflicts Panel
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-ink-muted">
                All identified overlapping drives competing for identical student groups, venues, or interview panels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-sm font-bold text-ink">Zero Scheduling Conflicts Detected</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    All drives have non-overlapping time windows or isolated venues, panels, and student groups.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conflicts.map((c) => (
                    <div
                      key={c.conflict_id}
                      className="rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-500/5 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge tone="danger" className="text-[10px] uppercase font-bold tracking-wider">
                          {c.type === "venue"
                            ? "Venue Collision"
                            : c.type === "panel"
                            ? "Panel Collision"
                            : "Student Group Collision"}
                        </Badge>
                        <span className="font-mono text-xs text-rose-600 dark:text-rose-400 font-semibold">
                          Overlap: {c.overlappingInterval.date} ({c.overlappingInterval.start}–
                          {c.overlappingInterval.end})
                        </span>
                      </div>

                      <p className="text-xs text-ink font-medium leading-relaxed">{c.description}</p>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-rose-200/40 dark:border-rose-900/40">
                        <div>
                          <p className="text-ink-faint">Drive 1:</p>
                          <p className="font-semibold text-ink">{c.driveA.title}</p>
                        </div>
                        <div>
                          <p className="text-ink-faint">Drive 2:</p>
                          <p className="font-semibold text-ink">{c.driveB.title}</p>
                        </div>
                      </div>

                      <div className="rounded bg-surface px-2.5 py-1 text-[11px] font-mono text-ink">
                        Colliding Resource: <span className="font-bold text-rose-600 dark:text-rose-400">{c.sharedResource}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Selected Drive Free Slots & Academic Calendar Overrides */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Drive Detail & Rescheduling Drawer */}
          <Card className="border-border bg-surface">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-ink">Suggested Free Slots</CardTitle>
                <Badge tone="accent" className="text-xs">
                  09:00–17:00 / 30m steps
                </Badge>
              </div>
              <CardDescription className="text-xs text-ink-muted">
                Conflict-free alternative slots preserving drive duration for{" "}
                <span className="font-semibold text-ink">{selectedDrive?.title}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Drive Meta Summary */}
              {selectedDrive && (
                <div className="rounded-lg border border-border/80 bg-surface-raised/30 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Current Slot:</span>
                    <span className="font-mono font-bold text-ink">
                      {selectedDrive.date} ({selectedDrive.start_time} - {selectedDrive.end_time})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Required Venue:</span>
                    <span className="font-semibold text-ink">{selectedDrive.venue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Assigned Panel:</span>
                    <span className="font-semibold text-ink">{selectedDrive.panel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Candidate Cohort:</span>
                    <span className="font-mono text-[11px] text-ink">
                      {selectedDrive.student_ids.join(", ")}
                    </span>
                  </div>

                  {/* Academic Calendar status for current slot */}
                  {selectedDriveCalendarEval && (selectedDriveCalendarEval.isBlocked || selectedDriveCalendarEval.hasWarning) && (
                    <div className="mt-2 pt-2 border-t border-border/50 text-[11px]">
                      <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        Academic Period Notice:
                      </div>
                      <ul className="list-disc list-inside mt-0.5 text-ink-muted text-[10px]">
                        {selectedDriveCalendarEval.events.map((e) => (
                          <li key={e.id}>
                            [{e.severity.toUpperCase()}] {e.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Free Slot Suggestions List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-ink">
                  Next Available Conflict-Free Slots ({suggestedSlots.length} found):
                </p>

                {suggestedSlots.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-ink-muted">
                    <CalendarX2 className="mx-auto h-6 w-6 text-ink-faint mb-1" />
                    <p className="font-semibold text-ink">No valid free slots in search window</p>
                    <p className="text-[11px] mt-0.5">
                      All candidate slots within 09:00–17:00 overlap with booked drives or academic block periods.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {suggestedSlots.map((slot, idx) => {
                      const isSlotBlocked = slot.calendar_status.is_blocked;
                      const hasWarning = slot.calendar_status.has_warning;

                      return (
                        <div
                          key={`${slot.date}-${slot.start_time}`}
                          className="rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent hover:bg-surface-raised/40 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-ink">
                                {slot.date}
                              </span>
                              <span className="font-mono text-xs font-semibold text-accent">
                                {slot.start_time} – {slot.end_time}
                              </span>
                            </div>

                            <p className="mt-1 text-[11px] text-ink-muted">
                              Venue: {slot.venue} • Panel: {slot.panel}
                            </p>

                            {/* Calendar Badges */}
                            {isSlotBlocked && (
                              <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                <Lock className="h-2.5 w-2.5" />
                                Requires Academic Override ({slot.calendar_status.event_titles[0]})
                              </p>
                            )}

                            {hasWarning && !isSlotBlocked && (
                              <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                Advisory Warning ({slot.calendar_status.event_titles[0]})
                              </p>
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant={isSlotBlocked ? "outline" : "primary"}
                            onClick={() => handleSelectSlot(slot)}
                            className="h-8 text-xs shrink-0 flex items-center gap-1"
                          >
                            {isSlotBlocked ? "Override & Move" : "Reschedule"}
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Calendar Preview Schedule Card */}
          <Card className="border-border bg-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-ink">BPUT Academic Milestones</CardTitle>
              <CardDescription className="text-xs text-ink-muted">
                Evaluated for Odd Semester 2026–27 final-year cohort.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {upcomingCalendarEvents.map((e) => {
                const tone = e.severity === "block" ? "danger" : e.severity === "warn" ? "warning" : "neutral";
                return (
                  <div
                    key={e.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-border/50 p-2.5 bg-surface-raised/20"
                  >
                    <div>
                      <p className="font-semibold text-ink text-[11px] leading-snug">{e.title}</p>
                      <p className="mt-1 font-mono text-[10px] text-ink-muted">
                        {e.start} {e.start !== e.end ? `to ${e.end}` : ""} • Cohort: {e.cohort}
                      </p>
                    </div>
                    <Badge tone={tone} className="shrink-0 text-[10px] uppercase font-bold">
                      {e.severity}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Explicit Calendar Block Override Reason Modal */}
      {overrideModalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="max-w-md w-full border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Academic Calendar Override Required</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  The date <strong className="font-mono text-ink">{overrideModalDate}</strong> is marked as a{" "}
                  <strong className="text-rose-600 dark:text-rose-400">BLOCK</strong> event in the BPUT Academic Calendar.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-raised/40 p-3 text-xs text-ink-muted space-y-1">
              <p className="font-semibold text-ink">Strict Override Policy:</p>
              <p className="text-[11px]">
                Overrides are advisory administrative waivers recorded locally in audit logs. Academic waivers do <strong>NOT</strong> bypass student, venue, or interview panel collisions.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Mandatory Reason for Override <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={overrideInputReason}
                onChange={(e) => setOverrideInputReason(e.target.value)}
                placeholder="e.g. Special executive dispensation approved by Principal / TPO for campus tier-1 partner…"
                className="w-full h-20 rounded-lg border border-border bg-surface p-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-ink-faint"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOverrideModalDate(null);
                  setPendingRescheduleSlot(null);
                }}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmOverride}
                disabled={!overrideInputReason.trim()}
                className="text-xs"
              >
                Submit Reason &amp; Reschedule
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
