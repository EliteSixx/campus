import Link from "next/link";
import { ClipboardList, Megaphone, Upload, type LucideIcon } from "lucide-react";
import { linkButtonClass } from "@/components/faculty/curriculum/utils";
import type { DashboardFaculty } from "@/lib/api/faculty-dashboard-meta";
import { formatLongDate } from "./utils";

// Row 1: greeting, today's date and the three things a faculty member most
// often starts from the dashboard.
//
// None of the target pages opens its form from a URL, so these are plain links
// to the page that holds the form.

const QUICK_ACTIONS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "New announcement", href: "/faculty/announcements", icon: Megaphone },
  { label: "Create assignment", href: "/faculty/assignments", icon: ClipboardList },
  { label: "Upload material", href: "/faculty/materials", icon: Upload },
];

export function DashboardHeader({
  faculty,
  now,
}: {
  faculty: DashboardFaculty;
  now: Date | null;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-ink">Welcome, {faculty.name}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          {faculty.department} Department
        </p>
        {/* Fixed height, so the line appearing after mount moves nothing. */}
        <p className="mt-1 h-5 text-sm font-medium text-ink tabular">
          {now ? formatLongDate(now) : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={linkButtonClass("secondary")}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
