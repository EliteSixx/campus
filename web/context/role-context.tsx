"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfileProvider } from "./user-profile-context";

export type Role = "student" | "industry" | "institution" | "faculty";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");

  useEffect(() => {
    const stored = window.localStorage.getItem("skillsync-role") as Role | null;
    const validRoles: Role[] = ["student", "industry", "institution", "faculty"];
    if (stored && validRoles.includes(stored)) setRoleState(stored);
    else if (stored) window.localStorage.setItem("skillsync-role", "student");
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    window.localStorage.setItem("skillsync-role", r);
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <UserProfileProvider currentRole={role}>{children}</UserProfileProvider>
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
