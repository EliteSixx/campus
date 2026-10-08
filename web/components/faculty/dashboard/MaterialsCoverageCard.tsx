import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { headerLinkClass, type CoverageRow } from "./utils";

// Row 4, right: how many topics in each course have at least one material,
// counted the way /faculty/materials counts them. Each row opens that course.

export function MaterialsCoverageCard({ rows }: { rows: CoverageRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Course materials coverage</CardTitle>
          <CardDescription>Topics with at least one material</CardDescription>
        </div>
        <Link href="/faculty/materials" className={headerLinkClass}>
          All materials
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <FolderOpen className="mx-auto h-5 w-5 text-ink-faint" />
            <p className="mt-2 text-sm text-ink-muted">No courses found.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {rows.map((row) => (
              <li key={row.courseId}>
                <Link
                  href={`/faculty/materials/${row.courseId}`}
                  className="block rounded-lg px-2 py-2 transition-colors hover:bg-surface-raised/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
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
                        {row.coveredTopics} of {row.totalTopics} topics
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-accent tabular">
                      {row.pct}%
                    </span>
                  </div>
                  <Progress value={row.pct} className="mt-1.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
