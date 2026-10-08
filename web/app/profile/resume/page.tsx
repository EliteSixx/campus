"use client";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { StudentResumeBuilder } from "@/components/resume/resume-builder";

export default function ResumePage() {
  return (
    <DashboardShell title="Student Resume Builder">
      <StudentResumeBuilder />
    </DashboardShell>
  );
}
