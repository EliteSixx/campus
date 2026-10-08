"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { InstitutionBreadcrumb } from "@/components/institution/institution-breadcrumb";
import { PartnerCard } from "@/components/institution/partner-card";
import { PartnerTable } from "@/components/institution/partner-table";
import { SearchFilterBar } from "@/components/institution/search-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { corporatePartners } from "@/data/institution/mock-partners";
import type { CorporatePartner, MoUStatus, EngagementLevel, IndustryEngagementIntelligence } from "@/data/institution/types";
import { getIndustryEngagementIntelligence } from "@/lib/api/institution";
import { IndustryEngagementIntelligenceView } from "@/components/institution/industry-engagement-intelligence-view";
import { LayoutGrid, Table, Plus, Download, X, CheckCircle2, Handshake, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportDropdown } from "@/components/shared/export-dropdown";

export default function PartnersPage() {
  const [partners, setPartners] = useState<CorporatePartner[]>(corporatePartners);
  const [activeTab, setActiveTab] = useState<"intelligence" | "directory">("intelligence");
  const [intelligence, setIntelligence] = useState<IndustryEngagementIntelligence | null>(null);
  const [search, setSearch] = useState("");
  const [mouFilter, setMouFilter] = useState<string>("all");
  const [engagementFilter, setEngagementFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    getIndustryEngagementIntelligence().then(setIntelligence);
  }, []);

  // Form state for new MoU modal
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("Software / IT");
  const [newHq, setNewHq] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDuration, setNewDuration] = useState("3");

  const filtered = partners.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.industry.toLowerCase().includes(search.toLowerCase());
    const matchesMou = mouFilter === "all" || p.mouStatus === mouFilter;
    const matchesEngagement = engagementFilter === "all" || p.engagementLevel === engagementFilter;
    return matchesSearch && matchesMou && matchesEngagement;
  });

  // Summary stats
  const activeCount = partners.filter((p) => p.mouStatus === "active").length;
  const expiringCount = partners.filter((p) => p.mouStatus === "expiring-soon").length;
  const totalHired = partners.reduce((a, p) => a + p.studentsHired, 0);
  const totalPrograms = partners.reduce((a, p) => a + p.programs.length, 0);

  const handleCreateMou = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const startYear = new Date().getFullYear();
    const endYear = startYear + parseInt(newDuration || "3", 10);
    const initials = newName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newPartner: CorporatePartner = {
      id: newName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: newName,
      initials: initials || "CP",
      industry: newIndustry,
      hq: newHq || "Bengaluru, India",
      mouStatus: "active",
      mouStart: `${startYear}-01-01`,
      mouEnd: `${endYear}-01-01`,
      engagementLevel: "high",
      engagementScore: 85,
      studentsHired: 0,
      activePrograms: 1,
      programs: [
        {
          name: "Campus Talent Incubation Program",
          type: "Workshop",
          date: `${startYear}-09-15`,
          participants: 60,
        },
      ],
      hiringHistory: [{ year: String(startYear), hired: 0 }],
      contactPerson: newContact || "University Relations Lead",
      contactEmail: newEmail || `campus@${newName.toLowerCase().replace(/\s+/g, "")}.com`,
    };

    setPartners([newPartner, ...partners]);
    setShowAddModal(false);
    setToastMsg(`MoU partnership with ${newName} successfully executed!`);
    setTimeout(() => setToastMsg(null), 4000);

    // Reset fields
    setNewName("");
    setNewHq("");
    setNewContact("");
    setNewEmail("");
  };

  const partnerHeaders = [
    "Partner Name",
    "Industry",
    "HQ",
    "MoU Status",
    "Start Date",
    "End Date",
    "Students Hired",
    "Engagement Level",
    "Contact Person",
    "Email",
  ];
  const partnerRows = filtered.map((p) => [
    p.name,
    p.industry,
    p.hq,
    p.mouStatus,
    p.mouStart,
    p.mouEnd,
    p.studentsHired,
    p.engagementLevel,
    p.contactPerson,
    p.contactEmail,
  ]);

  return (
    <DashboardShell title="Corporate Partners">
      <InstitutionBreadcrumb />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Corporate Partners & Collaboration</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            MoU status, hiring history, FDPs, workshops, and engagement scores across industry partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown
            filename="corporate_partners_mou_directory"
            title="Corporate Partners & MoUs Directory"
            headers={partnerHeaders}
            rows={partnerRows}
            label="Export"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="h-9 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Register New MoU
          </Button>
        </div>
      </div>

      {/* Success Toast */}
      {toastMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* View Mode Tabs: Intelligence vs Directory */}
      <div className="mb-6 flex border-b border-border/80">
        <button
          onClick={() => setActiveTab("intelligence")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all",
            activeTab === "intelligence"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:border-border hover:text-ink"
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>Industry Engagement Intelligence</span>
          <Badge tone="accent" className="ml-1 text-[10px] px-1.5 py-0">New</Badge>
        </button>
        <button
          onClick={() => setActiveTab("directory")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all",
            activeTab === "directory"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:border-border hover:text-ink"
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>Partner Directory &amp; MoUs</span>
          <span className="ml-1 rounded-full bg-surface-raised px-1.5 py-0.2 text-[10px] font-mono text-ink-muted">
            {partners.length}
          </span>
        </button>
      </div>

      {activeTab === "intelligence" ? (
        intelligence ? (
          <IndustryEngagementIntelligenceView intelligence={intelligence} />
        ) : (
          <div className="py-20 text-center text-xs text-ink-muted animate-pulse">
            Loading Industry Engagement Intelligence...
          </div>
        )
      ) : (
        <>
          {/* Summary stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <p className="font-mono text-2xl font-bold text-ink tabular">{partners.length}</p>
              <p className="mt-0.5 text-xs text-ink-muted">Total Partners</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <p className="font-mono text-2xl font-bold text-emerald-500 tabular">{activeCount}</p>
              <p className="mt-0.5 text-xs text-ink-muted">Active MoUs</p>
              {expiringCount > 0 && (
                <Badge tone="warning" className="mt-1 text-[10px]">{expiringCount} expiring soon</Badge>
              )}
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <p className="font-mono text-2xl font-bold text-accent tabular">{totalHired}</p>
              <p className="mt-0.5 text-xs text-ink-muted">Students Hired</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <p className="font-mono text-2xl font-bold text-ink tabular">{totalPrograms}</p>
              <p className="mt-0.5 text-xs text-ink-muted">Programs Conducted</p>
            </div>
          </div>

          {/* Filters & View Toggle */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search partners or industry…"
              className="flex-1"
            >
              <select
                value={mouFilter}
                onChange={(e) => setMouFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
              >
                <option value="all">All MoU Status</option>
                <option value="active">Active</option>
                <option value="expiring-soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={engagementFilter}
                onChange={(e) => setEngagementFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
              >
                <option value="all">All Engagement</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </SearchFilterBar>

            {/* View Switcher: Cards vs Table */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                  viewMode === "grid" ? "bg-accent text-white" : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                )}
                title="Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                  viewMode === "table" ? "bg-accent text-white" : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                )}
                title="Dense Table View"
              >
                <Table className="h-3.5 w-3.5" />
                Table
              </button>
            </div>
          </div>

          {/* Partners View */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <Handshake className="h-10 w-10 text-ink-faint/50 mb-2" />
              <p className="text-sm font-medium text-ink">No partners match your criteria</p>
              <p className="mt-1 max-w-sm text-xs text-ink-muted">Try adjusting your search keywords or status filters.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          ) : (
            <PartnerTable partners={filtered} />
          )}

          <p className="mt-4 text-xs text-ink-faint">
            Showing {filtered.length} of {partners.length} corporate partners
          </p>
        </>
      )}

      {/* Register New MoU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold">
                  <Handshake className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Register Corporate MoU</h3>
                  <p className="text-[11px] text-ink-muted">Establish an institutional industry partnership</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMou} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink">Company / Partner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siemens Digital Industries"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Industry Sector</label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="Software / IT">Software / IT</option>
                    <option value="Semiconductor / VLSI">Semiconductor / VLSI</option>
                    <option value="Fintech / Banking">Fintech / Banking</option>
                    <option value="Automotive & Robotics">Automotive & Robotics</option>
                    <option value="Energy & Infrastructure">Energy & Infrastructure</option>
                    <option value="Healthtech">Healthtech</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">MoU Term (Years)</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Corporate Headquarters</label>
                <input
                  type="text"
                  placeholder="e.g. Pune, India or Munich, Germany"
                  value={newHq}
                  onChange={(e) => setNewHq(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Contact Person</label>
                  <input
                    type="text"
                    placeholder="HR / Campus Director"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Liaison Email</label>
                  <input
                    type="email"
                    placeholder="campus@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Execute Partnership
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
