"use client";

import { useRef } from "react";
import { AlertTriangle, Lightbulb, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/shared/state";
import { StudentNotesCard } from "./StudentNotesCard";
import { AiErrorMessage } from "./AiErrorMessage";
import {
  READINESS_LABEL,
  READINESS_TONE,
  RISK_TONE,
  formatProbability,
  studentLabel,
  type AtRiskRow,
} from "./at-risk-data";

// Full reasons, interventions and mentor notes for one student.

export function AtRiskDetailPanel({ row }: { row: AtRiskRow | null }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!row) {
    return (
      <Card>
        <CardContent className="pt-5">
          <EmptyState
            icon={MousePointerClick}
            title="Select a student"
            description="Pick a row to see the full reasons, interventions and your notes."
          />
        </CardContent>
      </Card>
    );
  }

  const { student, activity, applications, readiness, prediction } = row;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{student.student_id}</CardTitle>
            <CardDescription>{studentLabel(student)}</CardDescription>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {prediction.status === "ok" && (
              <Badge tone={RISK_TONE[prediction.data.risk]}>{prediction.data.risk} risk</Badge>
            )}
            {readiness.status === "ok" && (
              <Badge tone={READINESS_TONE[readiness.data.level]}>
                {READINESS_LABEL[readiness.data.level]}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Placement activity
            </h4>
            {activity ? (
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <Stat label="Drives applied" value={activity.drives_applied} />
                <Stat label="Shortlisted" value={activity.shortlisted} />
                <Stat label="Interviews attended" value={activity.interviews_attended} />
                <Stat label="Rejections" value={activity.rejections} />
              </dl>
            ) : (
              <div className="mt-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-ink-muted">
                <p className="font-semibold text-ink">No activity data</p>
                <p className="mt-1">
                  There is no placement-activity record for this student, so no risk
                  prediction was requested.
                </p>
                {applications.length > 0 && (
                  <p className="mt-1">
                    Demo applications on file: {applications.length} (
                    {applications.map((a) => `${a.company}, ${a.status}`).join("; ")}). These
                    do not include interview or rejection counts.
                  </p>
                )}
              </div>
            )}
          </section>

          {readiness.status === "error" && (
            <AiErrorMessage error={readiness.error} context="Readiness" />
          )}

          {prediction.status === "loading" && <LoadingState label="Predicting placement risk" />}
          {prediction.status === "error" && (
            <AiErrorMessage error={prediction.error} context="Risk prediction" />
          )}

          {prediction.status === "ok" && (
            <>
              <p className="text-sm text-ink">
                Probability of not being placed:{" "}
                <span className="font-semibold tabular">
                  {formatProbability(prediction.data.probability_unplaced)}
                </span>{" "}
                <span className="text-xs text-ink-muted">
                  (model output {prediction.data.probability_unplaced}, engine{" "}
                  {prediction.data.meta.engine_version})
                </span>
              </p>
              {prediction.data.meta.stub && (
                <Badge tone="warning">Stub response: fixed demo values, not a model result</Badge>
              )}

              <ListSection
                icon={AlertTriangle}
                title="Reasons"
                items={prediction.data.reasons}
                empty="The model returned no reasons."
              />
              <ListSection
                icon={Lightbulb}
                title="Recommended interventions"
                items={prediction.data.interventions}
                empty="The model returned no interventions."
              />
            </>
          )}
        </CardContent>
      </Card>

      <StudentNotesCard
        key={student.student_id}
        studentId={student.student_id}
        studentName={student.student_id}
        textareaRef={textareaRef}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised/40 px-3 py-2">
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className="font-semibold tabular text-ink">{value}</dd>
    </div>
  );
}

function ListSection({
  icon: Icon,
  title,
  items,
  empty,
}: {
  icon: typeof AlertTriangle;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <section>
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
