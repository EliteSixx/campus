"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  desktopCollapsed: boolean;
  setDesktopCollapsed: (collapsed: boolean) => void;
  toggleDesktopCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  desktopCollapsed: false,
  setDesktopCollapsed: () => {},
  toggleDesktopCollapse: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("skillsync-sidebar-collapsed");
    if (stored === "true") {
      setDesktopCollapsed(true);
    }
  }, []);

  const toggleDesktopCollapse = () => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("skillsync-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        desktopCollapsed,
        setDesktopCollapsed,
        toggleDesktopCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
