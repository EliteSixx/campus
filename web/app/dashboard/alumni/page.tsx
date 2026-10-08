"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/shared/metric-card";
import { DisclosureSection } from "@/components/shared/disclosure-section";
import {
  Share2,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
  Code2,
  Users,
  CalendarDays,
  ArrowRight,
  Clock,
  Lightbulb,
} from "lucide-react";
import { useUserProfile } from "@/context/user-profile-context";
import {
  DEMO_MENTORSHIP_REQUESTS,
  DEMO_MENTEES,
  DEMO_SESSIONS,
  DEMO_REFERRALS,
  DEMO_PROOF_REVIEWS,
  getStudentById,
  PRIMARY_DEMO_ALUMNI_ID,
} from "@/data/demo-alumni";

export default function AlumniDashboardPage() {
  const { currentProfile } = useUserProfile();

  // Pull demo data scoped to primary alumni
  const myRequests = DEMO_MENTORSHIP_REQUESTS.filter((r) => r.alumniId === PRIMARY_DEMO_ALUMNI_ID && r.status === "pending");
  const myMentees = DEMO_MENTEES.filter((m) => m.alumniId === PRIMARY_DEMO_ALUMNI_ID);
  const upcomingSessions = DEMO_SESSIONS.filter((s) => s.alumniId === PRIMARY_DEMO_ALUMNI_ID && s.status === "upcoming");
  const myReferrals = DEMO_REFERRALS.filter((r) => r.alumniId === PRIMARY_DEMO_ALUMNI_ID && r.status === "open");
  const verifiedProofs = DEMO_PROOF_REVIEWS.filter((p) => p.alumniId === PRIMARY_DEMO_ALUMNI_ID && p.verified);
  const pendingProofs = DEMO_PROOF_REVIEWS.filter((p) => p.alumniId === PRIMARY_DEMO_ALUMNI_ID && !p.verified);

  // Post referral modal state (preserved from original)
  const [showPostReferralModal, setShowPostReferralModal] = useState(false);
  const [newReferral, setNewReferral] = useState({
    roleTitle: "",
    company: "AsterCloud Labs",
    location: "Bengaluru / Remote",
    requiredReadiness: "70",
    slotsRemaining: "3",
  });

  const handlePostReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPostReferralModal(false);
    setNewReferral({
      roleTitle: "",
      company: "AsterCloud Labs",
      location: "Bengaluru / Remote",
      requiredReadiness: "70",
      slotsRemaining: "3",
    });
  };

  return (
    <DashboardShell title="Alumni Network Command Center">
      {/* Weekly Insight Card */}
      <Card className="p-4 border border-accent/20 bg-accent-soft/30 shadow-sm mb-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft border border-accent/20">
            <Lightbulb className="h-4.5 w-4.5 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-ink">Weekly Insight</span>
              <Badge tone="accent" className="text-[9px] py-0 px-1.5">AI</Badge>
            </div>
            <p className="text-xs text-ink-muted font-medium mt-1 leading-relaxed">
              Tanisha hasn&apos;t logged progress in 9 days — consider a check-in. Her ML Pipeline project is at 80% readiness and a quick nudge could help her cross the finish line.
            </p>
            <div className="mt-2.5">
              <Link href="/alumni/mentees">
                <Button variant="outline" size="sm" className="text-xs font-bold gap-1 h-7">
                  View Mentee <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Alumni Welcome Banner */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="accent" className="gap-1 text-xs font-bold">
                <Sparkles className="h-3 w-3" /> Alumni Console
              </Badge>
              <span className="text-xs text-ink-muted font-semibold">Class of 2021 · CUPGS Odisha</span>
            </div>
            <h2 className="text-xl font-extrabold text-ink mt-1.5">
              Welcome Back, {currentProfile.name || "Priya Mohanty"}
            </h2>
            <p className="text-xs text-ink-muted mt-1 max-w-xl font-medium">
              {currentProfile.yearOrTitle || "Senior Software Engineer @ AsterCloud Labs"} · Mentor & Referral Sponsor.
              You are actively mentoring {myMentees.length} students and have verified {verifiedProofs.length} skill proofs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button onClick={() => setShowPostReferralModal(true)} className="gap-1.5 text-xs font-bold text-white bg-accent">
              <Plus className="h-4 w-4" />
              Post Job Referral
            </Button>
            <Link href="/alumni/mentorship">
              <Button variant="secondary" className="gap-1.5 text-xs font-bold">
                <MessageSquare className="h-4 w-4 text-accent" />
                Mentorship Queue ({myRequests.length})
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Pending Requests" value={`${myRequests.length}`} icon={MessageSquare} tone="warning" />
        <MetricCard label="Active Mentees" value={`${myMentees.length}`} icon={Users} tone="accent" />
        <MetricCard label="Upcoming Sessions" value={`${upcomingSessions.length}`} icon={CalendarDays} tone="success" />
        <MetricCard label="Verified Proofs" value={`${verifiedProofs.length}`} icon={ShieldCheck} tone="accent" />
      </div>

      {/* Collapsible Sections */}
      <div className="mt-6 space-y-4">

        {/* Mentorship Requests */}
        <DisclosureSection title="Mentorship Requests" icon={MessageSquare} count={myRequests.length}>
          <div className="space-y-3">
            {myRequests.map((req) => {
              const student = getStudentById(req.studentId);
              return (
                <div key={req.id} className="p-3.5 rounded-xl border border-border bg-surface-raised space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">{student?.name || "Unknown Student"}</div>
                      <div className="text-[11px] text-ink-muted font-medium">{student?.department}</div>
                    </div>
                    <Badge tone="warning" className="text-[10px]">Pending</Badge>
                  </div>
                  <div className="text-xs text-ink font-semibold">{req.topic}</div>
                  <p className="text-[11px] text-ink-muted font-medium line-clamp-2">{req.message}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-ink-faint font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {req.createdAt}
                    </span>
                    <Link href="/alumni/mentorship">
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1 font-bold">
                        Review <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
            <Link href="/alumni/mentorship" className="block">
              <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-accent gap-1">
                Open Full Mentorship Inbox <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </DisclosureSection>

        {/* My Mentees */}
        <DisclosureSection title="My Mentees" icon={Users} count={myMentees.length}>
          <div className="space-y-3">
            {myMentees.map((mentee) => {
              const student = getStudentById(mentee.studentId);
              return (
                <div key={mentee.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-raised">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold border border-accent/20">
                      {student?.avatarInitials || "?"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink">{student?.name}</div>
                      <div className="text-[11px] text-ink-muted font-medium">{mentee.topic}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-accent">{mentee.sessionsCompleted} sessions</div>
                    {mentee.nextSession && (
                      <div className="text-[10px] text-ink-muted font-medium">Next: {mentee.nextSession}</div>
                    )}
                  </div>
                </div>
              );
            })}
            <Link href="/alumni/mentees" className="block">
              <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-accent gap-1">
                View All Mentees <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </DisclosureSection>

        {/* Upcoming Sessions */}
        <DisclosureSection title="Upcoming Sessions" icon={CalendarDays} count={upcomingSessions.length}>
          <div className="space-y-3">
            {upcomingSessions.map((session) => {
              const student = getStudentById(session.studentId);
              return (
                <div key={session.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-raised">
                  <div>
                    <div className="text-xs font-bold text-ink">{session.topic}</div>
                    <div className="text-[11px] text-ink-muted font-medium">
                      with {student?.name} · {session.date} · {session.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="success" className="text-[10px]">{session.duration}</Badge>
                    <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="text-xs h-7 gap-1 font-bold text-white bg-accent">
                        Join <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
            <Link href="/alumni/sessions" className="block">
              <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-accent gap-1">
                Manage All Sessions <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </DisclosureSection>

        {/* Active Internal Referrals */}
        <DisclosureSection title="My Active Internal Referrals" icon={Share2} count={myReferrals.length}>
          <div className="space-y-3">
            {myReferrals.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border bg-surface-raised gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">{slot.roleTitle}</span>
                    <Badge tone="accent" className="text-[10px]">{slot.company}</Badge>
                  </div>
                  <p className="text-[11px] text-ink-muted font-medium mt-1">
                    {slot.location} · Minimum {slot.requiredReadiness}% Skill Readiness Required
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-faint font-medium">
                    <span>Posted: {slot.postedDate}</span>
                    <span>Applicants: {slot.applicantsCount} Students</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone="success" className="text-xs">{slot.slotsRemaining} Slots Left</Badge>
                </div>
              </div>
            ))}
            <Link href="/alumni/referrals" className="block">
              <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-accent gap-1">
                View All Referrals <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </DisclosureSection>

        {/* Student Proof Verification Queue */}
        <DisclosureSection title="Student Proof Verification" icon={ShieldCheck} count={pendingProofs.length}>
          <div className="space-y-3">
            {pendingProofs.map((item) => {
              const student = getStudentById(item.studentId);
              return (
                <div key={item.id} className="p-3.5 rounded-xl border border-border bg-surface-raised space-y-2.5 text-ink">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">{student?.name || "Student"}</div>
                      <div className="text-[11px] text-ink-muted font-medium">{student?.department}</div>
                    </div>
                    <Badge tone="neutral" className="text-[10px]">Needs Review</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-surface p-2 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-accent font-bold">
                      <Code2 className="h-3.5 w-3.5" />
                      <span>{item.skillName} ({item.readinessScore}% Score)</span>
                    </div>
                    <a
                      href={`https://${item.repoLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Code Repo</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}

            {verifiedProofs.filter(p => ["stu-002", "stu-013", "stu-014", "stu-015", "stu-016", "stu-017"].includes(p.studentId)).map((item) => {
              const student = getStudentById(item.studentId);
              return (
                <div key={item.id} className="p-3.5 rounded-xl border border-border bg-surface-raised space-y-2.5 text-ink">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">{student?.name || "Student"}</div>
                      <div className="text-[11px] text-ink-muted font-medium">{student?.department}</div>
                    </div>
                    <Badge tone="success" className="text-[10px]">Verified by You</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-surface p-2 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-accent font-bold">
                      <Code2 className="h-3.5 w-3.5" />
                      <span>{item.skillName} ({item.readinessScore}% Score)</span>
                    </div>
                    <a
                      href={`https://${item.repoLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Code Repo</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}

            <div className="text-[11px] text-ink-muted font-medium text-center py-2">
              {verifiedProofs.length} proofs already verified ·{" "}
              <Link href="/alumni/proofs" className="text-accent font-bold hover:underline">
                View Full Queue
              </Link>
            </div>
          </div>
        </DisclosureSection>
      </div>

      {/* Post Referral Modal (preserved from original) */}
      {showPostReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-ink">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="h-4.5 w-4.5 text-accent" />
                <span className="text-sm font-bold text-ink">Post Internal Job Referral Slot</span>
              </div>
              <button
                onClick={() => setShowPostReferralModal(false)}
                className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePostReferral} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Role Title *</label>
                <Input
                  placeholder="e.g. Software Engineer I (Backend)"
                  value={newReferral.roleTitle}
                  onChange={(e) => setNewReferral({ ...newReferral, roleTitle: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">Employer Company</label>
                  <Input
                    placeholder="e.g. AsterCloud Labs"
                    value={newReferral.company}
                    onChange={(e) => setNewReferral({ ...newReferral, company: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">Job Location</label>
                  <Input
                    placeholder="e.g. Bengaluru / Remote"
                    value={newReferral.location}
                    onChange={(e) => setNewReferral({ ...newReferral, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">Min Skill Readiness (%)</label>
                  <Input
                    type="number"
                    value={newReferral.requiredReadiness}
                    onChange={(e) => setNewReferral({ ...newReferral, requiredReadiness: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">Referral Slots Available</label>
                  <Input
                    type="number"
                    value={newReferral.slotsRemaining}
                    onChange={(e) => setNewReferral({ ...newReferral, slotsRemaining: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPostReferralModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1 font-bold text-white bg-accent">
                  <Share2 className="h-3.5 w-3.5" />
                  Publish Referral Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
