import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getSemesterAcademics } from "@/lib/api/academics";
import { getStudentWorkspaceRow } from "@/lib/api/faculty-students-workspace";
import { linkButtonClass } from "@/components/faculty/curriculum/utils";
import { ProgressReport } from "@/components/faculty/students/ProgressReport";
import { ReportPrintButton } from "@/components/faculty/students/ReportPrintButton";
import { studentHref } from "@/components/faculty/students/utils";

// The printable progress report for one student. The server collects the same
// data as the student page; ProgressReport builds the document. Private notes
// are never included. No clock is read here.

export default async function StudentProgressReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getStudentWorkspaceRow(id);
  if (!data) notFound();

  const { row, detail } = data;
  const transcript = await getSemesterAcademics(id);

  return (
    <DashboardShell title="Progress Report">
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "Faculty", href: "/dashboard/faculty" },
            { label: "My Students", href: "/faculty/students" },
            { label: row.name, href: studentHref(row.id) },
            { label: "Progress report" },
          ]}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={studentHref(row.id)} className={linkButtonClass("secondary")}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to student
          </Link>
          <ReportPrintButton />
        </div>
      </div>

      <ProgressReport row={row} detail={detail} transcript={transcript} />
    </DashboardShell>
  );
}
