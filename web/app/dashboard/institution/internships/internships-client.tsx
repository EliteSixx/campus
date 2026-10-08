"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { PipelineFunnel } from "@/components/institution/pipeline-funnel";
import { InternshipTable } from "@/components/institution/internship-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { internshipRecords, placementTrendData } from "@/data/institution/mock-internships";
import { dashboardOverview } from "@/data/institution/mock-overview";
import type { InstitutionalPlacementOutcomeIntelligence } from "@/data/institution/types";
import { PlacementOutcomeAnalyticsView } from "@/components/institution/placement-outcome-analytics-view";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { BarChart3, Layers, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface InternshipsClientProps {
  outcomeData: InstitutionalPlacementOutcomeIntelligence;
}

export function InternshipsClient({ outcomeData }: InternshipsClientProps) {
  const [activeTab, setActiveTab] = useState<"outcomes" | "records">("outcomes");
  const pipeline = dashboardOverview.internshipPipeline;

  return (
    <DashboardShell title="Internships & Placement Outcomes">
      <InstitutionBreadcrumb />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">
            Placement Performance &amp; Outcome Analytics
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Institutional decision-support for recruitment funnel conversion, readiness-outcome correlation, and historical placement trends.
          </p>
        </div>

        {/* View Switcher: Outcomes & Funnel Analytics vs Student Records */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab("outcomes")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "outcomes"
                ? "bg-accent text-white shadow-xs"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Outcome &amp; Funnel Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("records")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "records"
                ? "bg-accent text-white shadow-xs"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Pipeline &amp; Records</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: Outcome Analytics & Funnel Intelligence ─── */}
      {activeTab === "outcomes" && (
        <PlacementOutcomeAnalyticsView data={outcomeData} />
      )}

      {/* ─── TAB 2: Internship Pipeline & Student Records (Existing View) ─── */}
      {activeTab === "records" && (
        <div className="space-y-6">
          {/* Pipeline + Trend */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Application Pipeline</CardTitle>
                  <CardDescription>Current status distribution across all applications</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <PipelineFunnel data={pipeline} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Monthly Trend</CardTitle>
                  <CardDescription>Placements and internships month over month</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={placementTrendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgb(var(--ink-muted))" }} axisLine={{ stroke: "rgb(var(--border))" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "rgb(var(--ink-muted))" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      contentStyle={{
                        background: "rgb(var(--surface))",
                        border: "1px solid rgb(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="placements" name="Placements" stroke="rgb(var(--accent))" strokeWidth={2.5} dot={{ r: 3, fill: "rgb(var(--accent))" }} />
                    <Line type="monotone" dataKey="internships" name="Internships" stroke="rgb(var(--success))" strokeWidth={2} dot={{ r: 3, fill: "rgb(var(--success))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Full Records Table */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>All Internship &amp; Placement Records</CardTitle>
                <CardDescription>Search, filter, and sort individual student placement offers</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <InternshipTable data={internshipRecords} />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
