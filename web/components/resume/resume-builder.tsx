"use client";

import React, { useState, useEffect } from "react";
import { useRole, Role } from "@/context/role-context";
import { useUserProfile } from "@/context/user-profile-context";
import {
  StudentResume,
  ResumeTemplate,
  getStudentResume,
  updateStudentResume,
  calculateResumeCompletion,
  canViewResume,
} from "@/lib/api/resumes";
import { syncResumeSkills } from "@/lib/api/skills";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { CandidateResumeViewer } from "./candidate-resume-viewer";
import { AccessRestricted } from "./access-restricted";
import {
  Save,
  CheckCircle2,
  Printer,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StudentResumeBuilder() {
  const { role } = useRole();
  const { updateProfile } = useUserProfile();

  const [resume, setResume] = useState<StudentResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [accessState, setAccessState] = useState<{ allowed: boolean; reason?: string }>({
    allowed: true,
  });

  // Mobile view tab toggle: 'edit' or 'preview'
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  // Simulated viewer ID for testing Student B access control
  const [simulatedStudentB, setSimulatedStudentB] = useState(false);

  // Load student resume and evaluate permissions
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const activeRole = simulatedStudentB ? "student" : role;
      const activeViewerId = simulatedStudentB ? "s2" : role === "student" ? "s1" : `${role}-1`;

      const check = await canViewResume(activeRole as Role, activeViewerId, "s1");
      setAccessState(check);

      if (check.allowed) {
        const data = await getStudentResume("s1");
        setResume(data);
      }
      setLoading(false);
    }
    loadData();
  }, [role, simulatedStudentB]);

  // Handle live form edit
  const handleResumeChange = (updated: StudentResume) => {
    setResume(updated);
    setSavedSuccess(false);
  };

  // Save Resume to mock API & sync skills with Skill Matrix / UserProfileContext
  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);

    const saved = await updateStudentResume("s1", resume);
    setResume(saved);

    // 1. Sync structured resume skills directly to canonical student skill state & localStorage
    syncResumeSkills("s1", saved.skills);

    // 2. Sync with UserProfileContext for immediate React UI updates
    if (role === "student") {
      const topSkills = saved.skills.map((s) => ({
        name: s.name,
        score:
          s.proficiency === "Expert"
            ? 95
            : s.proficiency === "Advanced"
            ? 85
            : s.proficiency === "Intermediate"
            ? 65
            : 45,
      }));

      updateProfile("student", {
        name: saved.personalInfo.fullName || "Rudy Sharma",
        bio: saved.summary || "",
        skills: topSkills,
      });
    }

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-ink-muted text-xs">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Loading structured resume telemetry...
        </div>
      </div>
    );
  }

  // Access Restricted screen
  if (!accessState.allowed) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setSimulatedStudentB(false)}
            className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="h-3 w-3" />
            Switch back to Rudy Sharma (Owner)
          </button>
        </div>
        <AccessRestricted reason={accessState.reason} />
      </div>
    );
  }

  if (!resume) return null;

  // Read-only viewer for Faculty, Industry, Recruiter
  if (role !== "student") {
    const roleTitleMap: Record<string, string> = {
      faculty: "Faculty Department Mentor",
      industry: "Verified Industry Partner",
      institution: "Institutional Admin",
      alumni: "Verified Alumni Mentor",
    };
    return (
      <CandidateResumeViewer
        resume={resume}
        studentName={resume.personalInfo.fullName || "Rudy Sharma"}
        roleLabel={roleTitleMap[role] || "Authorized Stakeholder"}
      />
    );
  }

  // Student Owner View: Full Resume Builder
  const completion = calculateResumeCompletion(resume);

  return (
    <div className="space-y-4">
      {/* Top Action & Status Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border bg-surface p-4 shadow-md text-ink print:hidden">
        {/* Title & Completion */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-ink flex items-center gap-2">
              Structured Resume Builder
              <Sparkles className="h-4 w-4 text-accent" />
            </h1>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold text-accent border border-accent/30">
              Student Profile
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            {/* Completion Indicator */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">Resume Completion:</span>
              <div className="w-24 h-2 rounded-full bg-surface-raised overflow-hidden border border-border">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${completion.score}%` }}
                />
              </div>
              <span className="font-bold text-accent">{completion.score}%</span>
            </div>

            {completion.missingItems.length > 0 && (
              <span className="text-[11px] text-ink-muted font-medium hidden sm:inline">
                • Missing: {completion.missingItems[0]}
              </span>
            )}
          </div>
        </div>

        {/* Template Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Template Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-1 text-xs">
            <span className="text-[10px] text-ink-muted px-1 font-semibold hidden sm:inline">
              Template:
            </span>
            {(["classic", "modern", "minimal"] as ResumeTemplate[]).map((t) => (
              <button
                key={t}
                onClick={() => handleResumeChange({ ...resume, template: t })}
                className={cn(
                  "rounded px-2.5 py-1 text-xs capitalize font-bold transition-colors",
                  resume.template === t
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Download PDF */}
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 font-bold"
          >
            <Printer className="h-3.5 w-3.5" />
            Download PDF
          </Button>

          {/* Save Resume */}
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className={cn(
              "h-8 text-xs gap-1.5 font-bold text-white transition-all shadow-md",
              savedSuccess
                ? "bg-emerald-700 hover:bg-emerald-600"
                : "bg-accent hover:opacity-90"
            )}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved & Telemetry Updated!
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Resume"}
              </>
            )}
          </Button>

          {/* Security Test Toggle */}
          <button
            onClick={() => setSimulatedStudentB(!simulatedStudentB)}
            className="text-[11px] text-ink-muted hover:text-danger underline transition-colors ml-1 font-medium"
            title="Simulate unauthorized Student B accessing this resume"
          >
            Test Privacy Guard
          </button>
        </div>
      </div>

      {/* Mobile Toggle Tabs */}
      <div className="flex lg:hidden rounded-lg border border-border bg-surface p-1 text-xs print:hidden">
        <button
          onClick={() => setMobileTab("edit")}
          className={cn(
            "flex-1 py-1.5 rounded-md font-bold text-center transition-colors",
            mobileTab === "edit" ? "bg-accent text-white" : "text-ink-muted"
          )}
        >
          Edit Resume Form
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex-1 py-1.5 rounded-md font-bold text-center transition-colors",
            mobileTab === "preview" ? "bg-accent text-white" : "text-ink-muted"
          )}
        >
          Live A4 Preview
        </button>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block print:w-full print:p-0 print:m-0">
        {/* LEFT PANEL: EDIT FORM */}
        <div
          className={cn(
            "lg:col-span-5 space-y-4 print:hidden",
            mobileTab === "preview" && "hidden lg:block"
          )}
        >
          <ResumeForm resume={resume} onChange={handleResumeChange} />
        </div>

        {/* RIGHT PANEL: LIVE A4 PREVIEW */}
        <div
          className={cn(
            "lg:col-span-7 sticky top-4 rounded-xl border border-border bg-surface-raised p-2 sm:p-4 shadow-xl overflow-hidden text-ink print:w-full print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white print:static print:block",
            mobileTab === "edit" && "hidden lg:block"
          )}
        >
          <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3 px-2 print:hidden">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-ink">Live Resume Preview (A4)</span>
            </div>
            <span className="text-[11px] text-ink-muted font-mono font-semibold">Template: {resume.template}</span>
          </div>

          <div className="max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin print:max-h-none print:overflow-visible print:block">
            <ResumePreview resume={resume} template={resume.template} />
          </div>
        </div>
      </div>
    </div>
  );
}
