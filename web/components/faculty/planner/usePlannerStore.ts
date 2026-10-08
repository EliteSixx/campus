"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DELIVERED_KEY,
  generatePlanFromSyllabus,
  mergeDeliveredKeys,
  scheduleLectures,
  setLectureStatus,
  updateLecture,
  withUpdatedAt,
  type PlannerCalendar,
  type PlannerSubjectWorkspace,
  type StoredPlans,
  type SubjectPlan,
} from "@/lib/api/lecture-planner-meta";
import {
  deliveredDateFor,
  readOldNotes,
  readStoredPlans,
  readStringArray,
  todayISOInKolkata,
  writeStoredPlans,
  writeStringArray,
} from "./utils";

// The browser-side store for lecture plans.
//
// Storage and the clock are read after mount only. Until `loaded` is true the
// plans are empty and todayISO is null, and the UI shows a neutral skeleton,
// so the server HTML and the first client render always match.
//
// Every save also rewrites that subject's keys in theplug-planner-delivered,
// in the same `${subjectId}:${topicId}` format the dashboard reads.

export function usePlannerStore() {
  const [plans, setPlans] = useState<StoredPlans>({});
  const [deliveredKeys, setDeliveredKeys] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [todayISO, setTodayISO] = useState<string | null>(null);

  // Mirrors of state for use inside handlers, so a save always builds on the
  // latest plans and never runs before storage has been read.
  const plansRef = useRef<StoredPlans>({});
  const loadedRef = useRef(false);

  useEffect(() => {
    const stored = readStoredPlans();
    plansRef.current = stored;
    setPlans(stored);
    setDeliveredKeys(readStringArray(DELIVERED_KEY));
    loadedRef.current = true;
    setLoaded(true);
  }, []);

  // Today in India, refreshed every minute so a page left open past midnight
  // moves on to the next day.
  useEffect(() => {
    const tick = () => setTodayISO(todayISOInKolkata(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const savePlan = useCallback((plan: SubjectPlan) => {
    if (!loadedRef.current) return;

    const stamped = withUpdatedAt(plan, new Date().toISOString());
    const next: StoredPlans = { ...plansRef.current, [stamped.subjectId]: stamped };
    plansRef.current = next;
    setPlans(next);
    writeStoredPlans(next);

    // Only this subject's delivered keys are replaced.
    const keys = mergeDeliveredKeys(readStringArray(DELIVERED_KEY), stamped);
    writeStringArray(DELIVERED_KEY, keys);
    setDeliveredKeys(keys);
  }, []);

  // A fresh plan from the syllabus, carrying over what the old planner board
  // recorded: topics ticked as delivered, and each topic's notes.
  const generatePlan = useCallback(
    (subject: PlannerSubjectWorkspace, calendar: PlannerCalendar) => {
      let plan = generatePlanFromSyllabus(subject, calendar);
      const schedule = scheduleLectures(plan, calendar);
      const delivered = new Set(readStringArray(DELIVERED_KEY));
      const notes = readOldNotes();
      const today = todayISOInKolkata(new Date());
      const notedTopics = new Set<string>();

      for (const lecture of plan.lectures) {
        const key = lecture.topicKey;
        if (key === null) continue;

        if (delivered.has(key)) {
          plan = setLectureStatus(
            plan,
            lecture.id,
            "delivered",
            deliveredDateFor(schedule[lecture.id] ?? null, today),
          );
        }

        // Notes go on the first lecture of the topic only.
        if (!notedTopics.has(key)) {
          notedTopics.add(key);
          const note = notes[key];
          if (note !== undefined && note.trim() !== "") {
            plan = updateLecture(plan, lecture.id, { notes: note });
          }
        }
      }

      savePlan(plan);
    },
    [savePlan],
  );

  // "Reset to syllabus": a fresh plan with no carry-over. Saving it also drops
  // this subject's delivered keys, since nothing in the new plan is delivered.
  const removePlan = useCallback(
    (subject: PlannerSubjectWorkspace, calendar: PlannerCalendar) => {
      savePlan(generatePlanFromSyllabus(subject, calendar));
    },
    [savePlan],
  );

  return {
    plans,
    deliveredKeys,
    loaded,
    todayISO,
    savePlan,
    generatePlan,
    removePlan,
  };
}
