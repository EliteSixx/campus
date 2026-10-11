"use client";

/**
 * Student application tracker.
 *
 * Persists to localStorage until the applications API exists. All components
 * using `useApplications()` stay in sync within the tab (custom event) and
 * across tabs (storage event).
 */
import { useCallback, useEffect, useState } from "react";
import { CURRENT_STUDENT_ID } from "./current-student";

export const APPLICATION_STAGES = ["Applied", "Under Review", "Shortlisted", "Interview", "Offer"] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];
export type ApplicationStatus = ApplicationStage | "Rejected" | "Withdrawn";

export interface StudentApplication {
  opportunityId: string;
  status: ApplicationStatus;
  appliedOn: string; // ISO date
  history: { status: ApplicationStatus; date: string }[];
}

const STORAGE_KEY = `campuslink-applications-${CURRENT_STUDENT_ID}`;
const CHANGE_EVENT = "campuslink-applications-changed";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function seed(): StudentApplication[] {
  const make = (opportunityId: string, stages: ApplicationStatus[], startDaysAgo: number): StudentApplication => {
    const history = stages.map((status, i) => ({ status, date: isoDaysAgo(startDaysAgo - i * 4) }));
    return { opportunityId, status: stages[stages.length - 1], appliedOn: history[0].date, history };
  };
  return [
    make("o1", ["Applied", "Under Review", "Shortlisted", "Interview"], 20),
    make("o10", ["Applied", "Under Review", "Shortlisted"], 14),
    make("o6", ["Applied", "Under Review"], 8),
    make("o5", ["Applied"], 3),
    make("o4", ["Applied", "Under Review", "Rejected"], 25),
  ];
}

function read(): StudentApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StudentApplication[];
  } catch {
    // fall through to seed
  }
  return seed();
}

function write(apps: StudentApplication[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // storage unavailable: state still updates in memory for this page
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function isActiveApplication(app: StudentApplication) {
  return app.status !== "Withdrawn" && app.status !== "Rejected";
}

export function useApplications() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setApplications(read());
    sync();
    setHydrated(true);
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const getApplication = useCallback(
    (opportunityId: string) => applications.find((a) => a.opportunityId === opportunityId),
    [applications]
  );

  const apply = useCallback((opportunityId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const current = read().filter((a) => a.opportunityId !== opportunityId);
    const next: StudentApplication = {
      opportunityId,
      status: "Applied",
      appliedOn: today,
      history: [{ status: "Applied", date: today }],
    };
    write([next, ...current]);
  }, []);

  const withdraw = useCallback((opportunityId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    write(
      read().map((a) =>
        a.opportunityId === opportunityId
          ? { ...a, status: "Withdrawn" as const, history: [...a.history, { status: "Withdrawn" as const, date: today }] }
          : a
      )
    );
  }, []);

  return { applications, hydrated, getApplication, apply, withdraw };
}
