"use client";

import { useState, useMemo } from "react";
import { SearchFilterBar } from "./search-filter-bar";
import { SortableHeader, type SortDirection } from "./sortable-header";
import { FacultyProfileDrawer } from "./faculty-profile-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FacultyMember, FacultyStatus, FacultyRoleType } from "@/data/institution/mock-faculty";
import {
  UserCheck,
  Mail,
  Phone,
  LayoutGrid,
  Table,
  Download,
  Plus,
  Star,
  BookOpen,
  GraduationCap,
  X,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportDropdown } from "@/components/shared/export-dropdown";

const statusConfig: Record<FacultyStatus, { tone: "success" | "warning" | "neutral" | "danger" | "accent" | "cyan"; label: string }> = {
  active: { tone: "success", label: "Active" },
  "on-leave": { tone: "warning", label: "On Leave" },
  sabbatical: { tone: "cyan", label: "On Sabbatical" },
  visiting: { tone: "accent", label: "Visiting" },
};

export function FacultyDirectory({
  initialMembers,
  departmentFilterDefault = "all",
  hideDeptFilter = false,
}: {
  initialMembers: FacultyMember[];
  departmentFilterDefault?: string;
  hideDeptFilter?: boolean;
}) {
  const [members, setMembers] = useState<FacultyMember[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>(departmentFilterDefault);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedMember, setSelectedMember] = useState<FacultyMember | null>(null);

  // Sorting
  const [sortKey, setSortKey] = useState<string | null>("experienceYears");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form inputs for onboarding
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<FacultyRoleType>("faculty");
  const [newDept, setNewDept] = useState("Computer Science & Engineering");
  const [newDesignation, setNewDesignation] = useState("Assistant Professor");
  const [newQual, setNewQual] = useState("Ph.D. / M.Tech");
  const [newSpec, setNewSpec] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("+91 98450 ");
  const [newExp, setNewExp] = useState("5");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        m.specialization.toLowerCase().includes(search.toLowerCase()) ||
        m.designation.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || m.roleType === roleFilter;
      const matchesDept = deptFilter === "all" || m.deptId === deptFilter;
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;

      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }, [members, search, roleFilter, deptFilter, statusFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  const handleOnboardMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const initials = newName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const empId = `EMP-${newDept.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newMember: FacultyMember = {
      id: `fac-${Date.now()}`,
      name: newName,
      initials: initials || "FM",
      employeeId: empId,
      roleType: newRole,
      department: newDept,
      deptId: newDept.toLowerCase().includes("comp") ? "cse" : newDept.toLowerCase().includes("info") ? "it" : "ece",
      designation: newDesignation,
      qualification: newQual,
      specialization: newSpec || "Emerging Computing & Engineering",
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@university.edu`,
      phone: newPhone || "+91 98450 11999",
      experienceYears: parseInt(newExp || "5", 10),
      status: "active",
      coursesTaught: ["Special Elective: Emerging Technologies"],
      publicationsCount: 6,
      patentsCount: 1,
      consultancyProjects: 2,
      mentorshipCount: 15,
      fdpAttended: 5,
      performanceScore: 4.8,
      joiningDate: new Date().toISOString().split("T")[0],
    };

    setMembers([newMember, ...members]);
    setShowAddModal(false);
    setToastMsg(`Successfully onboarded ${newName} (${empId})!`);
    setTimeout(() => setToastMsg(null), 4000);

    // Reset
    setNewName("");
    setNewSpec("");
    setNewEmail("");
  };

  const facultyHeaders = [
    "Employee ID",
    "Name",
    "Role Type",
    "Department",
    "Designation",
    "Qualification",
    "Specialization",
    "Experience (Years)",
    "Performance Score",
    "Publications",
    "Patents",
    "Email",
    "Phone",
    "Status",
  ];

  const facultyRows = sorted.map((m) => [
    m.employeeId,
    m.name,
    m.roleType,
    m.department,
    m.designation,
    m.qualification,
    m.specialization,
    m.experienceYears,
    m.performanceScore,
    m.publicationsCount,
    m.patentsCount,
    m.email,
    m.phone,
    m.status,
  ]);

  const exportFacultyCSV = () => {
    const csvContent = [facultyHeaders.join(","), ...facultyRows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Faculty_Staff_Master_Roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Controls: Search, Filters, View Switcher & Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, employee ID, specialization…"
          className="flex-1"
        >
          {/* Role Type Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="faculty">Teaching Faculty</option>
            <option value="staff">Technical & Admin Staff</option>
          </select>

          {/* Department Filter (if not hidden) */}
          {!hideDeptFilter && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="cse">CSE</option>
              <option value="it">IT</option>
              <option value="ece">ECE</option>
              <option value="ds">Data Science</option>
              <option value="me">Mechanical</option>
              <option value="ee">Electrical</option>
              <option value="adm">Administration</option>
              <option value="tpo">Placement Cell</option>
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="sabbatical">On Sabbatical</option>
            <option value="visiting">Visiting</option>
          </select>
        </SearchFilterBar>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors",
                viewMode === "grid" ? "bg-accent text-white" : "text-ink-muted hover:text-ink hover:bg-surface-raised"
              )}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors",
                viewMode === "table" ? "bg-accent text-white" : "text-ink-muted hover:text-ink hover:bg-surface-raised"
              )}
              title="Dense Directory Table"
            >
              <Table className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <ExportDropdown
            filename="Faculty_Staff_Master_Roster"
            title="Faculty & Staff Master Roster"
            headers={facultyHeaders}
            rows={facultyRows}
            label="Export"
          />

          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} className="h-9 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Onboard Member
          </Button>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <UserCheck className="h-10 w-10 text-ink-faint/40 mb-2" />
          <p className="text-sm font-semibold text-ink">No faculty or staff members found</p>
          <p className="text-xs text-ink-muted mt-0.5">Try broadening your search or adjusting the department filter.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((m) => {
            const status = statusConfig[m.status];
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs hover:border-accent/40 hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  {/* Top Bar with Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white font-bold text-sm shadow-sm">
                        {m.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                          {m.name}
                        </h4>
                        <p className="font-mono text-[11px] text-accent font-semibold">{m.employeeId}</p>
                      </div>
                    </div>
                    <Badge tone={status.tone} className="text-[10px]">
                      {status.label}
                    </Badge>
                  </div>

                  {/* Designation & Dept */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-ink">{m.designation}</p>
                    <p className="text-[11px] text-ink-muted">{m.department}</p>
                  </div>

                  {/* Specialization */}
                  <p className="mt-2 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-ink">Specialization:</span> {m.specialization}
                  </p>
                </div>

                {/* Metrics & Footer */}
                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-ink-faint mb-3">
                    <div className="rounded-lg bg-surface-raised/50 py-1.5">
                      <span className="font-mono font-bold text-xs text-ink block">{m.experienceYears} yrs</span>
                      <span>Experience</span>
                    </div>
                    <div className="rounded-lg bg-surface-raised/50 py-1.5">
                      <span className="font-mono font-bold text-xs text-emerald-500 block flex items-center justify-center gap-0.5">
                        <Star className="h-3 w-3 fill-emerald-500" />
                        {m.performanceScore}
                      </span>
                      <span>Rating</span>
                    </div>
                    <div className="rounded-lg bg-surface-raised/50 py-1.5">
                      <span className="font-mono font-bold text-xs text-accent block">{m.publicationsCount}</span>
                      <span>Papers</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-accent font-semibold flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      View Full Dossier
                    </span>
                    <span className="text-[10px] text-ink-faint">{m.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Table View */
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/60 text-ink">
                <SortableHeader label="Emp ID" sortKey="employeeId" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[110px]" />
                <SortableHeader label="Name" sortKey="name" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[160px]" />
                <SortableHeader label="Department" sortKey="department" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[150px]" />
                <SortableHeader label="Designation" sortKey="designation" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} className="min-w-[140px]" />
                <SortableHeader label="Experience" sortKey="experienceYears" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
                <SortableHeader label="Rating" sortKey="performanceScore" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} align="right" />
                <SortableHeader label="Status" sortKey="status" currentSortKey={sortKey} currentDirection={sortDir} onSort={handleSort} />
                <th className="px-3 py-2.5 text-right font-semibold text-ink-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => {
                const status = statusConfig[m.status];
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className="border-b border-border/40 hover:bg-surface-raised/40 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-3 font-mono font-bold text-accent tabular">{m.employeeId}</td>
                    <td className="px-3 py-3">
                      <div>
                        <span className="font-bold text-ink">{m.name}</span>
                        <p className="text-[10px] text-ink-faint">{m.qualification}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-muted">{m.department}</td>
                    <td className="px-3 py-3 font-medium text-ink">{m.designation}</td>
                    <td className="px-3 py-3 text-right font-mono tabular">{m.experienceYears} yrs</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-emerald-500 tabular">
                      {m.performanceScore}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={status.tone} className="text-[10px]">
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(m);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-surface-raised px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent hover:text-white transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-ink-faint pt-1">
        <span>Showing {sorted.length} of {members.length} faculty and staff members</span>
      </div>

      {/* Onboard Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Onboard Faculty or Staff Member</h3>
                  <p className="text-[11px] text-ink-muted">Register an academic or administrative profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardMember} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink">Full Name with Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Smita Narayan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Role Category</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as FacultyRoleType)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="faculty">Teaching Faculty</option>
                    <option value="staff">Technical & Admin Staff</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Data Science & AI">Data Science</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Electrical Engineering">Electrical</option>
                    <option value="Administration">Administration</option>
                    <option value="Training & Placement Cell">Training & Placement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate Professor"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Highest Degree</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ph.D. (IIT Delhi)"
                    value={newQual}
                    onChange={(e) => setNewQual(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Specialization & Research Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning, Cloud Systems, VLSI"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Official Email</label>
                  <input
                    type="email"
                    placeholder="smita.n@university.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Experience (Years)</label>
                  <input
                    type="number"
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-raised/30 px-3 text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-border/60 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Complete Onboarding
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over Profile Drawer */}
      <FacultyProfileDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
