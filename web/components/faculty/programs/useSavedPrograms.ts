"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PROGRAMS_KEY,
  parseStoredPrograms,
  type ProgramStatus,
  type StoredPrograms,
} from "@/lib/api/faculty-programs-meta";

// This browser's shortlist, applications and hidden programmes, from
// localStorage "theplug-faculty-programs". null until read after mount, so
// anything that depends on it can show a skeleton instead of a wrong answer.

function readSaved(): StoredPrograms {
  try {
    const raw = localStorage.getItem(PROGRAMS_KEY);
    if (!raw) return {};
    return parseStoredPrograms(JSON.parse(raw) as unknown);
  } catch (e) {
    console.error(`Failed to read ${PROGRAMS_KEY} from localStorage`, e);
    return {};
  }
}

function writeSaved(saved: StoredPrograms): void {
  try {
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(saved));
  } catch (e) {
    console.error(`Failed to save ${PROGRAMS_KEY} to localStorage`, e);
  }
}

export function useSavedPrograms() {
  const [saved, setSaved] = useState<StoredPrograms | null>(null);

  useEffect(() => {
    setSaved(readSaved());
  }, []);

  // null clears the programme's status. Re-reads storage first so another tab's
  // changes are not overwritten.
  const setStatus = useCallback((id: string, status: ProgramStatus | null) => {
    const next = { ...readSaved() };
    if (status === null) {
      delete next[id];
    } else {
      next[id] = { status, savedAt: new Date().toISOString() };
    }
    writeSaved(next);
    setSaved(next);
  }, []);

  return { saved, setStatus };
}
