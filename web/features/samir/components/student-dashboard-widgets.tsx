"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, ClipboardList, FileText, Target, Mic, Sparkles, Video } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { useUserProfile } from "@/context/user-profile-context";
import { getStudentResume, calculateResumeCompletion } from "@/lib/api/resumes";
import { CURRENT_STUDENT_ID, currentStudent } from "../data/current-student";
import { useApplications, isActiveApplication } from "../data/applications-store";
import { loadInterviewHistory } from "../data/interview-history";

/* -------------------------------------------------------------------------- */
/* Greeting                                                                   */
/* -------------------------------------------------------------------------- */

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function StudentGreeting() {
  const { currentProfile } = useUserProfile();
  // Time of day is only known in the browser; render a neutral greeting until mounted.
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => setGreeting(greetingFor(new Date().getHours())), []);

  const firstName = (currentProfile.name || currentStudent.name).split(" ")[0];
  const goal = currentProfile.careerGoal || currentStudent.careerGoal;

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-ink">
          {greeting}, {firstName}
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Here&apos;s where you stand against your goal of becoming a {goal}.
        </p>
      </div>
      <Link
        href="/profile/interview"
        className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-accent to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:opacity-95 transition-all shrink-0 sm:self-auto"
      >
        <Sparkles className="h-4 w-4" />
        AI Mock Interview
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Applications metric                                                        */
/* -------------------------------------------------------------------------- */

export function ApplicationsMetric() {
  const { applications, hydrated } = useApplications();
  const active = applications.filter(isActiveApplication);
  const awaiting = active.filter((a) => a.status === "Applied" || a.status === "Under Review").length;
  const interviews = active.filter((a) => a.status === "Interview").length;

  return (
    <Link href="/applications" className="block">
      <MetricCard
        label="Active Applications"
        value={hydrated ? `${active.length}` : "–"}
        icon={ClipboardList}
        trend={
          !hydrated
            ? undefined
            : interviews > 0
            ? `${interviews} interview${interviews > 1 ? "s" : ""} · ${awaiting} awaiting reply`
            : `${awaiting} awaiting reply`
        }
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Next actions                                                               */
/* -------------------------------------------------------------------------- */

export interface NextActionOpportunity {
  id: string;
  title: string;
  companyName: string;
  matchScore: number;
  deadline: string;
  daysLeft: number;
}

export interface NextActionGap {
  name: string;
  current: number;
  target: number;
}

interface Action {
  id: string;
  icon: typeof Target;
  title: string;
  detail: string;
  href: string;
  cta: string;
  urgent?: boolean;
}

const MIN_MATCH_TO_SUGGEST = 50;

export function NextActions({
  opportunities,
  gaps,
  opportunityTitles,
}: {
  /** Open roles, already scored with the shared match function */
  opportunities: NextActionOpportunity[];
  gaps: NextActionGap[];
  /** id → "Title at Company" for roles the student may have applied to */
  opportunityTitles: Record<string, string>;
}) {
  const { applications, hydrated } = useApplications();
  const [resume, setResume] = useState<{ score: number; missing?: string } | null>(null);
  const [lastInterview, setLastInterview] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    setLastInterview(loadInterviewHistory()[0]?.overall ?? null);
    getStudentResume(CURRENT_STUDENT_ID).then((r) => {
      const c = calculateResumeCompletion(r);
      setResume({ score: c.score, missing: c.missingItems[0] });
    });
  }, []);

  if (!hydrated || !resume || lastInterview === undefined) {
    return <div className="h-56 animate-pulse rounded-lg bg-surface-raised" />;
  }

  const actions: Action[] = [];

  const interview = applications.find((a) => a.status === "Interview");
  if (interview) {
    actions.push({
      id: "interview",
      icon: Mic,
      title: `Prepare for your interview`,
      detail: opportunityTitles[interview.opportunityId] ?? "Upcoming interview",
      href: "/applications",
      cta: "View",
      urgent: true,
    });
  }

  if (lastInterview === null || lastInterview < 60) {
    actions.push({
      id: "mock-interview",
      icon: Video,
      title: lastInterview === null ? "Take your first mock interview" : "Retake your mock interview",
      detail:
        lastInterview === null
          ? "About 15 minutes. Planned around your strengths and gaps."
          : `Last score ${lastInterview}/100. Aim for 60+ before real interviews.`,
      href: "/profile/interview",
      cta: "Start",
    });
  }

  const appliedIds = new Set(applications.filter(isActiveApplication).map((a) => a.opportunityId));
  const candidates = opportunities
    .filter((o) => !appliedIds.has(o.id) && o.matchScore >= MIN_MATCH_TO_SUGGEST)
    // Soonest deadline first among good matches, then the highest match.
    .sort((a, b) => a.daysLeft - b.daysLeft || b.matchScore - a.matchScore);
  const best = candidates[0];
  if (best) {
    actions.push({
      id: "apply",
      icon: CalendarClock,
      title: `Apply to ${best.title} at ${best.companyName}`,
      detail: `${best.matchScore}% match · ${
        best.daysLeft <= 0 ? "closes today" : `closes in ${best.daysLeft} day${best.daysLeft > 1 ? "s" : ""}`
      }`,
      href: `/opportunities/${best.id}`,
      cta: "Apply",
      urgent: best.daysLeft <= 7,
    });
  }

  const gap = gaps[0];
  if (gap) {
    actions.push({
      id: "gap",
      icon: Target,
      title: `Close your ${gap.name} gap`,
      detail: `You're at ${gap.current}%. Your target role needs ${gap.target}%.`,
      href: "/career-intelligence?tab=roadmaps",
      cta: "Start",
    });
  }

  if (resume.score < 100) {
    actions.push({
      id: "resume",
      icon: FileText,
      title: "Finish your resume",
      detail: `${resume.score}% complete${resume.missing ? ` · missing ${resume.missing}` : ""}`,
      href: "/profile/resume",
      cta: "Edit",
    });
  }

  const top = actions.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <div>
            <CardTitle>Your next steps</CardTitle>
            <CardDescription>The most useful things to do this week</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-ink-muted">You&apos;re all caught up. Check back when new roles are posted.</p>
        ) : (
          <ol className="space-y-2">
            {top.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={a.id}>
                  <Link
                    href={a.href}
                    className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-accent/40 hover:bg-accent-soft/30"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4 shrink-0 text-ink-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{a.title}</p>
                      <p className={a.urgent ? "truncate text-xs text-warning" : "truncate text-xs text-ink-muted"}>
                        {a.detail}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-accent">
                      {a.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
