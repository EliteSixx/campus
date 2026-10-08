"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { AssignmentStatus } from "@/data/assignments";
import { isoDateInZone } from "@/components/faculty/dashboard/utils";
import { isAssignmentOverdue } from "./overdue";

// Today's calendar date in Asia/Kolkata, read after mount only so the server
// render and the first client render agree. null until then.
export function useTodayIST(): string | null {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    setToday(isoDateInZone(new Date()));
  }, []);
  return today;
}

// The "Overdue" badge. Shows nothing until today is known, so it can never
// flash a wrong answer.
export function OverdueBadge({
  status,
  dueDate,
}: {
  status: AssignmentStatus;
  dueDate: string;
}) {
  const today = useTodayIST();
  if (today === null || !isAssignmentOverdue(status, dueDate, today)) return null;
  return <Badge tone="danger">Overdue</Badge>;
}
