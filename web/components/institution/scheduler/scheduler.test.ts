import test from "node:test";
import assert from "node:assert/strict";

import {
  intervalsOverlap,
  parseTimeToMinutes,
  formatMinutesToTime,
  validateInterval,
  drivesOverlap,
  getOverlappingWindow,
} from "./intervals";
import { detectConflicts } from "./conflict-detector";
import {
  evaluateDateInCalendar,
  getApplicableEvents,
  isDateSchedulingAllowed,
} from "./calendar-evaluator";
import { suggestFreeSlots } from "./free-slots";
import type { BputAcademicCalendar, DriveSchedule } from "./types";

// Import normalized calendar fixture directly from local authorized directory
import calendarData from "../../../data/institution/bput_calendar_normalized_2026_2027.json" with { type: "json" };
const bputCalendar = calendarData as unknown as BputAcademicCalendar;

// ---------------------------------------------------------------------------
// 1. INTERVAL TESTS
// ---------------------------------------------------------------------------

test("intervals: correctly detects overlapping intervals", () => {
  assert.equal(intervalsOverlap("10:00", "12:00", "11:00", "13:00"), true);
  assert.equal(intervalsOverlap("10:00", "12:00", "10:30", "11:30"), true);
  assert.equal(intervalsOverlap("10:30", "11:30", "10:00", "12:00"), true);
});

test("intervals: correctly detects non-overlapping intervals", () => {
  assert.equal(intervalsOverlap("09:00", "10:00", "10:30", "11:30"), false);
  assert.equal(intervalsOverlap("14:00", "15:00", "11:00", "12:00"), false);
});

test("intervals: half-open interval rule [start, end) prevents collision when one ends as next begins", () => {
  // Drive A ends at 11:00, Drive B begins at 11:00
  assert.equal(intervalsOverlap("10:00", "11:00", "11:00", "12:00"), false);
  assert.equal(intervalsOverlap("11:00", "12:00", "10:00", "11:00"), false);
});

test("intervals: rejects invalid and zero-length intervals", () => {
  const zeroLen = validateInterval("10:00", "10:00");
  assert.equal(zeroLen.valid, false);
  assert.equal(intervalsOverlap("10:00", "10:00", "10:00", "12:00"), false);

  const inverted = validateInterval("12:00", "10:00");
  assert.equal(inverted.valid, false);
  assert.equal(intervalsOverlap("12:00", "10:00", "09:00", "11:00"), false);

  const malformed = validateInterval("invalid", "10:00");
  assert.equal(malformed.valid, false);
  assert.equal(intervalsOverlap("invalid", "10:00", "09:00", "10:00"), false);
});

test("intervals: getOverlappingWindow returns exact intersection", () => {
  const window = getOverlappingWindow("10:00", "12:00", "11:00", "13:00");
  assert.deepEqual(window, { start: "11:00", end: "12:00" });

  const noOverlap = getOverlappingWindow("10:00", "11:00", "11:00", "12:00");
  assert.equal(noOverlap, null);
});

// ---------------------------------------------------------------------------
// 2. CONFLICT DETECTION TESTS
// ---------------------------------------------------------------------------

const mockDriveA: DriveSchedule = {
  drive_id: "DRIVE-ACME-2026-01",
  job_id: "JOB001",
  title: "Acme Tech Backend Developer Drive",
  date: "2026-10-22",
  start_time: "10:00",
  end_time: "12:00",
  venue: "Seminar Hall 1",
  panel: "Panel A",
  graduation_year: 2027,
  student_ids: ["ST001", "ST002", "ST007", "ST008"],
};

const mockDriveB: DriveSchedule = {
  drive_id: "DRIVE-NORTHSTAR-2026-01",
  job_id: "JOB002",
  title: "Northstar Analytics Data Analyst Drive",
  date: "2026-10-22",
  start_time: "10:00",
  end_time: "12:00",
  venue: "Seminar Hall 1",
  panel: "Panel A",
  graduation_year: 2027,
  student_ids: ["ST001", "ST003", "ST008", "ST104"],
};

test("conflicts: deliberately clashing demo drives expose all 3 conflict types", () => {
  const conflicts = detectConflicts([mockDriveA, mockDriveB]);

  assert.equal(conflicts.length, 3, "Expected venue, panel, and student conflicts");

  const venueConflict = conflicts.find((c) => c.type === "venue");
  assert.ok(venueConflict, "Expected venue conflict");
  assert.equal(venueConflict.sharedResource, "Seminar Hall 1");

  const panelConflict = conflicts.find((c) => c.type === "panel");
  assert.ok(panelConflict, "Expected panel conflict");
  assert.equal(panelConflict.sharedResource, "Panel A");

  const studentConflict = conflicts.find((c) => c.type === "student");
  assert.ok(studentConflict, "Expected student conflict");
  assert.deepEqual(studentConflict.sharedResourceDetails, ["ST001", "ST008"]);
});

test("conflicts: no conflicts reported when drives do not overlap in time", () => {
  const sequentialDriveB: DriveSchedule = {
    ...mockDriveB,
    start_time: "12:00",
    end_time: "14:00",
  };

  const conflicts = detectConflicts([mockDriveA, sequentialDriveB]);
  assert.equal(conflicts.length, 0, "No conflicts expected for non-overlapping drives");
});

test("conflicts: no false conflict when resources are distinct", () => {
  const distinctDrive: DriveSchedule = {
    drive_id: "DRIVE-DISTINCT",
    job_id: "JOB999",
    title: "Distinct Tech Drive",
    date: "2026-10-22",
    start_time: "10:00",
    end_time: "12:00",
    venue: "Lab 3",
    panel: "Panel C",
    graduation_year: 2027,
    student_ids: ["ST999"],
  };

  const conflicts = detectConflicts([mockDriveA, distinctDrive]);
  assert.equal(conflicts.length, 0, "No conflicts expected when venue, panel, and students differ");
});

// ---------------------------------------------------------------------------
// 3. ACADEMIC CALENDAR TESTS
// ---------------------------------------------------------------------------

test("calendar: final-year cohort filtering includes 5_7_9_sem and all, excludes 1_sem/3_sem", () => {
  const applicable = getApplicableEvents(bputCalendar);

  // Must include 5_7_9_sem and all
  assert.ok(applicable.some((e) => e.cohort === "5_7_9_sem"));
  assert.ok(applicable.some((e) => e.cohort === "all"));

  // Must not include 1_sem or 3_sem exclusive events
  assert.ok(!applicable.some((e) => e.cohort === "1_sem"));
  assert.ok(!applicable.some((e) => e.cohort === "3_sem"));
});

test("calendar: date ranges evaluated inclusively", () => {
  // Class Test I for 5_7_9_sem is 2026-09-03 to 2026-09-11
  const startDay = evaluateDateInCalendar("2026-09-03", bputCalendar);
  assert.equal(startDay.isBlocked, true);

  const midDay = evaluateDateInCalendar("2026-09-07", bputCalendar);
  assert.equal(midDay.isBlocked, true);

  const endDay = evaluateDateInCalendar("2026-09-11", bputCalendar);
  assert.equal(endDay.isBlocked, true);

  const dayAfter = evaluateDateInCalendar("2026-09-12", bputCalendar);
  assert.equal(dayAfter.isBlocked, false);
});

test("calendar: severity precedence rule block > warn > info", () => {
  // On a day with block and warn, block must dominate
  const blockedDay = evaluateDateInCalendar("2026-09-10", bputCalendar);
  // On 2026-09-10: Class Test I (block) and BPUT Tech Carnival (warn)
  assert.equal(blockedDay.strictestSeverity, "block");
  assert.equal(blockedDay.isBlocked, true);

  // On an exam registration day (2026-09-15), severity is warn
  const warnDay = evaluateDateInCalendar("2026-09-15", bputCalendar);
  assert.equal(warnDay.strictestSeverity, "warn");
  assert.equal(warnDay.isBlocked, false);
  assert.equal(warnDay.hasWarning, true);
});

test("calendar: draft status is retained", () => {
  assert.equal(bputCalendar.status, "draft");
});

test("calendar: block override requires non-empty reason", () => {
  const blockedDate = "2026-09-05";

  const withoutReason = isDateSchedulingAllowed(blockedDate, bputCalendar, "");
  assert.equal(withoutReason.allowed, false);

  const withReason = isDateSchedulingAllowed(blockedDate, bputCalendar, "Approved by Dean of Placements");
  assert.equal(withReason.allowed, true);
});

// ---------------------------------------------------------------------------
// 4. FREE-SLOT SUGGESTION TESTS
// ---------------------------------------------------------------------------

test("free-slots: suggestions generated within 09:00 - 17:00 in 30-min steps", () => {
  const suggestions = suggestFreeSlots(mockDriveB, [mockDriveA], bputCalendar, {
    searchStartDate: "2026-10-22",
    searchDays: 1,
    maxSuggestions: 5,
  });

  assert.ok(suggestions.length > 0);

  for (const slot of suggestions) {
    const sMin = parseTimeToMinutes(slot.start_time);
    const eMin = parseTimeToMinutes(slot.end_time);

    assert.ok(sMin >= 540, "Slot must start at or after 09:00");
    assert.ok(eMin <= 1020, "Slot must end at or before 17:00");
    assert.equal((eMin - sMin), 120, "Slot duration must equal candidate drive duration (2 hours)");
    assert.equal(sMin % 30, 0, "Slot start time must align with 30-min steps");
  }
});

test("free-slots: excludes conflicting slots with existing drive on same date", () => {
  const suggestions = suggestFreeSlots(mockDriveB, [mockDriveA], bputCalendar, {
    searchStartDate: "2026-10-22",
    searchDays: 1,
    maxSuggestions: 10,
  });

  // Since mockDriveA is booked 10:00 - 12:00 in Seminar Hall 1 with Panel A and ST001/ST008:
  // Slots overlapping [10:00, 12:00) such as 09:30-11:30, 10:00-12:00, 10:30-12:30, 11:00-13:00, 11:30-13:30 must be excluded!
  for (const slot of suggestions) {
    const overlapWithA = intervalsOverlap(slot.start_time, slot.end_time, mockDriveA.start_time, mockDriveA.end_time);
    assert.equal(overlapWithA, false, `Suggested slot ${slot.start_time}-${slot.end_time} must not overlap with Drive A`);
  }

  // Earliest valid slot on same date after Drive A should be 12:00 - 14:00
  const firstSlot = suggestions[0];
  assert.equal(firstSlot.start_time, "12:00");
  assert.equal(firstSlot.end_time, "14:00");
});

test("free-slots: skips academic calendar block days by default", () => {
  // 2026-11-20 to 2026-12-19 is BPUT Semester Examinations (block)
  const suggestions = suggestFreeSlots(mockDriveB, [], bputCalendar, {
    searchStartDate: "2026-11-20",
    searchDays: 3,
  });

  assert.equal(suggestions.length, 0, "All slots during exam block period must be skipped by default");
});

test("free-slots: accepts academic calendar block with explicit override reason", () => {
  const suggestions = suggestFreeSlots(mockDriveB, [], bputCalendar, {
    searchStartDate: "2026-11-20",
    searchDays: 1,
    allowedOverrides: {
      "2026-11-20": "Vice Chancellor special executive dispensation for mega recruiter drive",
    },
  });

  assert.ok(suggestions.length > 0, "Slots should be returned when valid override reason provided");
  assert.equal(suggestions[0].calendar_status.is_blocked, true);
  assert.equal(suggestions[0].calendar_status.requires_override, true);
});

test("free-slots: surfaces advisory warnings without blocking", () => {
  // 2026-09-15 falls within exam registration warn period for 5_7_9_sem (2026-09-01 to 2026-09-19)
  const suggestions = suggestFreeSlots(mockDriveB, [mockDriveA], bputCalendar, {
    searchStartDate: "2026-09-15",
    searchDays: 1,
  });

  assert.ok(suggestions.length > 0);
  assert.equal(suggestions[0].calendar_status.has_warning, true);
  assert.equal(suggestions[0].calendar_status.is_blocked, false);
});

test("free-slots: does not mutate source drive records", () => {
  const originalDate = mockDriveB.date;
  const originalStart = mockDriveB.start_time;

  suggestFreeSlots(mockDriveB, [mockDriveA], bputCalendar, {
    searchStartDate: "2026-10-22",
    searchDays: 2,
  });

  assert.equal(mockDriveB.date, originalDate);
  assert.equal(mockDriveB.start_time, originalStart);
});
