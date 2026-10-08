import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SubjectHours } from "@/lib/api/timetable";
import { cn } from "@/lib/utils";
import { formatHours, subjectSwatch } from "./utils";

// Carried over from the old week view. The hours are totalled by
// lib/api/timetable.ts from the lecture and lab slots in data/timetable.ts, so
// nothing on this card is written down by hand.
//
// subjectIds is the API's subject order rather than this card's, so a subject
// keeps the same colour here as it has in the week grid.

export function HoursBySubject({
  subjects,
  subjectIds,
}: {
  subjects: SubjectHours[];
  subjectIds: string[];
}) {
  // Already sorted highest first, so the busiest subject fills the bar.
  const maxHours = subjects[0]?.hours ?? 0;

  return (
    <Card className="h-full p-5">
      <h3 className="text-sm font-bold tracking-tight text-ink">
        Hours by subject
      </h3>
      <p className="mt-0.5 text-xs text-ink-muted">
        Lecture and lab hours per week
      </p>

      <div className="mt-4 space-y-3">
        {subjects.map((subject) => (
          <div key={subject.id}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-baseline gap-1.5 text-ink">
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    subjectSwatch(subject.id, subjectIds),
                  )}
                />
                <span className="font-mono font-semibold">{subject.code}</span>
                <span className="truncate text-ink-muted">{subject.name}</span>
              </span>
              <span className="shrink-0 font-mono tabular text-ink">
                {formatHours(subject.hours)}
              </span>
            </div>
            <div className="mt-1.5">
              <Progress
                value={maxHours ? (subject.hours / maxHours) * 100 : 0}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
