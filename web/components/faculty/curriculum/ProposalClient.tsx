"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, FilePenLine, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  computeDraftAnalysis,
  isDraftChanged,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
  type ProgramMatch,
  type SubjectStudentImpact,
} from "@/lib/api/curriculum-insights-meta";
import { ProposalDocument } from "./ProposalDocument";
import { useDraftStore } from "./useDraftStore";
import { draftHref, linkButtonClass, textLinkClass } from "./utils";

// Reads the saved revision draft for one subject and shows it as a printable
// proposal. Read only: nothing here changes the draft. The draft is read after
// mount, so a skeleton stands in until then.

export function ProposalClient({
  subject,
  faculty,
  totalPostings,
  trackedStudents,
  postings,
  skills,
  programs,
  studentImpact,
}: {
  subject: InsightSubject;
  faculty: { name: string; department: string };
  totalPostings: number;
  trackedStudents: number;
  postings: InsightPosting[];
  skills: Record<string, InsightSkill>;
  programs: ProgramMatch[];
  studentImpact: SubjectStudentImpact | null;
}) {
  const store = useDraftStore(subject);
  const analysis = useMemo(
    () => computeDraftAnalysis(subject, store.draft, postings, skills),
    [subject, store.draft, postings, skills],
  );

  if (!store.loaded) {
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        <p className="sr-only" role="status">
          Loading your draft…
        </p>
        <div className="h-12 animate-pulse rounded-xl bg-surface-raised" aria-hidden="true" />
        <div className="h-96 animate-pulse rounded-xl bg-surface-raised" aria-hidden="true" />
      </div>
    );
  }

  if (!isDraftChanged(store.draft)) {
    return (
      <Card className="mt-6 p-6">
        <h2 className="text-base font-bold text-ink">No changes in your draft yet</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Keep, reduce or remove topics, or add new ones, then come back to print
          the proposal.
        </p>
        <Link
          href={draftHref(subject.id)}
          className={`mt-4 ${linkButtonClass("primary")}`}
        >
          <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
          Open revision draft
        </Link>
      </Card>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={draftHref(subject.id)} className={textLinkClass}>
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to draft
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-ink-muted">
            Your draft is saved in this browser. Printing uses the draft as it is
            now.
          </p>
          <Button type="button" size="sm" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            Print proposal
          </Button>
        </div>
      </div>

      <ProposalDocument
        subject={subject}
        faculty={faculty}
        totalPostings={totalPostings}
        trackedStudents={trackedStudents}
        postings={postings}
        skills={skills}
        programs={programs}
        studentImpact={studentImpact}
        draft={store.draft}
        analysis={analysis}
      />
    </>
  );
}
