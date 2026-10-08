"use client";

import { useEffect, useState } from "react";
import { formatLongISODate, isoDateInZone } from "./utils";

export interface Today {
  // "2026-09-16", the calendar day in Asia/Kolkata.
  iso: string;
  // "Wednesday, 16 September 2026".
  label: string;
}

// Today's date, read from the clock after mount only, so the server render and
// the first client render agree. null until then: anything that depends on it
// should show a skeleton.
export function useToday(): Today | null {
  const [today, setToday] = useState<Today | null>(null);

  useEffect(() => {
    const iso = isoDateInZone(new Date());
    setToday({ iso, label: formatLongISODate(iso) });
  }, []);

  return today;
}
