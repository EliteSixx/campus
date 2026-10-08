import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getSkillById } from "@/data/skills";
import { getSemesterAcademics } from "@/lib/api/academics";
import { getStudentWorkspaceRow } from "@/lib/api/faculty-students-workspace";
import { StudentDetailClient } from "@/components/faculty/students/StudentDetailClient";
import { isStudentDetailTab } from "@/components/faculty/students/detail-utils";

// One student's page. Everything is collected on the server and handed to a
// single client component as plain data. No clock is read here: warnings depend
// on today's date, which is decided in the browser.

export default async function FacultyStudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { id } = await params;
  const data = await getStudentWorkspaceRow(id);
  if (!data) notFound();

  const { row, detail } = data;
  const transcript = await getSemesterAcademics(id);

  // ?tab= opens a tab, but only one the page has.
  const requestedTab = searchParams?.tab;
  const initialTab = isStudentDetailTab(requestedTab) ? requestedTab : "overview";

  // Internship reports name skills by id. Resolved here so the skill catalogue
  // never reaches the browser.
  const skillNames: Record<string, string> = {};
  for (const internship of detail.internships) {
    const report = internship.report;
    if (!report) continue;
    for (const skillId of [...report.skillsApplied, ...report.skillsLearned]) {
      skillNames[skillId] = getSkillById(skillId)?.name ?? skillId;
    }
  }

  return (
    <DashboardShell title="Student Detail">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "My Students", href: "/faculty/students" },
          { label: row.name },
        ]}
      />

      <StudentDetailClient
        row={row}
        detail={detail}
        transcript={transcript}
        skillNames={skillNames}
        initialTab={initialTab}
      />
    </DashboardShell>
  );
}
