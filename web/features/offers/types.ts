/**
 * Post-Selection Lifecycle Types
 * Owned by Brajesh (web/features/offers/**)
 */

export type LifecycleState =
  | "OFFER_RECEIVED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "DEFERRED"
  | "DOCS_PENDING"
  | "DOCS_VERIFIED"
  | "JOINING_SCHEDULED"
  | "JOINED"
  | "WITHDRAWN";

export type DocumentStatus = "PENDING" | "SUBMITTED" | "VERIFIED";

export interface OfferDocument {
  document_id: string;
  label: string;
  required: boolean;
  status: DocumentStatus;
  file_name?: string;
  submitted_at?: string;
  verified_at?: string;
  notes?: string;
}

export interface LifecycleTransitionRecord {
  from: LifecycleState;
  to: LifecycleState;
  timestamp: string;
  actor: "STUDENT" | "PLACEMENT_CELL" | "SYSTEM";
  reason?: string;
  notes?: string;
}

export interface OfferRecord {
  offer_id: string;
  student_id: string;
  student_name?: string;
  application_id?: string;
  company: string;
  role: string;
  ctc_lpa: number;
  offer_letter_reference: string;
  joining_date: string;
  bond_terms: string;
  ppo_or_internship_conversion: boolean;
  acceptance_deadline: string;
  document_checklist: OfferDocument[];
  status: LifecycleState;
  status_history: LifecycleTransitionRecord[];
  deferred_reason?: string;
  rejection_reason?: string;
  withdrawal_reason?: string;
  created_at: string;
  updated_at: string;
}

export type NotificationCategory = "DEADLINE" | "DOCUMENT" | "JOINING" | "STATUS";
export type NotificationSeverity = "warning" | "info" | "success" | "action_required";

export interface NotificationItem {
  id: string;
  offer_id: string;
  student_id: string;
  company: string;
  title: string;
  message: string;
  type: NotificationSeverity;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  action_label?: string;
}
