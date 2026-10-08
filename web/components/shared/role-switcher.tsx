"use client";

import { useRole, Role } from "@/context/role-context";
import { Select } from "@/components/ui/select";
import { FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";

const roles: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "industry", label: "Recruiter" },
  { value: "institution", label: "Placement Cell" },
  { value: "faculty", label: "Mentor" },
];

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const { role, setRole } = useRole();
  const router = useRouter();

  const handleChange = (value: string) => {
    const r = value as Role;
    setRole(r);
    router.push(`/dashboard/${r}`);
  };

  return (
    <div
      className={
        compact
          ? "w-36"
          : "flex items-center gap-2 rounded-md border border-dashed border-border bg-surface-raised px-2.5 py-1.5"
      }
    >
      {!compact && <FlaskConical className="h-3.5 w-3.5 shrink-0 text-ink-muted" />}
      {!compact && <span className="text-xs text-ink-muted whitespace-nowrap">Preview role</span>}
      <Select
        value={role}
        onChange={(e) => handleChange(e.target.value)}
        className="h-7 text-xs bg-surface border-border text-ink font-semibold"
      >
        {roles.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
