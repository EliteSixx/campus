"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DisclosureSection } from "@/components/shared/disclosure-section";
import { RISK_TONE } from "./at-risk-data";
import { MAX_RESOLUTION_NOTE, openEscalations, resolvedEscalations } from "./escalations";
import type { ShownEscalation } from "./useEscalations";

// The mentor's escalation list: open ones with "Mark resolved", then a
// collapsed "Resolved" section. Risk shown here is the level the AI service
// returned when the student was escalated, not a fresh prediction.

export function OpenEscalations({
  escalations,
  loaded,
  studentLabels,
  onResolve,
}: {
  escalations: ShownEscalation[];
  loaded: boolean;
  // "CSE · 2027" by student id.
  studentLabels: Record<string, string>;
  // Returns an error message, or null when the escalation was resolved.
  onResolve: (id: string, note: string) => string | null;
}) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = openEscalations(escalations);
  const resolved = resolvedEscalations(escalations);

  function startResolving(id: string) {
    setResolvingId(id);
    setNote("");
    setError(null);
  }

  function stopResolving() {
    setResolvingId(null);
    setNote("");
    setError(null);
  }

  function submit(event: FormEvent, id: string) {
    event.preventDefault();
    const failure = onResolve(id, note);
    if (failure) {
      setError(failure);
      return;
    }
    stopResolving();
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Open escalations</CardTitle>
          <CardDescription>
            {loaded
              ? `${open.length} open · ${resolved.length} resolved. Saved in this browser only.`
              : "Saved in this browser only."}
          </CardDescription>
        </div>
        <Badge tone="neutral">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Local
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {!loaded ? (
          <div className="h-12 animate-pulse rounded-lg bg-surface-raised" aria-hidden="true" />
        ) : open.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <CheckCircle2 className="mb-2 h-7 w-7 text-ink-faint" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">No open escalations</p>
            <p className="mt-1 max-w-sm text-xs text-ink-muted">
              Nobody is waiting on a mentor right now. Use &quot;Escalate to mentor&quot; on a
              high or medium risk student when they need extra support.
            </p>
          </div>
        ) : (
          // `relative` keeps the screen-reader-only labels scrolling with the table
          // instead of widening the page.
          <div className="relative overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[34rem] table-fixed text-left text-sm xl:min-w-0">
              <colgroup>
                <col className="w-[5.5rem]" />
                <col className="w-[5.5rem]" />
                <col />
                <col className="w-[8.5rem]" />
                <col className="w-[7.5rem]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="py-2 pr-3 font-semibold">Student</th>
                  <th className="py-2 pr-3 font-semibold">Risk</th>
                  <th className="py-2 pr-3 font-semibold">Assigned mentor</th>
                  <th className="py-2 pr-3 font-semibold">Escalated</th>
                  <th className="py-2 font-semibold">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              {open.map((e) => {
                const resolving = e.id === resolvingId;
                const noteId = `resolution-note-${e.id}`;
                return (
                  <tbody key={e.id} className="border-b border-border/60 last:border-b-0">
                    <tr className="align-top">
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-ink">{e.studentId}</p>
                        {studentLabels[e.studentId] && (
                          <p className="text-[11px] text-ink-muted">{studentLabels[e.studentId]}</p>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge tone={RISK_TONE[e.risk]}>{e.risk}</Badge>
                      </td>
                      <td className="break-words py-3 pr-3 text-ink">{e.mentorName}</td>
                      <td className="py-3 pr-3 text-xs text-ink tabular">{e.createdWhen}</td>
                      <td className="py-3 text-right">
                        {!resolving && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => startResolving(e.id)}
                          >
                            Mark resolved
                            <span className="sr-only"> for {e.studentId}</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                    {resolving && (
                      <tr>
                        <td colSpan={5} className="pb-3">
                          <form
                            onSubmit={(event) => submit(event, e.id)}
                            className="rounded-lg border border-border bg-surface-raised/40 p-3"
                          >
                            <label htmlFor={noteId} className="text-xs font-semibold text-ink">
                              Resolution note for {e.studentId} (required)
                            </label>
                            <textarea
                              id={noteId}
                              rows={2}
                              maxLength={MAX_RESOLUTION_NOTE}
                              value={note}
                              onChange={(event) => setNote(event.target.value)}
                              autoFocus
                              placeholder="What was agreed or done, e.g. mock interview booked for Friday"
                              className="mt-1.5 w-full rounded-md border border-border bg-surface p-3 text-sm font-medium text-ink shadow-sm placeholder:text-ink-faint focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            />
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] text-ink-muted tabular" aria-live="polite">
                                {note.length}/{MAX_RESOLUTION_NOTE}
                              </span>
                              <div className="flex gap-2">
                                <Button type="button" size="sm" variant="ghost" onClick={stopResolving}>
                                  Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={note.trim() === ""}>
                                  Resolve
                                </Button>
                              </div>
                            </div>
                            {error && (
                              <p className="mt-2 text-xs font-semibold text-danger" role="alert">
                                {error}
                              </p>
                            )}
                          </form>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </table>
          </div>
        )}

        {loaded && resolved.length > 0 && (
          <DisclosureSection title="Resolved" icon={CheckCircle2} count={resolved.length}>
            <ul className="space-y-2">
              {resolved.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{e.studentId}</span>
                    <Badge tone={RISK_TONE[e.risk]}>{e.risk}</Badge>
                    <span className="text-sm text-ink">{e.mentorName}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line break-words text-sm text-ink">
                    {e.resolutionNote}
                  </p>
                  <p className="mt-2 text-[11px] text-ink-muted tabular">
                    Escalated {e.createdWhen} · Resolved {e.resolvedWhen}
                  </p>
                </li>
              ))}
            </ul>
          </DisclosureSection>
        )}
      </CardContent>
    </Card>
  );
}
