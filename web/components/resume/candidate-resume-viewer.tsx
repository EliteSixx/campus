"use client";

import React, { useState } from "react";
import { StudentResume, ResumeTemplate } from "@/lib/api/resumes";
import { ResumePreview } from "./resume-preview";
import { ShieldCheck, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CandidateResumeViewerProps {
  resume: StudentResume;
  studentName?: string;
  roleLabel?: string;
}

export function CandidateResumeViewer({
  resume,
  studentName = "Rudy Sharma",
  roleLabel = "Authorized Viewer",
}: CandidateResumeViewerProps) {
  const [template, setTemplate] = useState<ResumeTemplate>(resume.template || "modern");
  const [zoom] = useState<number>(100);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 text-ink">
      {/* Header Banner for Authorized Viewers */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-surface p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent border border-accent/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink tracking-tight">
                Candidate Resume — {studentName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success border border-success/30">
                <Eye className="h-3 w-3" />
                Read-Only Access
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5 font-medium">
              Viewing in authenticated <strong className="text-ink font-bold">{roleLabel}</strong> context. Student privacy settings permit your view.
            </p>
          </div>
        </div>

        {/* Template & Print Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-1 text-xs">
            <span className="text-[10px] text-ink-muted px-2 font-bold">Style:</span>
            {(["classic", "modern", "minimal"] as ResumeTemplate[]).map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs capitalize font-bold transition-colors",
                  template === t
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            onClick={handlePrint}
            size="sm"
            className="bg-accent hover:opacity-95 text-white gap-1.5 shadow-md text-xs font-bold"
          >
            <Printer className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* A4 Preview Container */}
      <div className="rounded-xl border border-border bg-surface-raised p-4 sm:p-6 shadow-xl">
        <ResumePreview resume={resume} template={template} zoom={zoom} />
      </div>
    </div>
  );
}
