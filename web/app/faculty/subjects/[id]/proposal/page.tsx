import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getSubjectInsights } from "@/lib/api/curriculum-insights";
import { ProposalClient } from "@/components/faculty/curriculum/ProposalClient";
import { subjectHref } from "@/components/faculty/curriculum/utils";

// The printable syllabus revision proposal for one subject. The server supplies
// the workspace; the draft itself lives in the browser, so ProposalClient reads
// it and builds the document. No clock is read here.

export default async function SubjectProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getSubjectInsights(id);
  if (!data) notFound();

  const { workspace, subject } = data;
  const studentImpact =
    workspace.studentImpact.find((s) => s.subjectId === subject.id) ?? null;

  return (
    <DashboardShell title="Revision Proposal">
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "Faculty", href: "/dashboard/faculty" },
            { label: "Curriculum Analysis", href: "/faculty/subjects" },
            { label: subject.code, href: subjectHref(subject.id) },
            { label: "Proposal" },
          ]}
        />
      </div>

      <ProposalClient
        subject={subject}
        faculty={workspace.faculty}
        totalPostings={workspace.totalPostings}
        trackedStudents={workspace.trackedStudents}
        postings={workspace.postings}
        skills={workspace.skills}
        programs={workspace.programs}
        studentImpact={studentImpact}
      />
    </DashboardShell>
  );
}
