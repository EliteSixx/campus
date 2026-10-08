import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  CurriculumDraft,
  InsightSubject,
  TopicStatus,
} from "@/lib/api/curriculum-insights-meta";
import { plural, textLinkClass, TOPIC_STATUS_TONE } from "./utils";

// The syllabus as it stands, in order, with each topic's demand, materials and
// — once drafts have loaded — what the revision draft does to it.

const STATUS_BAR: Record<TopicStatus, string> = {
  // Matches the cyan badge tone in components/ui/badge.tsx.
  Foundational: "bg-cyan-500",
  "Industry-current": "bg-success",
  Outdated: "bg-danger",
};

const STATUS_ORDER: TopicStatus[] = ["Foundational", "Industry-current", "Outdated"];

export function TopicsTab({
  subject,
  totalPostings,
  draft,
}: {
  subject: InsightSubject;
  totalPostings: number;
  // null until drafts have loaded.
  draft: CurriculumDraft | null;
}) {
  const changeFor = new Map((draft?.changes ?? []).map((c) => [c.topicId, c]));
  const hoursBy = (status: TopicStatus) =>
    subject.topics
      .filter((t) => t.status === status)
      .reduce((sum, t) => sum + t.hours, 0);
  const total = subject.totalHours;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Syllabus topics</CardTitle>
          <CardDescription>
            In syllabus order, checked against live posting demand
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Share of hours by status. The text carries the meaning. */}
        {total > 0 && (
          <div className="rounded-lg border border-border p-3.5">
            <div
              className="flex h-2 w-full overflow-hidden rounded-full bg-surface-raised"
              aria-hidden="true"
            >
              {STATUS_ORDER.map((status) => {
                const hours = hoursBy(status);
                if (hours === 0) return null;
                return (
                  <div
                    key={status}
                    className={STATUS_BAR[status]}
                    style={{ width: `${(hours / total) * 100}%` }}
                  />
                );
              })}
            </div>
            <p className="mt-2 text-xs text-ink-muted tabular">
              {hoursBy("Foundational")}h foundational ·{" "}
              {hoursBy("Industry-current")}h industry-current ·{" "}
              {hoursBy("Outdated")}h outdated
            </p>
          </div>
        )}

        <ol className="space-y-3">
          {subject.topics.map((topic) => {
            const change = changeFor.get(topic.id);
            return (
              <li key={topic.key} className="rounded-lg border border-border p-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-semibold text-ink">
                    {topic.name}
                  </span>
                  <span className="text-xs text-ink-muted tabular">
                    {topic.hours}h
                  </span>
                  <Badge tone={TOPIC_STATUS_TONE[topic.status]}>
                    {topic.status}
                  </Badge>
                  {change?.action === "reduce" && (
                    <Badge tone="warning">Draft: Reduced to {change.hours}h</Badge>
                  )}
                  {change?.action === "remove" && (
                    <Badge tone="danger">Draft: Removed</Badge>
                  )}
                </div>

                {topic.skillNames.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills">
                    {topic.skillIds.map((id, i) => (
                      <li
                        key={id}
                        className="rounded border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-ink"
                      >
                        {topic.skillNames[i] ?? id}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <p className="text-ink-muted tabular">
                    {topic.status === "Outdated"
                      ? "No posting asks for these skills"
                      : topic.demandCount > 0
                        ? `asked for in ${topic.demandCount} of ${totalPostings} postings`
                        : null}
                  </p>
                  {topic.materialsCount > 0 ? (
                    <Link
                      href={`/faculty/materials/${encodeURIComponent(subject.id)}`}
                      className={textLinkClass}
                    >
                      {plural(topic.materialsCount, "material")}
                    </Link>
                  ) : (
                    <span className="text-ink-faint">No materials yet</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <p className="pt-1 text-xs text-ink-muted">
          <span className="font-semibold text-ink">Foundational</span> — core
          concept, kept regardless of market demand.{" "}
          <span className="font-semibold text-ink">Industry-current</span> —
          directly demanded by live postings.{" "}
          <span className="font-semibold text-ink">Outdated</span> — no posting
          on the platform asks for these skills.
        </p>
      </CardContent>
    </Card>
  );
}
