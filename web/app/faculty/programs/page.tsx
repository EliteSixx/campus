import { Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getProgramsWorkspace } from "@/lib/api/faculty-programs";
import { ProgramsClient } from "@/components/faculty/programs/ProgramsClient";
import { isProgramsTab } from "@/components/faculty/programs/utils";

// Development & Research. The whole workspace is built on the server in one
// call and handed to a single client component. No clock is read here.

export default async function FacultyProgramsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const workspace = await getProgramsWorkspace();

  // ?tab= opens a tab, but only one the page has; anything else is Recommended.
  const requestedTab = searchParams?.tab;
  const initialTab = isProgramsTab(requestedTab) ? requestedTab : "recommended";

  return (
    <DashboardShell title="Development & Research">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Development & Research" },
        ]}
      />

      <Card className="p-6">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-xl font-bold text-ink">
            Development &amp; Research Opportunities
          </h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Ranked by how much each programme would close the gaps in the subjects
          you teach, checked against{" "}
          <span className="tabular">{workspace.totalPostings}</span> live
          postings. Shortlist the ones you want, mark what you have applied for,
          and print a development plan for your head of department.
        </p>
      </Card>

      <ProgramsClient workspace={workspace} initialTab={initialTab} />
    </DashboardShell>
  );
}
