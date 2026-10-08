"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  CalendarDays,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  DEMO_MENTEES,
  DEMO_SESSIONS,
  getStudentById,
  PRIMARY_DEMO_ALUMNI_ID,
} from "@/data/demo-alumni";
import Link from "next/link";

export default function AlumniMenteesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const myMentees = DEMO_MENTEES.filter((m) => m.alumniId === PRIMARY_DEMO_ALUMNI_ID);
  
  const filteredMentees = myMentees.filter((mentee) => {
    const student = getStudentById(mentee.studentId);
    if (!student) return false;
    return student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           mentee.topic.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardShell title="My Active Mentees">
      {/* Header */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">My Active Mentees</h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 font-medium max-w-xl">
              Students you are currently mentoring. Track their progress, manage sessions, and review their goals.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge tone="accent" className="text-xs">{myMentees.length} Active</Badge>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="mt-5 p-4 border border-border bg-surface">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
          <Input
            placeholder="Search mentees by name or topic..."
            className="pl-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Mentee List */}
      <div className="mt-5 space-y-4">
        {filteredMentees.map((mentee) => {
          const student = getStudentById(mentee.studentId);
          // Find their sessions
          const menteeSessions = DEMO_SESSIONS.filter(s => s.menteeId === mentee.id);
          const upcoming = menteeSessions.filter(s => s.status === "upcoming")[0]; // Just take first if any
          const completedCount = menteeSessions.filter(s => s.status === "completed").length;

          return (
            <Card key={mentee.id} className="p-5 border border-border bg-surface text-ink">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                
                {/* Profile Info */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent text-lg font-bold border border-accent/20">
                    {student?.avatarInitials || "?"}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-ink">{student?.name}</h3>
                    <div className="text-[11px] text-ink-muted font-medium mt-0.5">{student?.department}</div>
                    
                    <div className="mt-2 text-xs font-semibold text-ink">Focus: {mentee.topic}</div>
                    <div className="text-[10px] text-ink-faint font-medium mt-1">Mentoring since {mentee.acceptedAt}</div>
                  </div>
                </div>

                {/* Session Stats & Actions */}
                <div className="flex flex-col gap-3 min-w-[240px]">
                  <div className="bg-surface-raised p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold text-ink-muted">Sessions Completed</span>
                      <Badge tone="success" className="text-[10px]">{completedCount}</Badge>
                    </div>
                    
                    {upcoming ? (
                      <div className="border-t border-border/50 pt-2 mt-1">
                        <span className="text-[10px] font-bold text-ink-muted block mb-1">Next Session</span>
                        <div className="text-xs font-semibold text-ink">{upcoming.topic}</div>
                        <div className="text-[10px] text-ink-muted flex items-center gap-1 mt-0.5">
                          <CalendarDays className="h-3 w-3" /> {upcoming.date} · {upcoming.time}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-border/50 pt-2 mt-1">
                         <span className="text-[10px] text-ink-muted italic">No upcoming sessions scheduled.</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href="/alumni/sessions" className="flex-1">
                       <Button size="sm" variant="outline" className="w-full text-xs font-bold gap-1">
                         <CalendarDays className="h-3.5 w-3.5" /> Schedule
                       </Button>
                    </Link>
                  </div>
                </div>

              </div>
            </Card>
          );
        })}
        {filteredMentees.length === 0 && (
          <div className="text-center py-10 text-ink-muted text-sm font-medium border border-dashed border-border rounded-xl">
            No mentees found matching "{searchTerm}".
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
