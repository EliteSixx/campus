"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/context/user-profile-context";
import {
  TabStrip,
  stripPanelId,
  stripTabId,
  type TabStripItem,
} from "@/components/faculty/students/TabStrip";
import { OverviewTab } from "./OverviewTab";
import { ProfileHeader } from "./ProfileHeader";
import { ProjectsTab, PublicationsTab } from "./ResearchTabs";
import { SettingsTab } from "./SettingsTab";
import { TeachingTab } from "./TeachingTab";
import {
  PROFILE_TAB_PREFIX,
  profileTabHref,
  type FacultyProfileView,
  type ProfileTab,
} from "./utils";

// The interactive part of /faculty/profile: the header and five tabs. All the
// numbers come from the server page as plain data; only the settings tab reads
// or writes anything in the browser. No clock is read on this page.

export function FacultyProfileClient({
  view,
  initialTab,
}: {
  view: FacultyProfileView;
  initialTab: ProfileTab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const { profiles } = useUserProfile();

  // A link to another ?tab= while this page is already open (the sidebar, for
  // one) re-renders the server page with a new initialTab; follow it.
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // Keeps ?tab= in step so a reload or a shared link opens the same tab.
  const changeTab = useCallback(
    (next: ProfileTab) => {
      setTab(next);
      router.replace(profileTabHref(next), { scroll: false });
    },
    [router],
  );

  // Always the faculty entry, whichever role is active. An empty saved value
  // means the faculty record's own name or email.
  const saved = profiles.faculty;
  const name = saved.name.trim() || view.record.name;
  const email = saved.email.trim() || view.record.email;

  const tabs: TabStripItem<ProfileTab>[] = [
    { id: "overview", label: "Overview" },
    { id: "teaching", label: "Teaching", count: String(view.subjects.length) },
    {
      id: "publications",
      label: "Publications",
      count: String(view.publications.length),
    },
    { id: "projects", label: "Projects", count: String(view.projects.length) },
    { id: "settings", label: "Account & settings" },
  ];

  return (
    <>
      <ProfileHeader record={view.record} name={name} email={email} />

      <TabStrip
        tabs={tabs}
        active={tab}
        onChange={changeTab}
        idPrefix={PROFILE_TAB_PREFIX}
        label="Profile sections"
      />

      <div
        role="tabpanel"
        id={stripPanelId(PROFILE_TAB_PREFIX, tab)}
        aria-labelledby={stripTabId(PROFILE_TAB_PREFIX, tab)}
      >
        {tab === "overview" && (
          <OverviewTab record={view.record} stats={view.stats} focus={view.focus} />
        )}
        {tab === "teaching" && (
          <TeachingTab
            record={view.record}
            subjects={view.subjects}
            hours={view.hours}
            weeklyTeachingHours={view.stats.weeklyTeachingHours}
            focus={view.focus}
          />
        )}
        {tab === "publications" && (
          <PublicationsTab
            publications={view.publications}
            totalCitations={view.totalCitations}
          />
        )}
        {tab === "projects" && <ProjectsTab projects={view.projects} />}
        {tab === "settings" && (
          <SettingsTab recordName={view.record.name} recordEmail={view.record.email} />
        )}
      </div>
    </>
  );
}
