import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ALLOWED_TRANSITIONS,
  canTransition,
  getAllowedTransitions,
  isTerminalState,
  InvalidStateTransitionError,
  transitionOffer,
  verifyChecklistCompleteness,
} from "./state-machine";
import type { OfferRecord, OfferDocument } from "./types";

function createMockOffer(overrides: Partial<OfferRecord> = {}): OfferRecord {
  return {
    offer_id: "OFFER-TEST-001",
    student_id: "ST001",
    company: "Acme Tech",
    role: "Backend Developer",
    ctc_lpa: 8.0,
    offer_letter_reference: "OL-ACME-001.pdf",
    joining_date: "2027-07-01",
    bond_terms: "1 year bond",
    ppo_or_internship_conversion: true,
    acceptance_deadline: "2026-10-15",
    document_checklist: [
      { document_id: "D1", label: "ID Proof", required: true, status: "PENDING" },
      { document_id: "D2", label: "Degree", required: true, status: "PENDING" },
    ],
    status: "OFFER_RECEIVED",
    status_history: [],
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    ...overrides,
  };
}

describe("Post-Selection State Machine - Allowed Transitions", () => {
  it("defines explicit allowed transitions for all 10 lifecycle states", () => {
    const states = [
      "OFFER_RECEIVED",
      "UNDER_REVIEW",
      "ACCEPTED",
      "REJECTED",
      "DEFERRED",
      "DOCS_PENDING",
      "DOCS_VERIFIED",
      "JOINING_SCHEDULED",
      "JOINED",
      "WITHDRAWN",
    ] as const;

    for (const state of states) {
      assert.ok(
        state in ALLOWED_TRANSITIONS,
        `State ${state} should be defined in ALLOWED_TRANSITIONS`
      );
    }
  });

  it("permits standard lifecycle progression", () => {
    assert.strictEqual(canTransition("OFFER_RECEIVED", "UNDER_REVIEW"), true);
    assert.strictEqual(canTransition("UNDER_REVIEW", "ACCEPTED"), true);
    assert.strictEqual(canTransition("ACCEPTED", "DOCS_PENDING"), true);
    assert.strictEqual(canTransition("DOCS_PENDING", "DOCS_VERIFIED"), true);
    assert.strictEqual(canTransition("DOCS_VERIFIED", "JOINING_SCHEDULED"), true);
    assert.strictEqual(canTransition("JOINING_SCHEDULED", "JOINED"), true);
  });

  it("permits direct acceptance, rejection, and deferral from OFFER_RECEIVED", () => {
    assert.strictEqual(canTransition("OFFER_RECEIVED", "ACCEPTED"), true);
    assert.strictEqual(canTransition("OFFER_RECEIVED", "REJECTED"), true);
    assert.strictEqual(canTransition("OFFER_RECEIVED", "DEFERRED"), true);
  });

  it("permits returning from DEFERRED to UNDER_REVIEW or directly to ACCEPTED", () => {
    assert.strictEqual(canTransition("DEFERRED", "UNDER_REVIEW"), true);
    assert.strictEqual(canTransition("DEFERRED", "ACCEPTED"), true);
    assert.strictEqual(canTransition("DEFERRED", "REJECTED"), true);
    assert.strictEqual(canTransition("DEFERRED", "WITHDRAWN"), true);
  });

  it("permits rescheduling joining date on JOINING_SCHEDULED", () => {
    assert.strictEqual(canTransition("JOINING_SCHEDULED", "JOINING_SCHEDULED"), true);
  });

  it("permits withdrawal across pre-joining active stages", () => {
    assert.strictEqual(canTransition("ACCEPTED", "WITHDRAWN"), true);
    assert.strictEqual(canTransition("DOCS_PENDING", "WITHDRAWN"), true);
    assert.strictEqual(canTransition("DOCS_VERIFIED", "WITHDRAWN"), true);
    assert.strictEqual(canTransition("JOINING_SCHEDULED", "WITHDRAWN"), true);
  });
});

describe("Post-Selection State Machine - Invalid Transitions & Error Handling", () => {
  it("rejects invalid skipping of states with InvalidStateTransitionError", () => {
    const invalidTransitions: Array<[from: any, to: any]> = [
      ["OFFER_RECEIVED", "JOINED"],
      ["OFFER_RECEIVED", "DOCS_VERIFIED"],
      ["OFFER_RECEIVED", "JOINING_SCHEDULED"],
      ["UNDER_REVIEW", "JOINED"],
      ["ACCEPTED", "JOINED"],
      ["DOCS_PENDING", "JOINED"],
      ["DOCS_VERIFIED", "ACCEPTED"],
    ];

    for (const [from, to] of invalidTransitions) {
      assert.strictEqual(canTransition(from, to), false);
      const offer = createMockOffer({ status: from });
      assert.throws(
        () => transitionOffer(offer, to),
        (err: unknown) => {
          assert.ok(err instanceof InvalidStateTransitionError);
          assert.strictEqual(err.fromState, from);
          assert.strictEqual(err.toState, to);
          assert.ok(err.message.includes(`cannot transition from "${from}" to "${to}"`));
          return true;
        }
      );
    }
  });

  it("treats JOINED, REJECTED, and WITHDRAWN as terminal states with zero transitions", () => {
    const terminalStates = ["JOINED", "REJECTED", "WITHDRAWN"] as const;

    for (const state of terminalStates) {
      assert.strictEqual(isTerminalState(state), true);
      assert.deepStrictEqual(getAllowedTransitions(state), []);

      const offer = createMockOffer({ status: state });
      assert.throws(
        () => transitionOffer(offer, "ACCEPTED"),
        (err: unknown) => {
          assert.ok(err instanceof InvalidStateTransitionError);
          assert.ok(err.message.includes("is a terminal state and allows no further transitions"));
          return true;
        }
      );
    }
  });
});

describe("Post-Selection State Machine - Document Checklist Verification", () => {
  it("detects unverified required documents", () => {
    const docs: OfferDocument[] = [
      { document_id: "d1", label: "Govt ID", required: true, status: "VERIFIED" },
      { document_id: "d2", label: "Transcript", required: true, status: "PENDING" },
      { document_id: "d3", label: "Photo", required: false, status: "PENDING" },
    ];

    const result = verifyChecklistCompleteness(docs);
    assert.strictEqual(result.isComplete, false);
    assert.strictEqual(result.pendingRequired.length, 1);
    assert.strictEqual(result.pendingRequired[0].document_id, "d2");
  });

  it("blocks transition to DOCS_VERIFIED if required documents are pending", () => {
    const offer = createMockOffer({
      status: "DOCS_PENDING",
      document_checklist: [
        { document_id: "d1", label: "Govt ID", required: true, status: "VERIFIED" },
        { document_id: "d2", label: "Transcript", required: true, status: "PENDING" },
      ],
    });

    assert.throws(
      () => transitionOffer(offer, "DOCS_VERIFIED"),
      /Cannot transition offer .* to "DOCS_VERIFIED": required documents not verified yet: Transcript/
    );
  });

  it("allows transition to DOCS_VERIFIED when all required documents are verified", () => {
    const offer = createMockOffer({
      status: "DOCS_PENDING",
      document_checklist: [
        { document_id: "d1", label: "Govt ID", required: true, status: "VERIFIED" },
        { document_id: "d2", label: "Transcript", required: true, status: "VERIFIED" },
        { document_id: "d3", label: "Optional Photo", required: false, status: "PENDING" },
      ],
    });

    const updated = transitionOffer(offer, "DOCS_VERIFIED", {
      actor: "PLACEMENT_CELL",
      notes: "All academic and identity proofs verified",
    });

    assert.strictEqual(updated.status, "DOCS_VERIFIED");
    assert.strictEqual(updated.status_history.length, 1);
    assert.strictEqual(updated.status_history[0].actor, "PLACEMENT_CELL");
  });
});

describe("Post-Selection State Machine - Audit Trail & Metadata", () => {
  it("accumulates transition history and records reasons", () => {
    let offer = createMockOffer({ status: "OFFER_RECEIVED" });

    offer = transitionOffer(offer, "DEFERRED", {
      actor: "STUDENT",
      reason: "Appearing for GATE examination",
      timestamp: "2026-10-02T10:00:00Z",
    });

    assert.strictEqual(offer.status, "DEFERRED");
    assert.strictEqual(offer.deferred_reason, "Appearing for GATE examination");
    assert.strictEqual(offer.status_history.length, 1);
    assert.strictEqual(offer.status_history[0].from, "OFFER_RECEIVED");
    assert.strictEqual(offer.status_history[0].to, "DEFERRED");

    offer = transitionOffer(offer, "ACCEPTED", {
      actor: "STUDENT",
      timestamp: "2026-10-03T10:00:00Z",
    });

    assert.strictEqual(offer.status, "ACCEPTED");
    assert.strictEqual(offer.status_history.length, 2);
  });
});
