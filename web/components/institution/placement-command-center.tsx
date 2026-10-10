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
  type ReadinessResponse,
  type PredictPlacementResponse,
} from "@/lib/ai/client";

// Baseline evaluation date for BPUT Hackathon mid-evaluation (October 2026)
const HACKATHON_EVAL_DATE = "2026-10-13";

export function PlacementCommandCenter() {
  const [readinessMap, setReadinessMap] = useState<Record<string, ReadinessResponse>>({});
  const [readinessStatus, setReadinessStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [riskMap, setRiskMap] = useState<Record<string, PredictPlacementResponse>>({});
  const [riskStatus, setRiskStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [retryTrigger, setRetryTrigger] = useState(0);

  // 1. Total Students: Count of registered student profiles in demo seed dataset
  const totalStudents = demoStudents.length;

  // 3. Active Drives: Defensible calculation using existing DemoPlacementDrive schema.
  // The schema has no explicit "status" enum; we calculate active drives as scheduled drives
  // whose dates are upcoming/on or after the hackathon evaluation baseline (2026-10-13).
  const activeDrivesCount = useMemo(() => {
    return demoPlacementDrives.filter((d) => d.date >= HACKATHON_EVAL_DATE).length;
  }, []);

  // 4. Shortlisted Students: Count of unique students with application status SHORTLISTED or OFFERED
  const shortlistedCount = useMemo(() => {
    const shortlistedStudentIds = new Set<string>();
    for (const app of demoApplications) {
      if (app.status === "SHORTLISTED" || app.status === "OFFERED") {
        shortlistedStudentIds.add(app.student_id);
      }
    }
    return shortlistedStudentIds.size;
  }, []);

  // 5. Recorded Offers: Exact count of recorded offer letters in the demo dataset
  const recordedOffersCount = demoOffers.length;

  // 6. Confirmed Placed Students:
  // Neither DemoOffer nor DemoApplication contains an explicit "ACCEPTED" or "PLACED" status.
  // Furthermore, document_checklist shows pending onboarding documents.
  // Rather than fabricating a confirmed placement, we honestly report confirmed placements as 0 / unconfirmed.
  const confirmedPlacedCount = 0;

  // Fetch AI Readiness and Placement Risk from typed AI client
  useEffect(() => {
    let cancelled = false;

    setReadinessStatus("loading");
    setRiskStatus("loading");

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

    // 5. & 7. Risk model evaluation:
    // Only student ST104 has a recorded placement-activity record in demo seed data.
    // The service requires activity history to predict placement risk; omitting it would invent zeros.
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

  // 2. Placement Ready:
  // Verified from ai/app/services/readiness_service.py (_level_for: score >= 70) and ai/app/schemas.py:
  // ReadinessLevel enum values are: NOT_READY (<50), DEVELOPING (50-69), READY (70-84), HIGHLY_EMPLOYABLE (85-100).
  // "READY or above" strictly includes READY and HIGHLY_EMPLOYABLE.
  const placementReadyCount = useMemo(() => {
    if (readinessStatus !== "success") return null;
    return Object.values(readinessMap).filter(
      (r) => r.level === "READY" || r.level === "HIGHLY_EMPLOYABLE",
    ).length;
  }, [readinessMap, readinessStatus]);

  // 7. At Risk:
  // Evaluates students with available activity data (ST104) flagged as HIGH or MEDIUM risk.
  const atRiskCount = useMemo(() => {
    if (riskStatus !== "success") return null;
    return Object.values(riskMap).filter((r) => r.risk === "HIGH" || r.risk === "MEDIUM").length;
  }, [riskMap, riskStatus]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-ink">Placement Command Center Tiles</h3>
            <Badge tone="cyan" className="text-[10px]">
              Live Monorepo Feed
            </Badge>
          </div>
          <p className="text-xs text-ink-muted">
            Seven real-time operational metrics calculated directly from demo datasets and the AI client.
          </p>
        </div>

        {(readinessStatus === "error" || riskStatus === "error") && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <ServerOff className="h-3.5 w-3.5" /> AI service offline (port 8000)
            </span>
            <button
              onClick={() => setRetryTrigger((n) => n + 1)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-ink hover:bg-surface-raised transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Retry AI
            </button>
          </div>
        )}
      </div>

      {/* Grid of the 7 Command Center Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {/* 1. Total Students */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Total Students</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">{totalStudents}</p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">Cohort ST001–ST010</p>
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
              {readinessStatus === "loading" ? (
                <span className="text-sm font-normal text-ink-muted animate-pulse">Scoring…</span>
              ) : readinessStatus === "error" ? (
                <span className="text-xs font-semibold text-amber-500">AI Unavailable</span>
              ) : (
                placementReadyCount ?? "—"
              )}
            </p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">Level ≥ READY (READY / HIGHLY_EMP)</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500/40" />
        </Card>

        {/* 3. Active Drives */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Active Drives</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/10 text-sky-500">
                <Briefcase className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">{activeDrivesCount}</p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1" title="Derived from upcoming scheduled dates (Oct 2026); demo schema lacks status field">
            Upcoming scheduled dates (Oct 2026)
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
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">{shortlistedCount}</p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1">Unique applicants shortlisted</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500/40" />
        </Card>

        {/* 5. Recorded Offers */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Recorded Offers</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10 text-teal-500">
                <FileCheck2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">{recordedOffersCount}</p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1" title="Count of verified offer records in demo dataset (OFFER-ACME-ST001)">
            1 offer letter issued (Acme Tech)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500/40" />
        </Card>

        {/* 6. Confirmed Placed */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Confirmed Placed</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
                <GraduationCap className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">{confirmedPlacedCount}</p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1" title="Unconfirmed: DemoOffer schema lacks acceptance confirmation status; documents pending">
            Unconfirmed (offer acceptance pending)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500/40" />
        </Card>

        {/* 7. At Risk */}
        <Card className="p-3.5 relative overflow-hidden flex flex-col justify-between border-border bg-surface">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">At Risk</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-500">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-ink tabular">
              {riskStatus === "loading" ? (
                <span className="text-sm font-normal text-ink-muted animate-pulse">Evaluating…</span>
              ) : riskStatus === "error" ? (
                <span className="text-xs font-semibold text-amber-500">AI Unavailable</span>
              ) : (
                atRiskCount ?? "—"
              )}
            </p>
          </div>
          <p className="text-[10px] text-ink-faint mt-1" title="1 student evaluated with activity history (ST104); remaining 9 lack activity records">
            1 of 1 evaluated (9 lack activity)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500/40" />
        </Card>
      </div>
    </div>
  );
}
