"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { DriveCard } from "@/components/institution/drive-card";
import { DriveDetailModal } from "@/components/institution/drive-detail-modal";
import { SearchFilterBar } from "@/components/institution/search-filter-bar";
import { getPlacementDrives } from "@/lib/api/institution";
import type { CampusPlacementDrive, DriveStatus, DriveTier } from "@/data/institution/types";
import { Briefcase, Award, Users, CheckCircle2, Calendar, Filter, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlacementDrivesPage() {
  const [drives, setDrives] = useState<CampusPlacementDrive[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [selectedDrive, setSelectedDrive] = useState<CampusPlacementDrive | null>(null);

  useEffect(() => {
    async function load() {
      const fetched = await getPlacementDrives();
      setDrives(fetched);
    }
    load();
  }, []);

  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const matchesSearch =
        search === "" ||
        d.companyName.toLowerCase().includes(search.toLowerCase()) ||
        d.role.toLowerCase().includes(search.toLowerCase()) ||
        d.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const matchesTier = tierFilter === "all" || d.tier === tierFilter;
      const matchesDept = deptFilter === "all" || d.eligibleDeptIds.includes(deptFilter);

      return matchesSearch && matchesStatus && matchesTier && matchesDept;
    });
  }, [drives, search, statusFilter, tierFilter, deptFilter]);

  // Aggregate Metrics
  const activeDrivesCount = drives.filter((d) => d.status === "assessment-ongoing" || d.status === "interviews-ongoing").length;
  const totalRegistered = drives.reduce((acc, d) => acc + d.registeredCount, 0);
  const totalShortlisted = drives.reduce((acc, d) => acc + d.shortlistedCount, 0);
  const totalOffers = drives.reduce((acc, d) => acc + d.offersReleased, 0);
  const avgShortlistConversion =
    totalRegistered > 0 ? Math.round((totalShortlisted / totalRegistered) * 100) : 0;

  return (
    <DashboardShell title="Placement Drives">
      <InstitutionBreadcrumb />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Campus Placement Drive Orchestration</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Track active interview rounds, application-to-shortlist velocity, and corporate recruitment pipelines.
          </p>
        </div>
      </div>

      {/* Aggregate Metric Highlights */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Briefcase className="h-3 w-3 text-accent" /> Active Drives
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-accent tabular">{activeDrivesCount}</p>
          <p className="text-[10px] text-ink-faint">in evaluation</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Users className="h-3 w-3 text-ink-muted" /> Total Registrations
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{totalRegistered}</p>
          <p className="text-[10px] text-ink-faint">across all drives</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <Award className="h-3 w-3 text-sky-500" /> Shortlisted Pool
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-sky-500 tabular">{totalShortlisted}</p>
          <p className="text-[10px] text-ink-faint">cleared assessment</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Offers Released
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-500 tabular">{totalOffers}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">confirmed hiring</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5 text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Conversion Rate</p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink tabular">{avgShortlistConversion}%</p>
          <p className="text-[10px] text-ink-faint">app-to-shortlist</p>
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
              placeholder="Search by company, role, or city…"
              className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Drive Stages</option>
              <option value="assessment-ongoing">Assessment In Progress</option>
              <option value="interviews-ongoing">Interviews Ongoing</option>
              <option value="registration-open">Registration Open</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Salary Tiers</option>
              <option value="super-dream">Super Dream (&gt;15 LPA)</option>
              <option value="dream">Dream (8–14 LPA)</option>
              <option value="core-it">Core &amp; IT (5–7 LPA)</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Departments</option>
              <option value="cse">Computer Science (CSE)</option>
              <option value="it">Information Tech (IT)</option>
              <option value="ds">Data Science &amp; AI (DS)</option>
              <option value="ece">Electronics (ECE)</option>
              <option value="me">Mechanical (ME)</option>
              <option value="ee">Electrical (EE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drive Cards Grid */}
      {filteredDrives.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-ink-faint mb-2" />
          <h3 className="text-sm font-semibold text-ink">No placement drives found</h3>
          <p className="mt-1 text-xs text-ink-muted">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrives.map((drive) => (
            <DriveCard key={drive.id} drive={drive} onSelect={setSelectedDrive} />
          ))}
        </div>
      )}

      {/* Detail Slide-out Drawer */}
      <DriveDetailModal drive={selectedDrive} onClose={() => setSelectedDrive(null)} />
    </DashboardShell>
  );
}
