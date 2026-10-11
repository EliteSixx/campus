"use client";

import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { StudentOfferList } from "@/features/offers/components/student-offer-list";
import type { OfferRecord } from "@/features/offers/types";
import { OffersStoreError, useOffersStore } from "./_state/offers-store";

export default function OffersPage() {
  const router = useRouter();
  const { offers, accept, defer } = useOffersStore();
  const studentOffers = offers.filter((offer) => offer.student_id === "ST001");

  const selectOffer = (offer: OfferRecord) => router.push(`/offers/${encodeURIComponent(offer.offer_id)}`);

  return (
    <DashboardShell title="My Offers">
      <OffersStoreError />
      <StudentOfferList
        offers={studentOffers}
        onSelectOffer={selectOffer}
        onAcceptOffer={accept}
        onDeferOffer={(offerId) => defer(offerId, "Requested a follow-up from the offers list.")}
      />
    </DashboardShell>
  );
}
