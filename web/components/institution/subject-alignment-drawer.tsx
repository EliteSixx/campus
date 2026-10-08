"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  UserCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  Info,
  ArrowRight,
  Briefcase,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SubjectCurriculumAlignment, CurriculumTopic } from "@/data/institution/types";
import { cn } from "@/lib/utils";

interface SubjectAlignmentDrawerProps {
  subject: SubjectCurriculumAlignment | null;
  onClose: () => void;
}

export function SubjectAlignmentDrawer({ subject, onClose }: SubjectAlignmentDrawerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "foundational" | "industry" | "missing">("all");
  const [downloadToast, setDownloadToast] = useState(false);

  if (!subject) return null;

  const handleExport = () => {
    const headers = ["Topic Name", "Classification", "Relevance Score", "Priority", "Mapped Skills", "Rationale / Description"];
    const rows = subject.topics.map((t) => [
      t.name,
      t.classification,
      `${t.industryRelevanceScore}%`,
      t.priority || "N/A",
      t.mappedSkills.join("; "),
      t.description,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject.code.toLowerCase()}_curriculum_alignment.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3500);
  };

  const filteredTopics = subject.topics.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "foundational") return t.classification === "foundational";
    if (activeTab === "industry") return t.classification === "industry-relevant" || t.classification === "industry-advanced";
    if (activeTab === "missing") return t.classification === "missing-recommended";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-border bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface-raised/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                {subject.code}
              </span>
              <span className="text-xs text-ink-muted">{subject.semester} · {subject.credits} Credits</span>
            </div>
            <h3 className="text-base font-bold text-ink mt-1">{subject.title}</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Taught by <strong className="text-ink">{subject.primaryFacultyName}</strong> ({subject.primaryFacultyDesignation})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Industry Alignment KPI Meter */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Industry Standard Alignment
                </p>
                <p className="text-[11px] text-ink-faint">
                  Determined by syllabus coverage against active recruitment competency benchmarks
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-bold text-accent">{subject.alignmentScore}%</span>
                <span className="text-xs text-ink-muted block capitalize">{subject.alignmentStatus.replace("-", " ")}</span>
              </div>
            </div>

            <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  subject.alignmentStatus === "strong"
                    ? "bg-emerald-500"
                    : subject.alignmentStatus === "moderate"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                )}
                style={{ width: `${subject.alignmentScore}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2">
                <p className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">{subject.foundationalCount}</p>
                <p className="text-[10px] text-ink-muted">Foundational</p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
                <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">{subject.industryRelevantCount}</p>
                <p className="text-[10px] text-ink-muted">Industry Core</p>
              </div>
              <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2">
                <p className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">{subject.industryAdvancedCount}</p>
                <p className="text-[10px] text-ink-muted">Advanced</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
                <p className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{subject.missingRecommendedCount}</p>
                <p className="text-[10px] text-ink-muted">Missing Gap</p>
              </div>
            </div>
          </div>

          {/* Academic Foundation Principle Callout */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3.5 flex gap-3 text-xs">
            <GraduationCap className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400">
                Foundational Academic Distinction
              </h4>
              <p className="text-ink-muted mt-0.5 leading-relaxed text-[11px]">
                Not every topic in an engineering curriculum should be purely commercial. <strong>Foundational topics</strong> (e.g. Relational Algebra, State Space Search, Microcontroller Registers) provide the essential conceptual bedrock necessary to comprehend modern tools. They are recognized and preserved.
              </p>
            </div>
          </div>

          {/* Connected Industry Job Roles */}
          {subject.industryJobRoleLinks.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-accent" />
                Target Industry Job Roles &amp; Hiring Corporate Partners
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {subject.industryJobRoleLinks.map((role) => (
                  <div key={role.roleTitle} className="rounded-lg border border-border bg-surface-raised/40 p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">{role.roleTitle}</span>
                      <span className="font-mono text-xs font-bold text-accent">{role.alignmentPercent}% fit</span>
                    </div>
                    <p className="text-[10px] text-ink-muted mt-1">
                      Recruiters: {role.topHiringPartners.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Additions & Growth Areas */}
          {subject.recommendedAdditions.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Recommended Curriculum Enhancements ({subject.recommendedAdditions.length})
              </h4>
              <div className="space-y-2">
                {subject.recommendedAdditions.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-amber-500/20 bg-surface p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">{item.topic}</span>
                      <Badge tone={item.priority === "high" ? "danger" : "warning"} className="text-[9px]">
                        {item.priority === "high" ? "High Priority" : "Medium Priority"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">{item.reason}</p>
                    <p className="text-[10px] text-ink-faint mt-1 font-mono">Suggested Insertion: {item.suggestedWeek}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic-Level Granular Breakdown */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Syllabus Topic Catalog ({subject.topics.length})
              </h4>

              <div className="flex items-center gap-1.5">
                {/* Tab filters */}
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors",
                    activeTab === "all" ? "bg-surface-raised text-ink border-border" : "text-ink-muted border-transparent hover:bg-surface-raised/40"
                  )}
                >
                  All ({subject.topics.length})
                </button>
                <button
                  onClick={() => setActiveTab("foundational")}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors",
                    activeTab === "foundational" ? "bg-indigo-500/15 text-indigo-600 border-indigo-500/30" : "text-ink-muted border-transparent hover:bg-surface-raised/40"
                  )}
                >
                  Foundational ({subject.foundationalCount})
                </button>
                <button
                  onClick={() => setActiveTab("industry")}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors",
                    activeTab === "industry" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : "text-ink-muted border-transparent hover:bg-surface-raised/40"
                  )}
                >
                  Industry ({subject.industryRelevantCount + subject.industryAdvancedCount})
                </button>
                <button
                  onClick={() => setActiveTab("missing")}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors",
                    activeTab === "missing" ? "bg-amber-500/15 text-amber-600 border-amber-500/30" : "text-ink-muted border-transparent hover:bg-surface-raised/40"
                  )}
                >
                  Missing ({subject.missingRecommendedCount})
                </button>
              </div>
            </div>

            {downloadToast && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>Curriculum analysis exported successfully for {subject.code}!</span>
              </div>
            )}

            <div className="space-y-2">
              {filteredTopics.map((topic) => {
                const isFoundational = topic.classification === "foundational";
                const isIndustry = topic.classification === "industry-relevant";
                const isAdvanced = topic.classification === "industry-advanced";
                const isMissing = topic.classification === "missing-recommended";

                return (
                  <div
                    key={topic.id}
                    className={cn(
                      "rounded-xl border p-3.5 transition-all text-xs",
                      isFoundational && "border-indigo-500/20 bg-indigo-500/5",
                      isIndustry && "border-emerald-500/20 bg-emerald-500/5",
                      isAdvanced && "border-purple-500/20 bg-purple-500/5",
                      isMissing && "border-amber-500/30 bg-amber-500/5 border-dashed"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{topic.name}</span>
                          <span
                            className={cn(
                              "text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase",
                              isFoundational && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
                              isIndustry && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                              isAdvanced && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                              isMissing && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            )}
                          >
                            {topic.classification.replace("-", " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">{topic.description}</p>
                        {topic.rationale && (
                          <p className="text-[10px] text-ink-faint mt-1 italic">Note: {topic.rationale}</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-ink">{topic.industryRelevanceScore}%</span>
                        <span className="text-[9px] text-ink-faint block">Relevance</span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1 border-t border-border/40 pt-2">
                      <span className="text-[10px] text-ink-faint mr-1">Skills:</span>
                      {topic.mappedSkills.map((sk) => (
                        <span key={sk} className="rounded bg-surface-raised px-1.5 py-0.5 text-[9px] font-medium text-ink-muted border border-border/60">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-8 text-xs font-semibold gap-1 text-ink"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Syllabus Dossier</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close Panel
          </Button>
        </div>
      </div>
    </div>
  );
}
