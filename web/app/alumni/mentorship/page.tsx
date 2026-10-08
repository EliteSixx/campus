"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { MetricCard } from "@/components/shared/metric-card";
import {
  MessageSquare,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import {
  DEMO_MENTORSHIP_REQUESTS,
  getStudentById,
  PRIMARY_DEMO_ALUMNI_ID,
  DemoMentorshipRequest,
} from "@/data/demo-alumni";

export default function MentorshipInboxPage() {
  const [requests, setRequests] = useState<DemoMentorshipRequest[]>(
    DEMO_MENTORSHIP_REQUESTS.filter((r) => r.alumniId === PRIMARY_DEMO_ALUMNI_ID)
  );
  
  const [activeFilter, setActiveFilter] = useState<"All" | "pending" | "accepted" | "declined">("All");

  const [schedulingRequest, setSchedulingRequest] = useState<DemoMentorshipRequest | null>(null);
  const [customMeetLink, setCustomMeetLink] = useState("https://meet.google.com/skillsync-alumni-session");
  const [scheduledDateTime, setScheduledDateTime] = useState("Tomorrow at 6:00 PM IST");

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === "All") return true;
    return r.status === activeFilter;
  });

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingRequest) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === schedulingRequest.id
          ? {
              ...r,
              status: "accepted",
            }
          : r
      )
    );
    // In a real app we'd also generate a Session or Mentee record here

    setSchedulingRequest(null);
  };

  const handleDecline = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "declined" } : r))
    );
  };

  return (
    <DashboardShell title="Mentorship Inbox & Calendar">
      {/* Header Banner */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">1-on-1 Mentorship Inbox</h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 max-w-2xl font-medium">
              Manage incoming student advice requests, accept mentees, and schedule your initial kickoff calls.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge tone="accent" className="text-xs py-1 px-3 gap-1">
              <Video className="h-3.5 w-3.5" />
              Google Meet Integration
            </Badge>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Pending Requests"
          value={`${requests.filter((r) => r.status === "pending").length} Requests`}
          icon={Clock}
          tone="warning"
        />
        <MetricCard
          label="Accepted Mentees"
          value={`${requests.filter((r) => r.status === "accepted").length} Accepted`}
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Declined"
          value={`${requests.filter((r) => r.status === "declined").length} Declined`}
          icon={X}
          tone="neutral"
        />
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-border pb-3">
        {(["All", "pending", "accepted", "declined"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
              activeFilter === tab
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink hover:bg-surface-raised"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions Inbox List */}
      <div className="mt-4 space-y-4">
        {filteredRequests.map((request) => {
          const student = getStudentById(request.studentId);
          return (
            <Card key={request.id} className="p-5 border border-border bg-surface text-ink hover:border-border-strong transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent font-bold text-xs border border-accent/30">
                      {student?.avatarInitials || "?"}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-ink">{student?.name}</h3>
                      <p className="text-[11px] text-ink-muted font-semibold">{student?.department}</p>
                    </div>
                  </div>

                  <div className="bg-surface-raised p-3.5 rounded-xl border border-border text-xs text-ink space-y-1">
                    <div className="font-bold text-accent">Topic: {request.topic}</div>
                    <p className="text-[11px] text-ink-muted leading-relaxed font-medium">&ldquo;{request.message}&rdquo;</p>
                  </div>
                  <div className="text-[10px] text-ink-faint font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Requested on {request.createdAt}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                  <Badge
                    tone={
                      request.status === "accepted"
                        ? "success"
                        : request.status === "declined"
                        ? "neutral"
                        : "warning"
                    }
                    className="text-xs capitalize"
                  >
                    {request.status}
                  </Badge>

                  <div className="flex items-center gap-2">
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 px-2 font-bold"
                          onClick={() => handleDecline(request.id)}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs gap-1 font-bold text-white bg-accent"
                          onClick={() => setSchedulingRequest(request)}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Accept & Schedule Kickoff
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-ink-muted text-xs font-medium border border-dashed border-border rounded-xl">
            No mentorship requests found in this status.
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {schedulingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-ink">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Video className="h-4.5 w-4.5 text-accent" />
                <span className="text-sm font-bold text-ink">
                  Schedule Kickoff with {getStudentById(schedulingRequest.studentId)?.name}
                </span>
              </div>
              <button
                onClick={() => setSchedulingRequest(null)}
                className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Date & Time Slot *</label>
                <Input
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  placeholder="e.g. Tomorrow at 6:00 PM IST"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Google Meet / Session Link *</label>
                <Input
                  value={customMeetLink}
                  onChange={(e) => setCustomMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setSchedulingRequest(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1 font-bold text-white bg-accent">
                  Confirm & Accept Mentee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
