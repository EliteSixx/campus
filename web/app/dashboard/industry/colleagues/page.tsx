"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, MessageSquareText, Send, Users2, X } from "lucide-react";

type TeamGroup = {
  team: string;
  company: string;
  members: Array<{ name: string; role: string; focus: string }>;
};

const colleagueGroups: TeamGroup[] = [
  {
    company: "TechNova",
    team: "Marketing Management Hiring",
    members: [
      { name: "Sarah Chen", role: "Talent Acquisition Lead", focus: "Campaign hiring and funnel strategy" },
      { name: "Rohit Nair", role: "Senior Recruiter", focus: "Demand generation and GTM roles" },
      { name: "Ananya Verma", role: "Hiring Manager", focus: "Brand marketing and lifecycle teams" },
    ],
  },
  {
    company: "TechNova",
    team: "Product & Growth Hiring",
    members: [
      { name: "Milan Shah", role: "Technical Recruiter", focus: "Product analytics and experimentation" },
      { name: "Priya Iyer", role: "People Partner", focus: "Cross-functional product hiring" },
      { name: "Dev Kapoor", role: "Senior Manager", focus: "Growth, retention and CRM roles" },
    ],
  },
  {
    company: "TechNova",
    team: "Engineering Hiring",
    members: [
      { name: "Aisha Khan", role: "Recruitment Specialist", focus: "Backend and platform engineering" },
      { name: "Victor Dsouza", role: "Staff Engineer", focus: "AI and systems hiring" },
      { name: "Nisha Joshi", role: "Hiring Coordinator", focus: "Interview scheduling and candidate experience" },
    ],
  },
];

const initialMessages: Record<string, Array<{ sender: "them" | "me"; text: string; time: string }>> = {
  "Sarah Chen": [
    { sender: "them", text: "Hi! IΓÇÖm reviewing the marketing hiring pipeline for Q4.", time: "09:10" },
    { sender: "me", text: "Perfect, I can share candidate notes and hiring priorities.", time: "09:11" },
  ],
  "Rohit Nair": [
    { sender: "them", text: "LetΓÇÖs align on the GTM recruiting shortlist for this week.", time: "10:02" },
  ],
  "Ananya Verma": [
    { sender: "them", text: "We need a stronger creative hiring pipeline for lifecycle roles.", time: "11:35" },
  ],
  "Milan Shah": [
    { sender: "them", text: "Can we sync on product analytics hiring needs?", time: "08:45" },
  ],
  "Priya Iyer": [
    { sender: "them", text: "IΓÇÖve shortlisted a few strong cross-functional candidates.", time: "13:20" },
  ],
  "Dev Kapoor": [
    { sender: "them", text: "The growth team needs a sharper hiring roadmap this sprint.", time: "14:10" },
  ],
  "Aisha Khan": [
    { sender: "them", text: "IΓÇÖve scheduled the final platform engineering interviews.", time: "15:00" },
  ],
  "Victor Dsouza": [
    { sender: "them", text: "LetΓÇÖs compare the AI systems candidate panel feedback.", time: "16:40" },
  ],
  "Nisha Joshi": [
    { sender: "them", text: "The candidate experience notes are ready for review.", time: "17:12" },
  ],
};

export default function IndustryColleaguesPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [chatThreads, setChatThreads] = useState(initialMessages);

  const selectedMember =
    activeChat &&
    colleagueGroups
      .flatMap((group) => group.members)
      .find((member) => member.name === activeChat);

  const handleSendMessage = () => {
    if (!activeChat || !draft.trim()) return;

    const nextMessage = {
      sender: "me" as const,
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatThreads((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] ?? []), nextMessage],
    }));

    setDraft("");
  };

  return (
    <DashboardShell title="Industry Colleagues">
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          <Building2 className="h-3.5 w-3.5" />
          Company network
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{colleagueGroups[0].company} colleagues</h1>
        <p className="text-sm text-ink-muted">
          Teams and people working across the company hiring cells and growth functions.
        </p>
      </div>

      <div className="space-y-5">
        {colleagueGroups.map((group) => (
          <Card key={group.team} className="overflow-hidden">
            <CardHeader className="border-b border-border/80 bg-surface-raised/60">
              <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    <Briefcase className="h-3.5 w-3.5" />
                    {group.company}
                  </div>
                  <CardTitle className="mt-2 text-lg">{group.team}</CardTitle>
                  <CardDescription>Hiring cell responsible for this capability area</CardDescription>
                </div>
                <Badge tone="accent">{group.members.length} members</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {group.members.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3 shadow-[0_14px_30px_-28px_rgba(15,12,9,0.4)] transition-colors hover:border-accent/40 dark:bg-[#1b160e]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Users2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{member.name}</p>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">{member.role}</p>
                    </div>
                  </div>

                  <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate text-sm text-ink-muted">{member.focus}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveChat(member.name)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-raised text-ink-muted transition hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
                    aria-label={`Chat with ${member.name}`}
                    title={`Chat with ${member.name}`}
                  >
                    <MessageSquareText className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {activeChat && selectedMember ? (
        <div className="fixed inset-y-4 right-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_28px_80px_-28px_rgba(0,0,0,0.42)] backdrop-blur-xl dark:bg-[#17130f]">
          <div className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">{selectedMember.name}</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">{selectedMember.role}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveChat(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink-muted transition hover:border-accent/40 hover:text-accent"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(166,105,18,0.09),_transparent_55%)] p-4">
            {(chatThreads[activeChat] ?? []).map((message, index) => (
              <div key={`${message.time}-${index}`} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.sender === "me"
                      ? "bg-accent text-white"
                      : "border border-border bg-surface-raised text-ink"
                  }`}
                >
                  <p>{message.text}</p>
                  <span className={`mt-1 block text-[10px] ${message.sender === "me" ? "text-white/70" : "text-ink-muted"}`}>
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border bg-surface-raised p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-2 py-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Write a message"
                className="h-10 flex-1 bg-transparent px-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition hover:opacity-90"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
