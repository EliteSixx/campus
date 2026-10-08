"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  GraduationCap,
  Handshake,
  ChevronRight,
  CheckSquare,
  Square,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "alerts" | "partnerships" | "students";
  unread: boolean;
  linkHref?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "MoU Renewal Alert",
    message: "Corporate partnership MoU with Tata Consultancy Services expires in 45 days. Action required.",
    timestamp: "2 hours ago",
    category: "partnerships",
    unread: true,
    linkHref: "/dashboard/institution/partners",
  },
  {
    id: "notif-2",
    title: "Campus Drive Shortlist",
    message: "14 students from CSE & IT shortlisted by DataForge for the Summer 2026 Internship cohort.",
    timestamp: "4 hours ago",
    category: "students",
    unread: true,
    linkHref: "/dashboard/institution/students",
  },
  {
    id: "notif-3",
    title: "Critical Skill Deficit Flagged",
    message: "Cloud Computing gap across 2nd & 3rd year students exceeds 35% against corporate benchmarks.",
    timestamp: "1 day ago",
    category: "alerts",
    unread: true,
    linkHref: "/dashboard/institution/skills",
  },
  {
    id: "notif-4",
    title: "New Collaboration Proposed",
    message: "Siemens Digital Industries proposed an FDP program on Embedded Systems and IoT architecture.",
    timestamp: "2 days ago",
    category: "partnerships",
    unread: false,
    linkHref: "/dashboard/institution/partners",
  },
  {
    id: "notif-5",
    title: "Batch Assessment Completed",
    message: "Mechanical Engineering completed 95% of eligibility assessments for the 2026 graduating batch.",
    timestamp: "3 days ago",
    category: "students",
    unread: false,
    linkHref: "/dashboard/institution/departments/me",
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "alerts" | "partnerships" | "students">("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSelectMode(false);
        setSelectedIds(new Set());
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Mark single as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // Clear single message
  const clearSingleMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Clear all in current view
  const clearAllMessages = () => {
    if (filter === "all") {
      setNotifications([]);
    } else {
      setNotifications((prev) => prev.filter((n) => n.category !== filter));
    }
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  // Clear selected messages
  const clearSelectedMessages = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  // Toggle selection for an item
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select/Deselect all visible
  const toggleSelectAll = () => {
    const visibleIds = filtered.map((n) => n.id);
    const allSelected = visibleIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  };

  // Reset to initial mock notifications
  const restoreDefaultNotifications = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const filtered = notifications.filter(
    (n) => filter === "all" || n.category === filter
  );

  const getCategoryIcon = (cat: NotificationItem["category"]) => {
    switch (cat) {
      case "alerts":
        return <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />;
      case "partnerships":
        return <Handshake className="h-4 w-4 text-accent shrink-0" />;
      case "students":
        return <GraduationCap className="h-4 w-4 text-emerald-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-ink-muted transition-all hover:bg-surface-raised hover:text-ink",
          open && "border-accent text-accent ring-1 ring-accent/30"
        )}
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-surface">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-84 sm:w-96 rounded-2xl border border-border bg-surface p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  {/* Toggle multi-select mode */}
                  <button
                    onClick={() => {
                      setSelectMode(!selectMode);
                      setSelectedIds(new Set());
                    }}
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                      selectMode
                        ? "bg-accent text-white"
                        : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                    )}
                    title={selectMode ? "Exit selective mode" : "Select specific messages"}
                  >
                    {selectMode ? "Cancel" : "Select"}
                  </button>

                  {/* Clear All button */}
                  <button
                    onClick={clearAllMessages}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title={`Clear ${filter === "all" ? "all" : filter} notifications`}
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Selective Action Bar (Visible when selectMode is active) */}
          {selectMode && (
            <div className="mt-2.5 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold text-ink animate-in fade-in">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                {filtered.length > 0 && filtered.every((n) => selectedIds.has(n.id)) ? (
                  <CheckSquare className="h-4 w-4 text-accent" />
                ) : (
                  <Square className="h-4 w-4 text-ink-muted" />
                )}
                <span>Select All ({selectedIds.size}/{filtered.length})</span>
              </button>

              <button
                disabled={selectedIds.size === 0}
                onClick={clearSelectedMessages}
                className="flex items-center gap-1 rounded-lg bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Trash2 className="h-3 w-3" />
                Clear ({selectedIds.size})
              </button>
            </div>
          )}

          {/* Category Tabs */}
          <div className="mt-2.5 flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-1">
              {(["all", "alerts", "partnerships", "students"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilter(cat);
                    setSelectedIds(new Set());
                  }}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors",
                    filter === cat
                      ? "bg-accent text-white font-semibold"
                      : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {unreadCount > 0 && !selectMode && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-medium text-ink-muted hover:text-accent transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark read
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="mt-2 max-h-80 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-ink-faint/40 mb-2" />
                <p className="text-xs font-semibold text-ink">All notifications cleared!</p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  You are all caught up. No messages pending.
                </p>
                <button
                  onClick={restoreDefaultNotifications}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-raised transition-colors"
                >
                  <RotateCcw className="h-3 w-3 text-accent" />
                  Restore demo messages
                </button>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (selectMode) {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      } else {
                        markAsRead(item.id);
                      }
                    }}
                    className={cn(
                      "group relative flex items-start gap-2.5 rounded-xl p-2.5 transition-all text-left cursor-pointer",
                      selectMode && isSelected
                        ? "bg-accent/15 border border-accent/40"
                        : item.unread
                        ? "bg-accent-soft/30 hover:bg-accent-soft/50 border border-accent/20"
                        : "hover:bg-surface-raised/60 border border-border/40 bg-surface/50"
                    )}
                  >
                    {/* Checkbox in selectMode */}
                    {selectMode ? (
                      <button
                        onClick={(e) => toggleSelect(item.id, e)}
                        className="mt-0.5 text-accent"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4 text-ink-muted" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-0.5">{getCategoryIcon(item.category)}</div>
                    )}

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={cn(
                            "text-xs leading-tight truncate",
                            item.unread ? "font-bold text-ink" : "font-medium text-ink-muted"
                          )}
                        >
                          {item.title}
                        </p>
                        {item.unread && !selectMode && (
                          <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-ink-muted leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-faint">
                        <span>{item.timestamp}</span>
                        {item.linkHref && !selectMode && (
                          <Link
                            href={item.linkHref}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-0.5 text-accent font-semibold hover:underline"
                          >
                            View details
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Clear individual message button */}
                    {!selectMode && (
                      <button
                        onClick={(e) => clearSingleMessage(item.id, e)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-ink-faint hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Clear this message"
                        aria-label="Clear this notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer stats */}
          {notifications.length > 0 && (
            <div className="mt-3 border-t border-border/50 pt-2 flex items-center justify-between text-[10px] text-ink-faint">
              <span>{notifications.length} total notifications</span>
              <button
                onClick={clearAllMessages}
                className="text-rose-500 hover:underline font-semibold"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
