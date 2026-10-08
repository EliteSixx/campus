"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MetricCard } from "@/components/shared/metric-card";
import {
  GraduationCap,
  Search,
  MessageSquare,
  Building2,
  CheckCircle2,
  X,
  Sparkles,
  TrendingUp,
  Command,
} from "lucide-react";
import { DEMO_ALUMNI, DemoAlumni } from "@/data/demo-alumni";

export default function AlumniPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [mentorshipModalAlumni, setMentorshipModalAlumni] = useState<DemoAlumni | null>(null);
  const [mentorshipTopic, setMentorshipTopic] = useState("");
  const [mentorshipMessage, setMentorshipMessage] = useState("");
  const [mentorshipSuccess, setMentorshipSuccess] = useState(false);

  // Derive unique domains and companies from demo data
  const domains = [...new Set(DEMO_ALUMNI.map((a) => a.domain))];
  const companies = [...new Set(DEMO_ALUMNI.map((a) => a.employer))];

  const filteredAlumni = DEMO_ALUMNI.filter((alumnus) => {
    const matchesSearch =
      alumnus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain = selectedDomain === "all" || alumnus.domain === selectedDomain;
    const matchesCompany = selectedCompany === "all" || alumnus.employer.toLowerCase().includes(selectedCompany.toLowerCase());

    return matchesSearch && matchesDomain && matchesCompany;
  });

  const handleRequestMentorship = (e: React.FormEvent) => {
    e.preventDefault();
    setMentorshipSuccess(true);
    setTimeout(() => {
      setMentorshipSuccess(false);
      setMentorshipModalAlumni(null);
      setMentorshipTopic("");
      setMentorshipMessage("");
    }, 1500);
  };

  return (
    <DashboardShell title="Alumni Directory & Network">
      {/* Header Banner */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">Alumni Peer Directory</h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 max-w-2xl font-medium">
              Discover verified graduates across Tier-1 tech companies, high-growth startups, and research labs.
              Book 1-on-1 mentorship calls, request internal referrals, and trace real career trajectories.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge tone="accent" className="text-xs py-1 px-3 gap-1">
              <Sparkles className="h-3 w-3" />
              {DEMO_ALUMNI.length} Verified Graduates
            </Badge>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Active Alumni Mentors" value={`${DEMO_ALUMNI.filter(a => a.availableForMentorship).length}`} icon={GraduationCap} tone="accent" />
        <MetricCard label="Average Career Growth" value="3.4x" icon={TrendingUp} tone="success" />
        <MetricCard label="Top Hiring Employers" value={`${companies.length} Tech Giants`} icon={Building2} tone="warning" />
      </div>

      {/* Search & Filter Control Bar */}
      <Card className="mt-5 p-4 border border-border bg-surface text-ink">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-ink-muted" />
            <Input
              placeholder="Search by name, employer, or role title..."
              className="pl-9 pr-12 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-2.5 flex items-center gap-0.5 text-[10px] text-ink-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border font-semibold">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Select
              className="text-xs w-full sm:w-44"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              <option value="all">All Domains</option>
              {domains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>

            <Select
              className="text-xs w-full sm:w-40"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="all">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Alumni Directory Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlumni.map((alumnus) => (
          <Card
            key={alumnus.id}
            className="p-5 border border-border bg-surface text-ink flex flex-col justify-between hover:border-accent/40 shadow-sm transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent font-extrabold text-sm border border-accent/30 shadow-sm">
                    {alumnus.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-ink">{alumnus.name}</h3>
                    <p className="text-xs font-bold text-accent">{alumnus.jobTitle}</p>
                    <div className="flex items-center gap-1 text-[11px] text-ink-muted font-medium mt-0.5">
                      <Building2 className="h-3 w-3 text-accent" />
                      <span>{alumnus.employer}</span>
                    </div>
                  </div>
                </div>

                {alumnus.availableForMentorship && (
                  <Badge tone="success" className="text-[10px] py-0.5">
                    Mentoring
                  </Badge>
                )}
              </div>

              <div className="mt-3.5 space-y-2 text-xs text-ink-muted border-t border-border pt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Graduation Class:</span>
                  <span className="font-bold text-ink">{alumnus.gradYear} ({alumnus.department})</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Location:</span>
                  <span className="font-bold text-ink">{alumnus.location}</span>
                </div>
                <div className="text-[11px]">
                  <span className="text-ink-muted font-semibold">Career Trajectory: </span>
                  <span className="text-ink font-bold">{alumnus.careerPath}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2 pt-1">
                  {alumnus.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block rounded bg-surface-raised px-2 py-0.5 text-[10px] font-bold text-ink border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <Button
                variant={alumnus.availableForMentorship ? "primary" : "secondary"}
                size="sm"
                className="w-full text-xs gap-1.5 font-bold text-white bg-accent"
                disabled={!alumnus.availableForMentorship}
                onClick={() => setMentorshipModalAlumni(alumnus)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {alumnus.availableForMentorship ? "Request 1-on-1 Mentorship" : "Mentorship Full"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Mentorship Request Modal */}
      {mentorshipModalAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-ink">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-accent" />
                <span className="text-sm font-bold text-ink">
                  Request Mentorship with {mentorshipModalAlumni.name}
                </span>
              </div>
              <button
                onClick={() => setMentorshipModalAlumni(null)}
                className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {mentorshipSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
                <p className="text-sm font-bold text-ink">Mentorship Request Sent!</p>
                <p className="text-xs text-ink-muted font-medium">
                  {mentorshipModalAlumni.name} will receive your request and schedule a session via Google Meet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestMentorship} className="mt-4 space-y-3.5">
                <div className="rounded-xl bg-surface-raised p-3 text-xs text-ink border border-border space-y-1">
                  <div className="font-bold text-ink">
                    {mentorshipModalAlumni.jobTitle} @ {mentorshipModalAlumni.employer}
                  </div>
                  <div className="text-ink-muted font-medium">Class of {mentorshipModalAlumni.gradYear} · {mentorshipModalAlumni.department}</div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">Session Focus Topic *</label>
                  <Select
                    className="text-xs"
                    value={mentorshipTopic}
                    onChange={(e) => setMentorshipTopic(e.target.value)}
                    required
                  >
                    <option value="">Select a topic</option>
                    <option value="Resume & Portfolio Review">Resume & Portfolio Review</option>
                    <option value="System Design & Technical Prep">System Design & Technical Prep</option>
                    <option value="Career Transition & Roadmap">Career Transition & Roadmap</option>
                    <option value="Referral & Interview Guidance">Referral & Interview Guidance</option>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">Your Message / Context *</label>
                  <Textarea
                    rows={3}
                    placeholder="Briefly introduce yourself and what specific advice you're looking for..."
                    value={mentorshipMessage}
                    onChange={(e) => setMentorshipMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setMentorshipModalAlumni(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="gap-1 font-bold text-white bg-accent">
                    Send Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
