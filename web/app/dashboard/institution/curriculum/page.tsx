"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { SubjectAlignmentCard } from "@/components/institution/subject-alignment-card";
import { SubjectAlignmentDrawer } from "@/components/institution/subject-alignment-drawer";
import { getCurriculumAlignments } from "@/lib/api/institution";
import type { SubjectCurriculumAlignment, AlignmentStatus } from "@/data/institution/types";
import { BookOpen, UserCheck, Sparkles, GraduationCap, AlertTriangle, CheckCircle2, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CurriculumAlignmentPage() {
  const [subjects, setSubjects] = useState<SubjectCurriculumAlignment[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState<SubjectCurriculumAlignment | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getCurriculumAlignments();
      setSubjects(data);
    }
    load();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.primaryFacultyName.toLowerCase().includes(search.toLowerCase()) ||
        s.topics.some((t) => t.name.toLowerCase().includes(search.toLowerCase()));

      const matchesDept = deptFilter === "all" || s.deptId === deptFilter;
      const matchesStatus = statusFilter === "all" || s.alignmentStatus === statusFilter;
      const matchesFaculty = facultyFilter === "all" || s.primaryFacultyId === facultyFilter;

      return matchesSearch && matchesDept && matchesStatus && matchesFaculty;
    });
  }, [subjects, search, deptFilter, statusFilter, facultyFilter]);

  // Aggregate Metrics
  const totalSubjects = subjects.length;
  const avgAlignment =
    totalSubjects > 0
      ? Math.round(subjects.reduce((acc, s) => acc + s.alignmentScore, 0) / totalSubjects)
      : 0;
  const totalFoundational = subjects.reduce((acc, s) => acc + s.foundationalCount, 0);
  const totalIndustry = subjects.reduce((acc, s) => acc + s.industryRelevantCount + s.industryAdvancedCount, 0);
  const totalAdditions = subjects.reduce((acc, s) => acc + s.missingRecommendedCount, 0);

  // Unique faculties for filter dropdown
  const facultyList = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((s) => map.set(s.primaryFacultyId, s.primaryFacultyName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [subjects]);

  return (
    <DashboardShell title="Curriculum Alignment">
      <InstitutionBreadcrumb />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Curriculum–Industry Alignment Intelligence</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Analyze faculty course syllabi for industry relevance, prerequisite foundational topics, and recommended curriculum enhancements.
          </p>
        </div>
      </div>

      {/* Institutional Curriculum Metric Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <BookOpen className="h-3 w-3 text-accent" /> Subjects Audited
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{totalSubjects}</p>
          <p className="text-[10px] text-ink-faint">across departments</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-500" /> Avg Alignment
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-500 tabular">{avgAlignment}%</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">industry standard</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <GraduationCap className="h-3 w-3 text-indigo-500" /> Foundational Topics
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-indigo-500 tabular">{totalFoundational}</p>
          <p className="text-[10px] text-ink-faint">essential core basis</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-sky-500" /> Industry Topics
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-sky-500 tabular">{totalIndustry}</p>
          <p className="text-[10px] text-ink-faint">actively covered</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" /> Topic Additions
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-amber-500 tabular">{totalAdditions}</p>
          <p className="text-[10px] text-ink-faint">high/med priority</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject code, title, topic, or faculty…"
              className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Departments</option>
              <option value="cse">Computer Science (CSE)</option>
              <option value="it">Information Tech (IT)</option>
              <option value="me">Mechanical (ME)</option>
              <option value="ece">Electronics (ECE)</option>
              <option value="ds">Data Science &amp; AI (DS)</option>
            </select>

            {/* Alignment Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Alignment Tiers</option>
              <option value="strong">Strong (≥75%)</option>
              <option value="moderate">Moderate (55%–74%)</option>
              <option value="needs-improvement">Needs Improvement (&lt;55%)</option>
            </select>

            {/* Faculty Filter */}
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Instructors</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subject Alignment Cards Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-ink-faint mb-2" />
          <h3 className="text-sm font-semibold text-ink">No course syllabi found</h3>
          <p className="mt-1 text-xs text-ink-muted">
            Try adjusting your search criteria or department filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => (
            <SubjectAlignmentCard key={subject.id} subject={subject} onSelect={setSelectedSubject} />
          ))}
        </div>
      )}

      {/* Slide-out Syllabus Inspection Drawer */}
      <SubjectAlignmentDrawer subject={selectedSubject} onClose={() => setSelectedSubject(null)} />
    </DashboardShell>
  );
}
