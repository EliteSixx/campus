export type NotificationSeverity = "LOW" | "MEDIUM" | "HIGH";

export type NotificationEvent =
  | {
      type: "shortlisting";
      id: string;
      student_name: string;
      company: string;
      role: string;
    }
  | {
      type: "interview_schedule";
      id: string;
      student_name: string;
      company: string;
      role: string;
      interview_at: string;
      location?: string;
    }
  | {
      type: "drive_announcement";
      id: string;
      company: string;
      role: string;
      drive_at: string;
    }
  | {
      type: "document_deadline";
      id: string;
      document_name: string;
      company: string;
      due_at: string;
    }
  | {
      type: "offer_deadline";
      id: string;
      company: string;
      role: string;
      due_at: string;
    }
  | {
      type: "pending_offer_follow_up";
      id: string;
      company: string;
      role: string;
      due_at: string;
    };

export type NotificationItem = {
  id: string;
  type: NotificationEvent["type"];
  title: string;
  body: string;
  due_at: string | null;
  severity: NotificationSeverity;
};

function severityFor(dueAt: string | null, nowMs: number): NotificationSeverity {
  if (dueAt === null) return "LOW";
  const dueMs = Date.parse(dueAt);
  if (Number.isNaN(dueMs)) return "LOW";
  const remainingMs = dueMs - nowMs;
  if (remainingMs <= 24 * 60 * 60 * 1000) return "HIGH";
  if (remainingMs <= 7 * 24 * 60 * 60 * 1000) return "MEDIUM";
  return "LOW";
}

function toNotification(event: NotificationEvent, nowMs: number): NotificationItem {
  let title: string;
  let body: string;
  let due_at: string | null = null;

  switch (event.type) {
    case "shortlisting":
      title = "You were shortlisted";
      body = `${event.company} shortlisted you for ${event.role}.`;
      break;
    case "interview_schedule":
      title = "Interview scheduled";
      body = `Interview with ${event.company} for ${event.role} is scheduled at ${event.interview_at}${event.location ? `, ${event.location}` : ""}.`;
      due_at = event.interview_at;
      break;
    case "drive_announcement":
      title = "New placement drive";
      body = `${event.company} announced a drive for ${event.role}.`;
      due_at = event.drive_at;
      break;
    case "document_deadline":
      title = "Document deadline";
      body = `Submit ${event.document_name} for ${event.company}.`;
      due_at = event.due_at;
      break;
    case "offer_deadline":
      title = "Offer response due";
      body = `Respond to the ${event.role} offer from ${event.company}.`;
      due_at = event.due_at;
      break;
    case "pending_offer_follow_up":
      title = "Pending offer follow-up";
      body = `Follow up with ${event.company} about the ${event.role} offer.`;
      due_at = event.due_at;
      break;
  }

  return {
    id: `${event.type}:${event.id}`,
    type: event.type,
    title,
    body,
    due_at,
    severity: severityFor(due_at, nowMs),
  };
}

/** Build stable notification items from placement events and an explicit clock value. */
export function buildNotifications(events: readonly NotificationEvent[], now: Date): NotificationItem[] {
  const nowMs = now.getTime();
  return events
    .map((event, index) => ({ notification: toNotification(event, nowMs), index }))
    .sort((left, right) => {
      const leftDue = left.notification.due_at ? Date.parse(left.notification.due_at) : Number.POSITIVE_INFINITY;
      const rightDue = right.notification.due_at ? Date.parse(right.notification.due_at) : Number.POSITIVE_INFINITY;
      const safeLeftDue = Number.isNaN(leftDue) ? Number.POSITIVE_INFINITY : leftDue;
      const safeRightDue = Number.isNaN(rightDue) ? Number.POSITIVE_INFINITY : rightDue;
      return safeLeftDue - safeRightDue || left.index - right.index;
    })
    .map(({ notification }) => notification);
}
