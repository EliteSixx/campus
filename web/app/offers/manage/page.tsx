"use client";

import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { PlacementCellOffersTable } from "@/features/offers/components/placement-cell-offers-table";
import { OffersStoreError, useOffersStore } from "../_state/offers-store";

export default function ManageOffersPage() {
  const router = useRouter();
  const {
    offers,
    verifyDocument,
    rejectDocument,
    transitionToDocsVerified,
    updateJoiningDate,
    reset,
  } = useOffersStore();

  return (
    <DashboardShell title="Offers and Joining">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Review offers, verify onboarding documents, and update joining dates.</p>
        <button type="button" onClick={reset} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-raised">
          Reset demo data
        </button>
      </div>
      <OffersStoreError />
      <PlacementCellOffersTable
        offers={offers}
        onVerifyDocument={verifyDocument}
        onRejectDocument={rejectDocument}
        onTransitionToDocsVerified={transitionToDocsVerified}
        onUpdateJoiningDate={updateJoiningDate}
        onSelectOfferDetail={(offer) => router.push(`/offers/${encodeURIComponent(offer.offer_id)}`)}
      />
    </DashboardShell>
  );
}
