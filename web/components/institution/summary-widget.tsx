import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SummaryWidget({
  title,
  description,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">{title}</h3>
            <p className="text-xs text-ink-muted">{description}</p>
          </div>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline transition-colors shrink-0"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex-1 px-5 pb-5">
        {children}
      </div>
    </Card>
  );
}
