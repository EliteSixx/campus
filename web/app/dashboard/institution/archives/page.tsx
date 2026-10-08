import { getAccreditationEvidence, getInstitutionalAuditReport } from "@/lib/api/institution";
import { ArchivesClient } from "./archives-client";

export default async function HistoricalArchivesPage() {
  const categories = await getAccreditationEvidence();
  const report = await getInstitutionalAuditReport();

  return <ArchivesClient initialCategories={categories} initialReport={report} />;
}
