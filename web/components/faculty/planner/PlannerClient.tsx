"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Info, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  deleteLecture,
  getPlanProgress,
  insertLecture,
  makeCustomLecture,
  moveLecture,
  scheduleLectures,
  setLectureStatus,
  updateLecture,
  type LecturePatch,
  type LectureStatus,
  type PlannedLecture,
  type PlannerWorkspace,
  type SubjectPlan,
  type Weekday,
} from "@/lib/api/lecture-planner-meta";
import { usePlannerStore } from "./usePlannerStore";
import { deliveredDateFor, numberLectures } from "./utils";
import { PlanSetupCard } from "./PlanSetupCard";
import { GeneratePlanEmpty } from "./GeneratePlanEmpty";
import { PlanStatusBar } from "./PlanStatusBar";
import { DEFAULT_FILTERS, LectureList, type LectureFilters } from "./LectureList";
import type { LectureRowActions } from "./LectureRow";
import { LectureDetailPanel } from "./LectureDetailPanel";
import {
  AddLectureForm,
  AT_END,
  type AddLecturePrefill,
  type NewLectureFields,
} from "./AddLectureForm";
import { PlanProgressCard } from "./PlanProgressCard";
import { IndustryCheckCard } from "./IndustryCheckCard";
import { ViewToggle, type PlanView } from "./ViewToggle";
import { PlanCalendarView } from "./PlanCalendarView";
import { PrintablePlan } from "./PrintablePlan";

// The lecture plan editor. Holds the selected subject, the list filters and
// which panel is open; every change to a plan goes through the pure helpers in
// lib/api/lecture-planner-meta.ts and is then saved through the store.

type Panel =
  | { kind: "detail"; lectureId: string }
  // prefill is set when adding a lecture for a missing industry skill.
  | { kind: "add"; insertAfterId: string | null; prefill: AddLecturePrefill | null }
  | null;

const FLASH_MS = 4000;

// The Add Lecture prefill for a skill the syllabus does not teach. Used by the
// industry check card and by ?addSkill=.
function skillPrefill(skill: string): AddLecturePrefill {
  return {
    title: `Introduction to ${skill}`,
    type: "lecture",
    subtopic: "Industry skill — not in the current syllabus",
  };
}

function Skeleton() {
  return (
    <div className="mt-4 space-y-3" aria-hidden>
      <div className="h-28 animate-pulse rounded-xl bg-surface-raised" />
      <div className="h-64 animate-pulse rounded-xl bg-surface-raised" />
    </div>
  );
}

export function PlannerClient({
  workspace,
  initialSubjectId,
  initialAddSkillName = null,
}: {
  workspace: PlannerWorkspace;
  initialSubjectId: string | null;
  // Skill name from ?addSkill=, resolved on the server; null when absent.
  initialAddSkillName?: string | null;
}) {
  const router = useRouter();
  const { calendar, subjects } = workspace;
  const store = usePlannerStore();
  const { savePlan, todayISO } = store;

  const [subjectId, setSubjectId] = useState(initialSubjectId ?? subjects[0]?.id ?? "");
  const [filters, setFilters] = useState<LectureFilters>(DEFAULT_FILTERS);
  const [panel, setPanel] = useState<Panel>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [view, setView] = useState<PlanView>("list");
  // A lecture to add from ?addSkill=, waiting for storage to load and for the
  // subject to have a plan. Cleared once the panel opens or the subject changes.
  const [pendingSkillName, setPendingSkillName] = useState<string | null>(
    initialAddSkillName,
  );

  const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0] ?? null;
  const plan: SubjectPlan | null = subject ? (store.plans[subject.id] ?? null) : null;

  const schedule = useMemo(
    () => (plan ? scheduleLectures(plan, calendar) : {}),
    [plan, calendar],
  );
  const progress = useMemo(
    () => (plan ? getPlanProgress(plan, schedule, calendar, todayISO) : null),
    [plan, schedule, calendar, todayISO],
  );
  // The one lecture numbering. List, calendar, panels and print all read this
  // map, so "L12" means the same lecture everywhere.
  const numbers = useMemo(() => (plan ? numberLectures(plan) : {}), [plan]);

  // Planned lectures dated before today, for "Mark past lectures as delivered".
  const pastPlanned = useMemo(() => {
    if (!plan || todayISO === null) return [];
    return plan.lectures.filter((l) => {
      const date = schedule[l.id] ?? null;
      return l.status === "planned" && date !== null && date < todayISO;
    });
  }, [plan, schedule, todayISO]);

  const hasOldProgress = subject
    ? store.deliveredKeys.some((k) => k.startsWith(`${subject.id}:`))
    : false;

  // The success message clears itself.
  useEffect(() => {
    if (flash === null) return;
    const id = setTimeout(() => setFlash(null), FLASH_MS);
    return () => clearTimeout(id);
  }, [flash]);

  const closePanel = useCallback(() => setPanel(null), []);

  // Opens the pending ?addSkill= lecture once, as soon as there is a plan to
  // add it to (straight away, or after "Generate"). The URL loses addSkill so a
  // reload does not open it again.
  const pendingSubjectId = subject?.id ?? null;
  const hasPlan = plan !== null;
  useEffect(() => {
    if (pendingSkillName === null || !store.loaded || !hasPlan || pendingSubjectId === null) {
      return;
    }
    setPanel({ kind: "add", insertAfterId: null, prefill: skillPrefill(pendingSkillName) });
    setPendingSkillName(null);
    router.replace(`/faculty/planner?subject=${encodeURIComponent(pendingSubjectId)}`, {
      scroll: false,
    });
  }, [pendingSkillName, store.loaded, hasPlan, pendingSubjectId, router]);

  if (!subject) {
    return (
      <Card className="mt-6 p-6">
        <p className="text-sm text-ink-muted">No subjects are assigned to you yet.</p>
      </Card>
    );
  }

  const label = (lectureId: string) =>
    numbers[lectureId] !== undefined ? `L${numbers[lectureId]}` : "the cancelled lecture";

  // --- Subject and setup

  function changeSubject(next: string) {
    setSubjectId(next);
    setFilters(DEFAULT_FILTERS);
    setPanel(null);
    setFlash(null);
    // A lecture waiting for the previous subject is not carried over.
    setPendingSkillName(null);
    // Keeps the choice in the URL so a reload or a shared link opens it.
    router.replace(`/faculty/planner?subject=${encodeURIComponent(next)}`, {
      scroll: false,
    });
  }

  function saveDates(startDate: string, endDate: string, weekdays: Weekday[]) {
    if (!plan) return;
    savePlan({ ...plan, startDate, endDate, weekdays });
    setFlash("Dates saved. Lecture dates have been recalculated.");
  }

  function generate() {
    if (!subject) return;
    store.generatePlan(subject, calendar);
    setFlash(`Plan generated for ${subject.code}.`);
  }

  function reset() {
    if (!subject) return;
    if (!window.confirm(`This removes all your changes to ${subject.code}'s plan. Continue?`)) {
      return;
    }
    store.removePlan(subject, calendar);
    setFilters(DEFAULT_FILTERS);
    setPanel(null);
    setFlash(`${subject.code}'s plan was reset to the syllabus.`);
  }

  function markPast() {
    if (!plan || pastPlanned.length === 0) return;
    const n = pastPlanned.length;
    if (!window.confirm(`Mark ${n} past ${n === 1 ? "lecture" : "lectures"} as delivered?`)) {
      return;
    }
    let next = plan;
    for (const lecture of pastPlanned) {
      next = setLectureStatus(next, lecture.id, "delivered", schedule[lecture.id] ?? null);
    }
    savePlan(next);
    setFlash(`Marked ${n} ${n === 1 ? "lecture" : "lectures"} as delivered.`);
  }

  // --- Row actions

  const actions: LectureRowActions = {
    onToggleDelivered(lecture) {
      if (!plan || lecture.status === "cancelled") return;
      if (lecture.status === "delivered") {
        savePlan(setLectureStatus(plan, lecture.id, "planned", null));
        return;
      }
      const date = deliveredDateFor(schedule[lecture.id] ?? null, todayISO);
      savePlan(setLectureStatus(plan, lecture.id, "delivered", date));
    },
    onMove(lecture, direction) {
      if (!plan) return;
      const next = moveLecture(plan, lecture.id, direction);
      if (next !== plan) savePlan(next);
    },
    onEdit(lecture) {
      setPanel({ kind: "detail", lectureId: lecture.id });
    },
    onInsertAfter(lecture) {
      setPanel({ kind: "add", insertAfterId: lecture.id, prefill: null });
    },
    onToggleCancelled(lecture) {
      if (!plan) return;
      if (lecture.status === "cancelled") {
        savePlan(setLectureStatus(plan, lecture.id, "planned", null));
        return;
      }
      if (
        lecture.status === "delivered" &&
        !window.confirm(`"${lecture.title}" is marked delivered. Cancel it anyway?`)
      ) {
        return;
      }
      savePlan(setLectureStatus(plan, lecture.id, "cancelled", null));
    },
    onDelete(lecture) {
      if (!plan || !lecture.isCustom) return;
      if (!window.confirm(`Delete "${lecture.title}"? This cannot be undone.`)) return;
      savePlan(deleteLecture(plan, lecture.id));
      if (panel?.kind === "detail" && panel.lectureId === lecture.id) setPanel(null);
      setFlash(`Deleted "${lecture.title}".`);
    },
  };

  // --- Panels

  function saveDetail(
    lectureId: string,
    patch: LecturePatch,
    status: LectureStatus,
    actualDate: string | null,
  ) {
    if (!plan) return;
    const next = setLectureStatus(updateLecture(plan, lectureId, patch), lectureId, status, actualDate);
    savePlan(next);
    setPanel(null);
    setFlash(`Saved ${label(lectureId)}.`);
  }

  function addLecture(fields: NewLectureFields, position: string) {
    if (!plan || !subject) return;
    const lecture = makeCustomLecture(subject.id, Date.now(), fields);
    const last = plan.lectures[plan.lectures.length - 1];
    const afterId = position === AT_END ? (last?.id ?? null) : position;
    const next = insertLecture(plan, lecture, afterId);
    if (next === plan) return;
    savePlan(next);
    setPanel(null);
    setFlash(
      afterId === null
        ? `Added '${lecture.title}'.`
        : `Added '${lecture.title}' after ${label(afterId)}.`,
    );
  }

  function addForSkill(skill: string) {
    setPanel({ kind: "add", insertAfterId: null, prefill: skillPrefill(skill) });
  }

  function openLecture(lectureId: string) {
    setPanel({ kind: "detail", lectureId });
  }

  // Panels are closed first so an open overlay can never end up on paper;
  // the timeout lets that render commit before the print dialog blocks.
  function printPlan() {
    setPanel(null);
    setTimeout(() => window.print(), 0);
  }

  const detailLecture: PlannedLecture | null =
    panel?.kind === "detail" && plan
      ? (plan.lectures.find((l) => l.id === panel.lectureId) ?? null)
      : null;

  return (
    <>
      {/* Everything on screen. Hidden when printing; PrintablePlan below
          replaces it on paper. */}
      <div className="print:hidden">
        <PlanSetupCard
          subjects={subjects}
          subject={subject}
          calendar={calendar}
          plan={store.loaded ? plan : null}
          onSubjectChange={changeSubject}
          onSaveDates={saveDates}
        />

        {flash && (
          <p
            role="status"
            className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-xs font-medium text-success"
          >
            <CircleCheck className="h-4 w-4 shrink-0" />
            {flash}
          </p>
        )}

        {!store.loaded ? (
          <Skeleton />
        ) : !plan || !progress ? (
          <>
            {pendingSkillName !== null && (
              <p
                role="status"
                className="mt-4 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-xs font-medium text-accent"
              >
                <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                Generate a plan first — then the lecture for {pendingSkillName} will
                open to add.
              </p>
            )}
            <GeneratePlanEmpty
              subject={subject}
              calendar={calendar}
              hasOldProgress={hasOldProgress}
              onGenerate={generate}
            />
          </>
        ) : (
          <>
            <PlanStatusBar
              code={subject.code}
              progress={progress}
              todayKnown={todayISO !== null}
              pastPlannedCount={pastPlanned.length}
              onMarkPast={markPast}
              onAddLecture={() => setPanel({ kind: "add", insertAfterId: null, prefill: null })}
              onReset={reset}
            />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PlanProgressCard
                plan={plan}
                schedule={schedule}
                progress={progress}
                subject={subject}
              />
              <IndustryCheckCard plan={plan} subject={subject} onAddForSkill={addForSkill} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <ViewToggle view={view} onChange={setView} />
              <Button size="sm" variant="secondary" onClick={printPlan}>
                <Printer className="h-3.5 w-3.5" />
                Print plan
              </Button>
            </div>

            {view === "list" ? (
              <LectureList
                plan={plan}
                subject={subject}
                schedule={schedule}
                numbers={numbers}
                todayISO={todayISO}
                filters={filters}
                onFiltersChange={setFilters}
                actions={actions}
              />
            ) : (
              <PlanCalendarView
                key={plan.subjectId}
                plan={plan}
                schedule={schedule}
                calendar={calendar}
                todayISO={todayISO}
                numbers={numbers}
                overflowCount={progress.overflowCount}
                onOpenLecture={openLecture}
              />
            )}
          </>
        )}

        {plan && detailLecture && (
          <LectureDetailPanel
            key={detailLecture.id}
            lecture={detailLecture}
            number={numbers[detailLecture.id] ?? null}
            date={schedule[detailLecture.id] ?? null}
            subject={subject}
            todayISO={todayISO}
            onClose={closePanel}
            onSave={saveDetail}
            onDelete={actions.onDelete}
          />
        )}

        {plan && panel?.kind === "add" && (
          <AddLectureForm
            subject={subject}
            plan={plan}
            numbers={numbers}
            insertAfterId={panel.insertAfterId}
            prefill={panel.prefill ?? undefined}
            onClose={closePanel}
            onAdd={addLecture}
          />
        )}
      </div>

      {store.loaded && plan && progress && (
        <PrintablePlan
          plan={plan}
          schedule={schedule}
          progress={progress}
          subject={subject}
          calendar={calendar}
          faculty={workspace.faculty}
          numbers={numbers}
        />
      )}
    </>
  );
}
