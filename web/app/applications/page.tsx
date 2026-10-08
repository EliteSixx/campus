import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/shared/match-score";
import { getAllOpportunities } from "@/lib/api/opportunities";
import { getCompanyById } from "@/data/companies";
import { EmptyState } from "@/components/shared/state";
import { ClipboardList } from "lucide-react";

const applicationStatuses = [
  { status: "Under Review", tone: "warning" as const },
  { status: "Shortlisted", tone: "success" as const },
  { status: "Applied", tone: "neutral" as const },
];

export default async function ApplicationsPage() {
  const opportunities = await getAllOpportunities();
  // Simulate Rudy's 6 applications by taking a deterministic slice.
  const applied = opportunities.slice(0, 6).map((o, i) => ({
    ...o,
    status: applicationStatuses[i % applicationStatuses.length],
    appliedOn: `2026-0${(i % 6) + 3}-${10 + i}`,
    matchScore: 55 + ((i * 7) % 40),
  }));

  return (
    <DashboardShell title="Applications">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-ink">Your applications</h2>
        <p className="mt-0.5 text-sm text-ink-muted">Track the status of every role you&apos;ve applied to.</p>
      </div>

      {applied.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Opportunities you apply to will show up here."
        />
      ) : (
        <div className="space-y-3">
          {applied.map((a) => {
            const company = getCompanyById(a.companyId);
            return (
              <Card key={a.id} className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-raised text-xs font-semibold text-ink-muted">
                    {company?.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{a.title}</p>
                    <p className="text-xs text-ink-muted">
                      {company?.name} · Applied {a.appliedOn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MatchScore value={a.matchScore} size="sm" />
                  <Badge tone={a.status.tone}>{a.status.status}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
