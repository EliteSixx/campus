import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StakeholderCard({
  icon: Icon,
  title,
  description,
  points,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <div className="group [perspective:1200px]">
      <Card className="relative min-h-[276px] overflow-hidden border-border bg-surface/85 p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-300 [transform-style:preserve-3d] group-hover:-translate-y-1 group-hover:[transform:rotateX(2deg)_rotateY(-2deg)] group-hover:border-accent/60 group-hover:shadow-md motion-reduce:transform-none">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgb(var(--accent) / 0.09) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--accent) / 0.09) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(135deg, black, transparent 72%)",
          }}
        />
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/10 blur-2xl transition-all duration-500 group-hover:bg-accent/25" />
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent opacity-60" />

        <div className="relative flex items-start justify-between [transform:translateZ(28px)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <Icon className="h-5 w-5" />
          </div>
          <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent/60">0{points.length}</span>
        </div>

        <div className="relative mt-6 [transform:translateZ(22px)]">
          <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{description}</p>
        </div>

        <ul className="relative mt-5 space-y-2 border-t border-border/80 pt-4 [transform:translateZ(16px)]">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-xs text-ink-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70 ring-2 ring-accent/10" />
              {p}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
