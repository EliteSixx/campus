"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  institution: "Institution",
  departments: "Departments",
  students: "Student Directory",
  skills: "Skill Matrix",
  internships: "Internships & Placements",
  partners: "Corporate Partners",
  archives: "Archives & Compliance",
  faculty: "Faculty & Staff",
  policies: "Placement Policies",
  drives: "Placement Drives",
  curriculum: "Curriculum Alignment",
  outcomes: "Placement Outcomes",
};

export function InstitutionBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build crumbs starting from /dashboard/institution
  const basePath = "/dashboard/institution";
  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: basePath },
  ];

  // Add sub-route crumbs after /dashboard/institution
  const subSegments = segments.slice(2); // skip "dashboard" and "institution"
  let currentPath = basePath;

  subSegments.forEach((seg) => {
    currentPath += `/${seg}`;
    const label = routeLabels[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: currentPath });
  });

  // Don't show breadcrumbs on the main dashboard
  if (crumbs.length <= 1) return null;

  return (
    <nav className="mb-5 flex items-center gap-1 text-xs text-ink-muted" aria-label="Breadcrumb">
      <Link href={basePath} className="flex items-center gap-1 hover:text-ink transition-colors">
        <Home className="h-3 w-3" />
      </Link>
      {crumbs.slice(1).map((crumb, i) => {
        const isLast = i === crumbs.length - 2;
        return (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-ink-faint" />
            {isLast ? (
              <span className="font-medium text-ink">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-ink transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
