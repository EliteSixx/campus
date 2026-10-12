import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateNotifications } from "./notifications";
import type { OfferRecord } from "./types";

function buildSampleOffer(overrides: Partial<OfferRecord> = {}): OfferRecord {
  return {
    offer_id: "OFFER-ACME-ST001",
    student_id: "ST001",
    company: "Acme Tech",
    role: "Backend Developer",
    ctc_lpa: 8.0,
    offer_letter_reference: "OL/ACME/2026/ST001.pdf",
    joining_date: "2027-07-01",
    bond_terms: "1-year service agreement (INR 1,00,000 prorated)",
    ppo_or_internship_conversion: true,
    acceptance_deadline: "2026-10-12",
    document_checklist: [
      { document_id: "DOC-IDENTITY", label: "Government photo ID", required: true, status: "VERIFIED" },
      { document_id: "DOC-TRANSCRIPT", label: "Final semester transcript", required: true, status: "SUBMITTED" },
      { document_id: "DOC-DEGREE", label: "Degree certificate", required: true, status: "PENDING" },
    ],
    status: "OFFER_RECEIVED",
    status_history: [],
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    ...overrides,
  };
}

describe("In-App Lifecycle Notifications Generator", () => {
  it("generates 'Offer acceptance deadline is tomorrow' notification when deadline is 1 day away", () => {
    const offer = buildSampleOffer({
      status: "OFFER_RECEIVED",
      acceptance_deadline: "2026-10-12",
    });

    const now = new Date("2026-10-11T10:00:00Z");
    const notifs = generateNotifications([offer], now);

    const deadlineNotif = notifs.find((n) => n.title === "Offer acceptance deadline is tomorrow");
    assert.ok(deadlineNotif, "Should generate 'Offer acceptance deadline is tomorrow'");
    assert.strictEqual(deadlineNotif?.offer_id, "OFFER-ACME-ST001");
    assert.strictEqual(deadlineNotif?.type, "warning");
    assert.strictEqual(deadlineNotif?.category, "DEADLINE");
  });

  it("generates 'Document verification pending' notification for submitted documents waiting for verification", () => {
    const offer = buildSampleOffer({
      status: "DOCS_PENDING",
      document_checklist: [
        { document_id: "d1", label: "ID Proof", required: true, status: "VERIFIED" },
        { document_id: "d2", label: "Degree Certificate", required: true, status: "SUBMITTED" },
      ],
    });

    const now = new Date("2026-10-11T10:00:00Z");
    const notifs = generateNotifications([offer], now);

    const docsNotif = notifs.find((n) => n.title === "Document verification pending");
    assert.ok(docsNotif, "Should generate 'Document verification pending'");
    assert.strictEqual(docsNotif?.type, "action_required");
    assert.strictEqual(docsNotif?.category, "DOCUMENT");
  });

  it("generates 'Joining date updated' notification when offer is in JOINING_SCHEDULED state", () => {
    const offer = buildSampleOffer({
      status: "JOINING_SCHEDULED",
      joining_date: "2027-07-01",
      status_history: [
        {
          from: "DOCS_VERIFIED",
          to: "JOINING_SCHEDULED",
          timestamp: "2026-10-10T12:00:00Z",
          actor: "PLACEMENT_CELL",
        },
      ],
    });

    const now = new Date("2026-10-11T10:00:00Z");
    const notifs = generateNotifications([offer], now);

    const joiningNotif = notifs.find((n) => n.title === "Joining date updated");
    assert.ok(joiningNotif, "Should generate 'Joining date updated'");
    assert.strictEqual(joiningNotif?.category, "JOINING");
    assert.ok(joiningNotif?.message.includes("2027-07-01"));
  });

  it("is a pure function that does not mutate input offers or produce side effects", () => {
    const offer = buildSampleOffer({ status: "OFFER_RECEIVED" });
    const originalJson = JSON.stringify(offer);

    const notifs1 = generateNotifications([offer], new Date("2026-10-11T00:00:00Z"));
    const notifs2 = generateNotifications([offer], new Date("2026-10-11T00:00:00Z"));

    assert.strictEqual(JSON.stringify(offer), originalJson, "Offer object should not be mutated");
    assert.deepStrictEqual(notifs1, notifs2, "Subsequent calls with identical inputs should produce identical notifications");
  });

  it("handles empty offers array gracefully", () => {
    const notifs = generateNotifications([]);
    assert.deepStrictEqual(notifs, []);
  });
});
