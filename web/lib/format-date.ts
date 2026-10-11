/**
 * Shared date formatting helper.
 *
 * Pinning locale and timeZone guarantees the server and client produce
 * identical strings, preventing React hydration mismatches.
 */

const LOCALE = "en-IN";
const TIME_ZONE = "Asia/Kolkata";

/**
 * Format a date as "10 Oct 2026" (day-month-year, short month name).
 *
 * Safe to call during render — the output is deterministic across
 * server and client because locale and timeZone are explicit.
 */
export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}
