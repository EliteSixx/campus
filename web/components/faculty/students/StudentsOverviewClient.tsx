"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentsWorkspace } from "@/lib/api/faculty-students-meta";
import { buildAttentionEntries } from "./attention";
import { NeedsAttentionTab } from "./NeedsAttentionTab";
import { RosterTab } from "./RosterTab";
import { SkillGapsTab } from "./SkillGapsTab";
import { StudentsStatCards } from "./StudentsStatCards";
import { StudentsTabs, type StudentsTabItem } from "./StudentsTabs";
import { TeachingImpactTab } from "./TeachingImpactTab";
import {
  formatLongISODate,
  isoDateInZone,
  panelId,
  studentsTabHref,
  tabId,
  type StudentsTab,
} from "./utils";

// The interactive part of /faculty/students: stat cards, tabs and the four
// panels. Everything comes from one server-built workspace.
//
// "Today" decides who needs attention. It is read from the clock in an effect
// only, as a calendar date in Asia/Kolkata, so the server render and the first
// client render agree. Until it is set, every attention number is a skeleton.

export function StudentsOverviewClient({
  workspace,
  initialTab,
}: {
  workspace: StudentsWorkspace;
  initialTab: StudentsTab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<StudentsTab>(initialTab);
  const [today, setToday] = useState<{ iso: string; label: string } | null>(
    null,
  );
  const todayISO = today?.iso ?? null;

  // The only clock read on this page. The label is formatted here too, so no
  // Date is built during render.
  useEffect(() => {
    const iso = isoDateInZone(new Date());
    setToday({ iso, label: formatLongISODate(iso) });
  }, []);

  // Keeps ?tab= in step so a reload or a shared link opens the same tab.
  const changeTab = useCallback(
    (next: StudentsTab) => {
      setTab(next);
      router.replace(studentsTabHref(next), { scroll: false });
    },
    [router],
  );

  const attention = useMemo(
    () =>
      todayISO === null
        ? null
        : buildAttentionEntries(workspace.students, todayISO),
    [workspace.students, todayISO],
  );

  const attentionIds = useMemo(
    () => (attention === null ? null : new Set(attention.map((e) => e.row.id))),
    [attention],
  );

  const tabs: StudentsTabItem[] = [
    {
      id: "attention",
      label: "Needs attention",
      count: attention === null ? "…" : String(attention.length),
    },
    { id: "impact", label: "Teaching impact" },
    { id: "gaps", label: "Skill gaps" },
    { id: "roster", label: "Roster", count: String(workspace.students.length) },
  ];

  return (
    <>
      <StudentsStatCards
        trackedStudents={workspace.trackedStudents}
        enrolledStudents={workspace.enrolledStudents}
        averageReadiness={workspace.averageReadiness}
        attentionCount={attention === null ? null : attention.length}
        weakestSkill={workspace.weakestSkills[0] ?? null}
        onSelectTab={changeTab}
      />

      <StudentsTabs tabs={tabs} active={tab} onChange={changeTab} />

      <div role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)}>
        {tab === "attention" && (
          <NeedsAttentionTab
            entries={attention}
            totalStudents={workspace.students.length}
            todayLabel={today?.label ?? null}
          />
        )}
        {tab === "impact" && <TeachingImpactTab rows={workspace.subjectImpact} />}
        {tab === "gaps" && <SkillGapsTab skills={workspace.weakestSkills} />}
        {tab === "roster" && (
          <RosterTab students={workspace.students} attentionIds={attentionIds} />
        )}
      </div>
    </>
  );
}
