"use client";

import React from "react";
import { ShieldAlert, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AccessRestrictedProps {
  reason?: string;
  studentName?: string;
}

export function AccessRestricted({
  reason = "You are not authorized to view this student's resume.",
}: AccessRestrictedProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center text-ink">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger border border-danger/30 shadow-inner mb-5">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
        Access Restricted
      </h2>

      <p className="mt-2 max-w-md text-sm text-ink-muted leading-relaxed font-medium">
        {reason}
      </p>

      <div className="mt-6 max-w-sm rounded-xl border border-border bg-surface-raised p-4 text-left text-xs shadow-md">
        <div className="flex items-center gap-2 font-bold text-ink mb-2">
          <Lock className="h-4 w-4 text-accent" />
          ThePlug Resume Privacy Guarantee
        </div>
        <ul className="space-y-1.5 text-ink-muted text-[11px] font-medium list-disc list-inside">
          <li>Resumes on ThePlug are private to authorized stakeholders.</li>
          <li>Student resumes are never publicly indexed or accessible to other students.</li>
          <li>Access requires authenticated context and explicit authorization.</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-bold text-ink hover:bg-surface-raised transition-colors shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
