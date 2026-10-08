"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/shared/metric-card";
import {
  BookOpen,
  FileText,
  Briefcase,
  GraduationCap,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  DEMO_RESOURCES,
  getAlumniById,
  PRIMARY_DEMO_INSTITUTION_ID,
} from "@/data/demo-alumni";

export default function AlumniResourcesPage() {
  const resources = DEMO_RESOURCES.filter((r) => r.institutionId === PRIMARY_DEMO_INSTITUTION_ID);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [...new Set(resources.map((r) => r.category))];

  const categoryIcon: Record<string, typeof FileText> = {
    "Resume": FileText,
    "Interview Prep": Briefcase,
    "Career Guidance": GraduationCap,
  };

  return (
    <DashboardShell title="Resources">
      {/* Header */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold text-ink">Alumni Resources</h2>
        </div>
        <p className="text-xs text-ink-muted mt-1 font-medium max-w-xl">
          Career resources shared by alumni from your college. Checklists, prep guides, roadmaps, and real-world advice.
        </p>
      </Card>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total Resources" value={`${resources.length}`} icon={BookOpen} tone="accent" />
        <MetricCard label="Categories" value={`${categories.length}`} icon={FileText} tone="neutral" />
        <MetricCard label="Contributors" value={`${new Set(resources.map((r) => r.alumniId)).size}`} icon={GraduationCap} tone="success" />
      </div>

      {/* Resources by category */}
      {categories.map((cat) => {
        const catResources = resources.filter((r) => r.category === cat);
        const CatIcon = categoryIcon[cat] || BookOpen;
        return (
          <div key={cat} className="mt-6">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-3">
              <CatIcon className="h-4 w-4 text-accent" />
              {cat}
              <Badge tone="neutral" className="text-[10px]">{catResources.length}</Badge>
            </h3>
            <div className="space-y-3">
              {catResources.map((res) => {
                const author = getAlumniById(res.alumniId);
                const isExpanded = expandedId === res.id;
                return (
                  <Card key={res.id} className="border border-border bg-surface text-ink overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : res.id)}
                      className="w-full text-left p-4 hover:bg-surface-raised/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-ink">{res.title}</div>
                          <p className="text-[11px] text-ink-muted font-medium mt-0.5">{res.description}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-ink-faint font-medium">
                            <span>By {author?.name || "Alumni"}</span>
                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {res.createdAt}</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-ink-muted shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-ink-muted shrink-0" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-surface-raised/30">
                        <pre className="text-xs text-ink font-medium leading-relaxed whitespace-pre-wrap font-sans">
                          {res.content}
                        </pre>
                        {res.link && (
                          <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent font-bold hover:underline mt-3 inline-block">
                            View External Resource →
                          </a>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </DashboardShell>
  );
}
