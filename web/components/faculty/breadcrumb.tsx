import Link from "next/link";
import { ChevronRight } from "lucide-react";

// The faculty-side trail. Unlike components/institution/institution-breadcrumb.tsx
// the crumbs are passed in rather than derived from the pathname, because the
// detail pages name themselves after data the URL does not carry (a subject
// code, a student's name). Styling follows that component so the two sections
// read the same.

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      className="mb-5 flex flex-wrap items-center gap-1 text-xs text-ink-muted"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-ink-faint" />}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
