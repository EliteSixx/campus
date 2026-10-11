"use client";

import { useState } from "react";
import { BriefcaseBusiness, Sparkles } from "lucide-react";
import { IndustryPostJobClient } from "@/components/shared/industry-post-job";
import { RecruiterWorkspace } from "./recruiter-workspace";

type JobSection = "post-job" | "parse-job";

export function AddJobsWorkspace() {
  const [activeSection, setActiveSection] = useState<JobSection>("post-job");

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-2xl border border-border bg-surface/80 p-5 shadow-sm backdrop-blur dark:bg-surface sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Recruiter workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Add Jobs</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
          Publish a role or parse a job description and discover candidates matched to its requirements.
        </p>
      </header>

      <nav
        role="tablist"
        aria-label="Add jobs sections"
        className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-surface/80 p-1.5 shadow-sm dark:bg-surface sm:w-fit"
      >
        <button
          type="button"
          role="tab"
          id="post-job-tab"
          aria-selected={activeSection === "post-job"}
          aria-controls="post-job-panel"
          tabIndex={activeSection === "post-job" ? 0 : -1}
          onClick={() => setActiveSection("post-job")}
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            activeSection === "post-job"
              ? "bg-accent text-white shadow-sm"
              : "text-ink-muted hover:bg-surface-raised hover:text-ink"
          }`}
        >
          <BriefcaseBusiness className="h-4 w-4" />
          Post Job
        </button>
        <button
          type="button"
          role="tab"
          id="parse-job-tab"
          aria-selected={activeSection === "parse-job"}
          aria-controls="parse-job-panel"
          tabIndex={activeSection === "parse-job" ? 0 : -1}
          onClick={() => setActiveSection("parse-job")}
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            activeSection === "parse-job"
              ? "bg-accent text-white shadow-sm"
              : "text-ink-muted hover:bg-surface-raised hover:text-ink"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Parse Job
        </button>
      </nav>

      <section
        id="post-job-panel"
        role="tabpanel"
        aria-labelledby="post-job-tab"
        aria-label="Post Job"
        hidden={activeSection !== "post-job"}
      >
        <IndustryPostJobClient />
      </section>
      <section
        id="parse-job-panel"
        role="tabpanel"
        aria-labelledby="parse-job-tab"
        aria-label="Parse Job"
        hidden={activeSection !== "parse-job"}
      >
        <RecruiterWorkspace />
      </section>
    </div>
  );
}
