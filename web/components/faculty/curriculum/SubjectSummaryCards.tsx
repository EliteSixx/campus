import { BookOpen, Clock, Library, ListChecks, Target, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  InsightSkill,
  InsightSubject,
} from "@/lib/api/curriculum-insights-meta";
import { plural, SCORE_TEXT, scoreTone, skillNameOf, type Tone } from "./utils";

// Five small headline numbers for one subject. Own markup rather than
// MetricCard, which sets font-mono on the value.

function SmallCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Card className="h-full p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-ink-muted">{label}</p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
      </div>
      <p
        className={cn(
          "mt-1.5 text-xl font-extrabold tracking-tight tabular",
          tone ? SCORE_TEXT[tone] : "text-ink",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-ink-muted">{sub}</p>
    </Card>
  );
}

export function SubjectSummaryCards({
  subject,
  skills,
  draftScoreAfter,
}: {
  subject: InsightSubject;
  skills: Record<string, InsightSkill>;
  // null until drafts have loaded, or when the draft changes nothing.
  draftScoreAfter: number | null;
}) {
  const withMaterials = subject.topics.filter((t) => t.materialsCount > 0).length;
  const topMissing = subject.missingSkillIds[0];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
      <SmallCard
        label="Alignment"
        value={`${subject.alignmentScore}%`}
        sub={
          draftScoreAfter === null
            ? "industry aligned"
            : `Draft: ${draftScoreAfter}%`
        }
        icon={Target}
        tone={scoreTone(subject.alignmentScore)}
      />
      <SmallCard
        label="Topics"
        value={String(subject.topics.length)}
        sub={`${subject.totalHours}h in syllabus`}
        icon={ListChecks}
      />
      <SmallCard
        label="Outdated hours"
        value={`${subject.outdatedHours}h`}
        sub={plural(subject.outdatedCount, "outdated topic")}
        icon={Clock}
        tone={subject.outdatedHours > 0 ? "danger" : undefined}
      />
      <SmallCard
        label="Missing skills"
        value={String(subject.missingSkillIds.length)}
        sub={
          topMissing === undefined
            ? "Nothing missing"
            : skillNameOf(skills, topMissing)
        }
        icon={BookOpen}
        tone={subject.missingSkillIds.length > 0 ? "warning" : undefined}
      />
      <SmallCard
        label="Materials"
        value={`${withMaterials} of ${subject.topics.length}`}
        sub="topics with materials"
        icon={Library}
      />
    </div>
  );
}
