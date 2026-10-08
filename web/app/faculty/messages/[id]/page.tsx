import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  getConversationById,
  getConversations,
} from "@/lib/api/faculty-messages";
import { getAudienceOptions } from "@/lib/api/faculty-announcements";
import { getRoster } from "@/lib/api/faculty-roster";
import { MessagesClient } from "@/components/faculty/messages/MessagesClient";

export default async function FacultyConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [summaries, options, roster] = await Promise.all([
    getConversations(),
    getAudienceOptions(),
    getRoster(),
  ]);

  // Conversations started in the compose panel only exist in the visitor's
  // browser, so there is nothing to look up here and a 404 would be wrong.
  // The client component reads them from localStorage instead.
  const isLocal = id.startsWith("local-");
  const detail = isLocal ? null : await getConversationById(id);
  if (!isLocal && !detail) notFound();

  return (
    <DashboardShell title="Messages">
      <MessagesClient
        summaries={summaries}
        students={options.students}
        detail={detail}
        selectedId={id}
        studentIdsWithDetailPage={roster.map((entry) => entry.student.id)}
      />
    </DashboardShell>
  );
}
