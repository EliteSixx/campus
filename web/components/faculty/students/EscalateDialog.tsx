"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { RISK_TONE, studentLabel, type AtRiskRow } from "./at-risk-data";
import { DEMO_MENTORS, type DemoMentor } from "./escalation-mentors";
import { escalationEligibility } from "./escalations";
import { plural } from "./utils";

// The small "Escalate to mentor" form, as a native modal <dialog>. Mount it to
// open it; it calls onClose after it has closed (Cancel, Escape, a click on the
// backdrop, or a saved escalation).

export function EscalateDialog({
  row,
  onSubmit,
  onClose,
}: {
  row: AtRiskRow;
  // Returns an error message, or null when the escalation was saved.
  onSubmit: (mentor: DemoMentor) => string | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mentorId, setMentorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const selectId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const { student, prediction } = row;
  const eligibility = escalationEligibility(prediction);
  const mentor = DEMO_MENTORS.find((m) => m.mentor_id === mentorId) ?? null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!mentor) return;
    const failure = onSubmit(mentor);
    if (failure) {
      setError(failure);
      return;
    }
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // The dialog has no padding, so a click on the element itself is a
        // click on the backdrop.
        if (e.target === dialogRef.current) dialogRef.current.close();
      }}
      className="w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-0 text-ink shadow-popover backdrop:bg-black/50"
    >
      <form onSubmit={submit} className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id={titleId} className="text-sm font-bold tracking-tight text-ink">
              Escalate {student.student_id} to a mentor
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">{studentLabel(student)}</p>
          </div>
          {eligibility.eligible && (
            <Badge tone={RISK_TONE[eligibility.risk]}>{eligibility.risk} risk</Badge>
          )}
        </div>

        {eligibility.eligible ? (
          <p className="text-xs text-ink-muted">
            The risk level, {plural(eligibility.reasons.length, "reason")} and{" "}
            {plural(eligibility.interventions.length, "intervention")} are saved with the
            escalation exactly as the AI service returned them.
          </p>
        ) : (
          <p className="text-xs font-semibold text-danger" role="alert">
            Escalation unavailable. {eligibility.reason}.
          </p>
        )}

        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={selectId} className="text-xs font-semibold text-ink">
              Assigned mentor
            </label>
            <Badge tone="cyan" title="These four mentors are made up for the demo">
              <FlaskConical className="h-3 w-3" aria-hidden="true" />
              Demo mentor list
            </Badge>
          </div>
          <Select
            id={selectId}
            value={mentorId}
            onChange={(e) => {
              setMentorId(e.target.value);
              setError(null);
            }}
            required
          >
            <option value="" disabled>
              Choose a mentor
            </option>
            {DEMO_MENTORS.map((m) => (
              <option key={m.mentor_id} value={m.mentor_id}>
                {m.name} ({m.department})
              </option>
            ))}
          </Select>
        </div>

        {error && (
          <p className="text-xs font-semibold text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!mentor || !eligibility.eligible}>
            Escalate
          </Button>
        </div>
      </form>
    </dialog>
  );
}
