"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/select";
import { OpportunityCard } from "@/components/shared/opportunity-card";
import { EmptyState } from "@/components/shared/state";
import { getCompanyById } from "@/data/companies";
import { getSkillById, skills } from "@/data/skills";
import { getOpportunityStatus, isOpportunityActive } from "@/lib/api/opportunities";

interface OppWithMatch {
  id: string;
  title: string;
  companyId: string;
  location: string;
  mode: string;
  type: string;
  deadline?: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  requiredSkills: string[];
}

export function OpportunitiesClient({ opportunities }: { opportunities: OppWithMatch[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [mode, setMode] = useState("all");
  const [skill, setSkill] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [minMatch, setMinMatch] = useState("0");

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      const company = getCompanyById(o.companyId);
      const matchesQuery =
        query.trim() === "" ||
        o.title.toLowerCase().includes(query.toLowerCase()) ||
        company?.name.toLowerCase().includes(query.toLowerCase());
      const matchesType = type === "all" || o.type === type;
      const matchesMode = mode === "all" || o.mode === mode;
      const matchesSkill = skill === "all" || o.requiredSkills.includes(skill);
      const matchesMinMatch = o.matchScore >= Number(minMatch);
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? (o.deadline ? isOpportunityActive(o.deadline) : true)
            : (o.deadline ? getOpportunityStatus(o.deadline) === statusFilter : true);

      return matchesQuery && matchesType && matchesMode && matchesSkill && matchesMinMatch && matchesStatus;
    });
  }, [opportunities, query, type, mode, skill, minMatch, statusFilter]);

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <Input
            placeholder="Search title or company"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="active">Active (Open & Closing)</option>
          <option value="all">All statuses</option>
          <option value="Open">Open</option>
          <option value="Closing Soon">Closing soon</option>
          <option value="Closed">Closed (Expired)</option>
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="Internship">Internship</option>
          <option value="Job">Job</option>
        </Select>
        <Select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="all">All work modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </Select>
        <Select value={skill} onChange={(e) => setSkill(e.target.value)}>
          <option value="all">All skills</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select value={minMatch} onChange={(e) => setMinMatch(e.target.value)}>
          <option value="0">Any match score</option>
          <option value="50">50%+ match</option>
          <option value="70">70%+ match</option>
          <option value="90">90%+ match</option>
        </Select>
      </div>

      <p className="mb-3 text-xs text-ink-muted">{filtered.length} opportunities found</p>

      {filtered.length === 0 ? (
        <EmptyState
          title="No opportunities match your filters"
          description="Try widening your search or selecting 'All statuses' to view historical opportunities."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => (
            <OpportunityCard
              key={o.id}
              id={o.id}
              title={o.title}
              companyId={o.companyId}
              location={o.location}
              mode={o.mode}
              type={o.type}
              deadline={o.deadline}
              matchScore={o.matchScore}
              matchingSkills={o.matchingSkills}
              missingSkills={o.missingSkills}
            />
          ))}
        </div>
      )}
    </div>
  );
}
