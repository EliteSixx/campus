"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Download,
  BookmarkPlus,
  Star,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FacultyMember, FacultyStatus } from "@/data/institution/mock-faculty";
import { cn } from "@/lib/utils";

interface FacultyProfileDrawerProps {
  member: FacultyMember | null;
  onClose: () => void;
}

const statusConfig: Record<FacultyStatus, { tone: "success" | "warning" | "neutral" | "danger" | "accent" | "cyan"; label: string }> = {
  active: { tone: "success", label: "Active" },
  "on-leave": { tone: "warning", label: "On Leave" },
  sabbatical: { tone: "cyan", label: "On Sabbatical" },
  visiting: { tone: "accent", label: "Visiting Fellow" },
};

export function FacultyProfileDrawer({ member, onClose }: FacultyProfileDrawerProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!member) return null;

  const status = statusConfig[member.status] || { tone: "neutral", label: member.status };

  const handleAction = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const exportFacultyDossier = () => {
    const text = `FACULTY & STAFF ACADEMIC DOSSIER\n` +
      `Name: ${member.name} (${member.employeeId})\n` +
      `Designation: ${member.designation}\n` +
      `Department: ${member.department}\n` +
      `Qualification: ${member.qualification}\n` +
      `Specialization: ${member.specialization}\n` +
      `Experience: ${member.experienceYears} Years\n` +
      `Publications: ${member.publicationsCount} | Patents: ${member.patentsCount}\n` +
      `Performance Rating: ${member.performanceScore}/5.0\n` +
      `Generated on: ${new Date().toLocaleDateString()}\n`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${member.employeeId}_academic_dossier.txt`;
    link.click();
    URL.revokeObjectURL(url);

    handleAction(`Academic dossier downloaded for ${member.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface-raised/40">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white font-bold text-lg shadow-md shadow-accent/20">
              {member.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">{member.name}</h3>
                <Badge tone={status.tone} className="text-[10px]">
                  {status.label}
                </Badge>
              </div>
              <p className="font-mono text-xs text-accent font-semibold">
                {member.employeeId} · {member.designation}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action toast */}
        {toastMsg && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-border bg-surface-raised/40 p-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Rating</p>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-500 tabular flex items-center justify-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-emerald-500" />
                {member.performanceScore}
              </p>
              <p className="text-[9px] text-ink-faint">out of 5.0</p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised/40 p-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Experience</p>
              <p className="mt-1 font-mono text-xl font-bold text-accent tabular">
                {member.experienceYears}y
              </p>
              <p className="text-[9px] text-ink-faint">academic</p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised/40 p-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Papers</p>
              <p className="mt-1 font-mono text-xl font-bold text-ink tabular">
                {member.publicationsCount}
              </p>
              <p className="text-[9px] text-ink-faint">peer reviewed</p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised/40 p-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Mentees</p>
              <p className="mt-1 font-mono text-xl font-bold text-sky-500 tabular">
                {member.mentorshipCount}
              </p>
              <p className="text-[9px] text-ink-faint">students</p>
            </div>
          </div>

          {/* Academic Profile & Specialization */}
          <div className="rounded-xl border border-border p-4 space-y-3 bg-surface">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-accent" /> Credentials & Domain
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-ink-faint block text-[10px] font-semibold uppercase">Highest Degree</span>
                <p className="mt-0.5 font-medium text-ink">{member.qualification}</p>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px] font-semibold uppercase">Core Domain & Specialization</span>
                <p className="mt-0.5 font-medium text-accent leading-relaxed">{member.specialization}</p>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px] font-semibold uppercase">Department Affiliation</span>
                <p className="mt-0.5 font-medium text-ink">{member.department}</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-xl border border-border p-4 space-y-2.5 bg-surface">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-accent" /> Institutional Contact
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-ink-faint block text-[10px]">Official Email</span>
                <a href={`mailto:${member.email}`} className="font-medium text-accent hover:underline flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </a>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">Campus Phone / Intercom</span>
                <span className="font-medium text-ink flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3 text-ink-faint" />
                  {member.phone}
                </span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">Joining Date</span>
                <span className="font-medium text-ink flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-ink-faint" />
                  {member.joiningDate}
                </span>
              </div>
              <div>
                <span className="text-ink-faint block text-[10px]">Member Category</span>
                <span className="font-medium text-ink capitalize mt-0.5 block">
                  {member.roleType === "faculty" ? "Teaching Faculty" : "Staff / Technical"}
                </span>
              </div>
            </div>
          </div>

          {/* Courses / Labs Taught */}
          <div className="rounded-xl border border-border p-4 space-y-2.5 bg-surface">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-accent" /> Assigned Courses & Responsibilities
              </h4>
              <span className="text-[10px] text-ink-faint">{member.coursesTaught.length} active</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.coursesTaught.map((course) => {
                const code = course.split(":")[0]?.trim() || "";
                return (
                  <Link
                    key={course}
                    href={`/dashboard/institution/curriculum?search=${encodeURIComponent(code)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface-raised/60 px-2.5 py-1 text-xs font-semibold text-ink hover:border-accent/60 hover:bg-accent/5 transition-colors group"
                    title={`Analyze curriculum alignment for ${course}`}
                  >
                    <span>{course}</span>
                    <Sparkles className="h-3 w-3 text-accent opacity-70 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Research & Industry Consultancy */}
          <div className="rounded-xl border border-dashed border-border p-4 space-y-3 bg-surface-raised/20">
            <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Award className="h-4 w-4 text-accent" /> Research & Industry Metrics
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-surface p-2 border border-border/60">
                <span className="font-mono text-base font-bold text-ink">{member.publicationsCount}</span>
                <span className="block text-[10px] text-ink-muted">Publications</span>
              </div>
              <div className="rounded-lg bg-surface p-2 border border-border/60">
                <span className="font-mono text-base font-bold text-emerald-500">{member.patentsCount}</span>
                <span className="block text-[10px] text-ink-muted">Patents Granted</span>
              </div>
              <div className="rounded-lg bg-surface p-2 border border-border/60">
                <span className="font-mono text-base font-bold text-accent">{member.consultancyProjects}</span>
                <span className="block text-[10px] text-ink-muted">Govt/Industry Projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Administrative Actions */}
        <div className="border-t border-border p-4 bg-surface-raised/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={exportFacultyDossier}
            >
              <Download className="h-3.5 w-3.5" />
              Download Dossier
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction(`Mentorship batch reassigned under ${member.name}.`)}
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Assign Mentees
            </Button>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAction(`FDP/Research grant approval logged for ${member.name}.`)}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            Approve FDP / Grant
          </Button>
        </div>
      </div>
    </div>
  );
}
