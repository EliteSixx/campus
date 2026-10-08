"use client";

import { Fragment } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  LECTURE_STATUS_LABEL,
  type LectureStatus,
  type PlannedLecture,
  type PlannerSubjectWorkspace,
  type SubjectPlan,
  type PlannerTopicInfo,
} from "@/lib/api/lecture-planner-meta";
import { LectureRow, type LectureRowActions } from "./LectureRow";
import { OTHER_UNIT, labelClass, unitHeadingRows, unitLabel } from "./utils";

// The plan, lecture by lecture, in teaching order. A unit heading appears each
// time the unit changes (unitHeadingRows in ./utils), so a lecture moved into
// another unit's run is visibly out of place rather than silently regrouped. A
// no-unit lecture inside one unit's run stays under that unit's heading.

export type StatusFilter = "all" | LectureStatus;

export interface LectureFilters {
  status: StatusFilter;
  // "all", a unit id, or OTHER_UNIT.
  unit: string;
  showCancelled: boolean;
}

export const DEFAULT_FILTERS: LectureFilters = {
  status: "all",
  unit: "all",
  showCancelled: true,
};

export function filtersActive(filters: LectureFilters): boolean {
  return (
    filters.status !== DEFAULT_FILTERS.status ||
    filters.unit !== DEFAULT_FILTERS.unit ||
    filters.showCancelled !== DEFAULT_FILTERS.showCancelled
  );
}

const STATUS_OPTIONS: LectureStatus[] = ["planned", "delivered", "cancelled"];

export function LectureList({
  plan,
  subject,
  schedule,
  numbers,
  todayISO,
  filters,
  onFiltersChange,
  actions,
}: {
  plan: SubjectPlan;
  subject: PlannerSubjectWorkspace;
  schedule: Record<string, string | null>;
  numbers: Record<string, number>;
  todayISO: string | null;
  filters: LectureFilters;
  onFiltersChange: (filters: LectureFilters) => void;
  actions: LectureRowActions;
}) {
  const unitIds = new Set(subject.units.map((u) => u.id));
  const topicStatus = new Map<string, PlannerTopicInfo["status"]>(
    subject.topics.map((t) => [t.key, t.status]),
  );
  const active = filtersActive(filters);

  const matches = (lecture: PlannedLecture) => {
    if (!filters.showCancelled && lecture.status === "cancelled") return false;
    if (filters.status !== "all" && lecture.status !== filters.status) return false;
    if (filters.unit === OTHER_UNIT) {
      return lecture.unitId === null || !unitIds.has(lecture.unitId);
    }
    return filters.unit === "all" || lecture.unitId === filters.unit;
  };

  const visible = plan.lectures.filter(matches);
  const firstId = plan.lectures[0]?.id;
  const lastId = plan.lectures[plan.lectures.length - 1]?.id;
  // Unknown unit ids group with "Other lectures".
  const groupOf = (lecture: PlannedLecture) =>
    lecture.unitId !== null && unitIds.has(lecture.unitId) ? lecture.unitId : null;
  // Headings for the lectures actually on screen, so filters group correctly.
  const headings = unitHeadingRows(visible.map(groupOf));

  return (
    <Card className="mt-4 p-5">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="sm:w-44">
          <label htmlFor="filter-status" className={labelClass}>
            Status
          </label>
          <Select
            id="filter-status"
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value as StatusFilter })
            }
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {LECTURE_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:w-64">
          <label htmlFor="filter-unit" className={labelClass}>
            Unit
          </label>
          <Select
            id="filter-unit"
            value={filters.unit}
            onChange={(e) => onFiltersChange({ ...filters, unit: e.target.value })}
          >
            <option value="all">All units</option>
            {subject.units.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.number} · {u.title}
              </option>
            ))}
            <option value={OTHER_UNIT}>Other</option>
          </Select>
        </div>

        <label className="flex h-9 items-center gap-2 text-xs font-semibold text-ink">
          <input
            type="checkbox"
            checked={filters.showCancelled}
            onChange={(e) => onFiltersChange({ ...filters, showCancelled: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          Show cancelled
        </label>

        <p className="text-xs text-ink-muted tabular sm:ml-auto sm:pb-2.5" aria-live="polite">
          Showing {visible.length} of {plan.lectures.length}
        </p>
      </div>

      {/* Lectures */}
      {visible.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-ink-muted">
            {plan.lectures.length === 0
              ? "This plan has no lectures. Add one to get started."
              : "No lectures match these filters"}
          </p>
          {active && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={() => onFiltersChange(DEFAULT_FILTERS)}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {visible.map((lecture, i) => {
            const { group, showHeading } = headings[i] ?? {
              group: groupOf(lecture),
              showHeading: i === 0,
            };
            return (
              <Fragment key={lecture.id}>
                {showHeading && (
                  <li
                    className="pb-1 pt-3 text-xs font-bold uppercase tracking-wide text-ink-muted first:pt-0"
                  >
                    {unitLabel(subject.units, group)}
                  </li>
                )}
                <LectureRow
                  lecture={lecture}
                  number={numbers[lecture.id] ?? null}
                  date={schedule[lecture.id] ?? null}
                  todayISO={todayISO}
                  topicStatus={
                    lecture.topicKey ? (topicStatus.get(lecture.topicKey) ?? null) : null
                  }
                  isFirst={lecture.id === firstId}
                  isLast={lecture.id === lastId}
                  filtersActive={active}
                  actions={actions}
                />
              </Fragment>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
