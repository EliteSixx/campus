"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Award,
  Briefcase,
  UserCheck,
  FileCheck2,
  GraduationCap,
  AlertTriangle,
  RefreshCw,
  ServerOff,
  Info,
  Layers,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { demoStudents } from "@/data/demo/students";
import { demoPlacementDrives } from "@/data/demo/drives";
import { demoApplications } from "@/data/demo/applications";
import { demoOffers } from "@/data/demo/offers";
import { demoPlacementActivity } from "@/data/demo/placement-activity";
import type { DemoStudent } from "@/data/demo/types";
import {
  readiness,
  predictPlacement,
  analyticsSummary,
  type ReadinessResponse,
  type PredictPlacementResponse,
  type AnalyticsSummary,
} from "@/lib/ai/client";

// Baseline evaluation date for BPUT Hackathon mid-evaluation (October 2026)
const HACKATHON_EVAL_DATE = "2026-10-13";

// Standard canonical fallback data source text from ai/app/services/analytics_service.py
const DEFAULT_DATA_SOURCE =
  "Computed from the synthetic placement CSVs generated with seed 42. jobs_with_applications counts distinct jobs with applications. The synthetic data has no pending offer state; pending offers are tracked by the offer lifecycle screens. offers_not_accepted counts unaccepted offer records. offers_accepted counts offers while placed counts unique students, and a student can accept more than one offer.";

export function PlacementCommandCenter() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsStatus, setAnalyticsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [readinessMap, setReadinessMap] = useState<Record<string, ReadinessResponse>>({});
  const [readinessStatus, setReadinessStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [riskMap, setRiskMap] = useState<Record<string, PredictPlacementResponse>>({});
  const [riskStatus, setRiskStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Active view toggle: 'synthetic' (Analytics endpoint: 1500 students) vs 'demo' (Demo seed: 10 students)
  const [cohortView, setCohortView] = useState<"synthetic" | "demo">("synthetic");

  // 1. Total Students: Demo dataset count
  const demoTotalStudents = demoStudents.length;

  // 3. Demo Drives Count: 3 drives in web/data/demo/drives.ts
  const demoDrivesCount = demoPlacementDrives.length;
  const demoUpcomingDrivesCount = useMemo(() => {
    return demoPlacementDrives.filter((d) => d.date >= HACKATHON_EVAL_DATE).length;
  }, []);

  // 4. Shortlisted Students in demo seed
  const demoShortlistedCount = useMemo(() => {
    const shortlistedStudentIds = new Set<string>();
    for (const app of demoApplications) {
      if (app.status === "SHORTLISTED" || app.status === "OFFERED") {
        shortlistedStudentIds.add(app.student_id);
      }
    }
    return shortlistedStudentIds.size;
  }, []);

  // 5. Demo Offers in web/data/demo/offers.ts (1 pending offer with onboarding checklist)
  const demoPendingOffersCount = demoOffers.length;

  // 6. Demo Confirmed Placed Students (unconfirmed in demo seed)
  const demoConfirmedPlacedCount = 0;

  // Fetch from Analytics endpoint and AI client
  useEffect(() => {
    let cancelled = false;

    setAnalyticsStatus("loading");
    setReadinessStatus("loading");
    setRiskStatus("loading");

    // Fetch /ai/analytics/summary (T3b analytics endpoint)
    analyticsSummary()
      .then((data) => {
        if (cancelled) return;
        setAnalytics(data);
        setAnalyticsStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setAnalyticsStatus("error");
      });

    // Fetch readiness for all demo students
    Promise.allSettled(
      demoStudents.map((student) =>
        readiness({ student }).then((res) => ({ studentId: student.student_id, res })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, ReadinessResponse> = {};
      let hasSuccess = false;

      for (const r of results) {
        if (r.status === "fulfilled") {
          map[r.value.studentId] = r.value.res;
          hasSuccess = true;
        }
      }

      setReadinessMap(map);
      setReadinessStatus(hasSuccess ? "success" : "error");
    });

    // Fetch placement risk prediction
    const activityStudents: { student: DemoStudent; activity: typeof demoPlacementActivity }[] = [];
    const studentST104 = demoStudents.find((s) => s.student_id === demoPlacementActivity.student_id);
    if (studentST104) {
      activityStudents.push({
        student: studentST104,
        activity: demoPlacementActivity,
      });
    }

    if (activityStudents.length === 0) {
      setRiskStatus("success");
      return;
    }

    Promise.allSettled(
      activityStudents.map(({ student, activity }) =>
        predictPlacement({ student, activity }).then((res) => ({
          studentId: student.student_id,
          res,
        })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const rMap: Record<string, PredictPlacementResponse> = {};
      let hasSuccess = false;

      for (const r of results) {
        if (r.status === "fulfilled") {
          rMap[r.value.studentId] = r.value.res;
          hasSuccess = true;
        }
      }

      setRiskMap(rMap);
      setRiskStatus(hasSuccess ? "success" : "error");
    });

    return () => {
      cancelled = true;
    };
  }, [retryTrigger]);

  // Demo Placement Ready Count (score >= 70: READY or HIGHLY_EMPLOYABLE)
  const demoPlacementReadyCount = useMemo(() => {
    if (readinessStatus !== "success") return null;
    return Object.values(readinessMap).filter(
      (r) => r.level === "READY" || r.level === "HIGHLY_EMPLOYABLE",
    ).length;
  }, [readinessMap, readinessStatus]);

  // Demo At Risk Count (ST104 evaluated)
  const demoAtRiskCount = useMemo(() => {
    if (riskStatus !== "success") return null;
    return Object.values(riskMap).filter((r) => r.risk === "HIGH" || r.risk === "MEDIUM").length;
  }, [riskMap, riskStatus]);

  // Active data source text
  const dataSourceText = analytics?.data_source ?? DEFAULT_DATA_SOURCE;

  const isSynthetic = cohortView === "synthetic";

  // Display metrics depending on active view
  const displayTotalStudents = isSynthetic
    ? analytics?.totals.students ?? 1500
    : demoTotalStudents;

  const displayPlacementReady = isSynthetic
    ? analytics?.totals.placement_ready ?? 1036
    : demoPlacementReadyCount;

  // totals.jobs_with_applications replaces "active drives" (it counts jobs with applications, not drives; for drives use the 3 in web/data/demo/drives.ts)
  const displayJobsWithApplications = isSynthetic
    ? analytics?.totals.jobs_with_applications ?? 60
    : demoUpcomingDrivesCount;

  const displayShortlisted = isSynthetic
    ? analytics?.totals.shortlisted ?? 1560
    : demoShortlistedCount;

  // totals.offers_not_accepted replaces "pending offers" (the synthetic data has no pending state; pending offers come from the demo offers in web/data/demo/offers.ts)
  const displayOffersNotAccepted = isSynthetic
    ? analytics?.totals.offers_not_accepted ?? 48
    : demoPendingOffersCount;

  // totals.offers_accepted counts offers, while totals.placed counts students, so they can differ
  const displayOffersAccepted = isSynthetic
    ? analytics?.totals.offers_accepted ?? 480
    : 0;

  const displayPlaced = isSynthetic
    ? analytics?.totals.placed ?? 400
    : demoConfirmedPlacedCount;

  // At risk counts
  const displayAtRisk = isSynthetic
    ? analytics?.at_risk
      ? analytics.at_risk.high + analytics.at_risk.medium
      : 242
    : demoAtRiskCount;

  const hasOfflineService =
    analyticsStatus === "error" || readinessStatus === "error" || riskStatus === "error";

  return (
    <div className="space-y-4">
      {/* Top Header & Cohort Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-ink">Placement Command Center Tiles</h3>
            <Badge tone="cyan" className="text-[10px]">
              T3b Analytics Feed
            </Badge>
          </div>
          <p className="text-xs text-ink-muted">
            Operational intelligence powered by the analytics endpoint and conflict-aware scheduler.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cohort View Toggle */}
          <div className="inline-flex items-center rounded-lg border border-border bg-surface-raised/40 p-0.5 text-xs">
            <button
              onClick={() => setCohortView("synthetic")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                isSynthetic
                  ? "bg-surface shadow-xs text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Synthetic Cohort (1,500)
            </button>
            <button
              onClick={() => setCohortView("demo")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                !isSynthetic
                  ? "bg-surface shadow-xs text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Demo Dataset (10)
            </button>
          </div>

          {hasOfflineService && (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <ServerOff className="h-3.5 w-3.5" /> AI service offline
              </span>
              <button
                onClick={() => setRetryTrigger((n) => n + 1)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-ink hover:bg-surface-raised transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Synthetic Data Label Banner — Displays data_source text as the "Synthetic data" label */}
      <div className="flex items-start gap-2.5 rounded-xl border border-accent/25 bg-accent/5 p-3 text-xs">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent/20 text-accent font-bold text-[10px]">
          <Info className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="cyan" className="font-semibold text-[11px] px-2 py-0.5">
              Synthetic data
            </Badge>
          </div>
          <p className="text-[11px] leading-relaxed text-ink-muted">
            {dataSourceText}
          </p>
        </div>
      </div>

      {/* Grid of the Command Center Metrics (8 Core Operational Tiles) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {/* 1. Total Students */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Total Students</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {displayTotalStudents}
            </p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            {isSynthetic ? "Synthetic student cohort" : "Cohort ST001–ST010"}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/30" />
        </Card>

        {/* 2. Placement Ready */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Placement Ready</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                <Award className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {!isSynthetic && readinessStatus === "loading" ? (
                <span className="text-sm font-normal text-ink-muted animate-pulse">Scoring…</span>
              ) : (
                displayPlacementReady ?? "—"
              )}
            </p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1" title="Readiness level READY or HIGHLY_EMPLOYABLE (score >= 70)">
            Score ≥ 70 (READY / HIGHLY_EMP)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500/40" />
        </Card>

        {/* 3. Jobs with Applications (replaces "Active Drives") */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">
                {isSynthetic ? "Jobs with Applications" : "Active Drives"}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/10 text-sky-500">
                <Briefcase className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {displayJobsWithApplications}
            </p>
          </div>
          <p
            className="text-[10px] text-ink-faint mt-1"
            title={
              isSynthetic
                ? "totals.jobs_with_applications counts distinct jobs with applications, not drives. For drives, use the 3 in web/data/demo/drives.ts."
                : "3 scheduled drives in web/data/demo/drives.ts"
            }
          >
            {isSynthetic ? "Jobs with applications (drives: 3)" : "3 drives in demo data"}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500/40" />
        </Card>

        {/* 4. Shortlisted */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Shortlisted</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {displayShortlisted}
            </p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">
            {isSynthetic ? "1,560 shortlisted candidates" : "Unique demo shortlisted"}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500/40" />
        </Card>

        {/* 5. Offers Not Accepted (replaces "Pending Offers") */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">
                {isSynthetic ? "Offers Not Accepted" : "Pending Offers"}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {displayOffersNotAccepted}
            </p>
          </div>
          <p
            className="text-[10px] text-ink-faint mt-1"
            title={
              isSynthetic
                ? "totals.offers_not_accepted replaces 'pending offers'. The synthetic data has no pending state; pending offers come from demo offers in web/data/demo/offers.ts."
                : "1 demo pending offer in web/data/demo/offers.ts"
            }
          >
            {isSynthetic ? "No pending state; demo has 1" : "1 pending in demo offers"}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500/40" />
        </Card>

        {/* 6. Offers Accepted (counts offers) */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Offers Accepted</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10 text-teal-500">
                <FileCheck2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {displayOffersAccepted}
            </p>
          </div>
          <p
            className="text-[10px] text-ink-faint mt-1"
            title="totals.offers_accepted counts accepted offers (480), while totals.placed counts students (400), so they can differ."
          >
            Counts offers (differs from placed)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500/40" />
        </Card>

        {/* 7. Students Placed (counts unique students) */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Students Placed</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
                <GraduationCap className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {displayPlaced}
            </p>
          </div>
          <p
            className="text-[10px] text-ink-faint mt-1"
            title="totals.placed counts unique students placed (400). Differs from offers accepted (480) because a student can accept multiple offers."
          >
            {isSynthetic ? "Counts students (400 placed)" : "Unconfirmed in demo seed"}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500/40" />
        </Card>

        {/* 8. At Risk */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">At Risk</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-500">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {!isSynthetic && riskStatus === "loading" ? (
                <span className="text-sm font-normal text-ink-muted animate-pulse">Evaluating…</span>
              ) : (
                displayAtRisk ?? "—"
              )}
            </p>
          </div>
          <p
            className="text-[10px] text-ink-faint mt-1"
            title={
              isSynthetic && analytics?.at_risk
                ? `${analytics.at_risk.high} High, ${analytics.at_risk.medium} Medium risk students`
                : "Evaluated with activity records"
            }
          >
            {isSynthetic ? "71 High · 171 Med risk" : "1 of 1 evaluated (ST104)"}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500/40" />
        </Card>
      </div>

      {/* Semantic Differences Explainer Callout Card */}
      <div className="rounded-xl border border-border/80 bg-surface-raised/20 p-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-ink mb-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-accent" />
          <span>T3b Metric Field Definition Changes</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-ink-muted text-[11px]">
          <div className="rounded-lg border border-border/50 bg-surface/60 p-2">
            <span className="font-semibold text-ink block mb-0.5">
              1. totals.jobs_with_applications
            </span>
            <span>
              Replaces &quot;active drives&quot;. Counts distinct jobs receiving applications (60), not drives. For drives, use the 3 scheduled drives in{" "}
              <code className="text-[10px] bg-surface-raised px-1 py-0.5 rounded text-accent">
                web/data/demo/drives.ts
              </code>.
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface/60 p-2">
            <span className="font-semibold text-ink block mb-0.5">
              2. totals.offers_not_accepted
            </span>
            <span>
              Replaces &quot;pending offers&quot;. The synthetic dataset has no pending offer state (48 not accepted). Pending offers come from demo offers in{" "}
              <code className="text-[10px] bg-surface-raised px-1 py-0.5 rounded text-accent">
                web/data/demo/offers.ts
              </code>.
            </span>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface/60 p-2">
            <span className="font-semibold text-ink block mb-0.5">
              3. totals.offers_accepted vs totals.placed
            </span>
            <span>
              <code className="text-[10px] bg-surface-raised px-1 py-0.5 rounded text-ink">
                offers_accepted
              </code>{" "}
              counts total offers accepted (480), whereas{" "}
              <code className="text-[10px] bg-surface-raised px-1 py-0.5 rounded text-ink">
                placed
              </code>{" "}
              counts unique students (400), as students can accept multiple offers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
