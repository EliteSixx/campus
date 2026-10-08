import { Megaphone } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import {
  getAnnouncements,
  getAnnouncementStats,
  getAudienceLabel,
  getAudienceOptions,
} from "@/lib/api/faculty-announcements";
import { AnnouncementsClient } from "@/components/faculty/announcements/AnnouncementsClient";
import type { AnnouncementListEntry } from "@/components/faculty/announcements/utils";

export default async function FacultyAnnouncementsPage() {
  const [announcements, options] = await Promise.all([
    getAnnouncements(),
    getAudienceOptions(),
  ]);

  // The audience label and read figures are resolved here so the client never
  // needs the student data to render a card.
  const entries: AnnouncementListEntry[] = await Promise.all(
    announcements.map(async (announcement) => {
      const [audienceLabel, stats] = await Promise.all([
        getAudienceLabel(announcement.audience),
        getAnnouncementStats(announcement.id),
      ]);

      return {
        announcement,
        audienceLabel,
        totalRecipients: stats?.totalRecipients ?? 0,
        readCount: stats?.readCount ?? 0,
        readPercent: stats?.readPercent ?? 0,
        isLocal: false,
      };
    }),
  );

  return (
    <DashboardShell title="Announcements">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Announcements" },
        ]}
      />

      <Card className="p-6">
        <div className="flex items-center gap-2.5">
          <Megaphone className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold text-ink">Announcements</h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Share updates with your classes, courses and students.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Announcements you write here are saved in this browser only. They are
          not sent to students, and they will not follow you to another device.
        </p>
      </Card>

      <AnnouncementsClient entries={entries} options={options} />
    </DashboardShell>
  );
}
