"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_OFFERS } from "@/features/offers/data/demo-offers";
import { transitionOffer, verifyChecklistCompleteness } from "@/features/offers/state-machine";
import type { OfferRecord } from "@/features/offers/types";

const STORAGE_KEY = "campuslink.offers.v1";

interface OffersStore {
  offers: OfferRecord[];
  error: string | null;
  clearError: () => void;
  reset: () => void;
  accept: (offerId: string) => void;
  reject: (offerId: string, reason: string) => void;
  defer: (offerId: string, reason: string) => void;
  submitDocument: (offerId: string, documentId: string, fileName: string) => void;
  verifyDocument: (offerId: string, documentId: string) => void;
  rejectDocument: (offerId: string, documentId: string, reason?: string) => void;
  transitionToDocsVerified: (offerId: string) => void;
  updateJoiningDate: (offerId: string, newDate: string, notes?: string) => void;
}

const OffersStoreContext = createContext<OffersStore | null>(null);

function isOfferList(value: unknown): value is OfferRecord[] {
  return Array.isArray(value) && value.every((item) =>
    item && typeof item === "object" &&
    typeof item.offer_id === "string" &&
    typeof item.student_id === "string" &&
    Array.isArray(item.document_checklist) &&
    Array.isArray(item.status_history)
  );
}

export function OffersStoreProvider({ children }: { children: ReactNode }) {
  // The deterministic seed is rendered on the server and on the first client pass.
  const [offers, setOffers] = useState<OfferRecord[]>(DEMO_OFFERS);
  const [storageReady, setStorageReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isOfferList(parsed)) setOffers(parsed);
      }
    } catch {
      // Keep the in-memory demo seed when storage is unavailable or malformed.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    } catch {
      // State remains usable for this tab when storage is unavailable or full.
    }
  }, [offers, storageReady]);

  useEffect(() => {
    const syncFromOtherTab = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === null) {
        setOffers(DEMO_OFFERS);
        return;
      }
      try {
        const parsed: unknown = JSON.parse(event.newValue);
        if (isOfferList(parsed)) setOffers(parsed);
      } catch {
        // Ignore malformed values from another tab and retain the current state.
      }
    };
    window.addEventListener("storage", syncFromOtherTab);
    return () => window.removeEventListener("storage", syncFromOtherTab);
  }, []);

  const replaceOffer = useCallback((offerId: string, transform: (offer: OfferRecord) => OfferRecord) => {
    const current = offers.find((offer) => offer.offer_id === offerId);
    if (!current) return;
    try {
      const updated = transform(current);
      setOffers((previous) => previous.map((offer) => offer.offer_id === offerId ? updated : offer));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The offer action could not be completed.");
    }
  }, [offers]);

  const accept = useCallback((offerId: string) => replaceOffer(offerId, (offer) => {
    const accepted = transitionOffer(offer, "ACCEPTED", {
      actor: "STUDENT",
      notes: "Offer accepted by the student.",
    });
    return transitionOffer(accepted, "DOCS_PENDING", {
      actor: "SYSTEM",
      notes: "Document checklist opened after acceptance.",
    });
  }), [replaceOffer]);

  const reject = useCallback((offerId: string, reason: string) => replaceOffer(offerId, (offer) =>
    transitionOffer(offer, "REJECTED", { actor: "STUDENT", reason, notes: `Decline recorded: ${reason}` })
  ), [replaceOffer]);

  const defer = useCallback((offerId: string, reason: string) => replaceOffer(offerId, (offer) =>
    transitionOffer(offer, "DEFERRED", { actor: "STUDENT", reason, notes: `Deferral requested: ${reason}` })
  ), [replaceOffer]);

  const submitDocument = useCallback((offerId: string, documentId: string, fileName: string) =>
    replaceOffer(offerId, (offer) => {
      const document = offer.document_checklist.find((item) => item.document_id === documentId);
      if (!document) throw new Error(`Document ${documentId} was not found on offer ${offerId}.`);
      const now = new Date().toISOString();
      const checklist = offer.document_checklist.map((item) => item.document_id === documentId
        ? { ...item, status: "SUBMITTED" as const, file_name: fileName, submitted_at: now }
        : item);
      verifyChecklistCompleteness(checklist);
      return { ...offer, document_checklist: checklist, updated_at: now };
    }), [replaceOffer]);

  const verifyDocument = useCallback((offerId: string, documentId: string) =>
    replaceOffer(offerId, (offer) => {
      const document = offer.document_checklist.find((item) => item.document_id === documentId);
      if (!document) throw new Error(`Document ${documentId} was not found on offer ${offerId}.`);
      const now = new Date().toISOString();
      const checklist = offer.document_checklist.map((item) => item.document_id === documentId
        ? { ...item, status: "VERIFIED" as const, verified_at: now }
        : item);
      verifyChecklistCompleteness(checklist);
      return { ...offer, document_checklist: checklist, updated_at: now };
    }), [replaceOffer]);

  const rejectDocument = useCallback((offerId: string, documentId: string, reason?: string) =>
    replaceOffer(offerId, (offer) => {
      const document = offer.document_checklist.find((item) => item.document_id === documentId);
      if (!document) throw new Error(`Document ${documentId} was not found on offer ${offerId}.`);
      const checklist = offer.document_checklist.map((item) => item.document_id === documentId
        ? { ...item, status: "PENDING" as const, notes: reason || "Document needs to be resubmitted." }
        : item);
      verifyChecklistCompleteness(checklist);
      return { ...offer, document_checklist: checklist, updated_at: new Date().toISOString() };
    }), [replaceOffer]);

  const transitionToDocsVerified = useCallback((offerId: string) => replaceOffer(offerId, (offer) =>
    transitionOffer(offer, "DOCS_VERIFIED", {
      actor: "PLACEMENT_CELL",
      notes: "Required documents verified by the Placement Cell.",
    })
  ), [replaceOffer]);

  const updateJoiningDate = useCallback((offerId: string, newDate: string, notes?: string) =>
    replaceOffer(offerId, (offer) => {
      const withDate = { ...offer, joining_date: newDate };
      if (offer.status === "DOCS_VERIFIED" || offer.status === "JOINING_SCHEDULED") {
        return transitionOffer(withDate, "JOINING_SCHEDULED", {
          actor: "PLACEMENT_CELL",
          notes: notes || `Joining date set to ${newDate}.`,
        });
      }
      return { ...withDate, updated_at: new Date().toISOString() };
    }), [replaceOffer]);

  const reset = useCallback(() => {
    setOffers(DEMO_OFFERS);
    setError(null);
  }, []);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<OffersStore>(() => ({
    offers, error, clearError, reset, accept, reject, defer, submitDocument,
    verifyDocument, rejectDocument, transitionToDocsVerified, updateJoiningDate,
  }), [offers, error, clearError, reset, accept, reject, defer, submitDocument, verifyDocument, rejectDocument, transitionToDocsVerified, updateJoiningDate]);

  return <OffersStoreContext.Provider value={value}>{children}</OffersStoreContext.Provider>;
}

export function useOffersStore(): OffersStore {
  const store = useContext(OffersStoreContext);
  if (!store) throw new Error("useOffersStore must be used inside OffersStoreProvider.");
  return store;
}

export function OffersStoreError() {
  const { error, clearError } = useOffersStore();
  if (!error) return null;
  return (
    <div role="alert" className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
      <span>{error}</span>
      <button type="button" onClick={clearError} className="shrink-0 font-semibold underline">Dismiss</button>
    </div>
  );
}
