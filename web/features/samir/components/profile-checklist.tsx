"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/context/user-profile-context";
import { getStudentResume, calculateResumeCompletion } from "@/lib/api/resumes";
import { cn } from "@/lib/utils";
import { CURRENT_STUDENT_ID } from "../data/current-student";
import { getProfessionalSkillProfile } from "../data/skill-profile-data";
import { useApplications, isActiveApplication } from "../data/applications-store";

interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  href: string;
}

const RESUME_TARGET = 80;
const PROOF_CONFIDENCE_MIN = 60;

export function ProfileChecklist() {
  const { currentProfile } = useUserProfile();
  const { applications, hydrated } = useApplications();
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [weakProof, setWeakProof] = useState<string[] | null>(null);

  useEffect(() => {
    getStudentResume(CURRENT_STUDENT_ID).then((r) => setResumeScore(calculateResumeCompletion(r).score));
    getProfessionalSkillProfile().then((p) =>
      setWeakProof(p.evidenceRecords.filter((e) => e.confidence < PROOF_CONFIDENCE_MIN).map((e) => e.name))
    );
  }, []);

  if (resumeScore === null || weakProof === null || !hydrated) {
    return <div className="h-48 animate-pulse rounded-lg bg-surface-raised" />;
  }

  const acc = currentProfile.connectedAccounts;
  const items: ChecklistItem[] = [
    {
      id: "goal",
      label: "Set your career goal",
      hint: currentProfile.careerGoal ? `Target: ${currentProfile.careerGoal}` : "Recommendations depend on it",
      done: Boolean(currentProfile.careerGoal),
      href: "/settings/objectives",
    },
    {
      id: "resume",
      label: `Complete your resume (${RESUME_TARGET}%+)`,
      hint: `Currently ${resumeScore}% complete`,
      done: resumeScore >= RESUME_TARGET,
      href: "/profile/resume",
    },
    {
      id: "github",
      label: "Connect GitHub",
      hint: acc.github.connected ? `@${acc.github.handle}` : "Lets recruiters see your projects",
      done: acc.github.connected,
      href: "/settings/connections",
    },
    {
      id: "coding",
      label: "Connect LeetCode or HackerRank",
      hint: "Backs up your DSA and problem-solving scores",
      done: acc.leetcode.connected || acc.hackerrank.connected,
      href: "/settings/connections",
    },
    {
      id: "linkedin",
      label: "Connect LinkedIn",
      hint: "Recruiters often check it first",
      done: acc.linkedin.connected,
      href: "/settings/connections",
    },
    {
      id: "proof",
      label: "Add proof for every core skill",
      hint: weakProof.length ? `Low evidence: ${weakProof.join(", ")}` : "All core skills are backed by evidence",
      done: weakProof.length === 0,
      href: "/profile/skills",
    },
    {
      id: "apply",
      label: "Apply to at least one role",
      hint: "Start with your best-matched opportunities",
      done: applications.some(isActiveApplication),
      href: "/opportunities",
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  // Show unfinished items first so the next step is always at the top.
  const ordered = [...items.filter((i) => !i.done), ...items.filter((i) => i.done)];

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-accent" />
          <div>
            <h3 className="text-sm font-semibold text-ink">Profile checklist</h3>
            <p className="text-xs text-ink-muted">
              {doneCount === items.length
                ? "Your profile is complete. Nice work."
                : `${doneCount} of ${items.length} done. Complete profiles get noticed by recruiters first.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:w-48">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(doneCount / items.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs font-semibold text-ink">
            {doneCount}/{items.length}
          </span>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
        {ordered.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-start gap-3 rounded-lg border p-3 transition-colors",
                item.done
                  ? "border-border/60 bg-surface-raised/40"
                  : "border-border hover:border-accent/40 hover:bg-accent-soft/30"
              )}
            >
              {item.done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", item.done ? "text-ink-muted line-through" : "font-medium text-ink")}>
                  {item.label}
                </p>
                <p className="truncate text-xs text-ink-muted">{item.hint}</p>
              </div>
              {!item.done && (
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
