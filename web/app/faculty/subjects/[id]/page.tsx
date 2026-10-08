import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { cn } from "@/lib/utils";
import { getSubjectInsights } from "@/lib/api/curriculum-insights";
import { SubjectDetailClient } from "@/components/faculty/curriculum/SubjectDetailClient";
import {
  isDetailTab,
  linkButtonClass,
  proposalHref,
  SCORE_TEXT,
  scoreTone,
  skillOf,
  textLinkClass,
} from "@/components/faculty/curriculum/utils";

// One subject's curriculum analysis. The server collects the workspace once;
// tabs, the revision draft and anything read from localStorage live in
// SubjectDetailClient. ?tab= opens a tab, and ?tab=draft&addSkill= prefills
// the add-topic form. No clock is read here.

export default async function FacultySubjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { id } = await params;
  const data = await getSubjectInsights(id);
  if (!data) notFound();

  const { workspace, subject } = data;

  const requestedTab = searchParams?.tab;
  const initialTab = isDetailTab(requestedTab) ? requestedTab : "topics";

  // Only a skill the workspace knows about can prefill the form.
  const requestedSkill = searchParams?.addSkill;
  const initialAddSkill =
    typeof requestedSkill === "string" &&
    skillOf(workspace.skills, requestedSkill) !== null
      ? requestedSkill
      : null;

  const studentImpact =
    workspace.studentImpact.find((s) => s.subjectId === subject.id) ?? null;

  return (
    <DashboardShell title="Subject Detail">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Curriculum Analysis", href: "/faculty/subjects" },
          { label: subject.code },
        ]}
      />

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Link href="/faculty/subjects" className={textLinkClass}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              All subjects
            </Link>
            <div className="mt-2 flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold text-ink">{subject.name}</h2>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {subject.code} · Semester {subject.semester} · {subject.credits}{" "}
              credits · {subject.enrolled} enrolled ·{" "}
              {workspace.trackedStudents} tracked on The Plug
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Checked against {workspace.totalPostings} live postings
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "text-3xl font-extrabold tracking-tight tabular",
                SCORE_TEXT[scoreTone(subject.alignmentScore)],
              )}
            >
              {subject.alignmentScore}%
            </p>
            <p className="text-xs text-ink-muted">industry aligned</p>
          </div>
        </div>
      </Card>

      <SubjectDetailClient
        subject={subject}
        postings={workspace.postings}
        skills={workspace.skills}
        programs={workspace.programs}
        studentImpact={studentImpact}
        totalPostings={workspace.totalPostings}
        initialTab={initialTab}
        initialAddSkill={initialAddSkill}
      />

      <div className="mt-6">
        <Link
          href={proposalHref(subject.id)}
          className={linkButtonClass("secondary", "sm")}
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Open revision proposal
        </Link>
      </div>
    </DashboardShell>
  );
}
