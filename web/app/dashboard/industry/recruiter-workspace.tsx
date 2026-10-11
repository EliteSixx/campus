"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, CheckCircle2, ChevronDown, Circle, LoaderCircle, Save, Sparkles, UserRound, X } from "lucide-react";
import { demoStudents } from "@/data/demo/students";
import { AiError, parseJob, rank } from "@/lib/ai/client";
import type { components } from "@/lib/ai/types";
import { loadRecruiterStore, saveRecruiterStore } from "./recruiter-store";

type Job = components["schemas"]["Job"];
type Branch = components["schemas"]["Branch"];
type RankedMatch = components["schemas"]["RankedMatch"];
type ParseJobResponse = components["schemas"]["ParseJobResponse"];

interface JobFields {
  role: string;
  minCgpa: string;
  maxBacklogs: string;
  branches: string;
  requiredSkills: string;
  preferredSkills: string;
  ctc: string;
}

const branches: Branch[] = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "OTHER"];
const isBranch = (value: string): value is Branch => branches.some((branch) => branch === value);
const initialFields: JobFields = {
  role: "",
  minCgpa: "0",
  maxBacklogs: "",
  branches: "",
  requiredSkills: "",
  preferredSkills: "",
  ctc: "",
};

function fieldsFromJob(job: Job): JobFields {
  return {
    role: job.role,
    minCgpa: String(job.min_cgpa),
    maxBacklogs: job.max_backlogs == null ? "" : String(job.max_backlogs),
    branches: job.eligible_branches?.join(", ") ?? "",
    requiredSkills: job.required_skills?.join(", ") ?? "",
    preferredSkills: job.preferred_skills?.join(", ") ?? "",
    ctc: job.ctc_lpa == null ? "" : String(job.ctc_lpa),
  };
}

function splitList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function messageFor(error: unknown): string {
  if (error instanceof AiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-ink-muted">{label}</span>
      <input
        type={type}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
      />
    </label>
  );
}

function Skills({ items, tone }: { items: string[]; tone: "success" | "danger" }) {
  if (items.length === 0) return <span className="text-sm text-ink-faint">None</span>;
  const color = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function ReasonIcon({ type }: { type: components["schemas"]["ReasonType"] }) {
  if (type === "PASS") return <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Pass" />;
  if (type === "WARN") return <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" aria-label="Warning" />;
  return <X className="h-4 w-4 shrink-0 text-red-600" aria-label="Fail" />;
}

function CandidateResult({
  result,
  shortlisted,
  onShortlist,
}: {
  result: RankedMatch;
  shortlisted: boolean;
  onShortlist: () => void;
}) {
  const student = demoStudents.find((candidate) => candidate.student_id === result.student_id);

  return (
    <article className="rounded-xl border border-border bg-surface/80 p-4 shadow-sm backdrop-blur dark:bg-surface sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-raised text-ink-muted">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-ink">{student?.student_id ?? result.student_id}</h3>
              <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs font-medium text-ink-muted">
                Rank #{result.rank}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${result.eligible ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300"}`}>
                {result.eligible ? "Eligible" : "Not eligible"}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {student ? `${student.branch} · CGPA ${student.cgpa.toFixed(1)} · ${student.backlogs} backlogs` : "Candidate profile"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold tabular text-ink">{Math.round(result.match_score)}%</p>
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">Match score</p>
          </div>
          <button
            type="button"
            onClick={onShortlist}
            disabled={shortlisted}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-ink transition hover:bg-surface-raised disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700 dark:disabled:border-emerald-400/30 dark:disabled:bg-emerald-400/10 dark:disabled:text-emerald-300"
          >
            {shortlisted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {shortlisted ? "Shortlisted" : "Shortlist"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Matched skills</p>
          <Skills items={result.matched_skills} tone="success" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Skill gaps</p>
          <Skills items={result.skill_gaps} tone="danger" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Reasons</p>
        {result.reasons.length > 0 ? (
          <ul className="space-y-2">
            {result.reasons.map((reason, index) => (
              <li key={`${reason.type}-${index}`} className="flex items-start gap-2 text-sm text-ink-muted">
                <ReasonIcon type={reason.type} />
                <span>{reason.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-faint">No reasons provided.</p>
        )}
      </div>

      <details className="group mt-5 border-t border-border pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink">
          Score breakdown
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-4 space-y-3">
          {result.breakdown.map((component) => (
            <div key={component.name}>
              <div className="mb-1 flex justify-between gap-3 text-xs text-ink-muted">
                <span>{component.name} · {Math.round(component.weight * 100)}% weight</span>
                <span className="font-mono tabular">{Math.round(component.score)}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-surface-raised"
                role="img"
                aria-label={`${component.name}: ${Math.round(component.score)} percent`}
              >
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, component.score))}%` }} />
              </div>
            </div>
          ))}
          {result.breakdown.length === 0 && <p className="text-sm text-ink-faint">No score breakdown provided.</p>}
        </div>
      </details>
    </article>
  );
}

export function RecruiterWorkspace() {
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<JobFields>(initialFields);
  const [savedJob, setSavedJob] = useState<Job | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [parseResult, setParseResult] = useState<Pick<ParseJobResponse, "confidence" | "warnings"> | null>(null);
  const [ranked, setRanked] = useState<RankedMatch[] | null>(null);
  const [loading, setLoading] = useState<"parse" | "rank" | null>(null);
  const [error, setError] = useState("");
  const [storeReady, setStoreReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const store = loadRecruiterStore();
      setSavedJob(store.savedJob);
      if (store.savedJob) setFields(fieldsFromJob(store.savedJob));
      if (store.savedJob?.job_id) {
        setShortlistedIds(store.shortlistedByJob[store.savedJob.job_id] ?? []);
      }
    } catch (loadError) {
      setError(messageFor(loadError));
    } finally {
      setStoreReady(true);
    }
  }, []);

  const updateField = (key: keyof JobFields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setHasUnsavedChanges(true);
    setRanked(null);
    setNotice("");
  };

  const handleParse = async () => {
    if (!description.trim()) {
      setError("Paste a job description before parsing.");
      return;
    }

    setLoading("parse");
    setError("");
    setNotice("");
    try {
      const response = await parseJob({ text: description.trim() });
      setFields(fieldsFromJob(response.job));
      setParseResult({
        confidence: response.confidence,
        warnings: response.warnings.filter((warning) => warning !== "Company not specified"),
      });
      setHasUnsavedChanges(true);
      setRanked(null);
      setNotice("Job description parsed. Review and edit the fields before saving.");
    } catch (parseError) {
      setError(messageFor(parseError));
    } finally {
      setLoading(null);
    }
  };

  const handleSave = () => {
    if (!storeReady) return;
    setError("");
    setNotice("");
    const minCgpa = Number(fields.minCgpa);
    const maxBacklogs = fields.maxBacklogs === "" ? null : Number(fields.maxBacklogs);
    const ctc = fields.ctc === "" ? null : Number(fields.ctc);
    const branchValues = splitList(fields.branches);
    const eligibleBranches = branchValues.filter(isBranch);
    const invalidBranches = branchValues.filter((branch) => !isBranch(branch));

    if (!fields.role.trim()) {
      setError("Role is required before saving the job.");
      return;
    }
    if (!Number.isFinite(minCgpa) || minCgpa < 0 || minCgpa > 10) {
      setError("Minimum CGPA must be a number from 0 to 10.");
      return;
    }
    if (maxBacklogs !== null && (!Number.isInteger(maxBacklogs) || maxBacklogs < 0)) {
      setError("Maximum backlogs must be a whole number of 0 or more, or left blank for no limit.");
      return;
    }
    if (ctc !== null && (!Number.isFinite(ctc) || ctc < 0)) {
      setError("CTC must be a number of 0 or more, or left blank if unspecified.");
      return;
    }
    if (invalidBranches.length > 0) {
      setError(`Unknown branch code(s): ${invalidBranches.join(", ")}. Use ${branches.join(", ")}.`);
      return;
    }

    const job: Job = {
      job_id: savedJob?.job_id ?? `JOB-${Date.now()}`,
      role: fields.role.trim(),
      min_cgpa: minCgpa,
      max_backlogs: maxBacklogs,
      eligible_branches: eligibleBranches,
      required_skills: splitList(fields.requiredSkills),
      preferred_skills: splitList(fields.preferredSkills),
      ctc_lpa: ctc,
    };

    try {
      const store = loadRecruiterStore();
      saveRecruiterStore({ ...store, savedJob: job });
      setSavedJob(job);
      setShortlistedIds(store.shortlistedByJob[job.job_id ?? ""] ?? []);
      setHasUnsavedChanges(false);
      setRanked(null);
      setNotice("Job saved to the recruiter mock store.");
    } catch (saveError) {
      setError(messageFor(saveError));
    }
  };

  const handleRank = async () => {
    if (!savedJob || hasUnsavedChanges) return;
    setLoading("rank");
    setError("");
    setNotice("");
    try {
      const response = await rank({ job: savedJob, students: demoStudents });
      setRanked(response.ranked);
    } catch (rankError) {
      setError(messageFor(rankError));
    } finally {
      setLoading(null);
    }
  };

  const handleShortlist = (studentId: string) => {
    if (!savedJob?.job_id) {
      setError("Save the job again before shortlisting candidates.");
      return;
    }

    try {
      const store = loadRecruiterStore();
      const selected = new Set(store.shortlistedByJob[savedJob.job_id] ?? []);
      selected.add(studentId);
      const nextShortlisted = [...selected];
      saveRecruiterStore({
        ...store,
        shortlistedByJob: { ...store.shortlistedByJob, [savedJob.job_id]: nextShortlisted },
      });
      setShortlistedIds(nextShortlisted);
      setError("");
      setNotice(`${studentId} added to the shortlist.`);
    } catch (shortlistError) {
      setError(messageFor(shortlistError));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl border border-border bg-surface/80 p-5 shadow-sm backdrop-blur dark:bg-surface sm:p-7">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">AI-assisted hiring</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Create a role and find your best-fit candidates</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
              Parse a job description, review the structured requirements, then rank the demo student pool with explainable AI matching.
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {notice && !error && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface/80 p-5 shadow-sm backdrop-blur dark:bg-surface sm:p-7">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">01 / Job requirements</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Parse and review the job description</h2>
          <p className="mt-1 text-sm text-ink-muted">The AI parser drafts these fields for you. Confirm the requirements before saving.</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink-muted">Job description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            placeholder="Paste the role responsibilities and requirements here..."
            className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-6 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleParse}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
          >
            {loading === "parse" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading === "parse" ? "Parsing..." : "Parse job"}
          </button>
          {parseResult && (
            <span className="rounded-full bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-muted">
              Parser confidence: {Math.round(parseResult.confidence * 100)}%
            </span>
          )}
        </div>

        {parseResult && (
          <div className={`mt-4 rounded-xl border p-4 ${parseResult.warnings.length ? "border-amber-200 bg-amber-50 dark:border-amber-400/30 dark:bg-amber-400/10" : "border-emerald-200 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/10"}`}>
            <p className="text-sm font-semibold text-ink">{parseResult.warnings.length ? "Review parser warnings" : "No parser warnings"}</p>
            {parseResult.warnings.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900 dark:text-amber-300">
                {parseResult.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Role" value={fields.role} onChange={(value) => updateField("role", value)} placeholder="e.g. Backend Developer" />
          <Field label="Minimum CGPA (0-10)" type="number" min="0" max="10" step="0.1" value={fields.minCgpa} onChange={(value) => updateField("minCgpa", value)} />
          <Field label="Maximum backlogs" type="number" min="0" step="1" value={fields.maxBacklogs} onChange={(value) => updateField("maxBacklogs", value)} placeholder="No limit" />
          <Field label="Eligible branches" value={fields.branches} onChange={(value) => updateField("branches", value)} placeholder="CSE, IT (blank = all)" />
          <Field label="CTC (LPA)" type="number" min="0" step="0.1" value={fields.ctc} onChange={(value) => updateField("ctc", value)} placeholder="Optional" />
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Required skills (comma separated)" value={fields.requiredSkills} onChange={(value) => updateField("requiredSkills", value)} placeholder="Python, SQL, REST APIs" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Preferred skills (comma separated)" value={fields.preferredSkills} onChange={(value) => updateField("preferredSkills", value)} placeholder="Docker, AWS" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={!storeReady || loading !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savedJob ? "Save changes" : "Save job"}
          </button>
          {savedJob && (
            <span className="text-xs text-ink-muted">
              Saved role: <strong className="text-ink">{savedJob.role}</strong>
            </span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-5 shadow-sm backdrop-blur dark:bg-surface sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">02 / Candidate pool</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Rank demo candidates</h2>
            <p className="mt-1 text-sm text-ink-muted">{demoStudents.length} seeded student profiles · matching and scoring run through the AI service.</p>
          </div>
          <button
            type="button"
            onClick={handleRank}
            disabled={!savedJob || hasUnsavedChanges || loading !== null || !storeReady}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "rank" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading === "rank" ? "Ranking candidates..." : "Rank candidates"}
          </button>
        </div>

        {savedJob && hasUnsavedChanges && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300" role="status">
            Save your edited job requirements before ranking candidates.
          </div>
        )}
        {!savedJob && (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-surface-raised/50 p-6 text-center">
            <p className="text-sm font-medium text-ink">Save a job to rank candidates</p>
            <p className="mt-1 text-xs text-ink-muted">Parsed and edited requirements will be sent with the demo pool.</p>
          </div>
        )}
        {ranked && ranked.length === 0 && (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-surface-raised/50 p-6 text-center">
            <p className="text-sm font-medium text-ink">No ranked candidates returned</p>
            <p className="mt-1 text-xs text-ink-muted">Try ranking again or review the saved job requirements.</p>
          </div>
        )}
        {ranked && ranked.length > 0 && (
          <div className="mt-5 space-y-4">
            <p className="text-xs font-medium text-ink-muted">{ranked.length} candidates ranked for {savedJob?.role}</p>
            {ranked.map((result) => (
              <CandidateResult
                key={result.student_id}
                result={result}
                shortlisted={shortlistedIds.includes(result.student_id)}
                onShortlist={() => handleShortlist(result.student_id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
