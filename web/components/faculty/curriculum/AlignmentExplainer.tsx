import { ChevronDown, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  computeAlignment,
  countSkillDemand,
  taughtSkillIdsOf,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
} from "@/lib/api/curriculum-insights-meta";
import { skillNameOf } from "./utils";

// "How is the alignment score worked out?" — a closed-by-default explainer with
// a worked example taken from the live data, never hardcoded. The example uses
// the same computeAlignment() the scores come from, so it always adds up.

interface DemandItem {
  name: string;
  demand: number;
}

// Most demanded first, then by name.
function demandItems(
  skillIds: string[],
  skills: Record<string, InsightSkill>,
  postings: InsightPosting[],
): DemandItem[] {
  return skillIds
    .map((id) => ({
      name: skillNameOf(skills, id),
      demand: countSkillDemand(id, postings),
    }))
    .sort((a, b) => b.demand - a.demand || a.name.localeCompare(b.name, "en"));
}

// "SQL 5 + PostgreSQL 6 = 11", or just "SQL 5" for one skill.
function sumText(items: DemandItem[], total: number): string {
  if (items.length === 0) return "none = 0";
  const terms = items.map((i) => `${i.name} ${i.demand}`).join(" + ");
  return items.length === 1 ? terms : `${terms} = ${total}`;
}

// Highest score first; equal scores go to the lower code.
function pickExample(subjects: InsightSubject[]): InsightSubject | null {
  return (
    [...subjects].sort(
      (a, b) =>
        b.alignmentScore - a.alignmentScore || a.code.localeCompare(b.code, "en"),
    )[0] ?? null
  );
}

function WorkedExample({
  subject,
  skills,
  postings,
}: {
  subject: InsightSubject;
  skills: Record<string, InsightSkill>;
  postings: InsightPosting[];
}) {
  const result = computeAlignment(
    subject.industrySkillIds,
    taughtSkillIdsOf(subject.topics),
    postings,
  );
  const covered = demandItems(result.coveredSkillIds, skills, postings);
  const missing = demandItems(result.missingSkillIds, skills, postings);
  const { coveredDemand, missingDemand } = result;
  const total = coveredDemand + missingDemand;

  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-raised/60 p-4">
      <p className="text-xs font-bold text-ink">
        Worked example: {subject.code} {subject.name}
      </p>
      <dl className="mt-2 space-y-1.5 text-xs text-ink-muted">
        <div>
          <dt className="inline font-semibold text-ink">Taught skills: </dt>
          <dd className="inline tabular">{sumText(covered, coveredDemand)}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink">Missing skills: </dt>
          <dd className="inline tabular">{sumText(missing, missingDemand)}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink">Score: </dt>
          <dd className="inline tabular">
            {total === 0
              ? `No posting asks for any expected skill, so the score is ${result.score}%`
              : `${coveredDemand} ÷ (${coveredDemand} + ${missingDemand}) = ${result.score}%`}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function AlignmentExplainer({
  subjects,
  skills,
  postings,
  totalPostings,
}: {
  subjects: InsightSubject[];
  skills: Record<string, InsightSkill>;
  postings: InsightPosting[];
  totalPostings: number;
}) {
  const example = pickExample(subjects);

  return (
    <Card className="mt-6">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-sm font-bold text-ink">
            <Info className="h-4 w-4 text-accent" aria-hidden="true" />
            How is the alignment score worked out?
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="px-5 pb-5 text-sm text-ink-muted">
          <p>
            Each subject has a list of skills industry expects it to cover. For
            each skill we count how many of the {totalPostings} postings ask for
            it (required or preferred). Score = demand for the skills your
            topics teach ÷ demand for all expected skills.
          </p>

          {example && (
            <WorkedExample
              subject={example}
              skills={skills}
              postings={postings}
            />
          )}

          <p className="mt-4 text-xs">
            Foundational topics are kept even without demand. A topic is
            Outdated when it is not foundational and no posting asks for its
            skills.
          </p>
        </div>
      </details>
    </Card>
  );
}
