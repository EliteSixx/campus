"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/select";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/data/students";
import { getSkillById } from "@/data/skills";
import { statusForScore } from "@/lib/utils";

function statusTone(readiness: Student["readiness"]) {
  switch (readiness) {
    case "Placement Ready":
      return "success" as const;
    case "Near Ready":
      return "warning" as const;
    case "Critical Gap":
      return "danger" as const;
  }
}

export function CandidateTable({ students }: { students: Student[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery = query.trim() === "" || s.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || s.readiness === status;
      return matchesQuery && matchesStatus;
    });
  }, [students, query, status]);

  const columns: Column<Student>[] = [
    {
      header: "Candidate",
      cell: (s) => (
        <div>
          <p className="text-sm font-medium text-ink">{s.name}</p>
          <p className="text-xs text-ink-muted">{s.department} · {s.year}</p>
        </div>
      ),
    },
    {
      header: "Match Score",
      cell: (s) => <span className="font-mono text-sm font-medium text-ink tabular">{s.employabilityScore}%</span>,
    },
    {
      header: "Strong Skills",
      cell: (s) => (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {s.skills
            .filter((sk) => statusForScore(sk.score) === "Strong")
            .slice(0, 3)
            .map((sk) => (
              <Badge key={sk.skillId} tone="success">
                {getSkillById(sk.skillId)?.name ?? sk.skillId}
              </Badge>
            ))}
        </div>
      ),
    },
    {
      header: "Skill Gaps",
      cell: (s) => (
        <div className="flex max-w-[200px] flex-wrap gap-1">
          {s.skills
            .filter((sk) => statusForScore(sk.score) === "Skill Gap")
            .slice(0, 2)
            .map((sk) => (
              <Badge key={sk.skillId} tone="danger">
                {getSkillById(sk.skillId)?.name ?? sk.skillId}
              </Badge>
            ))}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (s) => <Badge tone={statusTone(s.readiness)}>{s.readiness === "Placement Ready" ? "Recommended" : s.readiness}</Badge>,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <Input placeholder="Search candidates" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
          <option value="all">All statuses</option>
          <option value="Placement Ready">Placement Ready</option>
          <option value="Near Ready">Near Ready</option>
          <option value="Critical Gap">Critical Gap</option>
        </Select>
      </div>
      <DataTable columns={columns} data={filtered} keyFn={(s) => s.id} />
    </div>
  );
}
