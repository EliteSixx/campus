"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/metric-card";
import {
  Gauge,
  Radar,
  IdCard,
  ArrowRight,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  Mic,
} from "lucide-react";
import { useRole } from "@/context/role-context";
import { useUserProfile } from "@/context/user-profile-context";
import { StudentAiExperience } from "@/features/samir";
import { currentStudent } from "@/features/samir/data/current-student";
import { ProfileChecklist } from "@/features/samir/components/profile-checklist";

export default function ProfilePage() {
  const { role } = useRole();
  const { currentProfile } = useUserProfile();
  const isStudent = role === "student";
  // Students fall back to the shared student record so every page shows the same person.
  const name = currentProfile.name || (isStudent ? currentStudent.name : "");
  const department = currentProfile.department || currentStudent.department;
  const year = currentProfile.yearOrTitle || currentStudent.year;
  const email = currentProfile.email || (isStudent ? currentStudent.email : "");
  const location = currentProfile.location || currentStudent.location;
  const scores = isStudent
    ? {
        employability: currentStudent.employabilityScore,
        readiness: currentStudent.skillReadiness,
        strength: currentStudent.profileStrength,
      }
    : {
        employability: currentProfile.employabilityScore,
        readiness: currentProfile.skillReadiness,
        strength: currentProfile.profileStrength,
      };

  const getUserInitials = (nameStr?: string) => {
    if (!nameStr || !nameStr.trim()) return role.substring(0, 2).toUpperCase();
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <DashboardShell title="My Profile">
      {/* Header Banner */}
      <Card className="p-6 relative overflow-hidden border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent text-2xl font-extrabold border-2 border-accent/30 shadow-md shrink-0">
              {getUserInitials(name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-ink">
                  {name || "Your name"}
                </h2>
                <Badge tone="accent" className="capitalize text-xs">
                  {role}
                </Badge>
                {role === "student" && (
                  <Badge tone="success" className="text-[10px]">
                    <ShieldCheck className="h-3 w-3 mr-0.5" /> Profile Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-ink-muted mt-0.5 font-semibold">
                {department} · {year}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-accent" />{" "}
                  {email || "Add your email in Account Details"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-accent" />{" "}
                  {location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            {role === "student" && (
              <>
                <Link href="/profile/resume">
                  <Button size="sm" className="gap-1.5 bg-accent hover:opacity-95 text-white font-bold shadow-md">
                    <FileText className="h-3.5 w-3.5" />
                    Resume Builder
                  </Button>
                </Link>
                <Link href="/profile/interview">
                  <Button variant="outline" size="sm" className="gap-1.5 border-border text-ink font-bold">
                    <Mic className="h-3.5 w-3.5" />
                    Mock Interview
                  </Button>
                </Link>
                <Link href="/profile/skills">
                  <Button variant="outline" size="sm" className="gap-1 border-border text-ink font-bold">
                    Skill Matrix
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {currentProfile.bio && (
          <div className="mt-4 pt-4 border-t border-border text-xs text-ink-muted leading-relaxed font-medium">
            <span className="font-semibold text-ink">About: </span>
            {currentProfile.bio}
          </div>
        )}
      </Card>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Employability Score"
          value={`${scores.employability}%`}
          icon={Gauge}
          tone="accent"
        />
        <MetricCard
          label="Skill Readiness"
          value={`${scores.readiness}%`}
          icon={Radar}
          tone="warning"
        />
        <MetricCard
          label="Profile Strength"
          value={`${scores.strength}%`}
          icon={IdCard}
          tone="success"
        />
      </div>

      {isStudent && (
        <div className="mt-6">
          <ProfileChecklist />
        </div>
      )}

      {/* AI readiness, skill gap and profile editing */}
      <div className="mt-8">
        <StudentAiExperience />
      </div>
    </DashboardShell>
  );
}
