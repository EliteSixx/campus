"use client";

import { CircleCheck, Plus, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  PlannerSubjectWorkspace,
  SubjectPlan,
} from "@/lib/api/lecture-planner-meta";

// How the plan lines up with what employers ask for: hours spent on topics no
// posting wants, and the most-demanded skills the syllabus leaves out.

export function IndustryCheckCard({
  plan,
  subject,
  onAddForSkill,
}: {
  plan: SubjectPlan;
  subject: PlannerSubjectWorkspace;
  onAddForSkill: (skillName: string) => void;
}) {
  const active = plan.lectures.filter((l) => l.status !== "cancelled");

  // Outdated topics, matched on the full subject:topic key.
  const outdated = subject.topics.filter((t) => t.status === "Outdated");
  const outdatedKeys = new Set(outdated.map((t) => t.key));
  const outdatedLectures = active.filter(
    (l) => l.topicKey !== null && outdatedKeys.has(l.topicKey),
  );
  const outdatedHours = outdatedLectures.reduce((sum, l) => sum + l.durationHours, 0);
  const outdatedNames = outdated
    .filter((t) => outdatedLectures.some((l) => l.topicKey === t.key))
    .map((t) => t.name);

  // A skill counts as planned once an active lecture's title names it.
  const isPlanned = (skill: string) =>
    active.some((l) => l.title.toLowerCase().includes(skill.toLowerCase()));

  const skills = subject.missingSkills.slice(0, 3);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold tracking-tight text-ink">Industry check</h3>
      <p className="mt-0.5 text-xs text-ink-muted tabular">
        Compared with {subject.totalPostings} live postings
      </p>

      {outdatedHours > 0 ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {outdatedHours} {outdatedHours === 1 ? "hour" : "hours"} planned on topics no
            posting asks for: {outdatedNames.join(", ")}
          </span>
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-success">
          <CircleCheck className="h-3.5 w-3.5 shrink-0" />
          No hours planned on outdated topics
        </p>
      )}

      <h4 className="mt-4 text-xs font-bold text-ink">Skills your syllabus is missing</h4>
      {skills.length === 0 ? (
        <p className="mt-1 text-xs text-ink-muted">
          Your syllabus covers every skill these postings ask for.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {skills.map((skill) => (
            <li
              key={skill.name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
            >
              <span className="min-w-0 text-sm text-ink tabular">
                {skill.name}
                <span className="text-xs text-ink-muted">
                  {" "}
                  — asked for in {skill.demandCount} of {subject.totalPostings} postings
                </span>
              </span>
              {isPlanned(skill.name) ? (
                <Badge tone="success">Planned</Badge>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onAddForSkill(skill.name)}
                  aria-label={`Add a lecture on ${skill.name}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add lecture
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
