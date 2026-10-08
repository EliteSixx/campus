"use client";

import {
  Ban,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  ListPlus,
  Pencil,
  RotateCcw,
  Trash2,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatPlanDate,
  LECTURE_STATUS_LABEL,
  LECTURE_TYPE_LABEL,
  type LectureStatus,
  type PlannedLecture,
  type PlannerTopicInfo,
} from "@/lib/api/lecture-planner-meta";
import { iconButtonClass } from "./utils";

// One lecture in the plan: its number, date, title and badges, plus the
// row-level actions. Every action is a real <button> with a label.

const STATUS_TONE: Record<LectureStatus, "neutral" | "success" | "danger"> = {
  planned: "neutral",
  delivered: "success",
  cancelled: "danger",
};

export interface LectureRowActions {
  onToggleDelivered: (lecture: PlannedLecture) => void;
  onMove: (lecture: PlannedLecture, direction: "up" | "down") => void;
  onEdit: (lecture: PlannedLecture) => void;
  onInsertAfter: (lecture: PlannedLecture) => void;
  onToggleCancelled: (lecture: PlannedLecture) => void;
  onDelete: (lecture: PlannedLecture) => void;
}

function IconButton({
  label,
  title,
  icon: Icon,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  title?: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    // The wrapper carries the tooltip, because a disabled button shows none.
    <span title={title ?? label} className="inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={cn(iconButtonClass, danger && "hover:text-danger")}
      >
        <Icon className="h-4 w-4" />
      </button>
    </span>
  );
}

export function LectureRow({
  lecture,
  number,
  date,
  todayISO,
  topicStatus,
  isFirst,
  isLast,
  filtersActive,
  actions,
}: {
  lecture: PlannedLecture;
  // null for cancelled lectures.
  number: number | null;
  // Scheduled date; null when cancelled or beyond the semester.
  date: string | null;
  todayISO: string | null;
  topicStatus: PlannerTopicInfo["status"] | null;
  isFirst: boolean;
  isLast: boolean;
  filtersActive: boolean;
  actions: LectureRowActions;
}) {
  const cancelled = lecture.status === "cancelled";
  const delivered = lecture.status === "delivered";
  const planned = lecture.status === "planned";
  const isToday = date !== null && todayISO !== null && date === todayISO;
  const overdue = planned && date !== null && todayISO !== null && date < todayISO;
  const moveTitle = filtersActive ? "Clear filters to reorder" : undefined;

  return (
    <li
      className={cn(
        "rounded-lg border px-3.5 py-3",
        cancelled
          ? "border-dashed border-border bg-surface/40"
          : isToday
            ? "border-accent bg-accent-soft/40"
            : "border-border bg-surface-raised/40",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        {/* Number, date and title */}
        <div className="flex min-w-0 gap-3">
          <span
            className={cn(
              "w-9 shrink-0 pt-0.5 text-sm font-bold tabular",
              cancelled ? "text-ink-faint" : "text-accent",
            )}
          >
            {number !== null ? `L${number}` : ""}
          </span>

          <div className="min-w-0">
            <p className="text-xs tabular">
              {cancelled ? (
                <span className="text-ink-faint">Not scheduled</span>
              ) : date !== null ? (
                <span className="font-semibold text-ink-muted">{formatPlanDate(date)}</span>
              ) : (
                <span className="font-semibold text-danger">No date — beyond semester end</span>
              )}
            </p>

            <button
              type="button"
              onClick={() => actions.onEdit(lecture)}
              className={cn(
                "mt-0.5 flex items-center gap-1.5 rounded text-left text-sm font-semibold hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                cancelled ? "text-ink-muted line-through" : "text-ink",
              )}
            >
              {delivered && <CircleCheck className="h-4 w-4 shrink-0 text-success" />}
              <span className="min-w-0">{lecture.title}</span>
            </button>

            {lecture.subtopic !== "" && (
              <p className="truncate text-xs text-ink-muted">{lecture.subtopic}</p>
            )}

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone="neutral">{LECTURE_TYPE_LABEL[lecture.type]}</Badge>
              <Badge tone={STATUS_TONE[lecture.status]}>
                {LECTURE_STATUS_LABEL[lecture.status]}
              </Badge>
              {lecture.isCustom && <Badge tone="accent">Custom</Badge>}
              {topicStatus === "Outdated" && <Badge tone="danger">Outdated topic</Badge>}
              {isToday && !cancelled && <Badge tone="accent">Today</Badge>}
              {overdue && <Badge tone="warning">Overdue</Badge>}
              {delivered && lecture.actualDate !== null && lecture.actualDate !== date && (
                <span className="text-xs text-ink-muted tabular">
                  Taken {formatPlanDate(lecture.actualDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-0.5 pl-12 sm:shrink-0 sm:pl-0">
          <IconButton
            label={delivered ? "Undo delivered" : "Mark delivered"}
            icon={delivered ? Undo2 : Check}
            onClick={() => actions.onToggleDelivered(lecture)}
            disabled={cancelled}
            title={cancelled ? "Restore the lecture first" : undefined}
          />
          <IconButton
            label="Move up"
            title={moveTitle}
            icon={ChevronUp}
            onClick={() => actions.onMove(lecture, "up")}
            disabled={filtersActive || isFirst}
          />
          <IconButton
            label="Move down"
            title={moveTitle}
            icon={ChevronDown}
            onClick={() => actions.onMove(lecture, "down")}
            disabled={filtersActive || isLast}
          />
          <IconButton label="Edit lecture" icon={Pencil} onClick={() => actions.onEdit(lecture)} />
          <IconButton
            label="Insert a lecture after this one"
            icon={ListPlus}
            onClick={() => actions.onInsertAfter(lecture)}
          />
          <IconButton
            label={cancelled ? "Restore lecture" : "Cancel lecture"}
            icon={cancelled ? RotateCcw : Ban}
            onClick={() => actions.onToggleCancelled(lecture)}
            danger={!cancelled}
          />
          {lecture.isCustom && (
            <IconButton
              label="Delete lecture"
              icon={Trash2}
              onClick={() => actions.onDelete(lecture)}
              danger
            />
          )}
        </div>
      </div>
    </li>
  );
}
