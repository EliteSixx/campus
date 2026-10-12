import type {
  NotificationItem,
  NotificationSeverity,
  OfferRecord,
} from "./types";
import { verifyChecklistCompleteness } from "./state-machine";

/**
 * Pure function to parse a date safely from string or Date object.
 */
function parseDate(dateInput: Date | string): Date {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getTime());
  }
  return new Date(dateInput);
}

/**
 * Calculates calendar day difference between target date and current date (target - now).
 */
function getDaysDifference(targetDate: Date, nowDate: Date): number {
  const targetMidnight = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  ).getTime();

  const nowMidnight = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate()
  ).getTime();

  const diffMs = targetMidnight - nowMidnight;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generates in-app notifications strictly evaluated from offer records and current timestamp.
 * In-app only; no external delivery mechanisms (no SMS, Email, or WhatsApp).
 *
 * @param offers List of offer records
 * @param now Current date or timestamp (defaults to new Date())
 * @returns Array of deterministic NotificationItem objects
 */
export function generateNotifications(
  offers: readonly OfferRecord[],
  now: Date | string = new Date()
): NotificationItem[] {
  const notifications: NotificationItem[] = [];
  const nowDate = parseDate(now);

  for (const offer of offers) {
    // 1. Acceptance Deadline Notifications
    if (offer.status === "OFFER_RECEIVED" || offer.status === "UNDER_REVIEW") {
      const deadlineDate = parseDate(offer.acceptance_deadline);
      const daysUntilDeadline = getDaysDifference(deadlineDate, nowDate);

      if (daysUntilDeadline === 1) {
        notifications.push({
          id: `notif-deadline-${offer.offer_id}-tomorrow`,
          offer_id: offer.offer_id,
          student_id: offer.student_id,
          company: offer.company,
          title: "Offer acceptance deadline is tomorrow",
          message: `The deadline to accept or defer your offer from ${offer.company} (${offer.role}, ${offer.ctc_lpa} LPA) is tomorrow (${offer.acceptance_deadline}).`,
          type: "warning",
          category: "DEADLINE",
          timestamp: nowDate.toISOString(),
          read: false,
          action_label: "Review Offer",
        });
      } else if (daysUntilDeadline === 0) {
        notifications.push({
          id: `notif-deadline-${offer.offer_id}-today`,
          offer_id: offer.offer_id,
          student_id: offer.student_id,
          company: offer.company,
          title: "Offer acceptance deadline is today",
          message: `Action required: Today is the final day to accept your offer from ${offer.company}.`,
          type: "action_required",
          category: "DEADLINE",
          timestamp: nowDate.toISOString(),
          read: false,
          action_label: "Accept or Defer",
        });
      } else if (daysUntilDeadline < 0) {
        notifications.push({
          id: `notif-deadline-${offer.offer_id}-expired`,
          offer_id: offer.offer_id,
          student_id: offer.student_id,
          company: offer.company,
          title: "Offer acceptance deadline has passed",
          message: `The acceptance window for ${offer.company} expired on ${offer.acceptance_deadline}.`,
          type: "info",
          category: "DEADLINE",
          timestamp: nowDate.toISOString(),
          read: true,
        });
      } else if (daysUntilDeadline <= 3) {
        notifications.push({
          id: `notif-deadline-${offer.offer_id}-soon`,
          offer_id: offer.offer_id,
          student_id: offer.student_id,
          company: offer.company,
          title: `Offer acceptance deadline in ${daysUntilDeadline} days`,
          message: `Your offer from ${offer.company} must be accepted before ${offer.acceptance_deadline}.`,
          type: "info",
          category: "DEADLINE",
          timestamp: nowDate.toISOString(),
          read: false,
          action_label: "Review Offer",
        });
      }
    }

    // 2. Document Verification Pending Notifications
    if (offer.status === "ACCEPTED" || offer.status === "DOCS_PENDING") {
      const { isComplete, pendingRequired, submittedRequired } =
        verifyChecklistCompleteness(offer.document_checklist);

      if (!isComplete) {
        if (submittedRequired.length > 0) {
          notifications.push({
            id: `notif-docs-${offer.offer_id}-pending-verify`,
            offer_id: offer.offer_id,
            student_id: offer.student_id,
            company: offer.company,
            title: "Document verification pending",
            message: `${submittedRequired.length} document(s) for ${offer.company} (${submittedRequired.map((d) => d.label).join(", ")}) are awaiting Placement Cell verification.`,
            type: "action_required",
            category: "DOCUMENT",
            timestamp: nowDate.toISOString(),
            read: false,
            action_label: "Verify Documents",
          });
        }

        if (pendingRequired.length > 0) {
          notifications.push({
            id: `notif-docs-${offer.offer_id}-pending-submit`,
            offer_id: offer.offer_id,
            student_id: offer.student_id,
            company: offer.company,
            title: "Document submission pending",
            message: `Please upload mandatory verification documents (${pendingRequired.map((d) => d.label).join(", ")}) for ${offer.company}.`,
            type: "warning",
            category: "DOCUMENT",
            timestamp: nowDate.toISOString(),
            read: false,
            action_label: "Upload Documents",
          });
        }
      }
    }

    // 3. Joining Date Updated & Scheduled Notifications
    if (offer.status === "JOINING_SCHEDULED") {
      // Check if joining date was updated or scheduled in history
      const hasJoiningTransition = offer.status_history.some(
        (h) => h.to === "JOINING_SCHEDULED"
      );

      if (hasJoiningTransition || offer.joining_date) {
        notifications.push({
          id: `notif-joining-${offer.offer_id}-updated`,
          offer_id: offer.offer_id,
          student_id: offer.student_id,
          company: offer.company,
          title: "Joining date updated",
          message: `Official joining date for ${offer.company} (${offer.role}) is scheduled for ${offer.joining_date}.`,
          type: "info",
          category: "JOINING",
          timestamp: nowDate.toISOString(),
          read: false,
          action_label: "View Schedule",
        });
      }

      // Check proximity of joining date
      const joiningDate = parseDate(offer.joining_date);
      const daysUntilJoining = getDaysDifference(joiningDate, nowDate);
      if (daysUntilJoining > 0 && daysUntilJoining <= 14) {
        notifications.push({
          id: `notif-joining-${offer.offer_id}-approaching`,
          offer_id: offer.offer_id,
          student_id: offer.student_id,
          company: offer.company,
          title: `Joining date in ${daysUntilJoining} days`,
          message: `Reporting at ${offer.company} is scheduled for ${offer.joining_date}. Ensure all onboarding procedures are complete.`,
          type: "info",
          category: "JOINING",
          timestamp: nowDate.toISOString(),
          read: false,
        });
      }
    }

    // 4. Completed Documents Verified Notification
    if (offer.status === "DOCS_VERIFIED") {
      notifications.push({
        id: `notif-docs-${offer.offer_id}-verified`,
        offer_id: offer.offer_id,
        student_id: offer.student_id,
        company: offer.company,
        title: "All documents verified",
        message: `All onboarding documents for ${offer.company} have been approved by the Placement Cell. Awaiting joining schedule.`,
        type: "success",
        category: "DOCUMENT",
        timestamp: nowDate.toISOString(),
        read: false,
      });
    }
  }

  // Sort: action_required & warning first, then by title
  const severityScore: Record<NotificationSeverity, number> = {
    action_required: 4,
    warning: 3,
    info: 2,
    success: 1,
  };

  return notifications.sort(
    (a, b) => severityScore[b.type] - severityScore[a.type]
  );
}
