import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Clash } from "@/lib/api/timetable";
import { slotLabel } from "./utils";

// Two overlapping slots in the same room are a double booking; two overlapping
// slots in different rooms would need you in both at once. lib/api/timetable.ts
// does the detection, this only reports it.

export function ClashCheckCard({ clashes }: { clashes: Clash[] }) {
  if (clashes.length === 0) {
    return (
      <Card className="h-full border-success/40 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
          <h3 className="text-sm font-bold text-success">No clashes found</h3>
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">
          No period has you in two places at once, and no room is booked twice
          over.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full border-danger/40 p-5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
        <h3 className="text-sm font-bold text-danger">
          {clashes.length} clash{clashes.length === 1 ? "" : "es"} found
        </h3>
      </div>

      <div className="mt-3 space-y-2">
        {clashes.map((clash) => (
          <div
            key={clash.id}
            className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5"
          >
            <p className="text-xs font-semibold text-danger">
              {clash.kind === "room"
                ? `Room ${clash.a.room} booked twice`
                : "Two classes at the same time"}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {clash.day},{" "}
              <span className="font-mono tabular text-ink">
                {clash.start}–{clash.end}
              </span>
              : <span className="text-ink">{slotLabel(clash.a)}</span> (
              {clash.a.room}) overlaps{" "}
              <span className="text-ink">{slotLabel(clash.b)}</span> (
              {clash.b.room}).
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
