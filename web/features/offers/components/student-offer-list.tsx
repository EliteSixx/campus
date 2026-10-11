"use client";

import React from "react";
import type { OfferRecord } from "../types";
import { STATE_METADATA } from "../state-machine";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  IndianRupee,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";

interface StudentOfferListProps {
  offers: OfferRecord[];
  onSelectOffer: (offer: OfferRecord) => void;
  onAcceptOffer: (offerId: string) => void;
  onDeferOffer: (offerId: string) => void;
}

export function StudentOfferList({
  offers,
  onSelectOffer,
  onAcceptOffer,
  onDeferOffer,
}: StudentOfferListProps) {
  const activeOffers = offers.filter(
    (o) => o.status !== "REJECTED" && o.status !== "WITHDRAWN"
  );

  return (
    <div className="space-y-6">
      {/* Top Student Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-gradient-to-r from-accent/10 via-surface to-surface p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
            My Job Offers & Placement Lifecycle
            <span className="rounded-full bg-accent/20 text-accent px-2.5 py-0.5 text-xs font-bold">
              {offers.length} {offers.length === 1 ? "Offer" : "Offers"}
            </span>
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Track official employment offers, submit onboarding documents, and confirm your joining schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-border bg-surface px-3.5 py-2 text-center shadow-xs">
            <span className="block text-[11px] font-medium text-ink-muted">Active Pipeline</span>
            <span className="text-base font-extrabold text-ink">{activeOffers.length}</span>
          </div>
        </div>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer) => {
          const meta = STATE_METADATA[offer.status];
          const verifiedDocs = offer.document_checklist.filter(
            (d) => d.status === "VERIFIED"
          ).length;
          const totalDocs = offer.document_checklist.length;
          const canAction =
            offer.status === "OFFER_RECEIVED" ||
            offer.status === "UNDER_REVIEW" ||
            offer.status === "DEFERRED";

          return (
            <div
              key={offer.offer_id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors">
                        {offer.company}
                      </h3>
                      <p className="text-xs font-semibold text-ink-muted">{offer.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.badgeClass}`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Offer Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-3.5">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-ink bg-surface-raised px-2.5 py-1 rounded-lg border border-border">
                    <IndianRupee className="w-3.5 h-3.5 text-accent" />
                    {offer.ctc_lpa} LPA
                  </span>

                  {offer.ppo_or_internship_conversion && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <Sparkles className="w-3 h-3" />
                      PPO Conversion
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted bg-surface-raised px-2.5 py-1 rounded-lg border border-border">
                    <Calendar className="w-3 h-3 text-ink-muted" />
                    Joining: {offer.joining_date}
                  </span>
                </div>

                {/* Document Progress Bar */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1.5">
                    <span className="flex items-center gap-1 font-medium">
                      <FileCheck2 className="w-3.5 h-3.5 text-accent" />
                      Documents Verification
                    </span>
                    <span className="font-bold text-ink">
                      {verifiedDocs} / {totalDocs} Verified
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{
                        width: `${totalDocs > 0 ? (verifiedDocs / totalDocs) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Deadline Notice */}
                {canAction && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Acceptance Deadline: {offer.acceptance_deadline}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectOffer(offer)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                >
                  View Details & Checklist
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {canAction && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeferOffer(offer.offer_id)}
                      className="px-2.5 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-500/10 rounded-lg transition-colors"
                    >
                      Defer
                    </button>
                    <button
                      onClick={() => onAcceptOffer(offer.offer_id)}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
