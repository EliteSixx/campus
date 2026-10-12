import type {
  BputAcademicCalendar,
  DriveSchedule,
  FreeSlotSuggestion,
} from "./types";
import { formatMinutesToTime, parseTimeToMinutes, validateInterval } from "./intervals";
import { evaluateDateInCalendar } from "./calendar-evaluator";
import { detectConflicts } from "./conflict-detector";

export interface FreeSlotOptions {
  searchStartDate?: string; // "YYYY-MM-DD", defaults to candidate drive date
  searchDays?: number;       // Number of days to search ahead, defaults to 14
  maxSuggestions?: number;   // Maximum suggestions to return, defaults to 10
  allowedOverrides?: Record<string, string>; // date -> override reason
}

/**
 * Pure TypeScript free-slot suggester for placement drives.
 *
 * Constraints:
 * 1. Time window: 09:00 to 17:00 only.
 * 2. Increments: 30-minute start steps (09:00, 09:30, 10:00, etc.).
 * 3. Drive duration preserved exactly from candidate drive.
 * 4. Resource check: Student group, venue, and panel must all be free.
 * 5. Academic calendar:
 *    - "block" events are skipped unless an override with non-empty reason is recorded.
 *    - "warn" events are accepted with advisory warning annotations.
 *    - "info" events are ignored.
 * 6. Deterministic ordering: sorted chronologically by date and start time.
 * 7. Non-mutating: does not modify input drive or existing drives.
 */
export function suggestFreeSlots(
  candidateDrive: DriveSchedule,
  existingDrives: DriveSchedule[],
  calendar: BputAcademicCalendar,
  options: FreeSlotOptions = {},
): FreeSlotSuggestion[] {
  const startMin = parseTimeToMinutes(candidateDrive.start_time);
  const endMin = parseTimeToMinutes(candidateDrive.end_time);

  if (startMin === -1 || endMin === -1 || startMin >= endMin) {
    return [];
  }

  const durationMinutes = endMin - startMin;
  const WINDOW_START = parseTimeToMinutes("09:00"); // 540
  const WINDOW_END = parseTimeToMinutes("17:00");   // 1020

  // Candidate duration exceeds daily working window
  if (durationMinutes > WINDOW_END - WINDOW_START) {
    return [];
  }

  const searchStartDate = options.searchStartDate || candidateDrive.date;
  const searchDays = Math.max(1, options.searchDays || 14);
  const maxSuggestions = Math.max(1, options.maxSuggestions || 10);
  const allowedOverrides = options.allowedOverrides || {};

  // Exclude the candidate drive itself from the conflict baseline
  const otherDrives = existingDrives.filter((d) => d.drive_id !== candidateDrive.drive_id);

  const suggestions: FreeSlotSuggestion[] = [];

  // Parse baseline date
  const [baseYear, baseMonth, baseDay] = searchStartDate
    .split("-")
    .map((num) => parseInt(num, 10));

  const baseDateObj = new Date(Date.UTC(baseYear, baseMonth - 1, baseDay));

  for (let dayOffset = 0; dayOffset < searchDays; dayOffset++) {
    const curDateObj = new Date(baseDateObj);
    curDateObj.setUTCDate(baseDateObj.getUTCDate() + dayOffset);

    const yyyy = curDateObj.getUTCFullYear();
    const mm = String(curDateObj.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(curDateObj.getUTCDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Evaluate academic calendar for this date
    const calendarEval = evaluateDateInCalendar(dateStr, calendar);

    // If blocked, check if a valid override reason was provided
    if (calendarEval.isBlocked) {
      const overrideReason = allowedOverrides[dateStr];
      const hasValidOverride = Boolean(overrideReason && overrideReason.trim().length > 0);
      if (!hasValidOverride) {
        // Skip blocked date completely
        continue;
      }
    }

    // Iterate over candidate start times in 30-minute steps
    for (
      let curStartMin = WINDOW_START;
      curStartMin + durationMinutes <= WINDOW_END;
      curStartMin += 30
    ) {
      const curEndMin = curStartMin + durationMinutes;
      const startTimeStr = formatMinutesToTime(curStartMin);
      const endTimeStr = formatMinutesToTime(curEndMin);

      // Do not suggest the exact current clashing slot if testing on the same date
      if (
        dateStr === candidateDrive.date &&
        startTimeStr === candidateDrive.start_time &&
        endTimeStr === candidateDrive.end_time
      ) {
        continue;
      }

      // Create a hypothetical candidate drive in this proposed slot
      const hypotheticalDrive: DriveSchedule = {
        ...candidateDrive,
        date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
      };

      // Check for hard resource conflicts (student, venue, panel) against other drives
      const conflicts = detectConflicts([hypotheticalDrive, ...otherDrives]);
      const hasConflict = conflicts.some(
        (c) =>
          c.driveA.drive_id === candidateDrive.drive_id ||
          c.driveB.drive_id === candidateDrive.drive_id,
      );

      if (hasConflict) {
        continue;
      }

      // Slot is valid!
      suggestions.push({
        date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
        duration_minutes: durationMinutes,
        venue: candidateDrive.venue,
        panel: candidateDrive.panel,
        calendar_status: {
          severity: calendarEval.strictestSeverity,
          is_blocked: calendarEval.isBlocked,
          has_warning: calendarEval.hasWarning,
          event_titles: calendarEval.events.map((e) => e.title),
          requires_override: calendarEval.isBlocked,
        },
      });

      if (suggestions.length >= maxSuggestions) {
        return suggestions;
      }
    }
  }

  return suggestions;
}
