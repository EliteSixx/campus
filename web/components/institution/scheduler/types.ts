import type { DemoPlacementDrive } from "@/data/demo/types";

export interface TimeInterval {
  start: string; // "HH:MM" in 24h format
  end: string;   // "HH:MM" in 24h format
}

export interface DriveSchedule {
  drive_id: string;
  job_id: string;
  title: string;
  date: string;       // "YYYY-MM-DD"
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
  venue: string;
  panel: string;
  graduation_year: number;
  student_ids: string[];
}

export type ConflictType = "student" | "venue" | "panel";

export interface SchedulerConflict {
  conflict_id: string;
  type: ConflictType;
  driveA: DriveSchedule;
  driveB: DriveSchedule;
  sharedResource: string;
  sharedResourceDetails?: string[];
  overlappingInterval: {
    date: string;
    start: string;
    end: string;
  };
  description: string;
}

export type CalendarSeverity = "block" | "warn" | "info";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
  cohort: string;
  severity: CalendarSeverity;
  category: "academic" | "activity";
  source?: string;
  source_sl_no?: number;
  source_date?: string;
}

export interface BputAcademicCalendar {
  calendar_id: string;
  academic_year: string;
  semester: string;
  title: string;
  status: "draft" | "official";
  timezone: string;
  severity_policy: Record<CalendarSeverity, string>;
  cohorts: Record<string, string>;
  events: CalendarEvent[];
  notes?: string[];
  excluded_external_events?: string[];
}

export interface CalendarEvaluation {
  date: string;
  strictestSeverity: CalendarSeverity | null;
  events: CalendarEvent[];
  isBlocked: boolean;
  hasWarning: boolean;
}

export interface CalendarOverride {
  date: string;
  reason: string;
  overriddenAt: string;
  user: string;
}

export interface FreeSlotSuggestion {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  venue: string;
  panel: string;
  calendar_status: {
    severity: CalendarSeverity | null;
    is_blocked: boolean;
    has_warning: boolean;
    event_titles: string[];
    requires_override: boolean;
  };
}
