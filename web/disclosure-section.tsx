"use client";

import { useState, useId, ReactNode, useCallback } from "react";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclosureSectionProps {
    title: string;
    icon?: LucideIcon;
    count?: number;
    defaultOpen?: boolean;
    children: ReactNode;
    className?: string;
    onToggle?: (isOpen: boolean) => void;
}

export function DisclosureSection({
    title,
    icon: Icon,
    count,
    defaultOpen = false,
    children,
    className,
    onToggle,
}: DisclosureSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const panelId = useId();
    const buttonId = useId();

    const toggle = useCallback(() => {
        const next = !isOpen;
        setIsOpen(next);
        onToggle?.(next);
    }, [isOpen, onToggle]);

    return (
        <div className={cn("border border-border rounded-xl bg-surface/80 overflow-hidden", className)}>
            <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={toggle}
                className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors duration-150",
                    "hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
                    isOpen && "border-b border-border"
                )}
            >
                <ChevronRight
                    className={cn(
                        "h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200",
                        isOpen && "rotate-90"
                    )}
                />
                {Icon && <Icon className="h-4 w-4 shrink-0 text-accent" />}
                <span className="text-xs font-bold text-ink flex-1">{title}</span>
                {typeof count === "number" && (
                    <span className="inline-flex items-center justify-center rounded-full bg-accent-soft text-accent text-[10px] font-bold px-2 py-0.5 min-w-[1.5rem] border border-accent/20">
                        {count}
                    </span>
                )}
            </button>
            <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className={cn(!isOpen && "sr-only")}
            >
                {isOpen && <div className="p-4">{children}</div>}
            </div>
        </div>
    );
}
