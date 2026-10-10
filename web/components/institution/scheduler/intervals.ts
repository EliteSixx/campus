/**
 * Pure TypeScript time-interval utilities for placement drive scheduling.
 *
 * Rules:
 * 1. Half-open intervals: [start, end).
 *    An event ending at 11:00 and another starting at 11:00 do NOT overlap.
 * 2. Strict validation: start must be strictly before end.
 *    Invalid or zero-length intervals (start >= end) are rejected.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Converts "HH:MM" string (24-hour clock) to total minutes from midnight.
 * Returns -1 if formatting is invalid.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== "string") return -1;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return -1;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return -1;
  }

  return hours * 60 + minutes;
}

/**
 * Converts total minutes from midnight back to 24-hour "HH:MM" string.
 */
export function formatMinutesToTime(totalMinutes: number): string {
  if (totalMinutes < 0 || totalMinutes >= 24 * 60) {
    throw new Error(`Invalid minutes value: ${totalMinutes}`);
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(hours)}:${pad(minutes)}`;
}

/**
 * Validates a start and end time interval.
 * Must be valid HH:MM and start strictly before end (zero-length intervals are invalid).
 */
export function validateInterval(start: string, end: string): ValidationResult {
  const startMin = parseTimeToMinutes(start);
  if (startMin === -1) {
    return { valid: false, error: `Invalid start time format: "${start}"` };
  }

  const endMin = parseTimeToMinutes(end);
  if (endMin === -1) {
    return { valid: false, error: `Invalid end time format: "${end}"` };
  }

  if (startMin >= endMin) {
    return {
      valid: false,
      error: `Start time (${start}) must be strictly before end time (${end}). Zero-length or negative intervals are not allowed.`,
    };
  }

  return { valid: true };
}

/**
 * Determines whether two time intervals overlap on a half-open basis: [start, end).
 * If startA < endB && startB < endA, they overlap.
 *
 * If either interval is invalid or zero-length, returns false.
 */
export function intervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const valA = validateInterval(startA, endA);
  if (!valA.valid) return false;

  const valB = validateInterval(startB, endB);
  if (!valB.valid) return false;

  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);

  return sA < eB && sB < eA;
}

/**
 * Checks if two drives overlap in both date and time interval.
 */
export function drivesOverlap(
  driveA: { date: string; start_time: string; end_time: string },
  driveB: { date: string; start_time: string; end_time: string },
): boolean {
  if (!driveA.date || !driveB.date) return false;
  if (driveA.date !== driveB.date) return false;

  return intervalsOverlap(
    driveA.start_time,
    driveA.end_time,
    driveB.start_time,
    driveB.end_time,
  );
}

/**
 * Returns the overlapping window between two intervals on the same date.
 * Returns null if they do not overlap.
 */
export function getOverlappingWindow(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): { start: string; end: string } | null {
  if (!intervalsOverlap(startA, endA, startB, endB)) return null;

  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);

  const overlapStart = Math.max(sA, sB);
  const overlapEnd = Math.min(eA, eB);

  return {
    start: formatMinutesToTime(overlapStart),
    end: formatMinutesToTime(overlapEnd),
  };
}
