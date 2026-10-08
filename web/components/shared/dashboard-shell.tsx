"use client";

import { useState, ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopNavbar } from "./top-navbar";
import { useSidebar } from "@/context/sidebar-context";

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { desktopCollapsed, toggleDesktopCollapse } = useSidebar();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-canvas print:h-auto print:overflow-visible print:bg-white print:block print:min-h-0 print:p-0 print:m-0">
      {/* 1. FROZEN TOP NAVBAR */}
      <div className="shrink-0 z-40 relative print:hidden">
        <TopNavbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          desktopSidebarCollapsed={desktopCollapsed}
          onToggleDesktopSidebar={toggleDesktopCollapse}
        />
      </div>

      {/* 2. LOWER APP ROW: FIXED SIDEBAR + INDEPENDENT SCROLLABLE CONTENT */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden print:block print:w-full print:p-0 print:m-0">
        <div className="shrink-0 h-full print:hidden">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            desktopCollapsed={desktopCollapsed}
            onToggleDesktopCollapse={toggleDesktopCollapse}
          />
        </div>
        <main className="flex-1 min-h-0 h-full overflow-y-auto p-4 md:p-6 print:p-0 print:m-0 print:block print:w-full scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
