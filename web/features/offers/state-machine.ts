import type {
  LifecycleState,
  LifecycleTransitionRecord,
  OfferDocument,
  OfferRecord,
} from "./types";

/**
 * Custom Error for invalid transitions in the post-selection lifecycle.
 */
export class InvalidStateTransitionError extends Error {
  public readonly fromState: LifecycleState;
  public readonly toState: LifecycleState;
  public readonly allowedTransitions: readonly LifecycleState[];
  public readonly offerId?: string;

  constructor(
    fromState: LifecycleState,
    toState: LifecycleState,
    allowedTransitions: readonly LifecycleState[],
    offerId?: string
  ) {
    const offerContext = offerId ? ` for offer "${offerId}"` : "";
    const allowedMsg =
      allowedTransitions.length > 0
        ? `Allowed transitions from "${fromState}" are: [${allowedTransitions.join(", ")}].`
        : `"${fromState}" is a terminal state and allows no further transitions.`;

    super(
      `Invalid state transition${offerContext}: cannot transition from "${fromState}" to "${toState}". ${allowedMsg}`
    );
    this.name = "InvalidStateTransitionError";
    this.fromState = fromState;
    this.toState = toState;
    this.allowedTransitions = allowedTransitions;
    this.offerId = offerId;
    Object.setPrototypeOf(this, InvalidStateTransitionError.prototype);
  }
}

/**
 * Explicit map of permitted state transitions.
 * States:
 * OFFER_RECEIVED, UNDER_REVIEW, ACCEPTED, REJECTED, DEFERRED,
 * DOCS_PENDING, DOCS_VERIFIED, JOINING_SCHEDULED, JOINED, WITHDRAWN.
 */
export const ALLOWED_TRANSITIONS: Readonly<
  Record<LifecycleState, readonly LifecycleState[]>
> = Object.freeze<Record<LifecycleState, readonly LifecycleState[]>>({
  OFFER_RECEIVED: Object.freeze<LifecycleState[]>([
    "UNDER_REVIEW",
    "ACCEPTED",
    "REJECTED",
    "DEFERRED",
    "WITHDRAWN",
  ]),
  UNDER_REVIEW: Object.freeze<LifecycleState[]>([
    "ACCEPTED",
    "REJECTED",
    "DEFERRED",
    "WITHDRAWN",
  ]),
  DEFERRED: Object.freeze<LifecycleState[]>([
    "UNDER_REVIEW",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  ACCEPTED: Object.freeze<LifecycleState[]>([
    "DOCS_PENDING",
    "WITHDRAWN",
  ]),
  DOCS_PENDING: Object.freeze<LifecycleState[]>([
    "DOCS_VERIFIED",
    "WITHDRAWN",
  ]),
  DOCS_VERIFIED: Object.freeze<LifecycleState[]>([
    "JOINING_SCHEDULED",
    "WITHDRAWN",
  ]),
  JOINING_SCHEDULED: Object.freeze<LifecycleState[]>([
    "JOINED",
    "JOINING_SCHEDULED", // allows rescheduling / updating joining date
    "WITHDRAWN",
  ]),
  JOINED: Object.freeze<LifecycleState[]>([]), // Terminal state
  REJECTED: Object.freeze<LifecycleState[]>([]), // Terminal state
  WITHDRAWN: Object.freeze<LifecycleState[]>([]), // Terminal state
});

/**
 * Checks whether a transition between two states is valid.
 */
export function canTransition(
  from: LifecycleState,
  to: LifecycleState
): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed) {
    return false;
  }
  return allowed.includes(to);
}

/**
 * Returns the list of permitted next states from a given state.
 */
export function getAllowedTransitions(
  state: LifecycleState
): readonly LifecycleState[] {
  return ALLOWED_TRANSITIONS[state] ?? [];
}

/**
 * Asserts that a state transition is valid, throwing an InvalidStateTransitionError if not.
 */
export function assertValidTransition(
  from: LifecycleState,
  to: LifecycleState,
  offerId?: string
): void {
  if (!canTransition(from, to)) {
    throw new InvalidStateTransitionError(
      from,
      to,
      getAllowedTransitions(from),
      offerId
    );
  }
}

/**
 * Returns whether a state is terminal (no outward transitions).
 */
export function isTerminalState(state: LifecycleState): boolean {
  return getAllowedTransitions(state).length === 0;
}

/**
 * Verifies whether all required documents are in "VERIFIED" status.
 */
export function verifyChecklistCompleteness(
  checklist: readonly OfferDocument[]
): {
  isComplete: boolean;
  pendingRequired: OfferDocument[];
  submittedRequired: OfferDocument[];
} {
  const pendingRequired = checklist.filter(
    (doc) => doc.required && doc.status === "PENDING"
  );
  const submittedRequired = checklist.filter(
    (doc) => doc.required && doc.status === "SUBMITTED"
  );
  const isComplete = pendingRequired.length === 0 && submittedRequired.length === 0;

  return {
    isComplete,
    pendingRequired,
    submittedRequired,
  };
}

/**
 * Pure transition function that returns a new OfferRecord with updated state and history.
 */
export function transitionOffer(
  offer: OfferRecord,
  toState: LifecycleState,
  options: {
    actor?: "STUDENT" | "PLACEMENT_CELL" | "SYSTEM";
    reason?: string;
    notes?: string;
    timestamp?: string;
  } = {}
): OfferRecord {
  assertValidTransition(offer.status, toState, offer.offer_id);

  // If transitioning to DOCS_VERIFIED, validate that all required documents are verified
  if (toState === "DOCS_VERIFIED") {
    const { isComplete, pendingRequired, submittedRequired } =
      verifyChecklistCompleteness(offer.document_checklist);
    if (!isComplete) {
      const pendingNames = [...pendingRequired, ...submittedRequired]
        .map((d) => d.label)
        .join(", ");
      throw new Error(
        `Cannot transition offer "${offer.offer_id}" to "DOCS_VERIFIED": required documents not verified yet: ${pendingNames}`
      );
    }
  }

  const timestamp = options.timestamp || new Date().toISOString();
  const transitionRecord: LifecycleTransitionRecord = {
    from: offer.status,
    to: toState,
    timestamp,
    actor: options.actor ?? "SYSTEM",
    reason: options.reason,
    notes: options.notes,
  };

  const updatedRecord: OfferRecord = {
    ...offer,
    status: toState,
    updated_at: timestamp,
    status_history: [...offer.status_history, transitionRecord],
  };

  if (toState === "DEFERRED" && options.reason) {
    updatedRecord.deferred_reason = options.reason;
  }
  if (toState === "REJECTED" && options.reason) {
    updatedRecord.rejection_reason = options.reason;
  }
  if (toState === "WITHDRAWN" && options.reason) {
    updatedRecord.withdrawal_reason = options.reason;
  }

  return updatedRecord;
}

/**
 * Human-friendly metadata for each lifecycle state.
 */
export interface StateMetadata {
  label: string;
  stepIndex: number;
  description: string;
  badgeClass: string;
  pillColor: string;
}

export const STATE_METADATA: Record<LifecycleState, StateMetadata> = {
  OFFER_RECEIVED: {
    label: "Offer Received",
    stepIndex: 1,
    description: "Official offer extended by company and ready for candidate review.",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    pillColor: "#3b82f6",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    stepIndex: 2,
    description: "Candidate or placement cell is evaluating offer terms and compensation.",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    pillColor: "#f59e0b",
  },
  ACCEPTED: {
    label: "Accepted",
    stepIndex: 3,
    description: "Candidate accepted the offer. Preparing document verification.",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    pillColor: "#10b981",
  },
  REJECTED: {
    label: "Rejected",
    stepIndex: 3,
    description: "Candidate declined the offer.",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    pillColor: "#f43f5e",
  },
  DEFERRED: {
    label: "Deferred",
    stepIndex: 2,
    description: "Acceptance deferred for approved reasons (e.g. academic schedule or exam).",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    pillColor: "#a855f7",
  },
  DOCS_PENDING: {
    label: "Docs Pending",
    stepIndex: 4,
    description: "Waiting for candidate document uploads and placement cell verification.",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
    pillColor: "#f97316",
  },
  DOCS_VERIFIED: {
    label: "Docs Verified",
    stepIndex: 5,
    description: "All mandatory verification documents approved by placement cell.",
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    pillColor: "#14b8a6",
  },
  JOINING_SCHEDULED: {
    label: "Joining Scheduled",
    stepIndex: 6,
    description: "Official joining date confirmed. Awaiting reporting date.",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    pillColor: "#6366f1",
  },
  JOINED: {
    label: "Joined",
    stepIndex: 7,
    description: "Candidate joined company. Onboarding completed successfully.",
    badgeClass: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30",
    pillColor: "#22c55e",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    stepIndex: 0,
    description: "Candidature withdrawn post acceptance.",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
    pillColor: "#64748b",
  },
};
