import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { PlacementOutcomeAnalyticsView } from "@/components/institution/placement-outcome-analytics-view";
import { getPlacementOutcomeIntelligence } from "@/lib/api/institution";

export default async function PlacementOutcomesPage() {
  const outcomeData = await getPlacementOutcomeIntelligence();

  return (
    <DashboardShell title="Placement Outcomes & Performance">
      <InstitutionBreadcrumb />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-ink">
          Institutional Placement Performance &amp; Outcome Analytics
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Comprehensive recruitment funnel conversion, readiness-outcome correlation, and historical placement progression.
        </p>
      </div>

      <PlacementOutcomeAnalyticsView data={outcomeData} />
    </DashboardShell>
  );
}
