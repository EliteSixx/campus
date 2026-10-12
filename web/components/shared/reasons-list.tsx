import { AlertTriangle, Check, X } from "lucide-react";
import type { components } from "@/lib/ai/types";

type MatchReason = components["schemas"]["Reason"];

const REASON_PRESENTATION = {
  PASS: { Icon: Check, color: "text-success", label: "Passed" },
  WARN: { Icon: AlertTriangle, color: "text-warning", label: "Warning" },
  FAIL: { Icon: X, color: "text-danger", label: "Failed" },
} as const;

export function ReasonsList({ reasons, className }: { reasons: MatchReason[]; className?: string }) {
  return (
    <ul className={className}>
      {reasons.map((reason, index) => {
        const { Icon, color, label } = REASON_PRESENTATION[reason.type];
        return (
          <li className="flex items-start gap-2 text-sm text-ink" key={`${reason.type}-${index}`}>
            <Icon aria-label={label} className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} aria-hidden="false" />
            <span>{reason.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
