"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ScanSearch } from "lucide-react";
import { StudentResume } from "@/lib/api/resumes";
import { opportunities } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { getSkillById } from "@/data/skills";
import { cn } from "@/lib/utils";

interface Check {
  id: string;
  label: string;
  weight: number;
  /** 0..1 */
  score: number;
  tip: string;
}

const ACTION_VERBS = [
  "built", "designed", "developed", "implemented", "led", "optimized", "improved", "reduced",
  "increased", "created", "deployed", "automated", "launched", "migrated", "wrote", "organized",
  "mentored", "architected", "integrated", "analyzed", "delivered", "secured", "achieved",
];

const GENERIC_KEYWORDS = ["python", "sql", "git", "rest-apis", "dsa", "communication", "teamwork"];

function bullets(text: string): string[] {
  return text
    .split(/\n|•/)
    .map((l) => l.replace(/^[\s\-*]+/, "").trim())
    .filter(Boolean);
}

function analyse(resume: StudentResume, keywordIds: string[]) {
  const longText = [
    resume.summary,
    ...resume.projects.map((p) => `${p.title} ${p.description}`),
    ...resume.experience.map((e) => `${e.role} ${e.description}`),
    ...resume.leadership.map((l) => l.description),
    ...resume.achievements.map((a) => `${a.title} ${a.description}`),
  ]
    .join(" ")
    .toLowerCase();
  const skillNames = new Set(resume.skills.map((s) => s.name.toLowerCase()));
  const skillIds = new Set(resume.skills.map((s) => s.skillId));

  const keywordNames = keywordIds.map((id) => ({ id, name: getSkillById(id)?.name ?? id }));
  const found = keywordNames.filter(
    (k) => skillIds.has(k.id) || skillNames.has(k.name.toLowerCase()) || longText.includes(k.name.toLowerCase())
  );
  const missingKeywords = keywordNames.filter((k) => !found.includes(k)).map((k) => k.name);

  const impactLines = [
    ...resume.experience.flatMap((e) => bullets(e.description)),
    ...resume.projects.flatMap((p) => bullets(p.description)),
    ...resume.leadership.flatMap((l) => bullets(l.description)),
  ];
  const quantified = impactLines.filter((l) => /\d/.test(l)).length;
  const verbLed = impactLines.filter((l) => ACTION_VERBS.includes(l.split(/\s+/)[0]?.toLowerCase() ?? "")).length;
  const firstPerson = /\b(i|me|my)\b/i.test(`${resume.summary} ${impactLines.join(" ")}`);
  const linkedProjects = resume.projects.filter((p) => p.githubUrl || p.liveDemoUrl).length;
  const p = resume.personalInfo;
  const contactCount = [p.email, p.phone, p.linkedinUrl || p.githubUrl].filter(Boolean).length;
  const summaryLen = resume.summary.trim().length;

  const checks: Check[] = [
    {
      id: "keywords",
      label: `Keywords for this role (${found.length}/${keywordNames.length})`,
      weight: 30,
      score: keywordNames.length ? found.length / keywordNames.length : 1,
      tip: missingKeywords.length
        ? `Add these if you genuinely have them: ${missingKeywords.join(", ")}.`
        : "Every required keyword appears in your resume.",
    },
    {
      id: "impact",
      label: `Quantified results (${quantified}/${impactLines.length} lines)`,
      weight: 15,
      score: impactLines.length ? Math.min(1, quantified / Math.max(3, impactLines.length * 0.5)) : 0,
      tip: "Use numbers to show impact, e.g. \"cut query time by 35%\" or \"served 2,000 users\".",
    },
    {
      id: "verbs",
      label: `Lines that start with an action verb (${verbLed}/${impactLines.length})`,
      weight: 10,
      score: impactLines.length ? Math.min(1, verbLed / Math.max(1, impactLines.length * 0.6)) : 0,
      tip: "Start each bullet with a verb like Built, Designed, Optimized or Led.",
    },
    {
      id: "contact",
      label: "Contact details and profile links",
      weight: 10,
      score: contactCount / 3,
      tip: "Include email, phone and a LinkedIn or GitHub link.",
    },
    {
      id: "summary",
      label: "Professional summary length",
      weight: 10,
      score: summaryLen >= 150 && summaryLen <= 600 ? 1 : summaryLen >= 80 ? 0.5 : 0,
      tip: "Aim for 2 to 4 sentences (150–600 characters) about what you do and want to do next.",
    },
    {
      id: "projects",
      label: `Projects with links (${linkedProjects})`,
      weight: 10,
      score: Math.min(1, linkedProjects / 2),
      tip: "Link at least two projects to GitHub or a live demo so recruiters can verify them.",
    },
    {
      id: "skills",
      label: `Skills listed (${resume.skills.length})`,
      weight: 10,
      score: Math.min(1, resume.skills.length / 6),
      tip: "List at least 6 relevant technical skills.",
    },
    {
      id: "voice",
      label: "No first-person pronouns",
      weight: 5,
      score: firstPerson ? 0 : 1,
      tip: "Drop \"I\", \"me\" and \"my\". Resumes read better in implied first person.",
    },
  ];

  const total = Math.round(checks.reduce((sum, c) => sum + c.score * c.weight, 0));
  return { total, checks, missingKeywords };
}

export function ResumeAtsCheck({ resume }: { resume: StudentResume }) {
  const [open, setOpen] = useState(true);
  const [targetId, setTargetId] = useState<string>("general");

  // Allow /profile/resume?target=<opportunityId> to preselect a role ("Tailor resume for this job").
  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("target");
    if (target && opportunities.some((o) => o.id === target)) setTargetId(target);
  }, []);

  const keywordIds = useMemo(() => {
    const opp = opportunities.find((o) => o.id === targetId);
    return opp ? [...opp.requiredSkills, ...opp.preferredSkills] : GENERIC_KEYWORDS;
  }, [targetId]);

  const { total, checks } = useMemo(() => analyse(resume, keywordIds), [resume, keywordIds]);
  const tone = total >= 80 ? "text-success" : total >= 60 ? "text-warning" : "text-danger";
  const failing = checks.filter((c) => c.score < 0.75);

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm print:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <ScanSearch className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-ink">ATS check</p>
            <p className="text-xs text-ink-muted">
              How well applicant-tracking systems and recruiters can read your resume
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("font-mono text-2xl font-bold", tone)}>{total}</span>
          <span className="text-xs text-ink-muted">/100</span>
          <ChevronDown className={cn("h-4 w-4 text-ink-muted transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-4">
          <label className="mb-4 flex flex-col gap-1.5 text-xs text-ink-muted sm:flex-row sm:items-center">
            <span className="font-medium text-ink">Check against</span>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="general">General software role</option>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title} · {getCompanyById(o.companyId)?.name ?? "Company"}
                </option>
              ))}
            </select>
          </label>

          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {checks.map((c) => {
              const ok = c.score >= 0.75;
              return (
                <li key={c.id} className="flex items-start gap-2.5 rounded-lg border border-border/70 p-3">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink">{c.label}</p>
                    {!ok && <p className="mt-0.5 text-xs text-ink-muted">{c.tip}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
          {failing.length === 0 && (
            <p className="mt-3 text-xs text-success">Your resume passes every check for this role.</p>
          )}
        </div>
      )}
    </div>
  );
}
