"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProgramMode, ProgramType } from "@/data/faculty-programs";
import {
  RANK_LABEL,
  rankPrograms,
  type ProgramRow,
  type ProgramStatus,
  type RankKey,
  type StoredPrograms,
} from "@/lib/api/faculty-programs-meta";
import { ProgramCard } from "./ProgramCard";
import {
  DEFAULT_FILTERS,
  MODES,
  TYPE_ORDER,
  type ProgramFilters,
} from "./utils";

// Every programme, hidden ones included, with search, filters and sorting. The
// filters live in the parent so they survive switching tabs.

export function AllProgramsTab({
  rows,
  saved,
  onStatus,
  totalPostings,
  filters,
  onFilters,
}: {
  rows: ProgramRow[];
  saved: StoredPrograms | null;
  onStatus: (id: string, status: ProgramStatus | null) => void;
  totalPostings: number;
  filters: ProgramFilters;
  onFilters: (next: ProgramFilters) => void;
}) {
  const ids = useId();
  const set = <K extends keyof ProgramFilters>(key: K, value: ProgramFilters[K]) =>
    onFilters({ ...filters, [key]: value });

  const presentTypes = TYPE_ORDER.filter((t) => rows.some((r) => r.type === t));
  const presentModes = MODES.filter((m) => rows.some((r) => r.mode === m));
  const costs = [...new Set(rows.map((r) => r.costText))].sort((a, b) =>
    a.localeCompare(b, "en"),
  );

  const needle = filters.query.trim().toLowerCase();
  const filtered = rankPrograms(
    rows.filter((row) => {
      if (filters.type !== "All" && row.type !== filters.type) return false;
      if (filters.mode !== "All" && row.mode !== filters.mode) return false;
      if (filters.cost !== "All" && row.costText !== filters.cost) return false;
      if (filters.gapsOnly && row.gaps.length === 0) return false;
      if (!needle) return true;
      return (
        row.title.toLowerCase().includes(needle) ||
        row.provider.toLowerCase().includes(needle) ||
        row.skillNames.some((n) => n.toLowerCase().includes(needle))
      );
    }),
    filters.sort,
  );

  // Sorting is not a filter, so it survives "Clear filters".
  const clear = () => onFilters({ ...DEFAULT_FILTERS, sort: filters.sort });

  return (
    <>
      <Card className="mt-6 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full min-w-0 sm:w-auto sm:flex-1">
            <label htmlFor={`${ids}-q`} className="sr-only">
              Search programmes
            </label>
            <Search
              className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted"
              aria-hidden="true"
            />
            <Input
              id={`${ids}-q`}
              type="search"
              placeholder="Search by title, provider or skill..."
              className="pl-9 text-xs"
              value={filters.query}
              onChange={(e) => set("query", e.target.value)}
            />
          </div>

          <div className="w-full sm:w-40">
            <label htmlFor={`${ids}-type`} className="sr-only">
              Type
            </label>
            <Select
              id={`${ids}-type`}
              className="text-xs"
              value={filters.type}
              onChange={(e) => set("type", e.target.value as "All" | ProgramType)}
            >
              <option value="All">All types</option>
              {presentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-36">
            <label htmlFor={`${ids}-mode`} className="sr-only">
              Mode
            </label>
            <Select
              id={`${ids}-mode`}
              className="text-xs"
              value={filters.mode}
              onChange={(e) => set("mode", e.target.value as "All" | ProgramMode)}
            >
              <option value="All">All modes</option>
              {presentModes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor={`${ids}-cost`} className="sr-only">
              Cost or sponsorship
            </label>
            <Select
              id={`${ids}-cost`}
              className="text-xs"
              value={filters.cost}
              onChange={(e) => set("cost", e.target.value)}
            >
              <option value="All">Any cost or sponsorship</option>
              {costs.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor={`${ids}-sort`} className="sr-only">
              Sort by
            </label>
            <Select
              id={`${ids}-sort`}
              className="text-xs"
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value as RankKey)}
            >
              {(Object.keys(RANK_LABEL) as RankKey[]).map((k) => (
                <option key={k} value={k}>
                  Sort: {RANK_LABEL[k]}
                </option>
              ))}
            </Select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-ink">
            <input
              type="checkbox"
              checked={filters.gapsOnly}
              onChange={(e) => set("gapsOnly", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            Only ones that close a gap
          </label>
        </div>
      </Card>

      <p className="sr-only" role="status">
        {filtered.length} of {rows.length} programmes shown
      </p>

      {filtered.length === 0 ? (
        <Card className="mt-4 flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-ink-muted">
            No programmes match these filters.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={clear}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="mt-4 space-y-4">
          {filtered.map((row) => (
            <ProgramCard
              key={row.id}
              row={row}
              status={saved === null ? undefined : saved[row.id]?.status ?? null}
              onStatus={onStatus}
              totalPostings={totalPostings}
            />
          ))}
        </div>
      )}
    </>
  );
}
