/**
 * Mock interview planner and answer evaluator.
 *
 * Planning is driven by the local AI service's analysis of the student
 * (/ai/readiness + /ai/skill-gap). Question selection and answer scoring run
 * here as transparent rules until the AI service exposes interview endpoints;
 * the input/output shapes match features/samir/MOCK_INTERVIEW_AI_SPEC.md so
 * `buildInterviewPlan` and `evaluateAnswer` can be swapped for API calls.
 */
import type { PredictPlacementResponse, ReadinessResponse, SkillGapResponse } from "@/lib/ai/client";
import type { AiStudent } from "./current-student";
import {
  BankQuestion,
  BEHAVIORAL_BANK,
  CLOSING_QUESTION,
  Difficulty,
  INTRO_QUESTION,
  PROJECT_QUESTION,
  questionsForSkill,
} from "./interview-question-bank";

/* -------------------------------------------------------------------------- */
/* Plan                                                                       */
/* -------------------------------------------------------------------------- */

export type InterviewSection = "Warm-up" | "Core skills" | "Skill gaps" | "Project deep-dive" | "Behavioral";

export interface PlannedQuestion extends BankQuestion {
  section: InterviewSection;
  /** Why the interviewer is asking this, derived from the AI analysis */
  reason: string;
}

export interface InterviewPlan {
  role: string;
  readinessScore: number;
  readinessLevel: ReadinessResponse["level"];
  matchedSkills: string[];
  missingSkills: SkillGapResponse["missing_skills"];
  placementRisk?: PredictPlacementResponse | null;
  estimatedMinutes: number;
  questions: PlannedQuestion[];
}

const MAX_CORE = 2;
const MAX_GAPS = 2;
const COMMUNICATION_TARGET = 70;

function pickQuestion(skill: string, prefer: Difficulty[], used: Set<string>): BankQuestion | undefined {
  const options = questionsForSkill(skill).filter((q) => !used.has(q.id));
  for (const d of prefer) {
    const hit = options.find((q) => q.difficulty === d);
    if (hit) return hit;
  }
  return options[0];
}

export function buildInterviewPlan(input: {
  student: AiStudent;
  role: string;
  readiness: ReadinessResponse;
  skillGap: SkillGapResponse;
  placementRisk?: PredictPlacementResponse | null;
}): InterviewPlan {
  const { student, role, readiness, skillGap, placementRisk } = input;
  const used = new Set<string>();
  const questions: PlannedQuestion[] = [];
  const add = (q: BankQuestion | undefined, section: InterviewSection, reason: string) => {
    if (!q || used.has(q.id)) return;
    used.add(q.id);
    questions.push({ ...q, section, reason });
  };

  const strongProfile = readiness.level === "READY" || readiness.level === "HIGHLY_EMPLOYABLE";

  add(INTRO_QUESTION(role), "Warm-up", "Every interview opens with this. It sets the tone, so it should be crisp and rehearsed.");

  // Skills the student already has that the role needs: push harder to verify depth.
  for (const skill of skillGap.matched_skills.slice(0, MAX_CORE)) {
    add(
      pickQuestion(skill, strongProfile ? ["medium", "hard", "easy"] : ["easy", "medium"], used),
      "Core skills",
      `You list ${skill}, which ${role} roles require. This checks how deeply you know it.`
    );
  }

  // Gaps the AI flagged, highest priority first: check fundamentals, not trivia.
  const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  const gaps = [...skillGap.missing_skills].sort((a, b) => rank[a.priority] - rank[b.priority]).slice(0, MAX_GAPS);
  for (const gap of gaps) {
    add(
      pickQuestion(gap.skill, ["easy", "medium"], used),
      "Skill gaps",
      `The AI flagged ${gap.skill} as a ${gap.priority.toLowerCase()}-priority gap for ${role}. Interviewers often probe gaps, so this checks your fundamentals.`
    );
  }

  const project = student.projects?.[0];
  if (project) {
    add(
      PROJECT_QUESTION(project.title, project.tech ?? []),
      "Project deep-dive",
      "Interviewers almost always dig into your strongest project. Explain your role, decisions and results."
    );
  }

  const communication = readiness.breakdown.find((b) => b.name === "communication");
  const needsCommunicationPractice = !communication || communication.score < COMMUNICATION_TARGET;
  add(
    BEHAVIORAL_BANK[0],
    "Behavioral",
    "Tests teamwork and conflict handling. Answer with Situation, Task, Action and Result."
  );
  if (needsCommunicationPractice) {
    add(
      BEHAVIORAL_BANK[1],
      "Behavioral",
      communication
        ? `Your communication score is ${Math.round(communication.score)}/100, below the ${COMMUNICATION_TARGET} target, so you get an extra structured-answer question.`
        : "Your communication hasn't been assessed yet, so this adds an extra structured-answer question."
    );
  }
  if (questions.length < 6) {
    add(CLOSING_QUESTION, "Behavioral", "A common closing question about goals and fit.");
  }

  return {
    role,
    readinessScore: readiness.score,
    readinessLevel: readiness.level,
    matchedSkills: skillGap.matched_skills,
    missingSkills: skillGap.missing_skills,
    placementRisk,
    estimatedMinutes: questions.length * 2,
    questions,
  };
}

/* -------------------------------------------------------------------------- */
/* Answer evaluation                                                          */
/* -------------------------------------------------------------------------- */

export interface AnswerEvaluation {
  questionId: string;
  transcript: string;
  skipped: boolean;
  score: number; // 0-100
  covered: string[];
  missed: string[];
  wordCount: number;
  wordsPerMinute: number | null;
  fillerCount: number;
  /** 0-100, delivery + structure: feeds the communication part of the report */
  communication: number;
  feedback: string[];
}

// "like" is left out on purpose: it is too often used legitimately ("I'd like to...").
const FILLERS = ["um", "uh", "umm", "uhh", "basically", "you know", "kind of", "sort of", "i mean"];
const EXAMPLE_SIGNALS = ["for example", "for instance", "in my project", "i used", "we used", "such as", "e.g", "i built", "i implemented"];

const LENGTH_RANGE: Record<BankQuestion["kind"], [number, number]> = {
  intro: [60, 180],
  technical: [40, 180],
  project: [80, 260],
  behavioral: [80, 260],
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Short alphanumeric terms must match as whole words ("get" should not match "together"). */
function termIn(text: string, term: string) {
  if (/^[a-z0-9.+#/ -]{1,6}$/.test(term)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}($|[^a-z0-9])`).test(text);
  }
  return text.includes(term);
}

function countFillers(text: string) {
  return FILLERS.reduce((n, f) => n + (text.match(new RegExp(`\\b${escapeRegex(f)}\\b`, "g"))?.length ?? 0), 0);
}

export function evaluateAnswer(
  question: BankQuestion,
  transcript: string,
  durationSec: number,
  mode: "voice" | "text"
): AnswerEvaluation {
  const text = transcript.toLowerCase().replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  const base = { questionId: question.id, transcript: transcript.trim(), wordCount: words };

  if (words < 3) {
    return {
      ...base,
      skipped: true,
      score: 0,
      covered: [],
      missed: question.concepts.map((c) => c.label),
      wordsPerMinute: null,
      fillerCount: 0,
      communication: 0,
      feedback: ["No answer was recorded. Even a partial answer scores better than skipping."],
    };
  }

  const covered = question.concepts.filter((c) => c.terms.some((t) => termIn(text, t))).map((c) => c.label);
  const missed = question.concepts.map((c) => c.label).filter((l) => !covered.includes(l));
  // Strong answers rarely hit every concept; ~60% coverage earns full content marks.
  const needed = Math.max(2, Math.ceil(question.concepts.length * 0.6));
  const content = Math.min(1, covered.length / needed);

  const [minWords, maxWords] = LENGTH_RANGE[question.kind];
  const length = words < minWords ? words / minWords : words > maxWords ? Math.max(0.6, maxWords / words) : 1;

  let structure: number;
  if (question.kind === "behavioral") structure = covered.includes("result") ? 1 : 0.5;
  else if (question.kind === "intro") structure = covered.length >= 3 ? 1 : 0.6;
  else structure = EXAMPLE_SIGNALS.some((s) => text.includes(s)) || /\d/.test(text) ? 1 : 0.5;

  const fillerCount = countFillers(text);
  const fillerRate = (fillerCount / words) * 100;
  const fillerScore = fillerRate <= 2 ? 1 : fillerRate <= 5 ? 0.7 : 0.4;
  const wpm = mode === "voice" && durationSec > 5 ? Math.round(words / (durationSec / 60)) : null;
  const paceScore = wpm === null ? 1 : wpm >= 110 && wpm <= 170 ? 1 : wpm >= 90 && wpm <= 190 ? 0.75 : 0.5;
  const delivery = (fillerScore + paceScore) / 2;

  const score = Math.round(100 * (0.5 * content + 0.15 * length + 0.15 * structure + 0.2 * delivery));

  const feedback: string[] = [];
  if (covered.length) feedback.push(`Good: you covered ${covered.join(", ")}.`);
  if (missed.length && content < 1) feedback.push(`Strengthen it by mentioning ${missed.slice(0, 3).join(", ")}.`);
  if (words < minWords) feedback.push(`Your answer was short (${words} words). Aim for at least ${minWords}, with a concrete example.`);
  if (words > maxWords) feedback.push(`Your answer ran long (${words} words). Lead with the main point and trim the detail.`);
  if (question.kind === "behavioral" && structure < 1)
    feedback.push("Finish with the result and what you learned (Situation, Task, Action, Result).");
  if ((question.kind === "technical" || question.kind === "project") && structure < 1)
    feedback.push("Back up the explanation with an example from your own work.");
  if (fillerScore < 1) feedback.push(`You used ${fillerCount} filler word${fillerCount === 1 ? "" : "s"}. A short pause sounds more confident.`);
  if (wpm !== null && wpm > 170) feedback.push(`You spoke quickly (${wpm} words/min). Slow down to around 130–150.`);
  if (wpm !== null && wpm < 110) feedback.push(`You spoke slowly (${wpm} words/min). Practice the answer once aloud to build flow.`);

  return {
    ...base,
    skipped: false,
    score,
    covered,
    missed,
    wordsPerMinute: wpm,
    fillerCount,
    communication: Math.round(((delivery + structure) / 2) * 100),
    feedback,
  };
}

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */

export interface InterviewReport {
  overall: number;
  communication: number;
  bySection: { section: InterviewSection; score: number }[];
  strengths: string[];
  improvements: string[];
  practiceSkills: string[];
}

export function summariseInterview(plan: InterviewPlan, evaluations: AnswerEvaluation[]): InterviewReport {
  const byId = new Map(evaluations.map((e) => [e.questionId, e]));
  const scored = plan.questions.map((q) => ({ q, e: byId.get(q.id) }));
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

  const overall = avg(scored.map(({ e }) => e?.score ?? 0));
  const answered = scored.filter(({ e }) => e && !e.skipped);
  const communication = avg(answered.map(({ e }) => e!.communication));

  const sections = Array.from(new Set(plan.questions.map((q) => q.section)));
  const bySection = sections.map((section) => ({
    section,
    score: avg(scored.filter(({ q }) => q.section === section).map(({ e }) => e?.score ?? 0)),
  }));

  const strengths = scored
    .filter(({ e }) => (e?.score ?? 0) >= 70)
    .map(({ q }) => (q.skill ? `${q.skill} (${q.section.toLowerCase()})` : q.section))
    .slice(0, 3);

  const improvements: string[] = [];
  const skipped = scored.filter(({ e }) => !e || e.skipped).length;
  if (skipped) improvements.push(`Answer every question. You skipped ${skipped}, and a partial answer always scores higher.`);
  const fillers = answered.reduce((n, { e }) => n + e!.fillerCount, 0);
  if (fillers >= 5) improvements.push(`Cut filler words (${fillers} in total). Pause briefly instead of saying "um" or "like".`);
  const short = answered.filter(({ q, e }) => e!.wordCount < LENGTH_RANGE[q.kind][0]).length;
  if (short >= 2) improvements.push("Give fuller answers: state the idea, explain why, then give an example.");
  const behavioral = answered.filter(({ q }) => q.kind === "behavioral");
  if (behavioral.some(({ e }) => !e!.covered.includes("result")))
    improvements.push("Use the STAR structure (Situation, Task, Action, Result) for behavioral answers.");

  const practiceSkills = Array.from(
    new Set(scored.filter(({ q, e }) => q.skill && (e?.score ?? 0) < 60).map(({ q }) => q.skill!))
  );
  if (practiceSkills.length) improvements.push(`Revise ${practiceSkills.join(", ")} before your next interview.`);

  return { overall, communication, bySection, strengths, improvements: improvements.slice(0, 4), practiceSkills };
}
