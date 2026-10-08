"use client";

import { useRouter } from "next/navigation";
import { Download, ChevronDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeptSwitcherProps {
  currentDeptId: string;
  departments: { id: string; name: string; shortName: string }[];
}

export function DeptSwitcher({ currentDeptId, departments }: DeptSwitcherProps) {
  const router = useRouter();

  const handleExport = () => {
    const current = departments.find((d) => d.id === currentDeptId);
    const content = `DEPARTMENT SKILL & PLACEMENT DOSSIER\nDepartment: ${current?.name ?? currentDeptId} (${current?.shortName})\nGenerated: ${new Date().toLocaleDateString()}\nStatus: Official Institutional Record`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentDeptId}_department_dossier.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Department Jump Select */}
      <div className="relative inline-flex items-center">
        <select
          value={currentDeptId}
          onChange={(e) => router.push(`/dashboard/institution/departments/${e.target.value}`)}
          aria-label="Switch Department"
          className="h-9 appearance-none rounded-lg border border-border bg-surface pl-8 pr-8 text-xs font-semibold text-ink hover:bg-surface-raised focus:border-accent focus:outline-none transition-colors cursor-pointer"
        >
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.shortName} — {dept.name}
            </option>
          ))}
        </select>
        <Building2 className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-ink-muted" />
        <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-ink-muted" />
      </div>

      {/* Export Department Dossier Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="h-9 gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        Export Dossier
      </Button>
    </div>
  );
}
