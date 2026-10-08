import { CalendarDays } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getPlannerWorkspace } from "@/lib/api/lecture-planner";
import { getSkillCatalog } from "@/lib/api/skills";
import { PlannerClient } from "@/components/faculty/planner/PlannerClient";

// The lecture plan designer. Everything the editor needs is collected on the
// server in one call; plans themselves live in the browser, so the editor is a
// client component. No clock is read here — "today" is decided in the browser.

export default async function FacultyPlannerPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [workspace, skillCatalog] = await Promise.all([
    getPlannerWorkspace(),
    getSkillCatalog(),
  ]);

  // ?addSkill=docker opens the Add Lecture panel for that skill. Only a known
  // skill id is accepted, and its name is resolved here so the client never
  // needs the skill data.
  const addSkill = searchParams?.addSkill;
  const initialAddSkillName =
    typeof addSkill === "string"
      ? (skillCatalog.find((s) => s.id === addSkill)?.name ?? null)
      : null;

  // ?subject=cs302 opens that subject, but only if it is one of this faculty
  // member's; anything else falls back to the first.
  const requested = searchParams?.subject;
  const requestedId = typeof requested === "string" ? requested : null;
  const initialSubjectId =
    workspace.subjects.find((s) => s.id === requestedId)?.id ??
    workspace.subjects[0]?.id ??
    null;

  return (
    <DashboardShell title="Lecture Planner">
      {/* Screen only: the printable plan carries its own heading. */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "Faculty", href: "/dashboard/faculty" },
            { label: "Lecture Planner" },
          ]}
        />

        <Card className="p-6">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold text-ink">Lecture Planner</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Design your lecture plan: generate it from the syllabus, then add,
            move or cancel lectures. Dates follow your timetable and skip holidays
            and exam weeks. Your plan is saved in this browser only.
          </p>
        </Card>
      </div>

      <PlannerClient
        workspace={workspace}
        initialSubjectId={initialSubjectId}
        initialAddSkillName={initialAddSkillName}
      />
    </DashboardShell>
  );
}
