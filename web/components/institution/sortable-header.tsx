"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  className,
  align = "left",
}: {
  label: string;
  sortKey: string;
  currentSortKey: string | null;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  const isActive = currentSortKey === sortKey;
  const Icon = isActive
    ? currentDirection === "asc" ? ArrowUp : ArrowDown
    : ArrowUpDown;

  const alignment = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
  }[align];

  return (
    <th className={cn("px-3 py-2.5 text-left", className)}>
      <button
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors",
          isActive ? "text-accent" : "text-ink-muted hover:text-ink",
          alignment
        )}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

export function useSortState<T>(defaultKey: string | null = null) {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortFn = (data: T[], accessor: (item: T, key: string) => number | string) => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = accessor(a, sortKey);
      const bVal = accessor(b, sortKey);
      const cmp = typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  };

  return { sortKey, sortDir, handleSort, sortFn };
}

import { useState } from "react";
