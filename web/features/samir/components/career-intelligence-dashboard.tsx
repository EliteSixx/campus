"use client";

/**
 * Career Intelligence Database & Dashboard
 * Strictly scoped within features/samir
 *
 * Provides students with deep intelligence on 10 major tech companies,
 * a multi-dimensional comparison matrix, and an interactive Skill Gap Analyzer.
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  TECH_COMPANIES,
  TechCompany,
  STUDENT_SKILL_MAP,
  PREPARATION_ROADMAPS,
  DISCLAIMER_TEXT
} from "../data/career-intelligence";
import {
  analyzeSkillGap,
  ALL_AVAILABLE_SKILLS,
  STUDENT_PRESETS,
  SkillGapAnalysisResult
} from "../data/career-analyzer";
import Link from "next/link";
import { getEnrichedOpportunitiesAction } from "../actions/career-opportunities";
import type { EnrichedOpportunity } from "../integrations/career-opportunities-bridge";
import {
  Building2,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Layers,
  Target,
  TrendingUp,
  Code2,
  Cpu,
  Users,
  Calendar,
  Terminal,
  Briefcase,
  ChevronRight,
  Info,
  X,
  Plus,
  Compass,
  FileCheck,
  Check,
  BadgeAlert,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveTab = "directory" | "comparison" | "analyzer" | "skillmap" | "roadmaps" | "live-opportunities";

export function CareerIntelligenceDashboard({ studentId = "s1" }: { studentId?: string } = {}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("analyzer");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("google");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const [liveOpportunities, setLiveOpportunities] = useState<EnrichedOpportunity[]>([]);

  useEffect(() => {
    getEnrichedOpportunitiesAction(studentId).then((res) => {
      if (res.success && res.opportunities) {
        setLiveOpportunities(res.opportunities);
      }
    });
  }, [studentId]);


  const tabs: { id: ActiveTab; label: string; icon: typeof Target }[] = [
    { id: "analyzer", label: "Skill Gap Analyzer", icon: Target },
    { id: "directory", label: "Company Deep Dives", icon: Building2 },
    { id: "comparison", label: "Full Comparison Matrix", icon: Layers },
    { id: "skillmap", label: "General Student Skill Map", icon: BookOpen },
    { id: "roadmaps", label: "3 / 6 / 12-Month Roadmaps", icon: Calendar },
    {
      id: "live-opportunities",
      label: `Curated Opportunities Fit (${liveOpportunities.length})`,
      icon: Briefcase,
    },
  ];

  // Skill Gap Analyzer state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Data Structures and Algorithms",
    "Python",
    "Java",
    "SQL",
    "Problem Solving",
    "Git & GitHub"
  ]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Modal / Drawer for detailed company view
  const [modalCompany, setModalCompany] = useState<TechCompany | null>(null);

  // Active roadmap tab inside roadmaps section
  const [activeRoadmapDuration, setActiveRoadmapDuration] = useState<"3-Month" | "6-Month" | "12-Month">("6-Month");

  // Run analysis dynamically
  const analysisResult: SkillGapAnalysisResult = useMemo(() => {
    return analyzeSkillGap(selectedSkills);
  }, [selectedSkills]);

  // Filter companies for directory and matrix
  const filteredCompanies = useMemo(() => {
    return TECH_COMPANIES.filter((comp) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.industry.some((ind) => ind.toLowerCase().includes(searchQuery.toLowerCase())) ||
        comp.commonRoles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
        comp.importantSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        comp.majorProducts.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesIndustry =
        industryFilter === "all" ||
        comp.industry.some((i) => i.toLowerCase().includes(industryFilter.toLowerCase()));

      const matchesDifficulty =
        difficultyFilter === "all" || comp.interviewDifficulty === difficultyFilter;

      return matchesSearch && matchesIndustry && matchesDifficulty;
    });
  }, [searchQuery, industryFilter, difficultyFilter]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    if (!selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
    }
    setCustomSkillInput("");
  };

  const applyPreset = (skills: string[]) => {
    setSelectedSkills(skills);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-accent/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Student Career Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Major Tech Companies & Skill Intelligence
            </h1>
            <p className="max-w-3xl text-xs sm:text-sm text-ink-muted">
              Understand how Tier-1 technology companies operate, how engineers work, hiring bars,
              and evaluate your exact skill gap with realistic preparation roadmaps.
            </p>
          </div>

        </div>

        {/* Mandatory Disclaimer Alert */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold">Guidance Disclaimer:</span> {DISCLAIMER_TEXT}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Career intelligence sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all",
                  active
                    ? "bg-accent text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>


        {/* Global Search */}
        {(activeTab === "directory" || activeTab === "comparison") && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-muted" />
            <input
              type="text"
              placeholder="Search companies, skills, roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SKILL GAP ANALYZER */}
      {/* ========================================================================= */}
      {activeTab === "analyzer" && (
        <div className="space-y-6">
          {/* Skill Input Console */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  Your Current Acquired Skills ({selectedSkills.length})
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Select your current skills or pick a preset profile to calculate your matching distance.
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-ink-muted mr-1">Presets:</span>
                {STUDENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.skills)}
                    className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Selected Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent"
                >
                  {skill}
                  <button
                    onClick={() => toggleSkill(skill)}
                    className="hover:text-red-500 transition-colors"
                    title="Remove skill"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selectedSkills.length === 0 && (
                <p className="text-xs italic text-ink-muted py-1">
                  No skills selected yet. Click skills below or pick a preset to analyze your readiness.
                </p>
              )}
            </div>

            {/* Custom Skill Add Form */}
            <form onSubmit={addCustomSkill} className="flex gap-2 pt-2 border-t border-border">
              <input
                type="text"
                placeholder="Type any other skill (e.g. Docker, GraphQL, Kubernetes, Rust)..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-ink px-3 py-1.5 text-xs font-semibold text-surface hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Skill
              </button>
            </form>

            {/* Quick-pick Skill Cloud */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">
                Click to toggle common student skills:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_AVAILABLE_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={cn(
                        "rounded-lg px-2 py-1 text-[11px] font-medium transition-all",
                        isSelected
                          ? "border border-accent bg-accent text-white"
                          : "border border-border bg-surface text-ink-muted hover:border-ink-muted hover:text-ink"
                      )}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Section 1: Companies Closest to Qualifying */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  1. Companies You Are Currently Closest to Qualifying For
                </h3>
                <p className="text-xs text-ink-muted">
                  Ranked by matching density between your verified skills and each company’s core technology stack.
                </p>
              </div>
              <span className="text-xs font-semibold text-accent">
                {analysisResult.closestCompanies[0]?.matchScore}% Top Match
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisResult.closestCompanies.map((match, idx) => {
                const comp = match.company;
                return (
                  <div
                    key={comp.id}
                    className="relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm hover:border-accent/40 transition-all group"
                  >
                    <div>
                      {/* Rank & Score Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white"
                            style={{ backgroundColor: comp.accentColor }}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                              {comp.name}
                            </h4>
                            <p className="text-[10px] text-ink-muted">{comp.industry[0]}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-ink">{match.matchScore}%</div>
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            {match.matchedSkills.length} Matched
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${match.matchScore}%`,
                            backgroundColor: comp.accentColor
                          }}
                        />
                      </div>

                      {/* Matched Skills */}
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                          You Have:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {match.matchedSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            >
                              <Check className="h-2.5 w-2.5" />
                              {s}
                            </span>
                          ))}
                          {match.matchedSkills.length > 4 && (
                            <span className="text-[10px] text-ink-muted">
                              +{match.matchedSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="mt-2.5 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                          To Build:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {match.missingSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                              {s}
                            </span>
                          ))}
                          {match.missingSkills.length > 4 && (
                            <span className="text-[10px] text-ink-muted">
                              +{match.missingSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-medium text-ink-muted">
                        Difficulty: <span className="font-semibold text-ink">{comp.interviewDifficulty}</span>
                      </span>
                      <button
                        onClick={() => setModalCompany(comp)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                      >
                        Deep Dive
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Section 2 & 3: Missing Skills & Recommended Learning Order */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommended Learning Order */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink">
                    2. Recommended Learning Order (Priority Sequence)
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    Learn in structured order from fundamentals to role specialization.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {analysisResult.recommendedLearningOrder.slice(0, 6).map((skill, index) => (
                  <div
                    key={skill}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 bg-surface hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink truncate">{skill}</p>
                      <p className="text-[11px] text-ink-muted">
                        {index === 0
                          ? "Foundation: Non-negotiable for technical screening"
                          : index === 1
                            ? "Core Language Mastery: OOP & standard concurrency models"
                            : index === 2
                              ? "Architecture & Data: Relational models and scalability"
                              : "Production Deployment: Cloud orchestration & role focus"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      Priority {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Projects to Bridge the Gap */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Terminal className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink">
                    3. Suggested Portfolio Projects (Gap Bridging)
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    Practical projects demonstrating proof of competence to hiring managers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {analysisResult.universalProjects.map((project, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border p-3 bg-surface hover:border-accent/30 transition-all"
                  >
                    <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-accent" />
                      {project.title}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
                      {project.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.skillsTargeted.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-ink"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section 4: Interview Preparation Topics */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
                <FileCheck className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  4. Interview Preparation Focus Topics
                </h3>
                <p className="text-[11px] text-ink-muted">
                  The exact technical concepts and behavioral frameworks prioritized by your closest matched companies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Coding */}
              <div className="rounded-xl border border-border p-4 bg-surface">
                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 text-accent mb-2">
                  <Code2 className="h-3.5 w-3.5" />
                  Coding & Algorithms
                </h4>
                <ul className="space-y-1.5 text-[11px] text-ink-muted">
                  {analysisResult.interviewPrepTopics.coding.map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* System Design */}
              <div className="rounded-xl border border-border p-4 bg-surface">
                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 text-accent mb-2">
                  <Cpu className="h-3.5 w-3.5" />
                  System Design & Architecture
                </h4>
                <ul className="space-y-1.5 text-[11px] text-ink-muted">
                  {analysisResult.interviewPrepTopics.systemDesign.map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Behavioral */}
              <div className="rounded-xl border border-border p-4 bg-surface">
                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 text-accent mb-2">
                  <Users className="h-3.5 w-3.5" />
                  Behavioral & Culture Fit
                </h4>
                <ul className="space-y-1.5 text-[11px] text-ink-muted">
                  {analysisResult.interviewPrepTopics.behavioral.map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPANY DIRECTORY & DEEP DIVES */}
      {/* ========================================================================= */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-ink-muted flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                Industry:
              </span>
              {["all", "Technology", "Cloud", "Artificial Intelligence", "Semiconductors", "IT Services"].map(
                (ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustryFilter(ind)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      industryFilter === ind
                        ? "bg-accent text-white"
                        : "bg-surface border border-border text-ink-muted hover:text-ink"
                    )}
                  >
                    {ind === "all" ? "All Industries" : ind}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink-muted">Difficulty:</span>
              {["all", "Medium", "Medium-High", "High", "Very High"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-xs font-medium transition-colors",
                    difficultyFilter === diff
                      ? "bg-ink text-surface"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Company Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCompanies.map((comp) => (
              <div
                key={comp.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-accent/40 transition-all group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white shadow-sm"
                        style={{ backgroundColor: comp.accentColor }}
                      >
                        {comp.ticker ? comp.ticker.slice(0, 3) : comp.name.slice(0, 2)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors">
                            {comp.name}
                          </h3>
                          {comp.ticker && (
                            <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                              {comp.ticker}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-muted line-clamp-1">{comp.tagline}</p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        comp.interviewDifficulty === "Very High"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                          : comp.interviewDifficulty === "High"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      )}
                    >
                      {comp.interviewDifficulty} Bar
                    </span>
                  </div>

                  {/* Industry & Products */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {comp.industry.slice(0, 3).map((ind) => (
                      <span
                        key={ind}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-ink"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>

                  {/* How Employees Work */}
                  <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3 border border-border/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                      How Employees Work:
                    </p>
                    <p className="text-xs leading-relaxed text-ink line-clamp-3">
                      {comp.howEmployeesWork}
                    </p>
                  </div>

                  {/* Common Roles */}
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                      Common Roles:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {comp.commonRoles.slice(0, 4).map((role) => (
                        <span
                          key={role}
                          className="rounded bg-accent/5 border border-accent/20 px-2 py-0.5 text-[10px] font-medium text-ink"
                        >
                          {role}
                        </span>
                      ))}
                      {comp.commonRoles.length > 4 && (
                        <span className="text-[10px] text-ink-muted">
                          +{comp.commonRoles.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Important Skills */}
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                      Important Skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {comp.importantSkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-surface border border-border px-1.5 py-0.5 text-[10px] font-semibold text-ink"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-[11px] text-ink-muted">
                    <span className="font-semibold text-ink">Hiring Focus:</span>{" "}
                    {comp.hiringFocus.slice(0, 45)}...
                  </div>
                  <button
                    onClick={() => setModalCompany(comp)}
                    className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                  >
                    Deep Dive
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FULL COMPARISON MATRIX */}
      {/* ========================================================================= */}
      {activeTab === "comparison" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">
                Cross-Company Benchmark Matrix (10 Companies)
              </h3>
              <p className="text-xs text-ink-muted">
                Direct side-by-side comparison across stack requirements, difficulty, work style, and entry opportunities.
              </p>
            </div>
            <span className="text-xs font-semibold text-ink-muted">
              Showing {filteredCompanies.length} of 10 Companies
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-xs text-ink">
              <thead className="border-b border-border bg-slate-50 dark:bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="p-3 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">Company</th>
                  <th className="p-3">Industry</th>
                  <th className="p-3">Primary Languages</th>
                  <th className="p-3">Cloud Requirements</th>
                  <th className="p-3">AI/ML Focus</th>
                  <th className="p-3">Interview Bar</th>
                  <th className="p-3 min-w-[200px]">Work Style</th>
                  <th className="p-3 min-w-[220px]">Recommended Student Prep</th>
                  <th className="p-3 min-w-[180px]">Entry-Level Pipelines</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-bold sticky left-0 bg-surface z-10">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: comp.accentColor }}
                        />
                        <span>{comp.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-ink-muted">{comp.industry.slice(0, 2).join(", ")}</td>
                    <td className="p-3 font-medium">
                      <div className="flex flex-wrap gap-1">
                        {comp.programmingLanguages.slice(0, 3).map((l) => (
                          <span key={l} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px]">
                            {l}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-ink-muted text-[11px]">
                      {comp.cloudRequirements.slice(0, 2).join(", ")}
                    </td>
                    <td className="p-3 text-ink-muted text-[11px]">
                      {comp.aiMlRequirements.slice(0, 2).join(", ")}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-bold",
                          comp.interviewDifficulty === "Very High"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                            : comp.interviewDifficulty === "High"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        )}
                      >
                        {comp.interviewDifficulty}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-ink-muted line-clamp-2">
                      {comp.workStyle}
                    </td>
                    <td className="p-3 text-[11px] font-medium text-ink">
                      {comp.bestPreparation}
                    </td>
                    <td className="p-3 text-[11px] text-ink-muted">
                      {comp.entryLevelOpportunities}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setModalCompany(comp)}
                        className="rounded-lg bg-surface border border-border px-2.5 py-1 text-xs font-bold text-accent hover:border-accent transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GENERAL STUDENT SKILL MAP */}
      {/* ========================================================================= */}
      {activeTab === "skillmap" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-ink">
              Universal Student Technology Skill Map
            </h3>
            <p className="text-xs text-ink-muted">
              The overarching competencies and engineering foundations common across major technology employers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STUDENT_SKILL_MAP.map((cat, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <h4 className="text-sm font-bold text-ink">{cat.category}</h4>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    {cat.skills.map((s) => (
                      <div
                        key={s.name}
                        className="rounded-xl border border-border/80 p-2.5 bg-slate-50/50 dark:bg-slate-900/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-ink">{s.name}</span>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                              s.importance === "Essential"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : s.importance === "High"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            )}
                          >
                            {s.importance}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-tight text-ink-muted">
                          {s.whyItMatters}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 3 / 6 / 12-MONTH PREPARATION ROADMAPS */}
      {/* ========================================================================= */}
      {activeTab === "roadmaps" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                Structured Student Preparation Roadmaps
              </h3>
              <p className="text-xs text-ink-muted">
                Choose a timeline based on your current graduation year and recruitment deadlines.
              </p>
            </div>

            <div className="flex rounded-xl border border-border bg-surface p-1 shadow-sm">
              {(["3-Month", "6-Month", "12-Month"] as const).map((duration) => (
                <button
                  key={duration}
                  onClick={() => setActiveRoadmapDuration(duration)}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all",
                    activeRoadmapDuration === duration
                      ? "bg-accent text-white shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  {duration} Plan
                </button>
              ))}
            </div>
          </div>

          {/* Render Active Roadmap */}
          {PREPARATION_ROADMAPS.filter((r) => r.duration === activeRoadmapDuration).map((roadmap) => (
            <div key={roadmap.duration} className="space-y-4">
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs font-medium text-accent">
                <span className="font-bold">Timeline Objective:</span> {roadmap.focus}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {roadmap.milestones.map((ms, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-accent text-white px-2 py-0.5 text-[10px] font-bold">
                          {ms.weeks}
                        </span>
                        <span className="text-[10px] font-bold text-ink-muted">
                          Phase {index + 1}
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-bold text-ink">{ms.phase}</h4>

                      <div className="mt-3 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                          Key Learning Goals:
                        </p>
                        <ul className="space-y-1.5 text-xs text-ink">
                          {ms.goals.map((g, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-accent mt-0.5">•</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                        Verified Deliverables:
                      </p>
                      <ul className="space-y-1 text-[11px] text-ink-muted">
                        {ms.deliverables.map((d, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CURATED OPPORTUNITIES FIT VIEW (BRIDGED FROM THE PLUG ECOSYSTEM) */}
      {/* ========================================================================= */}
      {activeTab === "live-opportunities" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Banner */}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ink">Curated Internship & Job Opportunities</h3>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
                    Ecosystem Bridged
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Ranked by algorithmic fit against your verified profile proofs and skills catalog.
                </p>
              </div>

              <Link
                href="/opportunities"
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity self-start sm:self-auto"
              >
                Open Full Opportunities Portal
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Opportunity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 hover:border-accent/50 hover:shadow-md transition-all"
              >
                <div>
                  {/* Top row: Company & Tier */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-raised font-bold text-ink text-sm border border-border">
                        {opp.companyInitials}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink text-sm leading-tight">{opp.title}</h4>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {opp.companyName} · {opp.location} ({opp.mode})
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0",
                        opp.matchScore >= 70
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : opp.matchScore >= 40
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      )}
                    >
                      {opp.matchScore}% Match
                    </span>
                  </div>

                  {/* Compensation, Type & Deadline Status */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                    <span className="rounded bg-surface-raised px-2 py-0.5 font-medium text-ink">
                      {opp.type}
                    </span>
                    <span className="font-semibold text-emerald-500">{opp.stipendOrCtc}</span>
                    <span>· Deadline: {opp.deadline}</span>
                    {opp.status && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          opp.status === "Open" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                          opp.status === "Closing Soon" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                          opp.status === "Closed" && "bg-surface-raised text-ink-faint border border-border"
                        )}
                      >
                        {opp.status}
                      </span>
                    )}
                  </div>

                  {/* Skills Breakdown */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mb-1">
                        <Check className="h-3 w-3" /> Matching Skills ({opp.matchingSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {opp.matchingSkills.map((s) => (
                          <span
                            key={s}
                            className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 border border-emerald-500/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {opp.missingSkills.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-amber-500 flex items-center gap-1 mb-1">
                          <Target className="h-3 w-3" /> Skills to Bridge ({opp.missingSkills.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {opp.missingSkills.map((s) => (
                            <span
                              key={s}
                              className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                  <p className="text-[11px] text-ink-muted italic">
                    {opp.benchmarkRoadmapSnippet}
                  </p>
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-bold text-ink hover:bg-surface-raised transition-colors"
                  >
                    View Role <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPANY DETAIL MODAL / DRAWER */}

      {/* ========================================================================= */}
      {modalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-2xl text-ink">
            {/* Close Button */}
            <button
              onClick={() => setModalCompany(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-ink-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3.5 pr-8">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black text-white shadow-md"
                style={{ backgroundColor: modalCompany.accentColor }}
              >
                {modalCompany.ticker ? modalCompany.ticker.slice(0, 3) : modalCompany.name.slice(0, 2)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black">{modalCompany.name}</h2>
                  {modalCompany.ticker && (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-ink-muted">
                      {modalCompany.ticker}
                    </span>
                  )}
                  <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-bold">
                    {modalCompany.interviewDifficulty} Interview Bar
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{modalCompany.tagline}</p>
              </div>
            </div>

            {/* Content Sections */}
            <div className="mt-6 space-y-5 text-xs">
              {/* Products & Common Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-3.5 bg-slate-50/50 dark:bg-slate-900/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Major Products & Areas:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {modalCompany.majorProducts.map((p) => (
                      <span key={p} className="rounded bg-surface border border-border px-2 py-0.5 text-[11px] font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border p-3.5 bg-slate-50/50 dark:bg-slate-900/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Common Roles Hired:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {modalCompany.commonRoles.map((r) => (
                      <span key={r} className="rounded bg-accent/10 text-accent px-2 py-0.5 text-[11px] font-semibold">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* How Employees Work */}
              <div className="rounded-xl border border-border p-4 bg-surface">
                <h4 className="font-bold text-ink text-sm flex items-center gap-1.5 text-accent mb-1.5">
                  <Users className="h-4 w-4" />
                  How Employees Work
                </h4>
                <p className="text-xs leading-relaxed text-ink">
                  {modalCompany.howEmployeesWork}
                </p>
              </div>

              {/* Hiring Focus & Best Preparation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4 bg-surface">
                  <h4 className="font-bold text-ink text-xs uppercase tracking-wider text-ink-muted mb-1">
                    Hiring Focus
                  </h4>
                  <p className="leading-relaxed text-ink">{modalCompany.hiringFocus}</p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-surface">
                  <h4 className="font-bold text-ink text-xs uppercase tracking-wider text-accent mb-1">
                    Best Preparation Strategy
                  </h4>
                  <p className="leading-relaxed text-ink font-semibold">{modalCompany.bestPreparation}</p>
                </div>
              </div>

              {/* Entry Level & Career Growth */}
              <div className="rounded-xl border border-border p-4 bg-surface space-y-2">
                <div>
                  <span className="font-bold text-ink">Entry-Level Programs: </span>
                  <span className="text-ink-muted">{modalCompany.entryLevelOpportunities}</span>
                </div>
                <div>
                  <span className="font-bold text-ink">Career Growth & Mobility: </span>
                  <span className="text-ink-muted">{modalCompany.careerGrowth}</span>
                </div>
                <div>
                  <span className="font-bold text-ink">Learning Opportunities: </span>
                  <span className="text-ink-muted">{modalCompany.learningOpportunities}</span>
                </div>
              </div>

              {/* Recommended Student Preparation Steps */}
              <div className="rounded-xl border border-border p-4 bg-surface">
                <h4 className="font-bold text-ink text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                  Recommended Student Preparation Steps:
                </h4>
                <ul className="space-y-1.5">
                  {modalCompany.recommendedStudentPrep.map((step, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample Bridge Projects */}
              <div className="rounded-xl border border-border p-4 bg-surface">
                <h4 className="font-bold text-ink text-xs uppercase tracking-wider text-accent mb-2">
                  Recommended Bridge Projects:
                </h4>
                <div className="space-y-2.5">
                  {modalCompany.sampleProjects.map((p, i) => (
                    <div key={i} className="rounded-lg border border-border p-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">{p.title}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-ink-muted">{p.description}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {p.skillsTargeted.map((s) => (
                          <span key={s} className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  setModalCompany(null);
                  setActiveTab("analyzer");
                }}
                className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity"
              >
                <Target className="h-3.5 w-3.5" />
                Analyze My Gap for {modalCompany.name}
              </button>
              <button
                onClick={() => setModalCompany(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
