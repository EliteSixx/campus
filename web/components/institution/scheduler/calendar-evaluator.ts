import type {
  BputAcademicCalendar,
  CalendarEvaluation,
  CalendarEvent,
  CalendarSeverity,
} from "./types";

// Target cohorts for final-year placement drives
export const FINAL_YEAR_COHORTS = new Set(["5_7_9_sem", "all"]);

const SEVERITY_PRECEDENCE: Record<CalendarSeverity, number> = {
  block: 3,
  warn: 2,
  info: 1,
};

/**
 * Filters calendar events applicable to final-year students (5th/7th/9th semester or all).
 */
export function getApplicableEvents(calendar: BputAcademicCalendar): CalendarEvent[] {
  if (!calendar || !Array.isArray(calendar.events)) return [];
  return calendar.events.filter((event) => FINAL_YEAR_COHORTS.has(event.cohort));
}

/**
 * Evaluates academic calendar status for a specific date (YYYY-MM-DD).
 * Date ranges are inclusive: start <= date <= end.
 * If multiple events occur, returns the strictest severity (block > warn > info).
 */
export function evaluateDateInCalendar(
  dateStr: string,
  calendar: BputAcademicCalendar,
): CalendarEvaluation {
  const applicableEvents = getApplicableEvents(calendar);
  const matchingEvents = applicableEvents.filter(
    (event) => dateStr >= event.start && dateStr <= event.end,
  );

  if (matchingEvents.length === 0) {
    return {
      date: dateStr,
      strictestSeverity: null,
      events: [],
      isBlocked: false,
      hasWarning: false,
    };
  }

  // Determine strictest severity
  let strictest: CalendarSeverity | null = null;
  let maxPrecedence = 0;

  for (const event of matchingEvents) {
    const prec = SEVERITY_PRECEDENCE[event.severity] || 0;
    if (prec > maxPrecedence) {
      maxPrecedence = prec;
      strictest = event.severity;
    }
  }

  return {
    date: dateStr,
    strictestSeverity: strictest,
    events: matchingEvents,
    isBlocked: strictest === "block",
    hasWarning: strictest === "warn",
  };
}

/**
 * Checks whether scheduling on a given date is permitted.
 * Block events are rejected unless an override reason is provided.
 * Warn and info events are permitted.
 */
export function isDateSchedulingAllowed(
  dateStr: string,
  calendar: BputAcademicCalendar,
  overrideReason?: string,
): { allowed: boolean; reason?: string; severity: CalendarSeverity | null } {
  const evalResult = evaluateDateInCalendar(dateStr, calendar);

  if (evalResult.isBlocked) {
    const hasValidOverride = Boolean(overrideReason && overrideReason.trim().length > 0);
    if (!hasValidOverride) {
      const titles = evalResult.events.map((e) => e.title).join("; ");
      return {
        allowed: false,
        reason: `Blocked by academic calendar: ${titles}. Requires explicit override reason.`,
        severity: "block",
      };
    }
  }

  return {
    allowed: true,
    severity: evalResult.strictestSeverity,
  };
}
