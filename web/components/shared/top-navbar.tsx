"use client";

import { Menu, Moon, Sun, Bell, PanelLeftClose, PanelLeft, Mail, Edit3, Home, UserCircle, LogOut, Layers, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { RoleSwitcher } from "./role-switcher";
import { useRole } from "@/context/role-context";
import { useUserProfile } from "@/context/user-profile-context";
import { useTheme } from "@/context/theme-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { InAppNotifications } from "@/features/offers/components/in-app-notifications";
import { DEMO_OFFERS } from "@/features/offers/data/demo-offers";
import { generateNotifications } from "@/features/offers/notifications";
import type { NotificationItem } from "@/features/offers/types";

export function TopNavbar({
  title,
  onMenuClick,
  desktopSidebarCollapsed,
  onToggleDesktopSidebar,
}: {
  title: string;
  onMenuClick: () => void;
  desktopSidebarCollapsed?: boolean;
  onToggleDesktopSidebar?: () => void;
}) {
  const { mode, toggleMode } = useTheme();
  const dark = mode === "dark";
  const { role } = useRole();
  const { currentProfile } = useUserProfile();
  const router = useRouter();
  
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const avatarRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsBellOpen(false);
      }
    };
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAvatarOpen(false);
        setIsBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const getUserInitials = () => {
    if (currentProfile && currentProfile.name && currentProfile.name.trim()) {
      const parts = currentProfile.name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].substring(0, 2).toUpperCase();
    }
    const roleFallback: Record<string, string> = {
      student: "ST",
      faculty: "MN",
      institution: "IN",
      industry: "ID",
    };
    return roleFallback[role] || "US";
  };

  const notifications: NotificationItem[] = generateNotifications(DEMO_OFFERS, "2026-10-11T09:00:00Z").map((item) => ({
    ...item,
    read: item.read || readNotificationIds.has(item.id),
  }));
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const markNotificationRead = (notificationId: string) => {
    setReadNotificationIds((current) => new Set(current).add(notificationId));
  };
  const handleNotificationAction = (notification: NotificationItem) => {
    markNotificationRead(notification.id);
    setIsBellOpen(false);
    router.push(role === "institution" && notification.category === "DOCUMENT"
      ? "/offers/manage"
      : `/offers/${encodeURIComponent(notification.offer_id)}`);
  };

  return (
    <header className="glass-nav flex h-14 w-full items-center justify-between gap-3 px-4 border-b border-border/80 dark:border-white/10 select-none">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="text-ink-muted lg:hidden hover:text-ink p-1 rounded hover:bg-surface-raised transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand logo in frozen top row */}
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group shrink-0 select-none">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-md transition-transform group-hover:scale-105">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-bold tracking-tight text-ink flex items-center gap-1 leading-tight">
              CampusLink
              <Sparkles className="h-3 w-3 text-accent" />
            </span>
            <span className="text-[9px] text-ink-muted uppercase tracking-wider font-bold">
              Academia × Industry
            </span>
          </div>
        </Link>

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block shrink-0" />

        {/* Desktop sidebar toggle button */}
        {onToggleDesktopSidebar && (
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors shrink-0"
            title={desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar desktop"
          >
            {desktopSidebarCollapsed ? <PanelLeft className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4.5 w-4.5" />}
          </button>
        )}

        <h1 className="text-sm font-semibold text-ink truncate min-w-0">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2 relative">
        <RoleSwitcher compact />
        
        <button
          onClick={toggleMode}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-raised transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div ref={bellRef} className="relative">
          <button 
            onClick={() => { setIsBellOpen(!isBellOpen); setIsAvatarOpen(false); }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-raised transition-colors relative",
              isBellOpen && "bg-surface-raised text-ink"
            )}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            )}
          </button>

          {/* Lifecycle notification dropdown */}
          {isBellOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-[min(92vw,36rem)] max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
              <InAppNotifications
                notifications={notifications}
                onNotificationAction={handleNotificationAction}
                onMarkAsRead={markNotificationRead}
                onMarkAllAsRead={() => setReadNotificationIds(new Set(notifications.map((item) => item.id)))}
              />
            </div>
          )}
        </div>

        <div ref={avatarRef} className="relative">
          <button 
            onClick={() => { setIsAvatarOpen(!isAvatarOpen); setIsBellOpen(false); }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent border border-accent/20 transition-all hover:ring-2 hover:ring-accent/30",
              isAvatarOpen && "ring-2 ring-accent/50"
            )}
          >
            {getUserInitials()}
          </button>

          {/* Avatar Dropdown */}
          {isAvatarOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-surface shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              {/* Header block */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-surface-raised/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent text-sm font-extrabold border border-accent/30 shadow-sm shrink-0">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-ink line-clamp-1">
                    {currentProfile.name || "Brajesh Panigrahi"}
                  </span>
                  <span className="text-[10px] text-ink-muted font-medium line-clamp-1">
                    {currentProfile.email || "rockypanigrahi6@gmail.com"}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                <a 
                  href={`mailto:${currentProfile.email || "rockypanigrahi6@gmail.com"}`}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
                  onClick={() => setIsAvatarOpen(false)}
                >
                  <Mail className="h-3.5 w-3.5 text-ink-muted" />
                  Gmail
                </a>
                <Link 
                  href="/settings/account"
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
                  onClick={() => setIsAvatarOpen(false)}
                >
                  <Edit3 className="h-3.5 w-3.5 text-ink-muted" />
                  Edit Name
                </Link>
                <Link 
                  href={`/dashboard/${role}`}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
                  onClick={() => setIsAvatarOpen(false)}
                >
                  <Home className="h-3.5 w-3.5 text-ink-muted" />
                  Home
                </Link>
                <Link 
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink hover:bg-surface-raised transition-colors"
                  onClick={() => setIsAvatarOpen(false)}
                >
                  <UserCircle className="h-3.5 w-3.5 text-ink-muted" />
                  Profile
                </Link>
              </div>

              <div className="h-px bg-border/60 mx-1.5" />

              <div className="p-1.5">
                <button 
                  onClick={() => setIsAvatarOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-error/90 hover:bg-error-soft hover:text-error transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
