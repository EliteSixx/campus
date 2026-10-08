"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  FileEdit,
  Megaphone,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MetricCard } from "@/components/shared/metric-card";
import type {
  AnnouncementStatus,
  AudienceType,
  Category,
} from "@/data/faculty-announcements";
import type { AudienceOptions } from "@/lib/api/faculty-announcements";
import { cn } from "@/lib/utils";
import { AnnouncementCard } from "./AnnouncementCard";
import { ComposeAnnouncement } from "./ComposeAnnouncement";
import {
  effectiveStatus,
  localToEntry,
  readLocalAnnouncements,
  sortEntries,
  writeLocalAnnouncements,
  type AnnouncementListEntry,
  type LocalAnnouncement,
} from "./utils";

type Tab = "all" | AnnouncementStatus;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "scheduled", label: "Scheduled" },
  { id: "draft", label: "Drafts" },
];

const CATEGORY_FILTERS: Category[] = [
  "exam",
  "assignment",
  "schedule",
  "event",
  "general",
];

const AUDIENCE_FILTERS: { value: AudienceType; label: string }[] = [
  { value: "class", label: "Class" },
  { value: "course", label: "Course" },
  { value: "department", label: "Department" },
  { value: "selected", label: "Selected students" },
  { value: "individual", label: "Individual student" },
];

const ALL = "all";

export function AnnouncementsClient({
  entries,
  options,
}: {
  entries: AnnouncementListEntry[];
  options: AudienceOptions;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [audienceType, setAudienceType] = useState<string>(ALL);
  const [composeOpen, setComposeOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [locals, setLocals] = useState<LocalAnnouncement[]>([]);

  // Both of these read something the server cannot know — the clock and this
  // browser's storage — so they run after mount only. Until then the stored
  // status is rendered as-is, which is what keeps hydration clean.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setLocals(readLocalAnnouncements());
  }, []);

  const nowISO = now ? now.toISOString() : null;

  const items = useMemo(
    () => sortEntries([...entries, ...locals.map(localToEntry)]),
    [entries, locals],
  );

  // Counted after the merge on purpose, so anything created in this browser is
  // included and a scheduled item whose time has passed counts as published.
  const summary = useMemo(() => {
    const statuses = items.map((item) =>
      effectiveStatus(item.announcement, nowISO),
    );
    const published = items.filter((_, i) => statuses[i] === "published");
    const readPercents = published.map((item) => item.readPercent);

    return {
      published: published.length,
      scheduled: statuses.filter((s) => s === "scheduled").length,
      drafts: statuses.filter((s) => s === "draft").length,
      averageReadPercent: readPercents.length
        ? Math.round(
            readPercents.reduce((sum, p) => sum + p, 0) / readPercents.length,
          )
        : 0,
    };
  }, [items, nowISO]);

  const tabCounts = useMemo(() => {
    const counts: Record<Tab, number> = {
      all: items.length,
      published: summary.published,
      scheduled: summary.scheduled,
      draft: summary.drafts,
    };
    return counts;
  }, [items.length, summary]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const status = effectiveStatus(item.announcement, nowISO);
      if (tab !== "all" && status !== tab) return false;
      if (category !== ALL && item.announcement.category !== category) {
        return false;
      }
      if (
        audienceType !== ALL &&
        item.announcement.audience.type !== audienceType
      ) {
        return false;
      }
      if (q === "") return true;
      return (
        item.announcement.title.toLowerCase().includes(q) ||
        item.announcement.body.toLowerCase().includes(q)
      );
    });
  }, [items, tab, category, audienceType, query, nowISO]);

  const filtersActive =
    query.trim() !== "" || category !== ALL || audienceType !== ALL;

  function handleSaved(item: LocalAnnouncement, message: string) {
    const next = [item, ...locals];
    setLocals(next);
    writeLocalAnnouncements(next);
    setFlash(message);
    setComposeOpen(false);
  }

  return (
    <>
      {/* The compose panel's open state lives here, so the button that opens
          it does too rather than in the server page above. */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold tracking-tight text-ink">
          All announcements
        </h3>
        <Button size="sm" onClick={() => setComposeOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New announcement
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Published"
          value={String(summary.published)}
          icon={Megaphone}
          tone="accent"
        />
        <MetricCard
          label="Scheduled"
          value={String(summary.scheduled)}
          icon={CalendarClock}
        />
        <MetricCard
          label="Drafts"
          value={String(summary.drafts)}
          icon={FileEdit}
        />
        <MetricCard
          label="Average read rate"
          value={`${summary.averageReadPercent}%`}
          icon={BarChart3}
          trend="Across published announcements"
        />
      </div>

      {flash && (
        <Card className="mt-4 flex items-center justify-between gap-3 border-success/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {flash}
          </p>
          <button
            type="button"
            onClick={() => setFlash(null)}
            aria-label="Dismiss message"
            className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Announcement status"
        className="mt-5 flex gap-1.5 overflow-x-auto border-b border-border pb-3 scrollbar-thin"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "font-mono text-[11px] tabular",
                  active ? "text-white/70" : "text-ink-faint",
                )}
              >
                {tabCounts[item.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mt-4 p-4">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <label htmlFor="announcement-search" className="sr-only">
              Search announcements
            </label>
            <Input
              id="announcement-search"
              placeholder="Search title or message..."
              className="pl-9 text-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor="announcement-category-filter" className="sr-only">
              Filter by category
            </label>
            <Select
              id="announcement-category-filter"
              className="text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value={ALL}>All categories</option>
              {CATEGORY_FILTERS.map((value) => (
                <option key={value} value={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <label htmlFor="announcement-audience-filter" className="sr-only">
              Filter by audience type
            </label>
            <Select
              id="announcement-audience-filter"
              className="text-xs"
              value={audienceType}
              onChange={(e) => setAudienceType(e.target.value)}
            >
              <option value={ALL}>All audiences</option>
              {AUDIENCE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!filtersActive}
            onClick={() => {
              setQuery("");
              setCategory(ALL);
              setAudienceType(ALL);
            }}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <Megaphone className="mx-auto h-6 w-6 text-ink-faint" />
          <p className="mt-2 text-sm font-semibold text-ink">
            No announcements match these filters
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Try a different search, category, audience or tab.
          </p>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((item) => (
            <AnnouncementCard
              key={item.announcement.id}
              entry={item}
              status={effectiveStatus(item.announcement, nowISO)}
            />
          ))}
        </div>
      )}

      {composeOpen && (
        <ComposeAnnouncement
          options={options}
          onClose={() => setComposeOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
