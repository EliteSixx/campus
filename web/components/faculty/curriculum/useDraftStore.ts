"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDraft,
  DRAFTS_KEY,
  reconcileDraft,
  withDraftUpdatedAt,
  type CurriculumDraft,
  type InsightSubject,
  type StoredDrafts,
} from "@/lib/api/curriculum-insights-meta";
import { readStoredDrafts, writeStoredDrafts } from "./utils";

// One subject's syllabus revision draft, kept in localStorage under DRAFTS_KEY
// alongside every other subject's draft.
//
// The first render always uses a fresh draft so the server HTML and the first
// client render agree; the stored draft is read after mount. Nothing is ever
// written before that read, so a saved draft can't be overwritten by an empty
// one. The clock is read only inside save(), an event handler.

export interface DraftStore {
  draft: CurriculumDraft;
  loaded: boolean;
  // updatedAt of the stored draft, or null when nothing is saved.
  savedAt: string | null;
  save: (next: CurriculumDraft) => void;
  reset: () => void;
}

function storedFor(drafts: StoredDrafts, subjectId: string) {
  return Object.prototype.hasOwnProperty.call(drafts, subjectId)
    ? drafts[subjectId]
    : null;
}

export function useDraftStore(subject: InsightSubject): DraftStore {
  const [draft, setDraft] = useState<CurriculumDraft>(() =>
    createDraft(subject),
  );
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      const stored = storedFor(readStoredDrafts(), subject.id);
      if (stored) {
        const reconciled = reconcileDraft(subject, stored);
        setDraft(reconciled);
        setSavedAt(reconciled.updatedAt);
      } else {
        setDraft(createDraft(subject));
        setSavedAt(null);
      }
    };

    load();
    setLoaded(true);

    // Another tab saved or reset a draft. key is null when storage is cleared.
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === DRAFTS_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [subject]);

  const save = useCallback(
    (next: CurriculumDraft) => {
      if (!loaded) return;
      const stamped = withDraftUpdatedAt(next, new Date().toISOString());
      setDraft(stamped);
      // Re-read so drafts saved for other subjects (maybe in another tab) are
      // kept.
      const all = readStoredDrafts();
      all[subject.id] = stamped;
      writeStoredDrafts(all);
      setSavedAt(stamped.updatedAt);
    },
    [loaded, subject.id],
  );

  const reset = useCallback(() => {
    if (!loaded) return;
    const rest: StoredDrafts = {};
    for (const [id, stored] of Object.entries(readStoredDrafts())) {
      if (id !== subject.id) rest[id] = stored;
    }
    writeStoredDrafts(rest);
    setDraft(createDraft(subject));
    setSavedAt(null);
  }, [loaded, subject]);

  return { draft, loaded, savedAt, save, reset };
}
