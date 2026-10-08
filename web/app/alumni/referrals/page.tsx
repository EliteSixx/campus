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
  Share2,
  Building2,
  Search,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useUserProfile } from "@/context/user-profile-context";
import { DEMO_REFERRALS, getAlumniById, PRIMARY_DEMO_INSTITUTION_ID, ReferralSlot } from "@/data/demo-alumni";

export default function AlumniReferralsPage() {
  const { currentProfile } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");

  const [selectedReferral, setSelectedReferral] = useState<ReferralSlot | null>(null);
  const [projectRepo, setProjectRepo] = useState("");
  const [pitchNote, setPitchNote] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // We scope to institution id (mocking that we only see referrals for our institution)
  const availableReferrals = DEMO_REFERRALS.filter(r => r.institutionId === PRIMARY_DEMO_INSTITUTION_ID && r.status === "open");

  const companies = [...new Set(availableReferrals.map((r) => r.company))];

  const filteredReferrals = availableReferrals.filter((item) => {
    const alumni = getAlumniById(item.alumniId);
    
    const matchesSearch =
      item.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alumni?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = companyFilter === "all" || item.company.toLowerCase() === companyFilter.toLowerCase();

    return matchesSearch && matchesCompany;
  });

  const handleApplyReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setSelectedReferral(null);
      setProjectRepo("");
      setPitchNote("");
    }, 1500);
  };

  return (
    <DashboardShell title="Alumni Job Referrals Portal">
      {/* Header Banner */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">Verified Alumni Referral Exchange</h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 max-w-2xl font-medium">
              Skip cold resumes. Top graduates post internal referral slots here.
              Apply with your verified skill readiness score and project repository proofs.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge tone="accent" className="text-xs py-1 px-3 gap-1">
              <UserCheck className="h-3.5 w-3.5" />
              Direct Alumni Pipeline
            </Badge>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Open Referral Slots" value={`${availableReferrals.length} Active`} icon={Share2} tone="accent" />
        <MetricCard label="Average Referral Conversion" value="4.8x Higher" icon={Sparkles} tone="success" />
        <MetricCard label="Target Employers" value={`${companies.length} Companies`} icon={Building2} tone="warning" />
      </div>

      {/* Search Bar & Filters */}
      <Card className="mt-5 p-4 border border-border bg-surface">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <Input
              placeholder="Search by role title, company, or alumni mentor..."
              className="pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              className="text-xs"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="all">All Employers</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>
      </Card>

      {/* Referral Feed Cards */}
      <div className="mt-5 space-y-4">
        {filteredReferrals.map((item) => {
          const alumni = getAlumniById(item.alumniId);
          return (
            <Card key={item.id} className="p-5 border border-border bg-surface text-ink hover:border-accent/40 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-ink">{item.roleTitle}</h3>
                    <Badge tone="accent" className="text-xs">
                      {item.company}
                    </Badge>
                    <Badge tone="neutral" className="text-[11px]">
                      {item.location}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink-muted font-medium">
                    <UserCheck className="h-3.5 w-3.5 text-accent" />
                    <span>
                      Referral Sponsor: <strong className="text-ink font-bold">{alumni?.name}</strong> ({alumni?.jobTitle})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[10px] text-ink-faint font-medium">
                     <span>Posted: {item.postedDate}</span>
                     <span>Applicants: {item.applicantsCount}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 border-t lg:border-t-0 border-border pt-3 lg:pt-0">
                  <div className="text-left sm:text-right text-xs">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">
                      {item.slotsRemaining} Slots Remaining
                    </div>
                    <div className="text-[11px] text-ink-muted font-medium">
                      Min Readiness: {item.requiredReadiness}%
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedReferral(item)}
                    size="sm"
                    className="gap-1.5 text-xs font-bold text-white bg-accent hover:opacity-95"
                  >
                    <span>Request Referral</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Request Referral Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-ink">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="h-4.5 w-4.5 text-accent" />
                <span className="text-sm font-bold text-ink">
                  Request Referral for {selectedReferral.company}
                </span>
              </div>
              <button
                onClick={() => setSelectedReferral(null)}
                className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
                <p className="text-sm font-bold text-ink">Referral Request Submitted!</p>
                <p className="text-xs text-ink-muted font-medium">
                  {getAlumniById(selectedReferral.alumniId)?.name} will review your skill score and project code to process the internal referral.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyReferral} className="mt-4 space-y-3.5">
                <div className="rounded-xl bg-surface-raised p-3 text-xs text-ink border border-border space-y-1">
                  <div className="font-bold text-ink">{selectedReferral.roleTitle}</div>
                  <div className="text-ink-muted font-medium">Sponsor: {getAlumniById(selectedReferral.alumniId)?.name}</div>
                  <div className="text-[11px] text-accent font-bold">
                    Your Skill Readiness: {currentProfile.skillReadiness || 68}% (Required: {selectedReferral.requiredReadiness}%)
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">GitHub Project / Proof Link *</label>
                  <Input
                    placeholder="https://github.com/yourhandle/project-repo"
                    value={projectRepo}
                    onChange={(e) => setProjectRepo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">Short Pitch / Note to Alumni *</label>
                  <Textarea
                    rows={3}
                    placeholder="Explain why you are a strong fit for this role and mention key technical achievements..."
                    value={pitchNote}
                    onChange={(e) => setPitchNote(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReferral(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="gap-1 font-bold text-white bg-accent">
                    Submit Referral Packet
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
