import { DashboardShell } from "@/components/shared/dashboard-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users2, Gauge, TrendingUp } from "lucide-react";
import { getIndustrySkillDemand } from "@/lib/api/analytics";
import { getAllStudents } from "@/lib/api/students";
import { MarketInsightsChart } from "@/components/shared/market-insights-chart";
import { CandidateTable } from "./candidate-table";
import { JobPostedBanner } from "@/components/shared/job-posted-banner";

export default async function IndustryDashboardPage() {
  const analytics = await getIndustrySkillDemand();
  const students = await getAllStudents();

  return (
    <DashboardShell title="Recruiter Dashboard">
      <JobPostedBanner />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink">Recruiter overview</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Skill intelligence across candidates applying to your open roles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Active Opportunities" value={`${analytics.activeOpportunities}`} icon={Briefcase} />
        <MetricCard label="Total Applicants" value={`${analytics.totalApplicants}`} icon={Users2} />
        <MetricCard label="Average Candidate Match" value={`${analytics.averageMatch}%`} icon={Gauge} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Top skill demand</CardTitle>
              <CardDescription>Most requested across your listings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analytics.topSkillDemand.map((s) => (
              <Badge key={s.skill} tone="accent">
                {s.skill} · +{s.trend}%
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-ink-faint" />
              <div>
                <CardTitle>Market skill insights</CardTitle>
                <CardDescription>Demand growth over the last quarter</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MarketInsightsChart data={analytics.marketInsights} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Candidate intelligence</CardTitle>
            <CardDescription>Ranked by skill readiness against your open roles</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <CandidateTable students={students} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
