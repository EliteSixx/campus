import { DashboardShell } from "@/components/shared/dashboard-shell";
import { getConversations } from "@/lib/api/faculty-messages";
import { getAudienceOptions } from "@/lib/api/faculty-announcements";
import { getRoster } from "@/lib/api/faculty-roster";
import { MessagesClient } from "@/components/faculty/messages/MessagesClient";
import { MAX_SUBJECT } from "@/components/faculty/messages/utils";

export default async function FacultyMessagesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [summaries, options, roster] = await Promise.all([
    getConversations(),
    getAudienceOptions(),
    // Only students in this faculty member's cohort have a detail page;
    // /faculty/students/[id] calls notFound() for anyone else.
    getRoster(),
  ]);

  // ?to=s1 opens a new message to that student, but only for an id the
  // recipient picker actually offers. ?subject= prefills the subject line,
  // trimmed and cut to the same limit the form enforces.
  const to = searchParams?.to;
  const initialComposeTo =
    typeof to === "string" && options.students.some((s) => s.id === to)
      ? to
      : null;

  const subject = searchParams?.subject;
  const trimmedSubject =
    typeof subject === "string" ? subject.trim().slice(0, MAX_SUBJECT) : "";
  const initialComposeSubject = trimmedSubject !== "" ? trimmedSubject : null;

  return (
    <DashboardShell title="Messages">
      <MessagesClient
        summaries={summaries}
        students={options.students}
        detail={null}
        selectedId={null}
        studentIdsWithDetailPage={roster.map((entry) => entry.student.id)}
        initialComposeTo={initialComposeTo}
        initialComposeSubject={initialComposeSubject}
      />
    </DashboardShell>
  );
}
