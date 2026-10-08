import { Users } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getStudentsWorkspace } from "@/lib/api/faculty-students-workspace";
import { StudentsOverviewClient } from "@/components/faculty/students/StudentsOverviewClient";
import { isStudentsTab } from "@/components/faculty/students/utils";

// My Students overview. The whole workspace is built on the server in one call
// and handed to a single client component. No clock is read here — who needs
// attention depends on today's date, which is decided in the browser.

export default async function FacultyStudentsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const workspace = await getStudentsWorkspace();

  // ?tab= opens a tab, but only one the page has; anything else falls back to
  // the attention list.
  const requestedTab = searchParams?.tab;
  const initialTab = isStudentsTab(requestedTab) ? requestedTab : "attention";

  return (
    <DashboardShell title="My Students">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "My Students" },
        ]}
      />

      <Card className="p-6">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-xl font-bold text-ink">My Students</h2>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {workspace.department} ·{" "}
          <span className="tabular">
            {workspace.trackedStudents} of {workspace.enrolledStudents}
          </span>{" "}
          enrolled students have skill data on The Plug
        </p>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          See who needs you this week, whether your teaching is landing, and
          which skills your syllabus does not reach. Averages use the students
          tracked on The Plug, not the full enrolment.
        </p>
      </Card>

      <StudentsOverviewClient workspace={workspace} initialTab={initialTab} />
    </DashboardShell>
  );
}
