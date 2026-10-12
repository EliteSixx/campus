import type { components } from "@/lib/ai/types";
import { Badge } from "@/components/ui/badge";

type FitLevel = components["schemas"]["ReadinessLevel"];

const FIT_PRESENTATION: Record<FitLevel, { label: string; tone: "danger" | "warning" | "success" | "accent" }> = {
  NOT_READY: { label: "Not Ready", tone: "danger" },
  DEVELOPING: { label: "Developing", tone: "warning" },
  READY: { label: "Ready", tone: "success" },
  HIGHLY_EMPLOYABLE: { label: "Highly Employable", tone: "accent" },
};

export function FitBadge({ fitLevel }: { fitLevel: FitLevel }) {
  const presentation = FIT_PRESENTATION[fitLevel];
  return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
}
