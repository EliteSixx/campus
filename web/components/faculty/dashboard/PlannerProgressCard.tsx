import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { headerLinkClass, type PlannerRow } from "./utils";

// Row 4, left: syllabus delivery per subject. The percentage is delivered
// hours over total hours and the count is topics, both as /faculty/planner
// shows them.

export function PlannerProgressCard({ rows }: { rows: PlannerRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Lecture planner progress</CardTitle>
          <CardDescription>Hours delivered against each syllabus</CardDescription>
        </div>
        <Link href="/faculty/planner" className={headerLinkClass}>
          Open planner
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <CalendarDays className="mx-auto h-5 w-5 text-ink-faint" />
            <p className="mt-2 text-sm text-ink-muted">No subjects to plan yet.</p>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {rows.map((row) => (
                <li key={row.subjectId}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <Badge tone="neutral" className="shrink-0">
                          {row.code}
                        </Badge>
                        <span className="truncate text-sm font-medium text-ink">
                          {row.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted tabular">
                        {row.deliveredTopics} of {row.totalTopics} topics
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-accent tabular">
                      {row.hoursPct}%
                    </span>
                  </div>
                  <Progress value={row.hoursPct} className="mt-1.5" />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-faint">
              Progress is saved in this browser.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
