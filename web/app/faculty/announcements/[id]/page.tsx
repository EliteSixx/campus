import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  getAnnouncementById,
  getAnnouncementStats,
  getAudienceLabel,
  type AnnouncementRecipient,
} from "@/lib/api/faculty-announcements";
import { getRoster } from "@/lib/api/faculty-roster";
import {
  AnnouncementDetail,
  type AnnouncementDetailData,
} from "@/components/faculty/announcements/AnnouncementDetail";
import type { DetailRecipient } from "@/components/faculty/announcements/utils";

export default async function FacultyAnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Announcements written in the compose form only exist in the visitor's
  // browser, so there is nothing to look up here and a 404 would be wrong.
  // The client component reads them from localStorage instead.
  if (id.startsWith("local-")) {
    return (
      <DashboardShell title="Announcement">
        <AnnouncementDetail data={null} announcementId={id} />
      </DashboardShell>
    );
  }

  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  const [audienceLabel, stats, roster] = await Promise.all([
    getAudienceLabel(announcement.audience),
    getAnnouncementStats(id),
    // Only students in this faculty member's cohort have a detail page;
    // /faculty/students/[id] calls notFound() for anyone else.
    getRoster(),
  ]);

  const withDetailPages = new Set(roster.map((entry) => entry.student.id));
  const mark = (recipient: AnnouncementRecipient): DetailRecipient => ({
    ...recipient,
    hasDetailPage: withDetailPages.has(recipient.id),
  });

  const data: AnnouncementDetailData = {
    announcement,
    audienceLabel,
    totalRecipients: stats?.totalRecipients ?? 0,
    readCount: stats?.readCount ?? 0,
    unreadCount: stats?.unreadCount ?? 0,
    readPercent: stats?.readPercent ?? 0,
    readStudents: (stats?.readStudents ?? []).map(mark),
    unreadStudents: (stats?.unreadStudents ?? []).map(mark),
  };

  return (
    <DashboardShell title="Announcement">
      <AnnouncementDetail data={data} announcementId={id} />
    </DashboardShell>
  );
}
