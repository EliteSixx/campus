"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CalendarPlus, CircleCheck, FilePenLine, GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  postingsForSkill,
  programsForSkill,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
  type ProgramMatch,
} from "@/lib/api/curriculum-insights-meta";
import {
  linkButtonClass,
  plannerSkillHref,
  plural,
  skillOf,
  textLinkClass,
} from "./utils";

// Every skill this subject is expected to teach but does not, most demanded
// first, with the postings behind the number, training programs that cover it,
// and a way into the revision draft.

const VISIBLE_POSTINGS = 3;
const VISIBLE_PROGRAMS = 2;

function MissingSkillCard({
  subject,
  skillId,
  skills,
  postings,
  programs,
  totalPostings,
  coveredInDraft,
  onAddToDraft,
  onViewDraft,
}: {
  subject: InsightSubject;
  skillId: string;
  skills: Record<string, InsightSkill>;
  postings: InsightPosting[];
  programs: ProgramMatch[];
  totalPostings: number;
  coveredInDraft: boolean;
  onAddToDraft: (skillId: string) => void;
  onViewDraft: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const listId = useId();
  const skill = skillOf(skills, skillId);
  const name = skill?.name ?? skillId;

  // Postings that require the skill come before those that only prefer it.
  const asking = postingsForSkill(skillId, postings).sort(
    (a, b) =>
      Number(b.requiredSkillIds.includes(skillId)) -
      Number(a.requiredSkillIds.includes(skillId)),
  );
  const visible = showAll ? asking : asking.slice(0, VISIBLE_POSTINGS);
  const matchingPrograms = programsForSkill(skillId, programs).slice(
    0,
    VISIBLE_PROGRAMS,
  );

  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-ink">{name}</h4>
          <p className="mt-0.5 text-xs text-ink-muted tabular">
            {skill?.category ?? "Other"} · {asking.length} of {totalPostings}{" "}
            postings
          </p>
        </div>
        {coveredInDraft && (
          <Badge tone="success">
            <CircleCheck className="h-3 w-3" aria-hidden="true" />
            Covered in your draft
          </Badge>
        )}
      </div>

      {asking.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold text-ink">Postings asking for it</p>
          <ul id={listId} className="mt-1.5 space-y-1.5">
            {visible.map((p) => {
              const required = p.requiredSkillIds.includes(skillId);
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-raised/60 px-2.5 py-1.5 text-xs"
                >
                  <span className="text-ink">
                    <span className="font-semibold">{p.title}</span>
                    <span className="text-ink-muted">
                      {" "}
                      · {p.company} · {p.type}, {p.location}
                    </span>
                  </span>
                  <Badge tone={required ? "accent" : "neutral"}>
                    {required ? "Required" : "Preferred"}
                  </Badge>
                </li>
              );
            })}
          </ul>
          {asking.length > VISIBLE_POSTINGS && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-1"
              aria-expanded={showAll}
              aria-controls={listId}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show fewer" : `Show all ${asking.length}`}
            </Button>
          )}
        </div>
      )}

      {matchingPrograms.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
            <GraduationCap className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Training that covers it
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-ink-muted">
            {matchingPrograms.map((program) => (
              <li key={program.id} className="tabular">
                <span className="font-semibold text-ink">{program.title}</span> ·{" "}
                {program.type} · {plural(program.durationWeeks, "week")}
              </li>
            ))}
          </ul>
          <Link href="/faculty/programs" className={`mt-1.5 ${textLinkClass}`}>
            View programs
          </Link>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {coveredInDraft ? (
          <Button type="button" size="sm" variant="secondary" onClick={onViewDraft}>
            <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
            View in draft
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={() => onAddToDraft(skillId)}>
            <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
            Add to revision draft
          </Button>
        )}
        <Link
          href={plannerSkillHref(subject.id, skillId)}
          className={linkButtonClass("secondary")}
          aria-label={`Plan a lecture on ${name} in ${subject.code}`}
        >
          <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Plan a lecture
        </Link>
      </div>
    </li>
  );
}

export function MissingSkillsTab({
  subject,
  skills,
  postings,
  programs,
  totalPostings,
  coveredInDraft,
  onAddToDraft,
  onViewDraft,
}: {
  subject: InsightSubject;
  skills: Record<string, InsightSkill>;
  postings: InsightPosting[];
  programs: ProgramMatch[];
  totalPostings: number;
  // Skills the saved draft covers; empty until drafts have loaded.
  coveredInDraft: string[];
  onAddToDraft: (skillId: string) => void;
  onViewDraft: () => void;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Missing from this syllabus</CardTitle>
          <CardDescription>
            Skills industry expects for {subject.code} that no topic teaches,
            most demanded first
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {subject.missingSkillIds.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Every skill expected for this subject is taught.
          </p>
        ) : (
          <ul className="space-y-3">
            {subject.missingSkillIds.map((skillId) => (
              <MissingSkillCard
                key={skillId}
                subject={subject}
                skillId={skillId}
                skills={skills}
                postings={postings}
                programs={programs}
                totalPostings={totalPostings}
                coveredInDraft={coveredInDraft.includes(skillId)}
                onAddToDraft={onAddToDraft}
                onViewDraft={onViewDraft}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
