"use client";

import React, { useState } from "react";
import type { OfferRecord, OfferDocument, LifecycleState } from "../types";
import { LifecycleTimeline } from "./lifecycle-timeline";
import { STATE_METADATA } from "../state-machine";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  FileUp,
  HelpCircle,
  IndianRupee,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/format-date";

interface StudentOfferDetailProps {
  offer: OfferRecord;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string, reason: string) => void;
  onDefer: (offerId: string, reason: string) => void;
  onSubmitDocument: (offerId: string, documentId: string, fileName: string) => void;
  onBackToList?: () => void;
}

export function StudentOfferDetail({
  offer,
  onAccept,
  onReject,
  onDefer,
  onSubmitDocument,
  onBackToList,
}: StudentOfferDetailProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [deferModalOpen, setDeferModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deferReason, setDeferReason] = useState("");
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const meta = STATE_METADATA[offer.status];
  const canDecide =
    offer.status === "OFFER_RECEIVED" ||
    offer.status === "UNDER_REVIEW" ||
    offer.status === "DEFERRED";

  // Calculate days to deadline
  const deadlineDate = new Date(offer.acceptance_deadline);
  const today = new Date();
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleSimulateUpload = (docId: string, label: string) => {
    setUploadingDocId(docId);
    setTimeout(() => {
      const sanitizedName = `${label.toLowerCase().replace(/[^a-z0-9]/g, "_")}_doc.pdf`;
      onSubmitDocument(offer.offer_id, docId, sanitizedName);
      setUploadingDocId(null);
    }, 600);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    onReject(offer.offer_id, rejectReason.trim());
    setRejectModalOpen(false);
    setRejectReason("");
  };

  const handleConfirmDefer = () => {
    if (!deferReason.trim()) return;
    onDefer(offer.offer_id, deferReason.trim());
    setDeferModalOpen(false);
    setDeferReason("");
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      {onBackToList && (
        <button
          onClick={onBackToList}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline transition-all"
        >
          ← Back to All Offers
        </button>
      )}

      {/* Offer Header Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-surface via-surface-raised to-surface p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 text-accent font-bold text-xl shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  {offer.company}
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}
                >
                  {meta.label}
                </span>
                {offer.ppo_or_internship_conversion && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" />
                    PPO Conversion
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-ink-muted mt-1">
                Role: <span className="text-ink font-semibold">{offer.role}</span> · Student ID:{" "}
                <span className="font-mono text-ink">{offer.student_id}</span>
                {offer.student_name && ` (${offer.student_name})`}
              </p>
            </div>
          </div>

          {/* Action Buttons for Student */}
          {canDecide && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onAccept(offer.offer_id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept Offer
              </button>
              <button
                onClick={() => setDeferModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 px-3.5 py-2.5 text-xs font-bold transition-all"
              >
                <Clock className="w-4 h-4" />
                Request Deferral
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-3.5 py-2.5 text-xs font-bold transition-all"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </div>
          )}
        </div>

        {/* Acceptance Deadline Warning Alert */}
        {canDecide && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Action Needed:</strong> Acceptance deadline is{" "}
                <span className="font-semibold underline">
                  {offer.acceptance_deadline}
                </span>{" "}
                ({diffDays <= 1 ? "Tomorrow!" : `${diffDays} days remaining`}).
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded">
              DECISION WINDOW ACTIVE
            </span>
          </div>
        )}
      </div>

      {/* Offer Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CTC Card */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-xs font-medium">Annual Compensation</span>
            <IndianRupee className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-black text-ink">{offer.ctc_lpa} LPA</p>
          <p className="text-[11px] text-ink-muted mt-1">Cost to Company (Fixed + Variable)</p>
        </div>

        {/* Joining Date Card */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-xs font-medium">Proposed Joining Date</span>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xl font-bold text-ink">{offer.joining_date}</p>
          <p className="text-[11px] text-ink-muted mt-1">Reporting at company headquarters</p>
        </div>

        {/* Bond Terms Card */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-xs font-medium">Service Agreement / Bond</span>
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xs font-semibold text-ink line-clamp-2 mt-1">
            {offer.bond_terms}
          </p>
          <p className="text-[10px] text-ink-muted mt-1">As stated in contract agreement</p>
        </div>

        {/* Offer Letter Reference Card */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-xs font-medium">Offer Letter Document</span>
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xs font-mono font-semibold text-ink truncate mt-1">
            {offer.offer_letter_reference}
          </p>
          <a
            href={`#download-${offer.offer_letter_reference}`}
            onClick={(e) => {
              e.preventDefault();
              alert(`Downloading official letter: ${offer.offer_letter_reference}`);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline mt-2"
          >
            <Download className="w-3 h-3" />
            Download PDF Letter
          </a>
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <LifecycleTimeline
        currentState={offer.status}
        statusHistory={offer.status_history}
      />

      {/* Document Checklist Section */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-accent" />
              Onboarding Document Verification Checklist
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Submit mandatory verification proofs for Placement Cell scrutiny and joining clearance.
            </p>
          </div>
          <div className="text-xs font-semibold text-ink-muted">
            {offer.document_checklist.filter((d) => d.status === "VERIFIED").length} of{" "}
            {offer.document_checklist.length} Verified
          </div>
        </div>

        {/* Document Checklist Items */}
        <div className="divide-y divide-border/60">
          {offer.document_checklist.map((doc) => (
            <div
              key={doc.document_id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {doc.status === "VERIFIED" ? (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : doc.status === "SUBMITTED" ? (
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-surface-raised border border-border text-ink-muted flex items-center justify-center">
                      <FileUp className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">{doc.label}</span>
                    {doc.required ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] text-ink-muted">Optional</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-ink-muted">
                    <span className="font-mono text-ink-faint">ID: {doc.document_id}</span>
                    {doc.file_name && (
                      <span>
                        · File: <strong className="text-ink">{doc.file_name}</strong>
                      </span>
                    )}
                    {doc.verified_at && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        · Verified on {formatDate(doc.verified_at)}
                      </span>
                    )}
                    {doc.submitted_at && !doc.verified_at && (
                      <span className="text-amber-600 dark:text-amber-400">
                        · Submitted on {formatDate(doc.submitted_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge & Upload Action */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                {doc.status === "VERIFIED" && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    VERIFIED
                  </span>
                )}

                {doc.status === "SUBMITTED" && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    UNDER VERIFICATION
                  </span>
                )}

                {doc.status === "PENDING" && (
                  <button
                    onClick={() => handleSimulateUpload(doc.document_id, doc.label)}
                    disabled={uploadingDocId === doc.document_id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover px-3 py-1.5 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {uploadingDocId === doc.document_id ? "Uploading..." : "Upload Document"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Decline Offer from {offer.company}
            </h3>
            <p className="text-xs text-ink-muted mt-1.5">
              Declining this offer is irreversible. Please provide a brief reason for the Placement Cell records.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Pursuing higher studies / Accepted another offer / Relocation constraints"
              rows={3}
              className="mt-3 w-full rounded-xl border border-border bg-surface-raised p-3 text-xs text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <div className="mt-4 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink-muted hover:bg-surface-raised"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defer Modal */}
      {deferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Request Deferral for {offer.company}
            </h3>
            <p className="text-xs text-ink-muted mt-1.5">
              Submit a formal request to defer your offer acceptance window. This requires approval from the Placement Cell.
            </p>

            <textarea
              value={deferReason}
              onChange={(e) => setDeferReason(e.target.value)}
              placeholder="e.g. Awaiting Semester 8 project presentation schedule / Competitive exam scheduled on Oct 25"
              rows={3}
              className="mt-3 w-full rounded-xl border border-border bg-surface-raised p-3 text-xs text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <div className="mt-4 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeferModalOpen(false)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink-muted hover:bg-surface-raised"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDefer}
                disabled={!deferReason.trim()}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Submit Deferral Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
