import type { DriveSchedule, SchedulerConflict } from "./types";
import { drivesOverlap, getOverlappingWindow } from "./intervals";

/**
 * Pure TypeScript conflict detector for placement drives.
 *
 * Inspects all unique drive pairs and flags:
 * 1. Venue conflicts: Same venue during overlapping interval.
 * 2. Panel conflicts: Same panel during overlapping interval.
 * 3. Student conflicts: One or more shared student IDs during overlapping interval.
 *
 * Avoids duplicate records for the same pair and resource type.
 */
export function detectConflicts(drives: DriveSchedule[]): SchedulerConflict[] {
  const conflicts: SchedulerConflict[] = [];

  for (let i = 0; i < drives.length; i++) {
    for (let j = i + 1; j < drives.length; j++) {
      const driveA = drives[i];
      const driveB = drives[j];

      // Time overlap is a prerequisite for any resource conflict
      if (!drivesOverlap(driveA, driveB)) {
        continue;
      }

      const overlapWindow = getOverlappingWindow(
        driveA.start_time,
        driveA.end_time,
        driveB.start_time,
        driveB.end_time,
      );

      if (!overlapWindow) {
        continue;
      }

      const baseInterval = {
        date: driveA.date,
        start: overlapWindow.start,
        end: overlapWindow.end,
      };

      // 1. Venue Conflict Check
      if (
        driveA.venue &&
        driveB.venue &&
        driveA.venue.trim().toLowerCase() === driveB.venue.trim().toLowerCase()
      ) {
        conflicts.push({
          conflict_id: `venue-${driveA.drive_id}-${driveB.drive_id}`,
          type: "venue",
          driveA,
          driveB,
          sharedResource: driveA.venue,
          overlappingInterval: baseInterval,
          description: `Venue collision at "${driveA.venue}" between "${driveA.title}" and "${driveB.title}" on ${baseInterval.date} (${baseInterval.start} - ${baseInterval.end})`,
        });
      }

      // 2. Panel Conflict Check
      if (
        driveA.panel &&
        driveB.panel &&
        driveA.panel.trim().toLowerCase() === driveB.panel.trim().toLowerCase()
      ) {
        conflicts.push({
          conflict_id: `panel-${driveA.drive_id}-${driveB.drive_id}`,
          type: "panel",
          driveA,
          driveB,
          sharedResource: driveA.panel,
          overlappingInterval: baseInterval,
          description: `Panel collision for "${driveA.panel}" between "${driveA.title}" and "${driveB.title}" on ${baseInterval.date} (${baseInterval.start} - ${baseInterval.end})`,
        });
      }

      // 3. Student Group Conflict Check
      const setA = new Set(driveA.student_ids || []);
      const sharedStudents = (driveB.student_ids || []).filter((id) => setA.has(id));

      if (sharedStudents.length > 0) {
        conflicts.push({
          conflict_id: `student-${driveA.drive_id}-${driveB.drive_id}`,
          type: "student",
          driveA,
          driveB,
          sharedResource: sharedStudents.join(", "),
          sharedResourceDetails: sharedStudents,
          overlappingInterval: baseInterval,
          description: `Student collision for ${sharedStudents.length} student(s) (${sharedStudents.join(", ")}) between "${driveA.title}" and "${driveB.title}" on ${baseInterval.date} (${baseInterval.start} - ${baseInterval.end})`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Checks if a candidate drive specification would conflict with existing drives.
 */
export function checkCandidateDriveConflicts(
  candidate: DriveSchedule,
  existingDrives: DriveSchedule[],
): SchedulerConflict[] {
  const otherDrives = existingDrives.filter((d) => d.drive_id !== candidate.drive_id);
  return detectConflicts([candidate, ...otherDrives]).filter(
    (c) => c.driveA.drive_id === candidate.drive_id || c.driveB.drive_id === candidate.drive_id,
  );
}
