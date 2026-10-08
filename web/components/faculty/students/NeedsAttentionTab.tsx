import Link from "next/link";
import { CircleAlert, CircleCheck, MessageSquare, TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { linkButtonClass } from "@/components/faculty/curriculum/utils";
import { messageStudentHref } from "@/lib/api/faculty-students-meta";
import { ATTENTION_MIN_TEXT, type AttentionEntry } from "./attention";
import {
  messageSubjectFor,
  plural,
  studentHref,
} from "./utils";

// Students with at least one warning, most urgent first. Attention depends on
// today's date, so until the browser has it the list is a skeleton.

function Skeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg bg-surface-raised"
        />
      ))}
    </div>
  );
}

export function NeedsAttentionTab({
  entries,
  totalStudents,
  todayLabel,
}: {
  // Already sorted; null until today is known.
  entries: AttentionEntry[] | null;
  totalStudents: number;
  // "Wednesday, 16 September 2026"; null until today is known.
  todayLabel: string | null;
}) {
  const others = entries === null ? null : totalStudents - entries.length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Students who need attention</CardTitle>
          <CardDescription>
            {ATTENTION_MIN_TEXT} Updated for{" "}
            {todayLabel ?? "…"}.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {entries === null ? (
          <>
            <Skeleton />
            <p className="sr-only" role="status">
              Checking students…
            </p>
          </>
        ) : entries.length === 0 ? (
          <p className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-sm text-ink-muted">
            <CircleCheck className="h-4 w-4 text-success" aria-hidden="true" />
            No student needs attention right now.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map(({ row, reasons }) => {
              const first = reasons[0];
              return (
                <li
                  key={row.id}
                  className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {row.name}
                    </span>
                    {row.rollNumber && (
                      <Badge tone="neutral" className="text-[11px] tabular">
                        {row.rollNumber}
                      </Badge>
                    )}
                    <span className="text-xs text-ink-muted">
                      {row.yearLabel}
                    </span>
                  </div>

                  <ul className="mt-2 space-y-1">
                    {reasons.map((reason, i) => {
                      const high = reason.severity === "high";
                      const Icon = high ? TriangleAlert : CircleAlert;
                      return (
                        <li
                          key={`${reason.kind}-${reason.subjectId ?? ""}-${reason.assignmentId ?? ""}-${i}`}
                          className={cn(
                            "flex items-start gap-2 text-xs",
                            high ? "text-danger" : "text-warning",
                          )}
                        >
                          <Icon
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>
                            <span className="sr-only">
                              {high ? "Urgent: " : "Warning: "}
                            </span>
                            {reason.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={messageStudentHref(
                        row.id,
                        first ? messageSubjectFor(first, row) : undefined,
                      )}
                      className={linkButtonClass("secondary")}
                    >
                      <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                      Message
                      <span className="sr-only"> {row.name}</span>
                    </Link>
                    <Link
                      href={studentHref(row.id)}
                      className={linkButtonClass("ghost")}
                    >
                      View student
                      <span className="sr-only"> {row.name}</span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {others !== null && others > 0 && (
          <p className="mt-3 text-xs text-ink-muted">
            {others === 1
              ? "1 other student has no warnings."
              : `${plural(others, "other student")} have no warnings.`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
