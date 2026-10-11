"use client";

import { useState, useEffect, useCallback } from "react";
import { readiness, skillGap, AiError, type ReadinessResponse, type SkillGapResponse } from "@/lib/ai/client";
import type { components } from "@/lib/ai/types";
import { demoStudents, demoStudentsById } from "@/data/demo/students";
import { getCurrentStudentAiRecord } from "../data/current-student";
import { demoJobs } from "@/data/demo/jobs";
import { StudentProfileForm } from "./student-profile-form";
import { StudentReadinessCard } from "./student-readiness-card";
import { StudentSkillGapPanel } from "./student-skill-gap-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertOctagon,
  RefreshCw,
  SlidersHorizontal,
  Bot,
  CheckCircle2,
} from "lucide-react";

export type Student = components["schemas"]["Student"];

export function StudentAiExperience() {
  // 1. Initial State: the shared current-student record, overlaid with any saved edits
  const [currentStudent, setCurrentStudent] = useState<Student>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`demo_student_${getCurrentStudentAiRecord().student_id}`);
      if (stored) {
        try {
          return JSON.parse(stored) as Student;
        } catch {
          // fallback
        }
      }
    }
    return getCurrentStudentAiRecord();
  });

  // Selected Target Role for Skill Gap Analysis (defaults to Backend Developer matching ST001)
  const [selectedRole, setSelectedRole] = useState<string>(demoJobs[0].role);

  // AI responses
  const [readinessData, setReadinessData] = useState<ReadinessResponse | null>(null);
  const [skillGapData, setSkillGapData] = useState<SkillGapResponse | null>(null);

  // States: loading & error
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aiError, setAiError] = useState<AiError | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Active View Tab: "intelligence" | "edit"
  const [activeTab, setActiveTab] = useState<"intelligence" | "edit">("intelligence");

  // Call AI Service (Readiness and Skill Gap in parallel)
  const evaluateAiInsights = useCallback(
    async (studentToEvaluate: Student, targetRoleName: string) => {
      setIsLoading(true);
      setAiError(null);
      setValidationError(null);

      const targetJob = demoJobs.find((j) => j.role === targetRoleName) ?? demoJobs[0];

      try {
        const [readinessRes, skillGapRes] = await Promise.all([
          readiness({ student: studentToEvaluate }),
          skillGap({
            student: studentToEvaluate,
            target: {
              role: targetJob.role,
              required_skills: targetJob.required_skills ?? [],
              preferred_skills: targetJob.preferred_skills ?? [],
            },
          }),
        ]);

        setReadinessData(readinessRes);
        setSkillGapData(skillGapRes);
      } catch (err) {
        console.error("AI insights request failed", err);
        if (err instanceof AiError) {
          setAiError(err);
        } else {
          setAiError(
            new AiError(
              "UNKNOWN_ERROR",
              err instanceof Error ? err.message : "Failed to communicate with AI engine",
              null,
              null
            )
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial evaluation on mount
  useEffect(() => {
    evaluateAiInsights(currentStudent, selectedRole);
  }, [evaluateAiInsights, currentStudent, selectedRole]);

  // Handle Save Profile & Analyze
  const handleSaveAndAnalyze = async (updatedStudent: Student) => {
    const studentToSave: Student = {
      ...updatedStudent,
      is_synthetic: false, // Explicit contract requirement
    };

    // Save into in-memory mock store
    const idx = demoStudents.findIndex((s) => s.student_id === studentToSave.student_id);
    if (idx >= 0) {
      demoStudents[idx] = studentToSave;
    } else {
      demoStudents.push(studentToSave);
    }
    demoStudentsById[studentToSave.student_id] = studentToSave;

    // Persist in localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `demo_student_${studentToSave.student_id}`,
          JSON.stringify(studentToSave)
        );
      } catch (e) {
        console.error("Failed to save to localStorage", e);
      }
    }

    setCurrentStudent(studentToSave);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);

    // Evaluate
    await evaluateAiInsights(studentToSave, selectedRole);
    setActiveTab("intelligence");
  };

  // Handle Target Role Switch
  const handleSelectRole = (newRole: string) => {
    setSelectedRole(newRole);
    evaluateAiInsights(currentStudent, newRole);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Demo Default Badge & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">
                Your Career Readiness
              </h2>
              <Badge tone="accent" className="text-[10px]">
                AI assessment
              </Badge>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              How placement-ready you are today, and which skills to work on next for your target role.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-surface-raised/60 p-1 text-xs">
            <button
              onClick={() => setActiveTab("intelligence")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-all ${
                activeTab === "intelligence"
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Insights
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-all ${
                activeTab === "edit"
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Edit Profile
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => evaluateAiInsights(currentStudent, selectedRole)}
            className="text-xs gap-1.5 border-border"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Re-evaluate
          </Button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3.5 text-xs text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Profile saved. Your readiness and skill gaps have been updated.
          </span>
        </div>
      )}

      {/* Error State Banner with AiError Message & Field */}
      {aiError && (
        <Card className="border-danger/30 bg-danger/5 text-danger">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertOctagon className="h-5 w-5 shrink-0 mt-0.5 text-danger" />
              <div>
                <p className="font-bold">We couldn&apos;t load your insights</p>
                <p className="mt-1 text-ink leading-relaxed">
                  {aiError.field
                    ? `Please check the "${aiError.field.replace(/_/g, " ")}" field in Edit Profile and try again.`
                    : "The assessment service didn't respond. Please try again in a moment."}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => evaluateAiInsights(currentStudent, selectedRole)}
              className="text-xs border-danger/30 text-danger hover:bg-danger/10 self-start sm:self-auto shrink-0"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 2. Main Content based on Active Tab */}
      {activeTab === "intelligence" ? (
        <div className="space-y-6">
          {/* Readiness Card (Score, Level Badge, Strengths, Gaps, Recommendations, Breakdown Chart) */}
          <StudentReadinessCard
            readinessData={readinessData}
            isLoading={isLoading}
          />

          {/* Skill Gap Panel (Target Role Picker, Matched Skills, Missing with Priority Colours, Coverage Bar) */}
          <StudentSkillGapPanel
            skillGapData={skillGapData}
            selectedRole={selectedRole}
            onSelectRole={handleSelectRole}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <StudentProfileForm
          initialStudent={currentStudent}
          onSaveAndAnalyze={handleSaveAndAnalyze}
          isLoading={isLoading}
          validationError={validationError}
        />
      )}
    </div>
  );
}
