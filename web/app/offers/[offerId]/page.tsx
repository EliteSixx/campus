"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { StudentOfferDetail } from "@/features/offers/components/student-offer-detail";
import { OffersStoreError, useOffersStore } from "../_state/offers-store";

export default function OfferDetailPage() {
  const params = useParams<{ offerId: string }>();
  const router = useRouter();
  const { offers, accept, reject, defer, submitDocument } = useOffersStore();
  const offer = offers.find((item) => item.offer_id === params.offerId);

  if (!offer) {
    return (
      <DashboardShell title="Offer not found">
        <p className="text-sm text-ink-muted">This demo offer does not exist.</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={`${offer.company} offer`}>
      <OffersStoreError />
      <StudentOfferDetail
        offer={offer}
        onAccept={accept}
        onReject={reject}
        onDefer={defer}
        onSubmitDocument={submitDocument}
        onBackToList={() => router.push("/offers")}
      />
    </DashboardShell>
  );
}
