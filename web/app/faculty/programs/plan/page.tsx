import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getProgramsWorkspace } from "@/lib/api/faculty-programs";
import { linkButtonClass } from "@/components/faculty/curriculum/utils";
import { DevelopmentPlan } from "@/components/faculty/programs/DevelopmentPlan";
import { PlanPrintButton } from "@/components/faculty/programs/PlanPrintButton";
import { programsTabHref } from "@/components/faculty/programs/utils";

// The printable development plan. The server supplies every programme and the
// faculty name; which ones are in the plan is read from this browser after
// mount. No clock is read here.

export default async function FacultyDevelopmentPlanPage() {
  const { rows, faculty } = await getProgramsWorkspace();

  return (
    <DashboardShell title="Development Plan">
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "Faculty", href: "/dashboard/faculty" },
            { label: "Development & Research", href: "/faculty/programs" },
            { label: "Development plan" },
          ]}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={programsTabHref("plan")} className={linkButtonClass("secondary")}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to my plan
          </Link>
          <PlanPrintButton />
        </div>
      </div>

      <DevelopmentPlan rows={rows} faculty={faculty} />
    </DashboardShell>
  );
}
