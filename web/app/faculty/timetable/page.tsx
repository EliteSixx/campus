import { CalendarClock } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getTimetableView } from "@/lib/api/timetable";
import { ClashCheckCard } from "@/components/faculty/timetable/ClashCheckCard";
import { HoursBySubject } from "@/components/faculty/timetable/HoursBySubject";
import { TimetableClient } from "@/components/faculty/timetable/TimetableClient";
import { TimetableSummary } from "@/components/faculty/timetable/TimetableSummary";
import { PrintButton } from "./print-button";

export default async function FacultyTimetablePage() {
  const view = await getTimetableView();

  return (
    <DashboardShell title="Timetable">
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "Faculty", href: "/dashboard/faculty" },
            { label: "Timetable" },
          ]}
        />
      </div>

      <Card className="p-6 print:border-0 print:p-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <CalendarClock className="h-5 w-5 text-accent print:hidden" />
              <h2 className="text-xl font-bold text-ink">Timetable</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Your weekly teaching schedule.
            </p>
          </div>
          <div className="print:hidden">
            <PrintButton />
          </div>
        </div>
      </Card>

      <TimetableSummary summary={view.summary} />

      <TimetableClient view={view} />

      {/* Both cards read the week rather than the current filter, so they sit
          below the grid rather than above it. */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 print:hidden">
        <HoursBySubject
          subjects={view.perSubjectHours}
          subjectIds={view.subjects.map((s) => s.id)}
        />
        <ClashCheckCard clashes={view.clashes} />
      </div>
    </DashboardShell>
  );
}
