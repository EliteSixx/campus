"use client";

import React, { useState, useMemo } from "react";
import type { OfferRecord, LifecycleState, OfferDocument } from "../types";
import { STATE_METADATA } from "../state-machine";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ShieldCheck,
  FileCheck2,
  CalendarPlus,
  ArrowUpDown,
  AlertCircle,
  Eye,
  Check,
  X,
  FileText,
} from "lucide-react";

interface PlacementCellOffersTableProps {
  offers: OfferRecord[];
  onVerifyDocument: (offerId: string, documentId: string) => void;
  onRejectDocument: (offerId: string, documentId: string, reason?: string) => void;
  onTransitionToDocsVerified: (offerId: string) => void;
  onUpdateJoiningDate: (offerId: string, newDate: string, notes?: string) => void;
  onSelectOfferDetail?: (offer: OfferRecord) => void;
}

export function PlacementCellOffersTable({
  offers,
  onVerifyDocument,
  onRejectDocument,
  onTransitionToDocsVerified,
  onUpdateJoiningDate,
  onSelectOfferDetail,
}: PlacementCellOffersTableProps) {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [activeDocsOffer, setActiveDocsOffer] = useState<OfferRecord | null>(null);
  const [activeDateOffer, setActiveDateOffer] = useState<OfferRecord | null>(null);
  const [newJoiningDate, setNewJoiningDate] = useState<string>("");
  const [dateUpdateNotes, setDateUpdateNotes] = useState<string>("");

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesState =
        selectedStateFilter === "ALL" || offer.status === selectedStateFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        offer.company.toLowerCase().includes(q) ||
        offer.role.toLowerCase().includes(q) ||
        offer.student_id.toLowerCase().includes(q) ||
        (offer.student_name && offer.student_name.toLowerCase().includes(q)) ||
        offer.offer_id.toLowerCase().includes(q);

      return matchesState && matchesSearch;
    });
  }, [offers, selectedStateFilter, searchQuery]);

  // Quick stats
  const stats = useMemo(() => {
    return {
      total: offers.length,
      offersReceived: offers.filter((o) => o.status === "OFFER_RECEIVED").length,
      docsPending: offers.filter((o) => o.status === "DOCS_PENDING").length,
      docsVerified: offers.filter((o) => o.status === "DOCS_VERIFIED").length,
      joiningScheduled: offers.filter((o) => o.status === "JOINING_SCHEDULED").length,
      joined: offers.filter((o) => o.status === "JOINED").length,
    };
  }, [offers]);

  const openJoiningDateModal = (offer: OfferRecord) => {
    setActiveDateOffer(offer);
    setNewJoiningDate(offer.joining_date || "2027-07-01");
    setDateUpdateNotes("");
  };

  const handleSaveJoiningDate = () => {
    if (!activeDateOffer || !newJoiningDate) return;
    onUpdateJoiningDate(activeDateOffer.offer_id, newJoiningDate, dateUpdateNotes);
    setActiveDateOffer(null);
  };

  // Keep activeDocsOffer updated when offers change
  const currentDocsOffer = useMemo(() => {
    if (!activeDocsOffer) return null;
    return offers.find((o) => o.offer_id === activeDocsOffer.offer_id) || activeDocsOffer;
  }, [offers, activeDocsOffer]);

  return (
    <div className="space-y-6">
      {/* Placement Cell Overview Stats Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-surface via-surface-raised to-surface p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Placement Cell: Post-Selection Governance
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Verify candidate documents, monitor acceptance pipelines, and update official corporate joining schedules.
            </p>
          </div>
        </div>

        {/* Quick status counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
            <span className="text-[11px] text-ink-muted">Total Offers</span>
            <p className="text-lg font-bold text-ink">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-center">
            <span className="text-[11px] text-blue-600 dark:text-blue-400">Offer Received</span>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.offersReceived}</p>
          </div>
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 text-center">
            <span className="text-[11px] text-orange-600 dark:text-orange-400">Docs Pending</span>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{stats.docsPending}</p>
          </div>
          <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-center">
            <span className="text-[11px] text-teal-600 dark:text-teal-400">Docs Verified</span>
            <p className="text-lg font-bold text-teal-700 dark:text-teal-300">{stats.docsVerified}</p>
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-center">
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400">Joining Sched.</span>
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{stats.joiningScheduled}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Joined</span>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{stats.joined}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, student ID (ST001), or company..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-surface-raised text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
          />
        </div>

        {/* State Filter Dropdown & Pills */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-muted shrink-0" />
          <span className="text-xs font-semibold text-ink-muted shrink-0">State:</span>
          <select
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
            className="rounded-xl border border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-ink focus:border-accent focus:outline-none"
          >
            <option value="ALL">All States ({offers.length})</option>
            <option value="OFFER_RECEIVED">OFFER_RECEIVED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="DOCS_PENDING">DOCS_PENDING</option>
            <option value="DOCS_VERIFIED">DOCS_VERIFIED</option>
            <option value="JOINING_SCHEDULED">JOINING_SCHEDULED</option>
            <option value="JOINED">JOINED</option>
            <option value="DEFERRED">DEFERRED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="WITHDRAWN">WITHDRAWN</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised/70 border-b border-border text-ink-muted font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Company & Role</th>
                <th className="py-3.5 px-4">CTC (LPA)</th>
                <th className="py-3.5 px-4">Lifecycle State</th>
                <th className="py-3.5 px-4">Document Checklist</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-ink-muted">
                    No offers found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => {
                  const meta = STATE_METADATA[offer.status];
                  const verifiedCount = offer.document_checklist.filter(
                    (d) => d.status === "VERIFIED"
                  ).length;
                  const totalCount = offer.document_checklist.length;
                  const submittedCount = offer.document_checklist.filter(
                    (d) => d.status === "SUBMITTED"
                  ).length;
                  const allRequiredVerified = offer.document_checklist
                    .filter((d) => d.required)
                    .every((d) => d.status === "VERIFIED");

                  return (
                    <tr
                      key={offer.offer_id}
                      className="hover:bg-surface-raised/40 transition-colors"
                    >
                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-ink">
                          {offer.student_name || offer.student_id}
                        </div>
                        <div className="font-mono text-[10px] text-ink-muted">
                          {offer.student_id} · {offer.offer_id}
                        </div>
                      </td>

                      {/* Company & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-ink">{offer.company}</div>
                        <div className="text-[11px] text-ink-muted">{offer.role}</div>
                        {offer.ppo_or_internship_conversion && (
                          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                            PPO Conversion
                          </span>
                        )}
                      </td>

                      {/* CTC */}
                      <td className="py-3.5 px-4 font-extrabold text-ink">
                        {offer.ctc_lpa} LPA
                      </td>

                      {/* Lifecycle State */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      {/* Document Verification Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">
                            {verifiedCount}/{totalCount}
                          </span>
                          {submittedCount > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              {submittedCount} awaiting verification
                            </span>
                          )}
                          {verifiedCount === totalCount && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              Complete
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink">
                          {offer.joining_date || "Not Set"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Verify Docs Action */}
                          <button
                            onClick={() => setActiveDocsOffer(offer)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-[11px] font-bold text-ink shadow-2xs transition-all"
                            title="Inspect & Verify Checklist"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-accent" />
                            Verify Docs
                          </button>

                          {/* Update Joining Date Action */}
                          <button
                            onClick={() => openJoiningDateModal(offer)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-[11px] font-bold text-ink shadow-2xs transition-all"
                            title="Update Joining Date"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-accent" />
                            Update Date
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Verification Modal */}
      {currentDocsOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-accent" />
                  Document Verification: {currentDocsOffer.company}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Candidate:{" "}
                  <strong className="text-ink">
                    {currentDocsOffer.student_name || currentDocsOffer.student_id}
                  </strong>{" "}
                  ({currentDocsOffer.student_id}) · Role: {currentDocsOffer.role}
                </p>
              </div>
              <button
                onClick={() => setActiveDocsOffer(null)}
                className="p-1 rounded-lg text-ink-muted hover:bg-surface-raised"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist Items */}
            <div className="divide-y divide-border/60 my-4 max-h-96 overflow-y-auto pr-1">
              {currentDocsOffer.document_checklist.map((doc) => (
                <div
                  key={doc.document_id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
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
                    <div className="text-[11px] text-ink-muted mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-ink-faint">ID: {doc.document_id}</span>
                      {doc.file_name && (
                        <span>
                          · Submitted: <strong className="text-ink">{doc.file_name}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for this document */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {doc.status === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                        <Check className="w-3.5 h-3.5" />
                        VERIFIED
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            onVerifyDocument(currentDocsOffer.offer_id, doc.document_id)
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold shadow-xs transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Verified
                        </button>
                        {doc.status === "SUBMITTED" && (
                          <button
                            onClick={() =>
                              onRejectDocument(
                                currentDocsOffer.offer_id,
                                doc.document_id,
                                "Document incomplete or illegible"
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface hover:bg-rose-500/10 text-rose-600 px-2.5 py-1.5 text-xs font-semibold transition-all"
                          >
                            Reject
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Advance to DOCS_VERIFIED State if all required docs are verified */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-xs text-ink-muted">
                {currentDocsOffer.document_checklist
                  .filter((d) => d.required)
                  .every((d) => d.status === "VERIFIED") ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    All required documents verified!
                  </span>
                ) : (
                  "Pending verification of all mandatory documents."
                )}
              </span>

              <div className="flex items-center gap-2">
                {currentDocsOffer.status === "DOCS_PENDING" &&
                  currentDocsOffer.document_checklist
                    .filter((d) => d.required)
                    .every((d) => d.status === "VERIFIED") && (
                    <button
                      onClick={() => {
                        onTransitionToDocsVerified(currentDocsOffer.offer_id);
                        setActiveDocsOffer(null);
                      }}
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all"
                    >
                      Advance to DOCS_VERIFIED
                    </button>
                  )}
                <button
                  onClick={() => setActiveDocsOffer(null)}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink-muted hover:bg-surface-raised"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Joining Date Update Modal */}
      {activeDateOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Update Corporate Joining Date
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Company: <strong className="text-ink">{activeDateOffer.company}</strong> · Candidate:{" "}
              {activeDateOffer.student_name || activeDateOffer.student_id}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  New Official Joining Date (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  value={newJoiningDate}
                  onChange={(e) => setNewJoiningDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-raised p-2.5 text-xs text-ink font-mono focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Change Note / Remarks:
                </label>
                <input
                  type="text"
                  value={dateUpdateNotes}
                  onChange={(e) => setDateUpdateNotes(e.target.value)}
                  placeholder="e.g. Rescheduled as requested by Acme Tech HR"
                  className="w-full rounded-xl border border-border bg-surface-raised p-2.5 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setActiveDateOffer(null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink-muted hover:bg-surface-raised"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJoiningDate}
                disabled={!newJoiningDate}
                className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent-hover disabled:opacity-50"
              >
                Save & Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
