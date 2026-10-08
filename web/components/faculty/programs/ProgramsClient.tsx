"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TabStrip,
  stripPanelId,
  stripTabId,
  type TabStripItem,
} from "@/components/faculty/students/TabStrip";
import type { ProgramsWorkspace } from "@/lib/api/faculty-programs-meta";
import { AllProgramsTab } from "./AllProgramsTab";
import { PlanTab } from "./PlanTab";
import { ProgramsStatCards } from "./ProgramsStatCards";
import { RecommendedTab } from "./RecommendedTab";
import { useSavedPrograms } from "./useSavedPrograms";
import {
  DEFAULT_FILTERS,
  PROGRAMS_TAB_PREFIX,
  programsTabHref,
  type ProgramFilters,
  type ProgramsTab,
} from "./utils";

// The interactive part of /faculty/programs: stat cards, tabs and the three
// panels. Everything comes from one server-built workspace. The only browser
// state is this page's saved choices (read after mount) and the filters. No
// clock is read: the data's start times are week counts, not dates.

export function ProgramsClient({
  workspace,
  initialTab,
}: {
  workspace: ProgramsWorkspace;
  initialTab: ProgramsTab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<ProgramsTab>(initialTab);
  const [filters, setFilters] = useState<ProgramFilters>(DEFAULT_FILTERS);
  const { saved, setStatus } = useSavedPrograms();

  // A link to another ?tab= while the page is open re-renders the server page
  // with a new initialTab; follow it.
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // Keeps ?tab= in step so a reload or a shared link opens the same tab.
  const changeTab = useCallback(
    (next: ProgramsTab) => {
      setTab(next);
      router.replace(programsTabHref(next), { scroll: false });
    },
    [router],
  );

  const { rows, totals, totalPostings } = workspace;
  const count = (status: "shortlisted" | "applied") =>
    saved === null
      ? null
      : rows.filter((r) => saved[r.id]?.status === status).length;
  const shortlisted = count("shortlisted");
  const applied = count("applied");

  const tabs: TabStripItem<ProgramsTab>[] = [
    { id: "recommended", label: "Recommended" },
    { id: "all", label: "All programmes", count: String(rows.length) },
    {
      id: "plan",
      label: "My plan",
      count:
        shortlisted === null || applied === null
          ? "…"
          : String(shortlisted + applied),
    },
  ];

  return (
    <>
      <ProgramsStatCards
        totals={totals}
        shortlisted={shortlisted}
        applied={applied}
        onOpenSoonest={() => {
          setFilters((f) => ({ ...f, sort: "soonest" }));
          changeTab("all");
        }}
        onOpenPlan={() => changeTab("plan")}
      />

      <TabStrip
        tabs={tabs}
        active={tab}
        onChange={changeTab}
        idPrefix={PROGRAMS_TAB_PREFIX}
        label="Programme sections"
      />

      <div
        role="tabpanel"
        id={stripPanelId(PROGRAMS_TAB_PREFIX, tab)}
        aria-labelledby={stripTabId(PROGRAMS_TAB_PREFIX, tab)}
      >
        {tab === "recommended" && (
          <RecommendedTab
            rows={rows}
            saved={saved}
            onStatus={setStatus}
            totalPostings={totalPostings}
          />
        )}
        {tab === "all" && (
          <AllProgramsTab
            rows={rows}
            saved={saved}
            onStatus={setStatus}
            totalPostings={totalPostings}
            filters={filters}
            onFilters={setFilters}
          />
        )}
        {tab === "plan" && (
          <PlanTab
            rows={rows}
            saved={saved}
            onStatus={setStatus}
            totalPostings={totalPostings}
          />
        )}
      </div>
    </>
  );
}
