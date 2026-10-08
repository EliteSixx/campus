"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/metric-card";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
} from "lucide-react";
import {
  DEMO_PROOF_REVIEWS,
  getStudentById,
  PRIMARY_DEMO_ALUMNI_ID,
} from "@/data/demo-alumni";

export default function AlumniProofsPage() {
  const [proofs, setProofs] = useState(
    DEMO_PROOF_REVIEWS.filter((p) => p.alumniId === PRIMARY_DEMO_ALUMNI_ID)
  );

  const pending = proofs.filter((p) => !p.verified);
  const verified = proofs.filter((p) => p.verified);

  const handleToggleVerification = (id: string) => {
    setProofs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, verified: !item.verified } : item))
    );
  };

  return (
    <DashboardShell title="Skill Proof Verification">
      {/* Header */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">Student Skill Proofs</h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 font-medium max-w-xl">
              Review student GitHub repositories and portfolios. Grant "Alumni Verified" status to help students stand out to recruiters.
            </p>
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard label="Pending Review" value={`${pending.length} Proofs`} icon={ShieldCheck} tone="warning" />
        <MetricCard label="Verified by You" value={`${verified.length} Proofs`} icon={CheckCircle2} tone="success" />
      </div>

      {/* Pending Reviews */}
      <h3 className="mt-6 text-sm font-bold text-ink flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-warning" /> Pending Reviews
      </h3>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {pending.map((item) => {
          const student = getStudentById(item.studentId);
          return (
            <Card key={item.id} className="p-4 border border-border bg-surface text-ink">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-ink">{student?.name || "Unknown Student"}</div>
                  <div className="text-[11px] text-ink-muted font-medium mt-0.5">{student?.department}</div>
                </div>
                <Badge tone="warning" className="text-[10px]">Needs Review</Badge>
              </div>

              <div className="mt-3 p-3 rounded-lg border border-border bg-surface-raised">
                <div className="flex items-center gap-2 text-accent font-bold text-xs mb-2">
                  <Code2 className="h-3.5 w-3.5" />
                  <span>{item.skillName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink-muted">Readiness Score: {item.readinessScore}%</span>
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

              <div className="mt-3 pt-3 border-t border-border flex justify-end">
                <Button
                  size="sm"
                  className="text-xs h-7 gap-1 font-bold text-white bg-accent"
                  onClick={() => handleToggleVerification(item.id)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Grant Alumni Verified Badge
                </Button>
              </div>
            </Card>
          );
        })}
        {pending.length === 0 && (
          <div className="col-span-full text-center py-6 text-ink-muted text-xs font-medium border border-dashed border-border rounded-xl">
            No pending proofs to review.
          </div>
        )}
      </div>

      {/* Verified History */}
      <h3 className="mt-8 text-sm font-bold text-ink flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success" /> Verified History
      </h3>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {verified.map((item) => {
          const student = getStudentById(item.studentId);
          return (
            <Card key={item.id} className="p-4 border border-border bg-surface text-ink opacity-80">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-ink">{student?.name || "Unknown Student"}</div>
                  <div className="text-[11px] text-ink-muted font-medium mt-0.5">{student?.department}</div>
                </div>
                <Badge tone="success" className="text-[10px]">Verified</Badge>
              </div>
              <div className="mt-2 text-[11px] font-bold text-ink">Skill: {item.skillName}</div>
              
              <div className="mt-3 pt-3 border-t border-border flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-6 px-2 font-bold"
                  onClick={() => handleToggleVerification(item.id)}
                >
                  Revoke Verification
                </Button>
              </div>
            </Card>
          );
        })}
        {verified.length === 0 && (
          <div className="col-span-full text-center py-6 text-ink-muted text-xs font-medium border border-dashed border-border rounded-xl">
            No verified proofs yet.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
