"use client";

import React, { useState, useMemo } from "react";
import type { OfferRecord, NotificationItem } from "../types";
import { DEMO_OFFERS } from "../data/demo-offers";
import { transitionOffer } from "../state-machine";
import { generateNotifications } from "../notifications";
import { StudentOfferList } from "./student-offer-list";
import { StudentOfferDetail } from "./student-offer-detail";
import { PlacementCellOffersTable } from "./placement-cell-offers-table";
import { InAppNotifications } from "./in-app-notifications";
import {
  UserCheck,
  Building,
  Bell,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

export interface PostSelectionDashboardProps {
  initialOffers?: OfferRecord[];
  initialRole?: "STUDENT" | "PLACEMENT_CELL";
  studentId?: string;
  referenceNow?: Date | string;
}

export function PostSelectionDashboard({
  initialOffers = DEMO_OFFERS,
  initialRole = "STUDENT",
  studentId = "ST001",
  referenceNow = "2026-10-11T09:00:00Z", // Local demo reference time
}: PostSelectionDashboardProps) {
  // Live mutable offer records state
  const [offers, setOffers] = useState<OfferRecord[]>(initialOffers);
  const [currentRole, setCurrentRole] = useState<"STUDENT" | "PLACEMENT_CELL">(initialRole);
  const [activeTab, setActiveTab] = useState<"VIEW" | "NOTIFICATIONS">("VIEW");

  // Selected offer for student view detail (defaults to ST001)
  const defaultOffer = useMemo(() => {
    return offers.find((o) => o.student_id === studentId) || offers[0];
  }, [offers, studentId]);

  const [selectedStudentOfferId, setSelectedStudentOfferId] = useState<string>(
    defaultOffer ? defaultOffer.offer_id : "OFFER-ACME-ST001"
  );
  const [isDetailView, setIsDetailView] = useState<boolean>(true);

  // Read notification state
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  // Generate pure in-app notifications
  const rawNotifications = useMemo(() => {
    return generateNotifications(offers, referenceNow);
  }, [offers, referenceNow]);

  const notifications = useMemo(() => {
    return rawNotifications.map((n) => ({
      ...n,
      read: readNotifIds.has(n.id) || n.read,
    }));
  }, [rawNotifications, readNotifIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Active student offer
  const activeStudentOffer = useMemo(() => {
    return (
      offers.find((o) => o.offer_id === selectedStudentOfferId) ||
      offers.find((o) => o.student_id === studentId) ||
      offers[0]
    );
  }, [offers, selectedStudentOfferId, studentId]);

  // Student Actions
  const handleAcceptOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.offer_id !== offerId) return o;
        // Transition OFFER_RECEIVED -> ACCEPTED
        let updated = transitionOffer(o, "ACCEPTED", {
          actor: "STUDENT",
          notes: "Offer accepted by candidate in student portal",
        });
        // Then transition ACCEPTED -> DOCS_PENDING for document onboarding
        updated = transitionOffer(updated, "DOCS_PENDING", {
          actor: "SYSTEM",
          notes: "Initiated onboarding document verification checklist",
        });
        return updated;
      })
    );
  };

  const handleRejectOffer = (offerId: string, reason: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.offer_id !== offerId) return o;
        return transitionOffer(o, "REJECTED", {
          actor: "STUDENT",
          reason,
          notes: `Decline recorded: ${reason}`,
        });
      })
    );
  };

  const handleDeferOffer = (offerId: string, reason: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.offer_id !== offerId) return o;
        return transitionOffer(o, "DEFERRED", {
          actor: "STUDENT",
          reason,
          notes: `Deferral request registered: ${reason}`,
        });
      })
    );
  };

  const handleSubmitDocument = (
    offerId: string,
    documentId: string,
    fileName: string
  ) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.offer_id !== offerId) return o;
        return {
          ...o,
          document_checklist: o.document_checklist.map((doc) => {
            if (doc.document_id !== documentId) return doc;
            return {
              ...doc,
              status: "SUBMITTED",
              file_name: fileName,
              submitted_at: new Date().toISOString(),
            };
          }),
        };
      })
    );
  };

  // Placement Cell Actions
  const handleVerifyDocument = (offerId: string, documentId: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.offer_id !== offerId) return o;
        return {
          ...o,
          document_checklist: o.document_checklist.map((doc) => {
            if (doc.document_id !== documentId) return doc;
            return {
              ...doc,
              status: "VERIFIED",
              verified_at: new Date().toISOString(),
            };
          }),
        };
      })
    );
  };

  const handleRejectDocument = (
    offerId: string,
    documentId: string,
    reason?: string
  ) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.offer_id !== offerId) return o;
        return {
          ...o,
          document_checklist: o.document_checklist.map((doc) => {
            if (doc.document_id !== documentId) return doc;
            return {
              ...doc,
              status: "PENDING",
              notes: reason || "Document rejected during audit",
            };
          }),
        };
      })
    );
  };

  const handleTransitionToDocsVerified = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.offer_id !== offerId) return o;
        return transitionOffer(o, "DOCS_VERIFIED", {
          actor: "PLACEMENT_CELL",
          notes: "All mandatory credentials authenticated by Placement Officer",
        });
      })
    );
  };

  const handleUpdateJoiningDate = (
    offerId: string,
    newDate: string,
    notes?: string
  ) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.offer_id !== offerId) return o;
        let updated = { ...o, joining_date: newDate };
        // If state is DOCS_VERIFIED, move to JOINING_SCHEDULED
        if (updated.status === "DOCS_VERIFIED") {
          updated = transitionOffer(updated, "JOINING_SCHEDULED", {
            actor: "PLACEMENT_CELL",
            notes: notes || `Joining scheduled for ${newDate}`,
          });
        } else if (updated.status === "JOINING_SCHEDULED") {
          // Rescheduling
          updated = transitionOffer(updated, "JOINING_SCHEDULED", {
            actor: "PLACEMENT_CELL",
            notes: notes || `Joining date rescheduled to ${newDate}`,
          });
        }
        return updated;
      })
    );
  };

  // Notification Interactions
  const handleMarkAsRead = (id: string) => {
    setReadNotifIds((prev) => new Set([...Array.from(prev), id]));
  };

  const handleMarkAllAsRead = () => {
    setReadNotifIds(new Set(notifications.map((n) => n.id)));
  };

  const handleNotificationAction = (notification: NotificationItem) => {
    setSelectedStudentOfferId(notification.offer_id);
    setIsDetailView(true);
    setActiveTab("VIEW");
    if (notification.category === "DOCUMENT" && currentRole === "STUDENT") {
      // Keep on student view
    } else if (notification.category === "DOCUMENT") {
      setCurrentRole("PLACEMENT_CELL");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Application Bar & Role Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white font-bold shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-ink flex items-center gap-2">
              Post-Selection Lifecycle System
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                Brajesh Feature
              </span>
            </h1>
            <p className="text-xs text-ink-muted">
              Pure TypeScript State Machine · ST001 Acme Tech Example · In-App Notifications
            </p>
          </div>
        </div>

        {/* Role Toggle & Notification Bell */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Tab Button */}
          <button
            onClick={() => setActiveTab(activeTab === "VIEW" ? "NOTIFICATIONS" : "VIEW")}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              activeTab === "NOTIFICATIONS"
                ? "bg-accent text-white border-accent shadow-xs"
                : "bg-surface-raised border-border text-ink hover:border-accent/40"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="ml-1 rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px] font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Role Switcher */}
          <div className="flex items-center rounded-xl border border-border bg-surface-raised p-1 text-xs font-bold">
            <button
              onClick={() => {
                setCurrentRole("STUDENT");
                setActiveTab("VIEW");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentRole === "STUDENT" && activeTab === "VIEW"
                  ? "bg-surface text-accent shadow-2xs font-extrabold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Student View (ST001)
            </button>
            <button
              onClick={() => {
                setCurrentRole("PLACEMENT_CELL");
                setActiveTab("VIEW");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentRole === "PLACEMENT_CELL" && activeTab === "VIEW"
                  ? "bg-surface text-accent shadow-2xs font-extrabold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Placement Cell View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "NOTIFICATIONS" ? (
        <InAppNotifications
          notifications={notifications}
          onNotificationAction={handleNotificationAction}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      ) : currentRole === "STUDENT" ? (
        isDetailView && activeStudentOffer ? (
          <StudentOfferDetail
            offer={activeStudentOffer}
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
            onDefer={handleDeferOffer}
            onSubmitDocument={handleSubmitDocument}
            onBackToList={() => setIsDetailView(false)}
          />
        ) : (
          <StudentOfferList
            offers={offers.filter((o) => o.student_id === studentId)}
            onSelectOffer={(offer) => {
              setSelectedStudentOfferId(offer.offer_id);
              setIsDetailView(true);
            }}
            onAcceptOffer={handleAcceptOffer}
            onDeferOffer={(id) => handleDeferOffer(id, "Deferral requested")}
          />
        )
      ) : (
        <PlacementCellOffersTable
          offers={offers}
          onVerifyDocument={handleVerifyDocument}
          onRejectDocument={handleRejectDocument}
          onTransitionToDocsVerified={handleTransitionToDocsVerified}
          onUpdateJoiningDate={handleUpdateJoiningDate}
          onSelectOfferDetail={(offer) => {
            setSelectedStudentOfferId(offer.offer_id);
            setCurrentRole("STUDENT");
            setIsDetailView(true);
          }}
        />
      )}
    </div>
  );
}
