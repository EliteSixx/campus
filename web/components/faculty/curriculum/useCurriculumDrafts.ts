"use client";

import { useEffect, useState } from "react";
import {
  DRAFTS_KEY,
  type StoredDrafts,
} from "@/lib/api/curriculum-insights-meta";
import { readStoredDrafts } from "./utils";

// Saved syllabus revision drafts, read from localStorage after mount so the
// server render and the first client render agree. Read only: nothing here
// writes a draft. Another tab saving a draft refreshes the list.

export function useCurriculumDrafts(): {
  drafts: StoredDrafts;
  loaded: boolean;
} {
  const [drafts, setDrafts] = useState<StoredDrafts>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDrafts(readStoredDrafts());
    setLoaded(true);

    // key is null when another tab clears all of storage.
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === DRAFTS_KEY) {
        setDrafts(readStoredDrafts());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { drafts, loaded };
}
