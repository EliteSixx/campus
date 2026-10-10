"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, FlaskConical, RefreshCw, ServerOff, Users2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/state";
import { cn } from "@/lib/utils";
import { AiError, predictPlacement, readiness } from "@/lib/ai/client";
import { AtRiskDetailPanel } from "./AtRiskDetailPanel";
import { EscalateDialog } from "./EscalateDialog";
import { OpenEscalations } from "./OpenEscalations";
import {
  currentEscalation,
  escalationEligibility,
  findOpenEscalation,
  openEscalations,
} from "./escalations";
import { useEscalations, type ShownEscalation } from "./useEscalations";
import {
  READINESS_LABEL,
  READINESS_TONE,
  RISK_FILTERS,
  RISK_TONE,
  buildSources,
  formatProbability,
  matchesFilter,
  sortRows,
  studentLabel,
  type AtRiskRow,
  type CallState,
  type PredictionState,
  type RiskFilter,
} from "./at-risk-data";

// Mentor "At-risk students" screen.
//
// Each student gets its own readiness and predict-placement calls, so one
// failure only marks that row. Every score, level and probability shown comes
// from the AI client; the page never computes one.

const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL ?? "http://localhost:8000";

function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  const message = error instanceof Error ? error.message : "Unexpected error";
  return new AiError("UNKNOWN_ERROR", message, null, null);
}

// Brings `target` to the top of the nearest scrolling ancestor, and moves only
// that. scrollIntoView would also scroll the document, which is a little taller
// than the window and would push the top bar off screen.
function scrollPageTo(target: HTMLElement) {
  let scroller = target.parentElement;
  while (scroller && !/auto|scroll/.test(getComputedStyle(scroller).overflowY)) {
    scroller = scroller.parentElement;
  }
  if (!scroller) return;
  const offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
  scroller.scrollTo({ top: scroller.scrollTop + offset - 16 });
}

function initialRows(): AtRiskRow[] {
  return buildSources().map((source) => ({
    ...source,
    readiness: { status: "loading" },
    prediction: source.activity ? { status: "loading" } : { status: "no_activity" },
  }));
}

export function AtRiskStudents() {
  const [rows, setRows] = useState<AtRiskRow[]>(initialRows);
  const [filter, setFilter] = useState<RiskFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const { escalations, loaded: escalationsLoaded, escalate, resolve } = useEscalations();
  // The student whose "Escalate to mentor" form is open.
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const escalationsRef = useRef<HTMLDivElement>(null);

  // On wide screens the detail panel scrolls on its own; start each student at
  // the top.
  useEffect(() => {
    if (detailRef.current) detailRef.current.scrollTop = 0;
  }, [selectedId]);

  useEffect(() => {
    let cancelled = false;
    const sources = buildSources();
    setRows(initialRows());

    function patch(studentId: string, change: Partial<Pick<AtRiskRow, "readiness" | "prediction">>) {
      if (cancelled) return;
      setRows((prev) =>
        prev.map((r) => (r.student.student_id === studentId ? { ...r, ...change } : r)),
      );
    }

    for (const { student, activity } of sources) {
      readiness({ student }).then(
        (data) => patch(student.student_id, { readiness: { status: "ok", data } }),
        (error: unknown) =>
          patch(student.student_id, { readiness: { status: "error", error: toAiError(error) } }),
      );

      if (activity) {
        predictPlacement({ student, activity }).then(
          (data) => patch(student.student_id, { prediction: { status: "ok", data } }),
          (error: unknown) =>
            patch(student.student_id, { prediction: { status: "error", error: toAiError(error) } }),
        );
      }
    }

    return () => {
      cancelled = true;
    };
  }, [runId]);

  const sorted = useMemo(() => sortRows(rows), [rows]);
  const visible = useMemo(() => sorted.filter((r) => matchesFilter(r, filter)), [sorted, filter]);
  const selected = rows.find((r) => r.student.student_id === selectedId) ?? null;
  const escalating = rows.find((r) => r.student.student_id === escalatingId) ?? null;
  const openCount = useMemo(() => openEscalations(escalations).length, [escalations]);
  const studentLabels = useMemo(
    () => Object.fromEntries(rows.map((r) => [r.student.student_id, studentLabel(r.student)])),
    [rows],
  );

  const counts = useMemo(() => {
    const c: Record<RiskFilter, number> = { ALL: rows.length, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 };
    for (const r of rows) {
      if (r.prediction.status === "ok") c[r.prediction.data.risk] += 1;
      else c.NONE += 1;
    }
    return c;
  }, [rows]);

  const calls = rows.flatMap((r): (CallState<unknown> | PredictionState)[] => [r.readiness, r.prediction]);
  const pending = calls.filter((c) => c.status === "loading").length;
  const serviceDown = calls.some((c) => c.status === "error" && c.error.code === "NETWORK_ERROR");
  const noActivity = rows.filter((r) => r.prediction.status === "no_activity");

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">At-risk students</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Placement risk from the AI service, highest risk first.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {openCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => escalationsRef.current && scrollPageTo(escalationsRef.current)}
              >
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                {openCount} open {openCount === 1 ? "escalation" : "escalations"}
              </Button>
            )}
            <Badge tone="cyan" title="Students, activity and model training data are generated">
              <FlaskConical className="h-3 w-3" aria-hidden="true" />
              Synthetic demo data
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRunId((n) => n + 1)}
              disabled={pending > 0}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", pending > 0 && "animate-spin")} aria-hidden="true" />
              {pending > 0 ? "Loading" : "Retry"}
            </Button>
          </div>
        </div>

        {serviceDown && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            <ServerOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">The AI service is not running.</p>
              <p className="mt-0.5 text-xs">
                Could not reach {AI_BASE_URL}. Start it with{" "}
                <code className="font-mono">cd ai &amp;&amp; uvicorn app.main:app --port 8000</code>, then
                press Retry.
              </p>
            </div>
          </div>
        )}

        {pending > 0 && !serviceDown && (
          <p className="text-xs text-ink-muted" aria-live="polite">
            Waiting for {pending} AI {pending === 1 ? "response" : "responses"}. The first request can be
            slow while the model loads.
          </p>
        )}

        {/* From xl up the detail panel is a fixed-width second column, so the
            table column takes all the remaining width. */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_19rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>
                    {counts.HIGH} high · {counts.MEDIUM} medium · {counts.LOW} low · {counts.NONE} without
                    a prediction
                  </CardDescription>
                </div>
                <div className="w-44">
                  <label htmlFor="risk-filter" className="sr-only">
                    Filter by risk level
                  </label>
                  <Select
                    id="risk-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as RiskFilter)}
                  >
                    {RISK_FILTERS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label} ({counts[f.value]})
                      </option>
                    ))}
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {rows.length === 0 ? (
                  <EmptyState icon={Users2} title="No demo students" description="web/data/demo has no students." />
                ) : visible.length === 0 ? (
                  <EmptyState icon={Users2} title="No students match this filter" />
                ) : (
                  <div className="relative overflow-x-auto scrollbar-thin">
                    {/* Fixed layout: the four short columns keep a set width and the two
                        text columns share what is left, so the table always fits its card
                        at laptop widths. Risk and probability share one column to leave
                        room for the escalation column beside the detail panel. The
                        min-width only applies on phone-sized screens. The wrapper is
                        `relative` so the screen-reader-only labels inside the buttons
                        scroll with the table instead of widening the page. */}
                    <table className="w-full min-w-[38rem] table-fixed text-left text-sm xl:min-w-0">
                      <colgroup>
                        <col className="w-[4.5rem]" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[6rem]" />
                        <col />
                        <col />
                        <col className="w-[5.75rem]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-border align-bottom text-[11px] uppercase tracking-wide text-ink-muted">
                          <th className="py-2 pr-3 font-semibold">Student</th>
                          <th className="py-2 pr-3 font-semibold">Readiness</th>
                          <th className="py-2 pr-3 font-semibold">
                            Risk
                            <span className="block">P(unplaced)</span>
                          </th>
                          <th className="py-2 pr-3 font-semibold">Main reasons</th>
                          <th className="py-2 pr-3 font-semibold">Interventions</th>
                          <th className="py-2 font-semibold">Escalation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((row) => (
                          <StudentRow
                            key={row.student.student_id}
                            row={row}
                            selected={row.student.student_id === selectedId}
                            onSelect={() => setSelectedId(row.student.student_id)}
                            escalationsLoaded={escalationsLoaded}
                            openEscalation={findOpenEscalation(escalations, row.student.student_id)}
                            onEscalate={() => {
                              setSelectedId(row.student.student_id);
                              setEscalatingId(row.student.student_id);
                            }}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {noActivity.length > 0 && (
                  <p className="mt-3 text-[11px] text-ink-muted">
                    No placement-activity record for {noActivity.map((r) => r.student.student_id).join(", ")}.
                    Their risk is not predicted rather than assuming zero activity.
                  </p>
                )}
              </CardContent>
            </Card>

            <div ref={escalationsRef}>
              <OpenEscalations
                escalations={escalations}
                loaded={escalationsLoaded}
                studentLabels={studentLabels}
                onResolve={resolve}
              />
            </div>

            <p className="text-[11px] text-ink-muted">
              All students and activity on this screen are synthetic, and the risk model is trained on
              synthetic data. Probabilities are illustrative and are not a measure of real-world accuracy.
            </p>
          </div>

          {/* From xl up the panel sticks to the top of the scrolling page and
              scrolls on its own when it is taller than the window, so it stays in
              view whichever row is clicked. 5rem is the top bar plus the page's
              bottom padding; that only adds up while this grid is the last thing
              on the page, which is why the footnote sits in the left column. */}
          <div
            ref={detailRef}
            className="scrollbar-thin xl:sticky xl:top-0 xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-y-auto"
          >
            <AtRiskDetailPanel
              row={selected}
              escalation={selected ? currentEscalation(escalations, selected.student.student_id) : null}
              escalationsLoaded={escalationsLoaded}
              onEscalate={() => setEscalatingId(selectedId)}
            />
          </div>
        </div>
      </div>

      {/* Outside the space-y wrapper: its child margins would replace the auto
          margins that centre a modal dialog. */}
      {escalating && (
        <EscalateDialog
          key={escalating.student.student_id}
          row={escalating}
          onSubmit={(mentor) => escalate(escalating.student.student_id, escalating.prediction, mentor)}
          onClose={() => setEscalatingId(null)}
        />
      )}
    </>
  );
}

function StudentRow({
  row,
  selected,
  onSelect,
  escalationsLoaded,
  openEscalation,
  onEscalate,
}: {
  row: AtRiskRow;
  selected: boolean;
  onSelect: () => void;
  escalationsLoaded: boolean;
  openEscalation: ShownEscalation | null;
  onEscalate: () => void;
}) {
  const { student, readiness: ready, prediction } = row;
  return (
    <tr
      onClick={onSelect}
      aria-selected={selected}
      className={cn(
        "cursor-pointer border-b border-border/60 align-top transition-colors hover:bg-surface-raised/60",
        selected && "bg-accent-soft/60 hover:bg-accent-soft/60",
      )}
    >
      <td className="py-3 pr-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="text-left font-semibold text-ink hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          {student.student_id}
        </button>
        <p className="text-[11px] text-ink-muted">{studentLabel(student)}</p>
      </td>
      <td className="py-3 pr-3">
        {ready.status === "ok" ? (
          <Badge tone={READINESS_TONE[ready.data.level]}>{READINESS_LABEL[ready.data.level]}</Badge>
        ) : ready.status === "loading" ? (
          <Pending />
        ) : (
          <ErrorChip error={ready.error} />
        )}
      </td>
      <PredictionCells prediction={prediction} />
      <td className="py-3">
        <EscalationCell
          studentId={student.student_id}
          prediction={prediction}
          loaded={escalationsLoaded}
          openEscalation={openEscalation}
          onEscalate={onEscalate}
        />
      </td>
    </tr>
  );
}

// An open escalation replaces the action. Otherwise the action is offered only
// when the service returned HIGH or MEDIUM on a non-stub prediction, and the
// reason is shown when it is not.
function EscalationCell({
  studentId,
  prediction,
  loaded,
  openEscalation,
  onEscalate,
}: {
  studentId: string;
  prediction: PredictionState;
  loaded: boolean;
  openEscalation: ShownEscalation | null;
  onEscalate: () => void;
}) {
  if (!loaded) return <Pending />;
  if (openEscalation) {
    return (
      <div>
        <Badge tone="accent">Escalated</Badge>
        <p className="mt-1 break-words text-[11px] text-ink">{openEscalation.mentorName}</p>
      </div>
    );
  }
  const eligibility = escalationEligibility(prediction);
  if (!eligibility.eligible) {
    return (
      <p className="break-words text-[11px] text-ink-muted" title="Escalation unavailable">
        {eligibility.reason}
      </p>
    );
  }
  // A plain button, not the shared Button: that one is a fixed-height single
  // line, and this label has to wrap to fit the narrow column.
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEscalate();
      }}
      className="rounded-lg border border-border bg-surface px-2 py-1 text-left text-xs font-medium leading-tight text-ink transition-all duration-150 hover:border-border-strong hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      Escalate to mentor
      <span className="sr-only"> for {studentId}</span>
    </button>
  );
}

function PredictionCells({ prediction }: { prediction: PredictionState }) {
  if (prediction.status === "no_activity") {
    return (
      <td className="py-3 pr-3 text-xs text-ink-muted" colSpan={3}>
        <Badge tone="neutral">No activity data</Badge>
      </td>
    );
  }
  if (prediction.status === "loading") {
    return (
      <td className="py-3 pr-3" colSpan={3}>
        <Pending />
      </td>
    );
  }
  if (prediction.status === "error") {
    return (
      <td className="py-3 pr-3" colSpan={3}>
        <ErrorChip error={prediction.error} />
      </td>
    );
  }

  const { risk, probability_unplaced, reasons, interventions, meta } = prediction.data;
  return (
    <>
      <td className="py-3 pr-3">
        <Badge tone={RISK_TONE[risk]}>{risk}</Badge>
        {meta.stub && <p className="mt-1 text-[10px] font-semibold text-warning">stub</p>}
        <p className="mt-1 font-semibold tabular text-ink">{formatProbability(probability_unplaced)}</p>
      </td>
      <td className="py-3 pr-3 text-xs text-ink">
        <Preview items={reasons} />
      </td>
      <td className="py-3 pr-3 text-xs text-ink">
        <Preview items={interventions} />
      </td>
    </>
  );
}

// First item in the table; the detail panel shows the full list.
function Preview({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-ink-muted">None returned</span>;
  return (
    <div className="break-words">
      <p className="line-clamp-3" title={items[0]}>
        {items[0]}
      </p>
      {items.length > 1 && <p className="mt-0.5 text-[11px] text-ink-muted">+{items.length - 1} more</p>}
    </div>
  );
}

function Pending() {
  return <span className="inline-block h-5 w-20 animate-pulse rounded-full bg-surface-raised" aria-label="Loading" />;
}

function ErrorChip({ error }: { error: AiError }) {
  return (
    <div className="max-w-[18rem] space-y-1">
      <Badge tone="danger">
        {error.code === "NETWORK_ERROR" ? "AI service not running" : `Error: ${error.code}`}
      </Badge>
      <p className="break-words text-[11px] text-danger">{error.message}</p>
      {error.field && (
        <p className="text-[11px] text-danger">
          Field: <code className="font-mono">{error.field}</code>
        </p>
      )}
    </div>
  );
}
