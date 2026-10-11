"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle2,
  Radar,
  Target,
  Briefcase,
  ClipboardList,
  Sparkles,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Link2,
  Bell,
  PlusSquare,
  Users2,
  LucideIcon,
} from "lucide-react";
import { useRole } from "@/context/role-context";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  storageKey: string;
  badge?: string;
}

function AnimatedPanel({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div
      className="overflow-hidden transition-all duration-200 ease-in-out"
      style={{ maxHeight: isOpen ? `${height}px` : "0px" }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

function CollapsibleNavGroup({
  group,
  pathname,
  desktopCollapsed,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  desktopCollapsed: boolean;
  onNavigate: () => void;
}) {
  const hasActive = group.items.some(
    (item) =>
      pathname === item.href || pathname.startsWith(item.href + "/")
  );

  // Both server and initial client render start with false to guarantee identical hydration markup
  const [isOpen, setIsOpen] = useState(false);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    // Safely sync with localStorage or auto-open active group after hydration
    try {
      const saved = localStorage.getItem(group.storageKey);
      if (saved !== null) {
        setIsOpen(saved === "true");
      } else if (hasActive) {
        setIsOpen(true);
      }
    } catch {
      if (hasActive) setIsOpen(true);
    }
    isHydratedRef.current = true;
  }, [group.storageKey, hasActive]);

  useEffect(() => {
    // Only persist after initial hydration to prevent overwriting saved state
    if (isHydratedRef.current) {
      try {
        localStorage.setItem(group.storageKey, String(isOpen));
      } catch {
        // Safe fallback for restricted storage environments
      }
    }
  }, [isOpen, group.storageKey]);

  // Auto-expand when an item inside the group becomes active
  useEffect(() => {
    if (hasActive && isHydratedRef.current && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActive, isOpen]);

  const GroupIcon = group.icon;

  if (desktopCollapsed) {
    // In collapsed mode, just show individual icons
    return (
      <>
        {group.items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150",
                active
                  ? "bg-accent-soft text-accent border border-accent/30 shadow-sm"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink",
                "lg:justify-center lg:px-0"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-accent" : "text-ink-muted"
                )}
              />
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors duration-150",
          "text-ink-muted hover:bg-surface-raised hover:text-ink"
        )}
      >
        <GroupIcon className="h-4 w-4 shrink-0 text-accent" />
        <span className="flex-1 text-left">{group.label}</span>
        {group.badge && (
          <span className="inline-flex items-center justify-center rounded-full bg-warning-soft text-warning text-[9px] font-bold px-1.5 py-0.5 border border-warning/20">
            {group.badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatedPanel isOpen={isOpen}>
        <div className="ml-3 space-y-0.5 border-l border-border/50 pl-2">
          {group.items.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                  active
                    ? "bg-accent-soft text-accent border border-accent/30 shadow-sm"
                    : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    active ? "text-accent" : "text-ink-muted"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </AnimatedPanel>
    </div>
  );
}

export function Sidebar({
  open,
  onClose,
  desktopCollapsed = false,
  onToggleDesktopCollapse,
}: {
  open: boolean;
  onClose: () => void;
  desktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}) {
  const { role } = useRole();
  const pathname = usePathname();

  // Top-level nav items (always visible)
  const topNav: NavItem[] = [
    { label: "Dashboard", href: `/dashboard/${role}`, icon: LayoutDashboard },
  ];

  // Role-specific flat nav items
  const roleNav: NavItem[] = (() => {
    switch (role) {
      case "student":
        return [
          { label: "Skill Profile", href: "/profile/skills", icon: Radar },
          { label: "Resume", href: "/profile/resume", icon: FileText },
          { label: "Skill Analysis", href: "/skill-analysis", icon: Target },
          { label: "Career Intelligence", href: "/career-intelligence", icon: Sparkles },
          { label: "Opportunities", href: "/opportunities", icon: Briefcase },
          {
            label: "Applications",
            href: "/applications",
            icon: ClipboardList,
          },
        ];
      case "industry":
        return [
          { label: "Colleagues", href: "/dashboard/industry/colleagues", icon: Users2 },
          { label: "Add Jobs", href: "/dashboard/industry/post-job", icon: PlusSquare },
        ];
      default:
        return [];
    }
  })();

  // Collapsible groups
  const groups: NavGroup[] = [];

  // Common Settings Group
  groups.push({
    label: "Settings",
    icon: UserCircle2,
    storageKey: "sidebar-settings",
    items: [
      { label: "Account Details", href: "/settings/account", icon: UserCircle2 },
      { label: "Objectives", href: "/settings/objectives", icon: Target },
      { label: "Connected Platforms", href: "/settings/connections", icon: Link2 },
      { label: "Notification Preferences", href: "/settings/notifications", icon: Bell },
    ],
  });

  const renderLink = (item: NavItem) => {
    const active =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        title={desktopCollapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150",
          active
            ? "bg-accent-soft text-accent border border-accent/30 shadow-sm"
            : "text-ink-muted hover:bg-surface-raised hover:text-ink",
          desktopCollapsed && "lg:justify-center lg:px-0"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            active ? "text-accent" : "text-ink-muted"
          )}
        />
        {!desktopCollapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "glass-sidebar fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-border bg-surface shadow-lg backdrop-blur-2xl transition-all duration-300 dark:bg-slate-950/90 dark:border-white/10 lg:static lg:h-full lg:z-auto lg:translate-x-0 lg:shadow-none",
          desktopCollapsed ? "lg:w-16" : "lg:w-60",
          open
            ? "translate-x-0 w-60"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile drawer header (hidden on desktop since TopNavbar is frozen above sidebar) */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4 dark:border-white/10 lg:hidden shrink-0">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-md">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-ink flex items-center gap-1">
                CampusLink
                <Sparkles className="h-3 w-3 text-accent" />
              </span>
              <span className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">
                Placement Intelligence
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink rounded hover:bg-surface-raised transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {/* Top nav items */}
          {topNav.map(renderLink)}

          {/* Role-specific flat items */}
          {roleNav.map(renderLink)}

          {/* Collapsible groups */}
          {groups.length > 0 && (
            <>
              <div className="pt-2 pb-1">
                <div className="h-px bg-border/60" />
              </div>
              {groups.map((group) => (
                <CollapsibleNavGroup
                  key={group.storageKey}
                  group={group}
                  pathname={pathname}
                  desktopCollapsed={desktopCollapsed}
                  onNavigate={onClose}
                />
              ))}
            </>
          )}

          {/* Separator */}
          <div className="pt-2 pb-1">
            <div className="h-px bg-border/60" />
          </div>
        </nav>

        {!desktopCollapsed && (
          <div className="border-t border-border p-3 dark:border-white/10">
            <div className="rounded-xl bg-surface-raised p-3 text-xs border border-border">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <Layers className="h-3.5 w-3.5 text-accent" />
                CampusLink Platform
              </div>
              <p className="mt-1 text-[11px] text-ink-muted leading-snug font-medium">
                Academia × Industry verified intelligence & collaboration.
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
