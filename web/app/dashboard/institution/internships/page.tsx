import { getPlacementOutcomeIntelligence } from "@/lib/api/institution";
import { InternshipsClient } from "./internships-client";

export default async function InternshipsPage() {
  const outcomeData = await getPlacementOutcomeIntelligence();

  return <InternshipsClient outcomeData={outcomeData} />;
}
