"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  computeDraftAnalysis,
  isDraftChanged,
  type InsightPosting,
  type InsightSkill,
  type InsightSubject,
  type ProgramMatch,
  type SubjectStudentImpact,
} from "@/lib/api/curriculum-insights-meta";
import type { AddPrefill } from "./AddDraftTopicForm";
import { DraftEditor } from "./DraftEditor";
import { IndustryDemandTab } from "./IndustryDemandTab";
import { MissingSkillsTab } from "./MissingSkillsTab";
import { StudentImpactTab } from "./StudentImpactTab";
import {
  panelId,
  SubjectDetailTabs,
  tabId,
  type DetailTabItem,
} from "./SubjectDetailTabs";
import { SubjectSummaryCards } from "./SubjectSummaryCards";
import { TopicsTab } from "./TopicsTab";
import { useDraftStore } from "./useDraftStore";
import {
  relatedPostingsFor,
  subjectHref,
  type DetailTab,
} from "./utils";

// Everything below the intro card on a subject's page: summary numbers, the
// tab strip and the active panel. Owns the revision draft so every tab sees
// the same one. The tab lives in the URL as ?tab=, so a link can open any tab.

export function SubjectDetailClient({
  subject,
  postings,
  skills,
  programs,
  studentImpact,
  totalPostings,
  initialTab,
  initialAddSkill,
}: {
  subject: InsightSubject;
  postings: InsightPosting[];
  skills: Record<string, InsightSkill>;
  programs: ProgramMatch[];
  studentImpact: SubjectStudentImpact | null;
  totalPostings: number;
  initialTab: DetailTab;
  // A known skill id from ?addSkill=, or null.
  initialAddSkill: string | null;
}) {
  const router = useRouter();
  const store = useDraftStore(subject);
  const [tab, setTab] = useState<DetailTab>(initialTab);
  // Taken from the URL once, only when the link opened the draft tab. The lazy
  // initialiser runs a single time, so later renders never re-apply it.
  const [addPrefill, setAddPrefill] = useState<AddPrefill | null>(() =>
    initialTab === "draft" && initialAddSkill !== null
      ? { skillId: initialAddSkill }
      : null,
  );

  const analysis = useMemo(
    () => computeDraftAnalysis(subject, store.draft, postings, skills),
    [subject, store.draft, postings, skills],
  );
  const related = useMemo(
    () => relatedPostingsFor(subject.industrySkillIds, postings),
    [subject.industrySkillIds, postings],
  );
  const changed = store.loaded && isDraftChanged(store.draft);

  // Keeps ?tab= in step and drops ?addSkill=, so a reload never re-prefills.
  const changeTab = useCallback(
    (next: DetailTab) => {
      setTab(next);
      router.replace(`${subjectHref(subject.id)}?tab=${next}`, { scroll: false });
    },
    [router, subject.id],
  );

  const onAddToDraft = useCallback(
    (skillId: string) => {
      setAddPrefill({ skillId });
      changeTab("draft");
    },
    [changeTab],
  );

  const onPrefillDone = useCallback(() => {
    setAddPrefill(null);
    if (tab === "draft") changeTab("draft");
  }, [changeTab, tab]);

  const tabs: DetailTabItem[] = [
    { id: "topics", label: "Topics", count: subject.topics.length },
    { id: "missing", label: "Missing skills", count: subject.missingSkillIds.length },
    { id: "demand", label: "Industry demand", count: related.length },
    { id: "students", label: "Student impact" },
    { id: "draft", label: "Revision draft", changed },
  ];

  return (
    <>
      <SubjectSummaryCards
        subject={subject}
        skills={skills}
        draftScoreAfter={changed ? analysis.scoreAfter : null}
      />

      <SubjectDetailTabs tabs={tabs} active={tab} onChange={changeTab} />

      <div role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)}>
        {tab === "topics" && (
          <TopicsTab
            subject={subject}
            totalPostings={totalPostings}
            draft={store.loaded ? store.draft : null}
          />
        )}
        {tab === "missing" && (
          <MissingSkillsTab
            subject={subject}
            skills={skills}
            postings={postings}
            programs={programs}
            totalPostings={totalPostings}
            coveredInDraft={store.loaded ? analysis.coveredAfter : []}
            onAddToDraft={onAddToDraft}
            onViewDraft={() => changeTab("draft")}
          />
        )}
        {tab === "demand" && (
          <IndustryDemandTab
            subject={subject}
            skills={skills}
            related={related}
            totalPostings={totalPostings}
          />
        )}
        {tab === "students" && (
          <StudentImpactTab impact={studentImpact} subjectCode={subject.code} />
        )}
        {tab === "draft" && (
          <DraftEditor
            subject={subject}
            skills={skills}
            postings={postings}
            totalPostings={totalPostings}
            store={store}
            analysis={analysis}
            prefill={addPrefill}
            onPrefillDone={onPrefillDone}
          />
        )}
      </div>
    </>
  );
}
