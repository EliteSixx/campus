"use client";

import { useEffect, useState } from "react";
import type { PredictionState } from "./at-risk-data";
import { formatNoteTime } from "./detail-utils";
import type { DemoMentor } from "./escalation-mentors";
import {
  createEscalation,
  parseStoredEscalations,
  resolveEscalation,
  type Escalation,
} from "./escalations";

// Escalations for the Mentor screen, kept in this browser only.
//
// Saved the way private notes are in StudentNotesCard: one JSON array under one
// localStorage key, re-read before every change so an escalation made in
// another tab is never lost. The notes key and parser live in
// lib/api/faculty-students-meta.ts, which is outside the Mentor folders, so the
// escalation key and parser stay in this folder instead. Storage is touched
// only in effects and event handlers, always inside try/catch.

export const ESCALATIONS_KEY = "theplug-student-escalations";

function readEscalations(): Escalation[] {
  try {
    const raw = localStorage.getItem(ESCALATIONS_KEY);
    if (!raw) return [];
    return parseStoredEscalations(JSON.parse(raw) as unknown);
  } catch (e) {
    console.error(`Failed to read ${ESCALATIONS_KEY} from localStorage`, e);
    return [];
  }
}

function writeEscalations(escalations: Escalation[]): boolean {
  try {
    localStorage.setItem(ESCALATIONS_KEY, JSON.stringify(escalations));
    return true;
  } catch (e) {
    console.error(`Failed to save ${ESCALATIONS_KEY} to localStorage`, e);
    return false;
  }
}

export interface ShownEscalation extends Escalation {
  // Formatted when the escalation is loaded or changed, so render builds no Date.
  createdWhen: string;
  resolvedWhen: string | null;
}

function toShown(escalation: Escalation): ShownEscalation {
  return {
    ...escalation,
    createdWhen: formatNoteTime(escalation.createdAt),
    resolvedWhen: escalation.resolvedAt ? formatNoteTime(escalation.resolvedAt) : null,
  };
}

export interface EscalationStore {
  escalations: ShownEscalation[];
  // False until storage has been read after mount.
  loaded: boolean;
  // Both return an error message, or null when the change was saved.
  escalate: (studentId: string, prediction: PredictionState, mentor: DemoMentor) => string | null;
  resolve: (id: string, note: string) => string | null;
}

export function useEscalations(): EscalationStore {
  const [escalations, setEscalations] = useState<ShownEscalation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEscalations(readEscalations().map(toShown));
    setLoaded(true);
  }, []);

  function escalate(studentId: string, prediction: PredictionState, mentor: DemoMentor) {
    // Clock read in an event handler, never during render.
    const now = new Date();
    const stored = readEscalations();
    const result = createEscalation(stored, {
      id: `esc-${now.getTime()}`,
      studentId,
      prediction,
      mentor,
      now: now.toISOString(),
    });
    if (!result.ok) {
      // Show what storage holds, e.g. an escalation made in another tab.
      setEscalations(stored.map(toShown));
      return result.error;
    }
    if (!writeEscalations(result.escalations)) {
      return "The escalation could not be saved in this browser.";
    }
    setEscalations(result.escalations.map(toShown));
    return null;
  }

  function resolve(id: string, note: string) {
    const stored = readEscalations();
    const result = resolveEscalation(stored, { id, note, now: new Date().toISOString() });
    if (!result.ok) {
      setEscalations(stored.map(toShown));
      return result.error;
    }
    if (!writeEscalations(result.escalations)) {
      return "The escalation could not be updated in this browser.";
    }
    setEscalations(result.escalations.map(toShown));
    return null;
  }

  return { escalations, loaded, escalate, resolve };
}
