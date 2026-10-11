"use client";

import React, { useState } from "react";
import type { NotificationItem, NotificationCategory } from "../types";
import {
  Bell,
  Clock,
  AlertTriangle,
  FileCheck2,
  Calendar,
  CheckCircle2,
  CheckCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
} from "lucide-react";

interface InAppNotificationsProps {
  notifications: NotificationItem[];
  onNotificationAction?: (notification: NotificationItem) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

export function InAppNotifications({
  notifications,
  onNotificationAction,
  onMarkAsRead,
  onMarkAllAsRead,
}: InAppNotificationsProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const filteredNotifications = notifications.filter((item) => {
    if (unreadOnly && item.read) return false;
    if (activeTab === "ALL") return true;
    return item.category === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "DEADLINE":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "DOCUMENT":
        return <FileCheck2 className="w-4 h-4 text-orange-500" />;
      case "JOINING":
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case "STATUS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getSeverityBadge = (type: NotificationItem["type"]) => {
    switch (type) {
      case "action_required":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "info":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "success":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
              <Bell className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              In-App Notification Feed
              {unreadCount > 0 && (
                <span className="rounded-full bg-accent text-white px-2 py-0.2 text-[10px] font-bold">
                  {unreadCount} New
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Real-time lifecycle telemetry.{" "}
            <span className="font-semibold text-ink">In-app only; no email, SMS or WhatsApp.</span>
          </p>
        </div>

        {onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline disabled:opacity-40 self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "ALL"
                ? "bg-accent text-white shadow-xs"
                : "bg-surface-raised text-ink-muted hover:text-ink"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("DEADLINE")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "DEADLINE"
                ? "bg-accent text-white shadow-xs"
                : "bg-surface-raised text-ink-muted hover:text-ink"
            }`}
          >
            Deadlines
          </button>
          <button
            onClick={() => setActiveTab("DOCUMENT")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "DOCUMENT"
                ? "bg-accent text-white shadow-xs"
                : "bg-surface-raised text-ink-muted hover:text-ink"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("JOINING")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "JOINING"
                ? "bg-accent text-white shadow-xs"
                : "bg-surface-raised text-ink-muted hover:text-ink"
            }`}
          >
            Joining Dates
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-ink-muted font-medium select-none">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          Unread only
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-10 text-center text-ink-muted">
            <Bell className="w-8 h-8 mx-auto text-ink-faint mb-2" />
            <p className="text-xs font-semibold">No notifications in this view.</p>
            <p className="text-[11px] text-ink-faint">All lifecycle actions are currently up to date.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                notif.read
                  ? "border-border/60 bg-surface/60 opacity-80"
                  : "border-border bg-surface-raised shadow-xs ring-1 ring-accent/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getCategoryIcon(notif.category)}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-ink">{notif.title}</h4>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded border ${getSeverityBadge(
                        notif.type
                      )}`}
                    >
                      {notif.category}
                    </span>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-faint font-medium">
                    <span>Company: {notif.company}</span>
                    <span>·</span>
                    <span>Student: {notif.student_id}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {onMarkAsRead && !notif.read && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="text-[11px] text-ink-muted hover:text-ink px-2 py-1"
                  >
                    Dismiss
                  </button>
                )}
                {notif.action_label && onNotificationAction && (
                  <button
                    onClick={() => onNotificationAction(notif)}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent text-white hover:bg-accent-hover px-3 py-1.5 text-xs font-bold shadow-2xs transition-all"
                  >
                    {notif.action_label}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
