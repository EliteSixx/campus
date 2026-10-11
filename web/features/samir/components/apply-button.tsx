"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplications, isActiveApplication } from "../data/applications-store";

export function ApplyButton({ opportunityId, closed }: { opportunityId: string; closed: boolean }) {
  const { hydrated, getApplication, apply } = useApplications();
  const [justApplied, setJustApplied] = useState(false);
  const existing = getApplication(opportunityId);

  if (!hydrated) {
    return <Button className="mt-5 w-full" disabled>Apply now</Button>;
  }

  if (existing && isActiveApplication(existing)) {
    return (
      <div className="mt-5 space-y-2">
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-xs text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            {justApplied ? "Application submitted." : `Applied on ${existing.appliedOn}`} · Status:{" "}
            <strong>{existing.status}</strong>
          </span>
        </div>
        <Link href="/applications" className="block">
          <Button variant="secondary" className="w-full">View in My Applications</Button>
        </Link>
      </div>
    );
  }

  if (closed) {
    return (
      <Button className="mt-5 w-full gap-1.5" disabled>
        <Lock className="h-3.5 w-3.5" /> Applications closed
      </Button>
    );
  }

  return (
    <Button
      className="mt-5 w-full gap-1.5"
      onClick={() => {
        apply(opportunityId);
        setJustApplied(true);
      }}
    >
      <Send className="h-3.5 w-3.5" />
      {existing ? "Apply again" : "Apply now"}
    </Button>
  );
}
